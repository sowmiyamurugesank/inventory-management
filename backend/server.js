import app from "./app.js";
import pool from "./config/db.js"; // adjust path if db.js is elsewhere

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("PostgreSQL connected:", res.rows[0].now);
  } catch (err) {
    console.error("Database connection failed:", err.message);
  }
});