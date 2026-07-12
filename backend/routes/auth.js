import express from "express";
import db from "../models/database.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = express.Router();
const SECRET = "your-secret-key-change-in-production";

const generateId = (prefix) => `${prefix}${Date.now()}${Math.random().toString(36).substr(2, 9)}`;

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await db.get("SELECT * FROM users WHERE email = ?", [email]);

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid password" });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, SECRET, { expiresIn: "24h" });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, department: user.department_id } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, department_id, role = "Employee" } = req.body;

    const existing = await db.get("SELECT id FROM users WHERE email = ?", [email]);
    if (existing) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const id = generateId("emp");

    await db.run(
      "INSERT INTO users (id, name, email, password, department_id, role) VALUES (?, ?, ?, ?, ?, ?)",
      [id, name, email, hashedPassword, department_id, role]
    );

    const token = jwt.sign({ id, email }, SECRET, { expiresIn: "24h" });
    res.json({ token, user: { id, name, email, role, department: department_id } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
