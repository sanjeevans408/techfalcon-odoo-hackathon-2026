import express from "express";
import fetch from "node-fetch";
import db from "../models/database.js";

const router = express.Router();

const NVIDIA_API_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
const NVIDIA_MODEL = "meta/llama-3.1-70b-instruct";

// ─── Gather live data snapshot from SQLite ────────────────────────────────────
async function buildDataContext() {
  try {
    const [assets, maintenance, bookings, transfers, audits, users] =
      await Promise.all([
        db.all("SELECT * FROM assets"),
        db.all("SELECT * FROM maintenance_requests"),
        db.all("SELECT * FROM bookings"),
        db.all("SELECT * FROM transfer_requests"),
        db.all("SELECT * FROM audits"),
        db.all("SELECT id, name, role, department_id FROM users"),
      ]);

    // Asset breakdown by status
    const assetByStatus = assets.reduce((acc, a) => {
      acc[a.status] = (acc[a.status] || 0) + 1;
      return acc;
    }, {});

    // Maintenance breakdown
    const maintByStatus = maintenance.reduce((acc, m) => {
      acc[m.status] = (acc[m.status] || 0) + 1;
      return acc;
    }, {});

    // Assets with poor condition
    const atRiskAssets = assets
      .filter((a) => a.condition === "Fair" || a.condition === "Needs Repair")
      .map((a) => ({ tag: a.tag, name: a.name, condition: a.condition, status: a.status }));

    // Overdue bookings (end_time passed, still Upcoming)
    const now = new Date();
    const overdueBookings = bookings.filter(
      (b) => b.status === "Upcoming" && new Date(b.end_time) < now
    ).length;

    // Open audits
    const openAudits = audits.filter((a) => a.status === "Open").length;

    // Pending transfers
    const pendingTransfers = transfers.filter((t) => t.status === "Requested").length;

    // Total asset value
    const totalValue = assets.reduce((sum, a) => sum + (a.cost || 0), 0);

    // Most common category
    const catCount = assets.reduce((acc, a) => {
      acc[a.category_id] = (acc[a.category_id] || 0) + 1;
      return acc;
    }, {});

    return {
      summary: {
        totalAssets: assets.length,
        totalValue: `₹${totalValue.toLocaleString("en-IN")}`,
        assetsByStatus: assetByStatus,
        maintenanceByStatus: maintByStatus,
        atRiskAssets,
        overdueBookings,
        openAudits,
        pendingTransfers,
        totalUsers: users.length,
        roles: users.reduce((acc, u) => { acc[u.role] = (acc[u.role] || 0) + 1; return acc; }, {}),
      },
      assets: assets.map((a) => ({
        tag: a.tag,
        name: a.name,
        status: a.status,
        condition: a.condition,
        location: a.location,
        cost: a.cost,
      })),
      maintenance: maintenance.map((m) => ({
        issue: m.issue,
        priority: m.priority,
        status: m.status,
        date: m.date,
      })),
      bookings: bookings.map((b) => ({
        status: b.status,
        purpose: b.purpose,
        start: b.start_time,
        end: b.end_time,
      })),
    };
  } catch (err) {
    console.error("[AI] Failed to build data context:", err);
    return { error: "Could not read live data" };
  }
}

// ─── POST /api/ai/chat ────────────────────────────────────────────────────────
router.post("/chat", async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "messages array is required" });
  }

  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey || apiKey === "your_nvidia_api_key_here") {
    return res.status(503).json({
      error: "NVIDIA API key not configured. Please set NVIDIA_API_KEY in backend/.env",
    });
  }

  // Build live data context
  const dataCtx = await buildDataContext();

  const systemPrompt = `You are AssetFlow AI — an expert enterprise asset management assistant built into the AssetFlow ERP system. You help users analyze their organization's asset data, identify issues, and make data-driven decisions.

CURRENT LIVE DATA SNAPSHOT (from the database):
${JSON.stringify(dataCtx, null, 2)}

GUIDELINES:
- Be concise, professional, and data-driven
- Use the live data above to answer questions accurately
- Format numbers in Indian locale (₹ for currency)
- When you see asset tags like AF-0001, reference them by name too
- Highlight urgent items (maintenance pending, overdue bookings, at-risk assets) proactively
- If asked for a summary, give bullet points with key metrics
- If data shows 0 or empty, say so honestly
- Keep responses focused and under 300 words unless asked for detail`;

  const payload = {
    model: NVIDIA_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      ...messages,
    ],
    temperature: 0.4,
    max_tokens: 1024,
    stream: false,
  };

  try {
    const response = await fetch(NVIDIA_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("[AI] NVIDIA API error:", errText);
      return res.status(response.status).json({
        error: `NVIDIA API error: ${response.statusText}`,
      });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "No response from AI.";
    return res.json({ reply, model: NVIDIA_MODEL });
  } catch (err) {
    console.error("[AI] Network error:", err);
    return res.status(500).json({ error: "Failed to reach NVIDIA NIM API." });
  }
});

export default router;
