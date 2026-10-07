
const places = [
  { id: 1,  name: 'Беловежская пуща',             cat: 'Национальные парки', img: 'img/place1.jpg', hours: 5,   price: 25, text: 'Древнейший лес Европы и зубры в вольерах.' },
  { id: 2,  name: 'Нарочанский парк',             cat: 'Национальные парки', img: 'img/place2.jpg', hours: 4,   price: 15, text: 'Крупнейшее озеро страны и сосновые леса.' },
  { id: 3,  name: 'Припятский парк',              cat: 'Национальные парки', img: 'img/place3.jpg', hours: 5,   price: 20, text: 'Поймы Припяти, болота и редкие птицы.' },
  { id: 4,  name: 'Браславские озёра',            cat: 'Национальные парки', img: 'img/place4.jpg', hours: 4,   price: 12, text: 'Более 30 озёр, смотровые вышки и тропы.' },
  { id: 5,  name: 'Парк Горького',                cat: 'Городские парки',    img: 'img/place5.jpg', hours: 2,   price: 0,  text: 'Главный парк Минска: аттракционы и набережная.' },
  { id: 6,  name: 'Парк Победы',                  cat: 'Городские парки',    img: 'img/place6.jpg', hours: 2,   price: 0,  text: 'Тихие аллеи и озеро в центре Минска.' },
  { id: 7,  name: 'Лошицкая усадьба',             cat: 'Городские парки',    img: 'img/place7.jpg', hours: 2,   price: 0,  text: 'Усадебный парк XVIII века.' },
  { id: 8,  name: 'Парк Жилибера',                cat: 'Городские парки',    img: 'img/place8.jpg', hours: 1.5, price: 0,  text: 'Старейший парк Гродно над Неманом.' },
  { id: 9,  name: 'Мирский замок и парк',         cat: 'Дворцовые ансамбли', img: 'img/place9.jpg', hours: 3,   price: 18, text: 'Замок XVI века, список ЮНЕСКО.' },
  { id: 10, name: 'Несвижский ансамбль',          cat: 'Дворцовые ансамбли', img: 'img/place10.jpg', hours: 4,   price: 22, text: 'Резиденция Радзивиллов с парком.' },
  { id: 11, name: 'Гомельский дворец и парк',     cat: 'Дворцовые ансамбли', img: 'img/place11.jpg', hours: 3,   price: 14, text: 'Ансамбль Румянцевых-Паскевичей.' },
  { id: 12, name: 'Центральный ботанический сад', cat: 'Ботанические сады',  img: 'img/place12.jpg', hours: 3,   price: 10, text: 'Тысячи видов растений и оранжереи.' },
];
const presets = [
  { title: 'Выходные в Минске', text: 'Зелёные места столицы за один уикенд.', ids: [5, 6, 7, 12] },
  { title: 'Королевские замки', text: 'Дворцы и парки с богатой историей.', ids: [9, 10, 11] },
  { title: 'Озёрный край', text: 'Нарочь и Браслав: вода, сосны и тишина.', ids: [2, 4] },
  { title: 'Дикая природа', text: 'Зубры, болота и пуща для исследователей.', ids: [1, 3, 2] },
];





let route = [], limit = 10, filter = 'Все';
try { route = JSON.parse(localStorage.getItem('route')) || []; limit = Number(localStorage.getItem('limit')) || 10; } catch (e) {}
const $ = (id) => document.getElementById(id);
const byId = (id) => places.find(p => p.id === id);
const money = (n) => n === 0 ? 'Бесплатно' : n + ' BYN';
const sum = (ids, key) => ids.reduce((s, id) => s + byId(id)[key], 0);
const hrs = (h) => { const m = Math.round(h * 60), hh = Math.floor(m / 60), mm = m % 60;
  return (hh ? hh + ' ч' : '') + (hh && mm ? ' ' : '') + (mm ? mm + ' мин' : (hh ? '' : '0 ч')); };
const save = () => { try { localStorage.setItem('route', JSON.stringify(route)); localStorage.setItem('limit', limit); } catch (e) {} };




