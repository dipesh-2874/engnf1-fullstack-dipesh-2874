import express from "express";
import cors from "cors";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import authRoutes from "./routes/authRoutes.js";
import testRoutes from "./routes/testRoutes.js";
import ticketRoutes from "./routes/ticketRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";
import resourceRoutes from "./routes/resourceRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import adminRoutes from "./routes/admin/adminRoutes.js";

const frontend = fileURLToPath(new URL("../../frontend/dist/", import.meta.url));

export function createApp({ serveFrontend = false } = {}) {
  const app = express();
  app.use(cors());
  app.use(express.json());

  const health = (_req, res) => res.json({ message: "TriageSync is running..." });
  app.get("/api/health", health);
  app.use("/api/auth", authRoutes);
  app.use("/api/test", testRoutes);
  app.use("/api/tickets", ticketRoutes);
  app.use("/api/stats", statsRoutes);
  app.use("/api/resources", resourceRoutes);
  app.use("/api/bookings", bookingRoutes);
  app.use("/api/admin", adminRoutes);

  app.use("/api", (_req, res) => res.status(404).json({
    error: { code: "NOT_FOUND", message: "API route not found" },
  }));

  if (serveFrontend) {
    const index = join(frontend, "index.html");
    if (!existsSync(index)) throw new Error("Build the frontend before enabling SERVE_FRONTEND.");
    app.use(express.static(frontend, { index: false }));
    app.use("/assets", (_req, res) => res.sendStatus(404));
    app.get("/{*path}", (_req, res) => res.sendFile(index));
  } else {
    app.get("/", health);
  }

  app.use((error, _req, res, next) => {
    if (res.headersSent) return next(error);
    if (error.type === "entity.parse.failed") {
      return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Invalid JSON body" } });
    }
    if (error.type === "entity.too.large") {
      return res.status(413).json({ error: { code: "VALIDATION_ERROR", message: "Request body is too large" } });
    }
    console.error("Unhandled server error:", error.name);
    return res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Something went wrong" } });
  });

  return app;
}
