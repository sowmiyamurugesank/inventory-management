import pool from "../config/db.js";

const WAREHOUSE_OPERATIONS = {
  CREATE: {
    sql: `
      SELECT create_warehouse(
        $1::jsonb
      ) AS result
    `,
    params: (data) => [JSON.stringify(data.data)],
  },
};

export async function warehouse(operation, data = {}) {
  const config = WAREHOUSE_OPERATIONS[operation];

  if (!config) {
    throw new Error(`Unsupported warehouse operation: ${operation}`);
  }

  const params = config.params(data);

  const { rows } = await pool.query(config.sql, params);

  return rows[0].result;
}
