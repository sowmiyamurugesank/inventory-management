
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import pool from "./config/db.js";
import staffLoginRoutes from "./Routes/staffLogin.routes.js";
import authRoutes from "./Routes/auth.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();

app.use(
    cors({
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
    })
);

app.use(express.json({ limit: "100kb" }));

app.get("/api/health", async (req, res, next) => {
    try {
        await pool.query("SELECT 1");

        res.json({
            success: true,
            message: "Express and PostgreSQL are connected",
        });
    } catch (error) {
        next(error);
    }
});

app.use("/api/auth", authRoutes);
app.use("/api/staff-login-accounts", staffLoginRoutes);

app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: "Route not found",
    });
});

app.use(errorHandler);

const PORT = Number(process.env.PORT || 5000);

const server = app.listen(PORT, () => {
    console.log(`API running at http://localhost:${PORT}`);
});

async function shutdown() {
    server.close(async () => {
        await pool.end();
        process.exit(0);
    });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