function renderFilters() {
  const cats = ['Все', ...new Set(places.map(p => p.cat))];
  $('filters').innerHTML = cats.map(c => `<button class="tab ${c === filter ? 'active' : ''}" data-act="filter" data-cat="${c}">${c}</button>`).join('');
}
function renderCards() {
  const list = filter === 'Все' ? places : places.filter(p => p.cat === filter);
  $('cards').innerHTML = list.map(p => { const on = route.includes(p.id);
    return `<article class="card ${on ? 'in' : ''}"><div class="img-box">${p.icon}</div><div class="card-body">
      <span class="tag">${p.cat}</span><h3>${p.name}</h3><p>${p.text}</p>
      <div class="meta"><span>⏱ ${hrs(p.hours)}</span><span>${money(p.price)}</span></div>
      <button class="btn ${on ? 'btn-remove' : ''}" data-act="${on ? 'remove' : 'add'}" data-id="${p.id}">${on ? 'Убрать из маршрута' : 'Добавить в маршрут'}</button>
    </div></article>`; }).join('');
}
function renderRoute() {
  const items = route.map(byId), time = sum(route, 'hours'), cost = sum(route, 'price'), over = time > limit;
  $('steps').innerHTML = items.length ? items.map((p, i) => `<li class="step"><span class="num">${i + 1}</span>
    <div><b>${p.name}</b><small>${p.cat} · ${hrs(p.hours)} · ${money(p.price)}</small></div>
    <div class="ctl"><button data-act="up" data-id="${p.id}" ${i === 0 ? 'disabled' : ''} aria-label="Выше">↑</button>
    <button data-act="down" data-id="${p.id}" ${i === items.length - 1 ? 'disabled' : ''} aria-label="Ниже">↓</button>
    <button data-act="remove" data-id="${p.id}" aria-label="Убрать">✕</button></div></li>`).join('')
    : '<li class="empty">Маршрут пуст. Добавьте объекты из каталога.</li>';
  $('totalTime').textContent = hrs(time); $('totalCost').textContent = cost + ' BYN'; $('totalCount').textContent = items.length;
  $('barFill').style.width = Math.min(100, time / limit * 100) + '%';
  $('barFill').classList.toggle('over', over); $('status').classList.toggle('over', over);
  $('status').textContent = over ? `⚠ Превышен лимит на ${hrs(time - limit)}. Уберите объекты или увеличьте лимит.`
                                 : `Осталось времени: ${hrs(limit - time)} из ${hrs(limit)}`;
}
function renderPresets() {
  $('presets').innerHTML = presets.map((r, i) => { const t = sum(r.ids, 'hours');
    return `<div class="row"><div><h3>${r.title}</h3><p>${r.text}</p><ul class="stops">${r.ids.map(id => `<li>${byId(id).name}</li>`).join('')}</ul></div>
    <div class="side"><div class="price">${hrs(t)} · ${sum(r.ids, 'price')} BYN</div>
    <button class="btn" data-act="preset" data-idx="${i}">Загрузить в планировщик</button></div></div>`; }).join('');
}
function render() {
  if ($('cards')) { renderFilters(); renderCards(); renderRoute(); }
  if ($('presets')) renderPresets();
  if ($('badge')) $('badge').textContent = route.length;
}



// cобытия
if ($('burger')) $('burger').addEventListener('click', () => $('menu').classList.toggle('open'));

document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-act]'); if (!btn) return;
  const id = Number(btn.dataset.id), i = route.indexOf(id);
  switch (btn.dataset.act) {
    case 'filter': filter = btn.dataset.cat; break;
    case 'add':    if (i === -1) route.push(id); break;
    case 'remove': if (i !== -1) route.splice(i, 1); break;
    case 'up':     if (i > 0) [route[i - 1], route[i]] = [route[i], route[i - 1]]; break;
    case 'down':   if (i < route.length - 1) [route[i + 1], route[i]] = [route[i], route[i + 1]]; break;
    case 'preset': route = presets[Number(btn.dataset.idx)].ids.slice(); save(); location.href = 'planner.html'; return;
  }
  save(); render();
});
if ($('limit')) {
  $('limit').value = limit;
  $('limit').addEventListener('input', (e) => { limit = Number(e.target.value) > 0 ? Number(e.target.value) : 10; save(); renderRoute(); });
}
if ($('clear')) $('clear').addEventListener('click', () => { route = []; save(); render(); });





if ($('form')) $('form').addEventListener('submit', (e) => {
  e.preventDefault();
  const name = $('name').value.trim(), email = $('email').value.trim(), msg = $('msg').value.trim();
  let error = '';
  if (!name || !email || !msg) error = 'Заполните все поля';
  else if (!/^\S+@\S+\.\S+$/.test(email)) error = 'Некорректный e-mail';
  else if (msg.length < 10) error = 'Сообщение слишком короткое (от 10 символов)';
  $('result').textContent = error || 'Спасибо! Мы скоро свяжемся с вами.';
  $('result').style.color = error ? 'red' : 'green';
  if (!error) $('form').reset();
});

render();
