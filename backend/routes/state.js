import express from "express";
import db from "../models/database.js";

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const row = await db.get("SELECT data FROM app_state WHERE id = 1");
    res.json(row ? JSON.parse(row.data) : null);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/", async (req, res) => {
  try {
    await db.run(
      `INSERT INTO app_state (id, data, updated_at) VALUES (1, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = CURRENT_TIMESTAMP`,
      [JSON.stringify(req.body)]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
