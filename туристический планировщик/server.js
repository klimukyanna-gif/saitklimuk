const express = require('express');
const path = require('path');
const db = require('./db');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const wrap = (fn) => (req, res, next) => fn(req, res).catch(next);
const bad = (res, msg, code = 400) => res.status(code).json({ error: msg });
const toId = (v) => (Number.isInteger(Number(v)) && Number(v) > 0 ? Number(v) : null);
const one = async (sql, p) => (await db.query(sql, p)).rows[0];

function checkPlace(b) {
  if (!b.name || !String(b.name).trim()) return 'Укажите название';
  if (!b.category || !String(b.category).trim()) return 'Укажите категорию';
  if (!(Number(b.hours) > 0)) return 'Длительность должна быть больше 0';
  if (!(Number(b.price) >= 0)) return 'Цена не может быть отрицательной';
  return null;
}
const placeParams = (b) => [String(b.name).trim(), String(b.category).trim(), b.image || '', Number(b.hours), Number(b.price), b.description || ''];

app.get('/api/places', wrap(async (req, res) => {
  const { category } = req.query;
  const r = category ? await db.query('SELECT * FROM places WHERE category = ? ORDER BY id', [category])
                     : await db.query('SELECT * FROM places ORDER BY id');
  res.json(r.rows);
}));

app.get('/api/categories', wrap(async (req, res) => {
  const r = await db.query('SELECT DISTINCT category FROM places ORDER BY category');
  res.json(r.rows.map(x => x.category));
}));

app.get('/api/places/:id', wrap(async (req, res) => {
  const id = toId(req.params.id); if (!id) return bad(res, 'Некорректный id');
  const p = await one('SELECT * FROM places WHERE id = ?', [id]);
  p ? res.json(p) : bad(res, 'Объект не найден', 404);
}));

app.post('/api/places', wrap(async (req, res) => {
  const err = checkPlace(req.body); if (err) return bad(res, err);
  const r = await db.query('INSERT INTO places (name, category, image, hours, price, description) VALUES (?, ?, ?, ?, ?, ?)', placeParams(req.body));
  res.status(201).json(await one('SELECT * FROM places WHERE id = ?', [r.insertId]));
}));

app.put('/api/places/:id', wrap(async (req, res) => {
  const id = toId(req.params.id); if (!id) return bad(res, 'Некорректный id');
  const err = checkPlace(req.body); if (err) return bad(res, err);
  if (!(await one('SELECT id FROM places WHERE id = ?', [id]))) return bad(res, 'Объект не найден', 404);
  await db.query('UPDATE places SET name = ?, category = ?, image = ?, hours = ?, price = ?, description = ? WHERE id = ?', [...placeParams(req.body), id]);
  res.json(await one('SELECT * FROM places WHERE id = ?', [id]));
}));

app.delete('/api/places/:id', wrap(async (req, res) => {
  const id = toId(req.params.id); if (!id) return bad(res, 'Некорректный id');
  const r = await db.query('DELETE FROM places WHERE id = ?', [id]);
  r.affected ? res.status(204).end() : bad(res, 'Объект не найден', 404);
}));

app.get('/api/routes', wrap(async (req, res) => {
  const p = req.query.preset;
  const routes = (p === '1' || p === '0')
    ? (await db.query('SELECT * FROM routes WHERE is_preset = ? ORDER BY id', [Number(p)])).rows
    : (await db.query('SELECT * FROM routes ORDER BY id')).rows;
  const items = (await db.query('SELECT route_id, place_id FROM route_items ORDER BY route_id, pos')).rows;
  res.json(routes.map(r => ({ ...r, placeIds: items.filter(i => i.route_id === r.id).map(i => i.place_id) })));
}));

app.get('/api/routes/:id', wrap(async (req, res) => {
  const id = toId(req.params.id); if (!id) return bad(res, 'Некорректный id');
  const route = await one('SELECT * FROM routes WHERE id = ?', [id]);
  if (!route) return bad(res, 'Маршрут не найден', 404);
  const places = (await db.query('SELECT p.* FROM route_items ri JOIN places p ON p.id = ri.place_id WHERE ri.route_id = ? ORDER BY ri.pos', [id])).rows;
  res.json({ ...route, places });
}));

app.post('/api/routes', wrap(async (req, res) => {
  const { name, limit, placeIds } = req.body;
  if (!name || !String(name).trim()) return bad(res, 'Введите название маршрута');
  if (!Array.isArray(placeIds) || !placeIds.length) return bad(res, 'Маршрут пуст: добавьте объекты');
  const ids = placeIds.map(toId);
  if (ids.includes(null) || new Set(ids).size !== ids.length) return bad(res, 'Некорректный список объектов');

  const found = (await db.query(`SELECT * FROM places WHERE id IN (${ids.map(() => '?').join(',')})`, ids)).rows;
  if (found.length !== ids.length) return bad(res, 'Некоторые объекты не найдены', 404);
  const byId = Object.fromEntries(found.map(p => [p.id, p]));
  const hours = ids.reduce((s, id) => s + Number(byId[id].hours), 0);
  const price = ids.reduce((s, id) => s + Number(byId[id].price), 0);

  const lim = Number(limit) > 0 ? Number(limit) : null;
  if (lim && hours > lim)
    return res.status(400).json({ error: `Превышен лимит: маршрут ${hours} ч при лимите ${lim} ч`, total_hours: hours, limit: lim });

  const r = await db.query('INSERT INTO routes (name, description, time_limit, total_hours, total_price, is_preset) VALUES (?, ?, ?, ?, ?, 0)',
    [String(name).trim(), '', lim, hours, price]);
  for (let i = 0; i < ids.length; i++)
    await db.query('INSERT INTO route_items (route_id, place_id, pos) VALUES (?, ?, ?)', [r.insertId, ids[i], i + 1]);
  res.status(201).json({ id: r.insertId, name: String(name).trim(), total_hours: hours, total_price: price, placeIds: ids });
}));

app.delete('/api/routes/:id', wrap(async (req, res) => {
  const id = toId(req.params.id); if (!id) return bad(res, 'Некорректный id');
  const r = await db.query('DELETE FROM routes WHERE id = ? AND is_preset = 0', [id]);
  r.affected ? res.status(204).end() : bad(res, 'Маршрут не найден или это готовый маршрут', 404);
}));

app.post('/api/messages', wrap(async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) return bad(res, 'Заполните все поля');
  if (!/^\S+@\S+\.\S+$/.test(email)) return bad(res, 'Некорректный e-mail');
  if (String(message).trim().length < 10) return bad(res, 'Сообщение слишком короткое (от 10 символов)');
  await db.query('INSERT INTO messages (name, email, message) VALUES (?, ?, ?)', [String(name).trim(), String(email).trim(), String(message).trim()]);
  res.status(201).json({ ok: true });
}));
app.get('/api/messages', wrap(async (req, res) => res.json((await db.query('SELECT * FROM messages ORDER BY id DESC')).rows)));

app.use('/api', (req, res) => bad(res, 'Такого маршрута API нет', 404));
app.use((err, req, res, next) => { console.error(err.message); bad(res, 'Ошибка сервера (проверьте подключение к базе данных)', 500); });

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Сервер: http://localhost:${PORT}`);
  try { await db.query('SELECT 1 AS ok'); console.log('База данных подключена'); }
  catch (e) { console.error('Не удалось подключиться к БД:', e.message); }
});
