import "dotenv/config";
import express from "express";
import cors from "cors";

import { initDataStore, getMode } from "./services/dataStore.js";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler.js";

import geoRoutes from "./routes/geoRoutes.js";
import villageRoutes from "./routes/villageRoutes.js";
import siteRoutes from "./routes/siteRoutes.js";
import servicesRoutes from "./routes/servicesRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import copilotRoutes from "./routes/copilotRoutes.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", dataMode: getMode(), timestamp: new Date().toISOString() });
});

app.use("/api", geoRoutes);
app.use("/api", villageRoutes);
app.use("/api", siteRoutes);
app.use("/api", servicesRoutes);
app.use("/api", dashboardRoutes);
app.use("/api", copilotRoutes);
app.use("/api", authRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

initDataStore()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`[server] Disaster Relocation API listening on http://localhost:${PORT}`);
      console.log(`[server] Data mode: ${getMode()}`);
    });
  })
  .catch((err) => {
    console.error("[server] Failed to initialize data store:", err);
    process.exit(1);
  });
