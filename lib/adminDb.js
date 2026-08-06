const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const baseDir = path.join(__dirname, '..');
const jsonDbPath = path.join(baseDir, 'data', 'admin-db.json');

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

let pool = null;
let useJson = false;

function ensureJsonDb() {
  if (!fs.existsSync(path.dirname(jsonDbPath))) {
    fs.mkdirSync(path.dirname(jsonDbPath), { recursive: true });
  }
  if (!fs.existsSync(jsonDbPath)) {
    fs.writeFileSync(jsonDbPath, JSON.stringify({ settings: {}, admin_users: [] }, null, 2));
  }
  return JSON.parse(fs.readFileSync(jsonDbPath, 'utf8'));
}

function writeJsonDb(data) {
  fs.writeFileSync(jsonDbPath, JSON.stringify(data, null, 2));
}

async function initDb() {
  if (!dbConfig.host || !dbConfig.user || !dbConfig.database) {
    console.log('Admin DB: MySQL credentials not set; using JSON fallback.');
    useJson = true;
    return;
  }
  try {
    pool = mysql.createPool({
      ...dbConfig,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
    });
    const conn = await pool.getConnection();
    await conn.query(`
      CREATE TABLE IF NOT EXISTS settings (
        setting_key VARCHAR(255) PRIMARY KEY,
        setting_value TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    await conn.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    conn.release();
    console.log('Admin MySQL tables ready.');
  } catch (err) {
    console.error('Admin DB: MySQL connection failed, falling back to JSON.', err.message);
    useJson = true;
  }
}

async function getSetting(key) {
  if (useJson) {
    const db = ensureJsonDb();
    return db.settings[key] || null;
  }
  const [rows] = await pool.execute('SELECT setting_value FROM settings WHERE setting_key = ?', [key]);
  return rows[0] ? rows[0].setting_value : null;
}

async function setSetting(key, value) {
  if (useJson) {
    const db = ensureJsonDb();
    db.settings[key] = String(value);
    writeJsonDb(db);
    return;
  }
  await pool.execute(
    'INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)',
    [key, String(value)]
  );
}

async function getSettings() {
  if (useJson) {
    const db = ensureJsonDb();
    return db.settings;
  }
  const [rows] = await pool.execute('SELECT setting_key, setting_value FROM settings');
  const settings = {};
  rows.forEach((row) => { settings[row.setting_key] = row.setting_value; });
  return settings;
}

async function findAdmin(username) {
  if (useJson) {
    const db = ensureJsonDb();
    return db.admin_users.find((u) => u.username === username) || null;
  }
  const [rows] = await pool.execute('SELECT * FROM admin_users WHERE username = ?', [username]);
  return rows[0] || null;
}

async function saveAdmin(username, passwordHash) {
  if (useJson) {
    const db = ensureJsonDb();
    const existing = db.admin_users.find((u) => u.username === username);
    if (existing) {
      existing.password_hash = passwordHash;
    } else {
      db.admin_users.push({ username, password_hash: passwordHash });
    }
    writeJsonDb(db);
    return;
  }
  await pool.execute(
    'INSERT INTO admin_users (username, password_hash) VALUES (?, ?) ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)',
    [username, passwordHash]
  );
}

module.exports = {
  initDb,
  getSetting,
  setSetting,
  getSettings,
  findAdmin,
  saveAdmin,
  isJson: () => useJson,
};
