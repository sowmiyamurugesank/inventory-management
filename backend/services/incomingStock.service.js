
import pool from "../config/db.js";

export const incomingStockService = {
  async list(filters = {}, page = 1, pageSize = 50) {
    const query = `
      SELECT public.list_warehouse_incoming_stock(
        $1::jsonb,
        $2::integer,
        $3::integer
      ) AS result
    `;

    const response = await pool.query(query, [
      JSON.stringify(filters),
      page,
      pageSize,
    ]);

    return response.rows[0].result;
  },
};
 