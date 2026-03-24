const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '../../lidom.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

let db;

function getDB() {
  if (!db) {
    db = new Database(DB_PATH);
    
    db.pragma('foreign_keys = ON');
    db.pragma('journal_mode = WAL'); 
    
    const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8');
    db.exec(schema);

    console.log('✅ Base de datos conectada:', DB_PATH);
  }

  return db;
}

module.exports = { getDB };