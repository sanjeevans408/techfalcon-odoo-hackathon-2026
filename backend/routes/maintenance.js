import express from "express";
import db from "../models/database.js";

const router = express.Router();

const generateId = (prefix) => `${prefix}${Date.now()}${Math.random().toString(36).substr(2, 9)}`;

// Get all maintenance requests
router.get("/", async (req, res) => {
  try {
    const requests = await db.all(`
      SELECT id, asset_id, raised_by, issue, priority, status, technician, date, photo_name FROM maintenance_requests ORDER BY date DESC
    `);
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create maintenance request
router.post("/", async (req, res) => {
  try {
    const { asset_id, raised_by, issue, priority, photo_name } = req.body;
    const id = generateId("mr");
    const date = new Date().toISOString().split("T")[0];

    await db.run(
      `INSERT INTO maintenance_requests (id, asset_id, raised_by, issue, priority, status, date, photo_name) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, asset_id, raised_by, issue, priority || "Medium", "Pending", date, photo_name || null]
    );

    // Update asset status
    await db.run("UPDATE assets SET status = ? WHERE id = ?", ["Under Maintenance", asset_id]);

    res.json({ id, asset_id, raised_by, issue, priority, status: "Pending" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update maintenance request status
router.put("/:id", async (req, res) => {
  try {
    const { status, technician } = req.body;
    await db.run(
      "UPDATE maintenance_requests SET status = ?, technician = ? WHERE id = ?",
      [status, technician || null, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Resolve maintenance (mark as resolved and asset as available)
router.put("/:id/resolve", async (req, res) => {
  try {
    const request = await db.get("SELECT asset_id FROM maintenance_requests WHERE id = ?", [req.params.id]);
    if (!request) return res.status(404).json({ error: "Request not found" });

    await db.run("UPDATE maintenance_requests SET status = ? WHERE id = ?", ["Resolved", req.params.id]);
    await db.run("UPDATE assets SET status = ? WHERE id = ?", ["Available", request.asset_id]);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
