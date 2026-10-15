import express from "express";

import itemListRoutes from "./routes/itemList.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend is running",
  });
});

app.use("/api/items", itemListRoutes);

app.use(errorHandler);

export default app;
