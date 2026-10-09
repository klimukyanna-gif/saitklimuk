const host = process.env.DB_HOST || 'localhost';
const instance = process.env.DB_INSTANCE || '';
const database = process.env.DB_NAME || 'parks';
const native = process.env.DB_AUTH === 'windows' || /^\(localdb\)/i.test(host);

let sql, cfg;

if (native) {
  sql = require('mssql/msnodesqlv8');
  const odbc = process.env.DB_ODBC_DRIVER || 'ODBC Driver 17 for SQL Server';
  const server = instance && !host.includes('\\') ? host + '\\' + instance : host;
  const login = process.env.DB_USER && process.env.DB_AUTH !== 'windows'
    ? `Uid=${process.env.DB_USER};Pwd=${process.env.DB_PASSWORD || ''};`
    : 'Trusted_Connection=Yes;';
  cfg = { connectionString: `Driver={${odbc}};Server=${server};Database=${database};${login}TrustServerCertificate=Yes;` };
} else {
  sql = require('mssql');
  cfg = {
    server: host,
    database,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: instance ? undefined : Number(process.env.DB_PORT || 1433),
    options: { instanceName: instance || undefined, trustServerCertificate: true, encrypt: false },
  };
}

let pool;
const getPool = () => pool || (pool = sql.connect(cfg).catch((e) => { pool = null; throw e; }));

module.exports = {
  async query(text, params = []) {
    const req = (await getPool()).request();
    let i = 0;
    const isInsert = /^\s*insert/i.test(text);
    const q = text.replace(/\?/g, () => { const n = i++; req.input('p' + n, params[n]); return '@p' + n; })
              + (isInsert ? '; SELECT SCOPE_IDENTITY() AS id' : '');
    const r = await req.query(q);
    return { rows: r.recordset || [], insertId: isInsert && r.recordset ? r.recordset[0].id : undefined, affected: r.rowsAffected[0] };
  },
};
