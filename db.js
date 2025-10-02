const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbFile = path.join(__dirname, 'incidents.db');

function openDB() {
  return new sqlite3.Database(dbFile);
}

module.exports.init = function() {
  return new Promise((resolve, reject) => {
    const db = openDB();
    db.run(`CREATE TABLE IF NOT EXISTS incidents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      description TEXT,
      severity TEXT,
      category TEXT,
      priority TEXT,
      status TEXT,
      metadata TEXT,
      created_at TEXT
    )`, (err) => {
      db.close();
      if (err) return reject(err);
      resolve();
    });
  });
};

module.exports.createIncident = function(incident) {
  return new Promise((resolve, reject) => {
    const db = openDB();
    const stmt = db.prepare(`INSERT INTO incidents
      (title,description,severity,category,priority,status,metadata,created_at)
      VALUES (?,?,?,?,?,?,?,?)`);
    stmt.run([
      incident.title,
      incident.description,
      incident.severity,
      incident.category,
      incident.priority,
      incident.status,
      incident.metadata,
      incident.created_at
    ], function(err) {
      stmt.finalize();
      db.close();
      if (err) return reject(err);
      resolve(this.lastID);
    });
  });
};

module.exports.listIncidents = function() {
  return new Promise((resolve, reject) => {
    const db = openDB();
    db.all('SELECT * FROM incidents ORDER BY created_at DESC', (err, rows) => {
      db.close();
      if (err) return reject(err);
      resolve(rows);
    });
  });
};

module.exports.getIncidentById = function(id) {
  return new Promise((resolve, reject) => {
    const db = openDB();
    db.get('SELECT * FROM incidents WHERE id = ?', [id], (err, row) => {
      db.close();
      if (err) return reject(err);
      resolve(row);
    });
  });
};

module.exports.updateStatus = function(id, status) {
  return new Promise((resolve, reject) => {
    const db = openDB();
    db.run('UPDATE incidents SET status = ? WHERE id = ?', [status, id], function(err) {
      db.close();
      if (err) return reject(err);
      resolve();
    });
  });
};

if (require.main === module) {
  // CLI: node db.js --init
  const arg = process.argv[2];
  if (arg === '--init') {
    module.exports.init().then(()=>console.log('DB init done')).catch(e=>console.error(e));
  }
}
