import sqlite3 from "sqlite3";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "../assetflow.db");

const db = new sqlite3.Database(dbPath);

const database = {
  db: db,

  initialize: function () {
    this.db.serialize(() => {
      // Users table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          department_id TEXT,
          role TEXT NOT NULL,
          status TEXT DEFAULT 'Active',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Departments table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS departments (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          head_id TEXT,
          parent_id TEXT,
          status TEXT DEFAULT 'Active',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Categories table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS categories (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          extra_field TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Assets table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS assets (
          id TEXT PRIMARY KEY,
          tag TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          category_id TEXT NOT NULL,
          serial TEXT,
          acquisition_date DATE,
          cost REAL,
          condition TEXT,
          location TEXT,
          shared BOOLEAN DEFAULT 0,
          status TEXT DEFAULT 'Available',
          allocated_to_type TEXT,
          allocated_to_id TEXT,
          expected_return DATE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (category_id) REFERENCES categories(id)
        )
      `);

      // Allocation history
      this.db.run(`
        CREATE TABLE IF NOT EXISTS allocation_history (
          id TEXT PRIMARY KEY,
          asset_id TEXT NOT NULL,
          holder TEXT,
          from_date DATE,
          to_date DATE,
          note TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (asset_id) REFERENCES assets(id)
        )
      `);

      // Maintenance history
      this.db.run(`
        CREATE TABLE IF NOT EXISTS maintenance_history (
          id TEXT PRIMARY KEY,
          asset_id TEXT NOT NULL,
          issue TEXT,
          date DATE,
          status TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (asset_id) REFERENCES assets(id)
        )
      `);

      // Maintenance requests
      this.db.run(`
        CREATE TABLE IF NOT EXISTS maintenance_requests (
          id TEXT PRIMARY KEY,
          asset_id TEXT NOT NULL,
          raised_by TEXT NOT NULL,
          issue TEXT NOT NULL,
          priority TEXT DEFAULT 'Medium',
          status TEXT DEFAULT 'Pending',
          technician TEXT,
          date DATE,
          photo_name TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (asset_id) REFERENCES assets(id),
          FOREIGN KEY (raised_by) REFERENCES users(id)
        )
      `);

      // Bookings table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS bookings (
          id TEXT PRIMARY KEY,
          asset_id TEXT NOT NULL,
          booked_by TEXT NOT NULL,
          start_time DATETIME NOT NULL,
          end_time DATETIME NOT NULL,
          status TEXT DEFAULT 'Upcoming',
          purpose TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (asset_id) REFERENCES assets(id),
          FOREIGN KEY (booked_by) REFERENCES users(id)
        )
      `);

      // Transfer requests
      this.db.run(`
        CREATE TABLE IF NOT EXISTS transfer_requests (
          id TEXT PRIMARY KEY,
          asset_id TEXT NOT NULL,
          from_holder TEXT,
          to_employee_id TEXT NOT NULL,
          requested_by TEXT NOT NULL,
          status TEXT DEFAULT 'Requested',
          date DATE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (asset_id) REFERENCES assets(id),
          FOREIGN KEY (to_employee_id) REFERENCES users(id),
          FOREIGN KEY (requested_by) REFERENCES users(id)
        )
      `);

      // Audits table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS audits (
          id TEXT PRIMARY KEY,
          scope TEXT NOT NULL,
          date_from DATE,
          date_to DATE,
          status TEXT DEFAULT 'Open',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Audit items
      this.db.run(`
        CREATE TABLE IF NOT EXISTS audit_items (
          id TEXT PRIMARY KEY,
          audit_id TEXT NOT NULL,
          asset_id TEXT NOT NULL,
          result TEXT DEFAULT 'Unchecked',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (audit_id) REFERENCES audits(id),
          FOREIGN KEY (asset_id) REFERENCES assets(id)
        )
      `);

      // Audit auditors
      this.db.run(`
        CREATE TABLE IF NOT EXISTS audit_auditors (
          id TEXT PRIMARY KEY,
          audit_id TEXT NOT NULL,
          auditor_id TEXT NOT NULL,
          FOREIGN KEY (audit_id) REFERENCES audits(id),
          FOREIGN KEY (auditor_id) REFERENCES users(id)
        )
      `);

      // Notifications table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS notifications (
          id TEXT PRIMARY KEY,
          user_id TEXT,
          type TEXT,
          message TEXT,
          date DATETIME DEFAULT CURRENT_TIMESTAMP,
          read BOOLEAN DEFAULT 0,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `);

      // Logs table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS logs (
          id TEXT PRIMARY KEY,
          actor TEXT,
          action TEXT,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      this.db.run(`
        CREATE TABLE IF NOT EXISTS app_state (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          data TEXT NOT NULL,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      console.log("✓ Database initialized");
    });
  },

  run: function (sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  },

  get: function (sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  all: function (sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  },
};

export default database;
