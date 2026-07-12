import express from "express";
import db from "../models/database.js";

const router = express.Router();

const generateId = (prefix) => `${prefix}${Date.now()}${Math.random().toString(36).substr(2, 9)}`;

// Get all assets
router.get("/", async (req, res) => {
  try {
    const assets = await db.all(`
      SELECT a.id, a.tag, a.name, a.category_id, a.serial, a.acquisition_date, a.cost, 
             a.condition, a.location, a.shared, a.status, a.allocated_to_type, a.allocated_to_id, 
             a.expected_return FROM assets a
    `);
    res.json(assets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get asset by ID with history
router.get("/:id", async (req, res) => {
  try {
    const asset = await db.get(
      "SELECT * FROM assets WHERE id = ?",
      [req.params.id]
    );
    if (!asset) return res.status(404).json({ error: "Asset not found" });

    const allocationHistory = await db.all(
      "SELECT id, holder, from_date, to_date, note FROM allocation_history WHERE asset_id = ?",
      [req.params.id]
    );
    const maintenanceHistory = await db.all(
      "SELECT id, issue, date, status FROM maintenance_history WHERE asset_id = ?",
      [req.params.id]
    );

    res.json({ ...asset, allocationHistory, maintenanceHistory });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create asset
router.post("/", async (req, res) => {
  try {
    const { tag, name, category_id, serial, acquisition_date, cost, condition, location, shared } = req.body;
    const id = generateId("ast");

    await db.run(
      `INSERT INTO assets (id, tag, name, category_id, serial, acquisition_date, cost, 
       condition, location, shared, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, tag, name, category_id, serial, acquisition_date, cost, condition, location, shared ? 1 : 0, "Available"]
    );

    res.json({ id, tag, name, category_id, status: "Available" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update asset
router.put("/:id", async (req, res) => {
  try {
    const { name, condition, location, shared, status, allocated_to_type, allocated_to_id, expected_return } = req.body;
    await db.run(
      `UPDATE assets SET name = ?, condition = ?, location = ?, shared = ?, status = ?, 
       allocated_to_type = ?, allocated_to_id = ?, expected_return = ? WHERE id = ?`,
      [name, condition, location, shared ? 1 : 0, status, allocated_to_type, allocated_to_id, expected_return, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete asset
router.delete("/:id", async (req, res) => {
  try {
    await db.run("DELETE FROM assets WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get categories
router.get("/categories/list", async (req, res) => {
  try {
    const categories = await db.all("SELECT id, name, extra_field FROM categories");
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
