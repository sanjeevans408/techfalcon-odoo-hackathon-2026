import express from "express";
import db from "../models/database.js";

const router = express.Router();

const generateId = (prefix) => `${prefix}${Date.now()}${Math.random().toString(36).substr(2, 9)}`;

// Get notifications
router.get("/", async (req, res) => {
  try {
    const notifications = await db.all(`
      SELECT id, type, message, date, read FROM notifications ORDER BY date DESC LIMIT 50
    `);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark as read
router.put("/:id/read", async (req, res) => {
  try {
    await db.run("UPDATE notifications SET read = 1 WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get activity logs
router.get("/logs", async (req, res) => {
  try {
    const logs = await db.all(`
      SELECT id, actor, action, timestamp FROM logs ORDER BY timestamp DESC LIMIT 100
    `);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
