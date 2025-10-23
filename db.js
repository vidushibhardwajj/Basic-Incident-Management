const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbFile = path.join(__dirname, 'incidents.db');

function openDB() {
  return new sqlite3.Database(dbFile);
}

module.exports.init = function() {
  return new Promise((resolve, reject) => {
    const db = openDB();
    db.serialize(() => {
      db.run(`CREATE TABLE IF NOT EXISTS incidents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        description TEXT,
        severity TEXT,
        category TEXT,
        priority TEXT,
        status TEXT,
        metadata TEXT,
        phone TEXT,
        created_at TEXT
      )`, (err) => {
        if (err) {
          db.close();
          return reject(err);
        }
        // ensure phone column exists on older DBs
        db.all("PRAGMA table_info(incidents)", (err, rows) => {
          if (err) {
            db.close();
            return reject(err);
          }
          const hasPhone = Array.isArray(rows) && rows.some(r => r && r.name === 'phone');
          if (!hasPhone) {
            db.run("ALTER TABLE incidents ADD COLUMN phone TEXT", (err) => {
              db.close();
              if (err) return reject(err);
              resolve();
            });
          } else {
            db.close();
            resolve();
          }
        });
      });
    });
  });
};

module.exports.createIncident = function(incident) {
  return new Promise((resolve, reject) => {
    const db = openDB();

    // Defensive defaults to avoid inserting undefined into DB and to always have a created_at
    const title = incident.title || null;
    const description = incident.description || null;
    const severity = incident.severity || null;
    const category = incident.category || null;
    const priority = incident.priority || null;
    const status = incident.status || null;
    const metadata = incident.metadata || null;
    const phone = (incident.phone === undefined) ? null : incident.phone; // explicit null if missing
    const created_at = incident.created_at || new Date().toISOString();

    const stmt = db.prepare(`INSERT INTO incidents
      (title,description,severity,category,priority,status,metadata,phone,created_at)
      VALUES (?,?,?,?,?,?,?,?,?)`);
    stmt.run([
      title,
      description,
      severity,
      category,
      priority,
      status,
      metadata,
      phone,
      created_at
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
  const arg = process.argv[2];
  if (arg === '--init') {
    module.exports.init().then(()=>console.log('DB init done')).catch(e=>console.error(e));
  }
}
