import express from "express";

import cors from "cors";

import itemListRoutes from "./routes/itemList.routes.js";

import vendorRoutes from "./routes/vendor.routes.js";

import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend is running",
  });
});

app.use("/api/items", itemListRoutes);

app.use("/api/vendors", vendorRoutes);

app.use(errorHandler);

export default app;
