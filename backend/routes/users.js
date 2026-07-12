import express from "express";
import db from "../models/database.js";

const router = express.Router();

const generateId = (prefix) => `${prefix}${Date.now()}${Math.random().toString(36).substr(2, 9)}`;

// Get all users
router.get("/", async (req, res) => {
  try {
    const users = await db.all("SELECT id, name, email, department_id, role, status FROM users");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user by ID
router.get("/:id", async (req, res) => {
  try {
    const user = await db.get("SELECT id, name, email, department_id, role, status FROM users WHERE id = ?", [req.params.id]);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user
router.put("/:id", async (req, res) => {
  try {
    const { name, department_id, role, status } = req.body;
    await db.run(
      "UPDATE users SET name = ?, department_id = ?, role = ?, status = ? WHERE id = ?",
      [name, department_id, role, status, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete user
router.delete("/:id", async (req, res) => {
  try {
    await db.run("DELETE FROM users WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get departments
router.get("/departments", async (req, res) => {
  try {
    const departments = await db.all("SELECT id, name, head_id, parent_id, status FROM departments");
    res.json(departments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
