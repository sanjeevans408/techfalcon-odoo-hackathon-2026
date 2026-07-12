import express from "express";
import db from "../models/database.js";

const router = express.Router();

const generateId = (prefix) => `${prefix}${Date.now()}${Math.random().toString(36).substr(2, 9)}`;

// Get all audits
router.get("/", async (req, res) => {
  try {
    const audits = await db.all(`
      SELECT id, scope, date_from, date_to, status FROM audits ORDER BY date_from DESC
    `);

    // Enrich with auditors and items
    const enriched = await Promise.all(
      audits.map(async (audit) => {
        const auditors = await db.all(
          "SELECT auditor_id FROM audit_auditors WHERE audit_id = ?",
          [audit.id]
        );
        const items = await db.all(
          "SELECT asset_id, result FROM audit_items WHERE audit_id = ?",
          [audit.id]
        );
        return { ...audit, auditors: auditors.map((a) => a.auditor_id), items };
      })
    );

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create audit
router.post("/", async (req, res) => {
  try {
    const { scope, date_from, date_to, auditors } = req.body;
    const id = generateId("aud");

    await db.run(
      `INSERT INTO audits (id, scope, date_from, date_to, status) VALUES (?, ?, ?, ?, ?)`,
      [id, scope, date_from, date_to, "Open"]
    );

    // Add auditors
    for (const auditor_id of auditors) {
      const aid = generateId("aa");
      await db.run(
        "INSERT INTO audit_auditors (id, audit_id, auditor_id) VALUES (?, ?, ?)",
        [aid, id, auditor_id]
      );
    }

    res.json({ id, scope, status: "Open" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update audit item result
router.put("/:audit_id/items/:asset_id", async (req, res) => {
  try {
    const { result } = req.body;
    await db.run(
      "UPDATE audit_items SET result = ? WHERE audit_id = ? AND asset_id = ?",
      [result, req.params.audit_id, req.params.asset_id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Close audit
router.put("/:id/close", async (req, res) => {
  try {
    const audit = await db.get("SELECT id FROM audits WHERE id = ?", [req.params.id]);
    if (!audit) return res.status(404).json({ error: "Audit not found" });

    // Mark missing items as lost
    const missingItems = await db.all(
      "SELECT asset_id FROM audit_items WHERE audit_id = ? AND result = ?",
      [req.params.id, "Missing"]
    );

    for (const item of missingItems) {
      await db.run("UPDATE assets SET status = ? WHERE id = ?", ["Lost", item.asset_id]);
    }

    await db.run("UPDATE audits SET status = ? WHERE id = ?", ["Closed", req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
