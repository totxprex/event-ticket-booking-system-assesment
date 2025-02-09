const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.resolve(__dirname, "../orders.db");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Could not connect to database", err);
  } else {
    console.log("Connected to SQLite database.");
  }
});

const createOrdersTable = `
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    eventId TEXT NOT NULL,
    userId TEXT NOT NULL,
    userName TEXT NOT NULL,
    status TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`;

db.run(createOrdersTable, (err) => {
  if (err) {
    console.error("Failed to create orders table", err);
  } else {
    console.log("Orders table is ready.");
  }
});

module.exports = db;
