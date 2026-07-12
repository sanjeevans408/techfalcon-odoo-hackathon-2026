import express from "express";
import db from "../models/database.js";

const router = express.Router();

const generateId = (prefix) => `${prefix}${Date.now()}${Math.random().toString(36).substr(2, 9)}`;

// Get all bookings
router.get("/", async (req, res) => {
  try {
    const bookings = await db.all(`
      SELECT id, asset_id, booked_by, start_time, end_time, status, purpose FROM bookings ORDER BY start_time DESC
    `);
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create booking
router.post("/", async (req, res) => {
  try {
    const { asset_id, booked_by, start_time, end_time, purpose } = req.body;
    const id = generateId("bk");

    // Check for overlaps
    const overlap = await db.get(
      `SELECT id FROM bookings WHERE asset_id = ? AND status != 'Cancelled' 
       AND start_time < ? AND end_time > ?`,
      [asset_id, end_time, start_time]
    );

    if (overlap) {
      return res.status(400).json({ error: "This time slot overlaps with an existing booking" });
    }

    await db.run(
      `INSERT INTO bookings (id, asset_id, booked_by, start_time, end_time, status, purpose) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, asset_id, booked_by, start_time, end_time, "Upcoming", purpose || "—"]
    );

    res.json({ id, asset_id, booked_by, start_time, end_time, status: "Upcoming", purpose });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cancel booking
router.put("/:id/cancel", async (req, res) => {
  try {
    await db.run("UPDATE bookings SET status = ? WHERE id = ?", ["Cancelled", req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
