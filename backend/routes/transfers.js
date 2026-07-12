import express from "express";
import db from "../models/database.js";

const router = express.Router();

const generateId = (prefix) => `${prefix}${Date.now()}${Math.random().toString(36).substr(2, 9)}`;

// Get all transfer requests
router.get("/", async (req, res) => {
  try {
    const requests = await db.all(`
      SELECT id, asset_id, from_holder, to_employee_id, requested_by, status, date FROM transfer_requests ORDER BY date DESC
    `);
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create transfer request
router.post("/", async (req, res) => {
  try {
    const { asset_id, from_holder, to_employee_id, requested_by } = req.body;
    const id = generateId("tr");
    const date = new Date().toISOString().split("T")[0];

    await db.run(
      `INSERT INTO transfer_requests (id, asset_id, from_holder, to_employee_id, requested_by, status, date) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, asset_id, from_holder, to_employee_id, requested_by, "Requested", date]
    );

    res.json({ id, asset_id, status: "Requested" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Approve transfer
router.put("/:id/approve", async (req, res) => {
  try {
    const request = await db.get("SELECT asset_id, to_employee_id FROM transfer_requests WHERE id = ?", [req.params.id]);
    if (!request) return res.status(404).json({ error: "Request not found" });

    await db.run("UPDATE transfer_requests SET status = ? WHERE id = ?", ["Approved", req.params.id]);
    await db.run(
      "UPDATE assets SET allocated_to_type = ?, allocated_to_id = ? WHERE id = ?",
      ["employee", request.to_employee_id, request.asset_id]
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reject transfer
router.put("/:id/reject", async (req, res) => {
  try {
    await db.run("UPDATE transfer_requests SET status = ? WHERE id = ?", ["Rejected", req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
