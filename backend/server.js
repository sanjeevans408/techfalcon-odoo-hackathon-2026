import "./loadEnv.js";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import db from "./models/database.js";
import authRoutes from "./routes/auth.js";
import assetRoutes from "./routes/assets.js";
import userRoutes from "./routes/users.js";
import bookingRoutes from "./routes/bookings.js";
import maintenanceRoutes from "./routes/maintenance.js";
import auditRoutes from "./routes/audits.js";
import transferRoutes from "./routes/transfers.js";
import notificationRoutes from "./routes/notifications.js";
import stateRoutes from "./routes/state.js";
import aiRoutes from "./routes/ai.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize database
db.initialize();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/assets", assetRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/audits", auditRoutes);
app.use("/api/transfers", transferRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/state", stateRoutes);
app.use("/api/ai", aiRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "API running", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
