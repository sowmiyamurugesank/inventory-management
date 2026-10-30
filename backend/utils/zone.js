import pool from "../config/db.js";

const OPERATIONS = {
  LIST: {
    sql: `
      SELECT public.list_warehouse_zones(
        $1::jsonb,
        $2::integer,
        $3::integer
      ) AS result
    `,
    params: (data) => [
      JSON.stringify(data.filters ?? {}),
      data.page ?? 1,
      data.pageSize ?? 50,
    ],
  },

  CREATE: {
    sql: `
      SELECT public.create_warehouse_zone($1::jsonb) AS result
    `,
    params: (data) => [JSON.stringify(data)],
  },

  UPDATE: {
    sql: `
      SELECT public.update_warehouse_zone(
        $1::uuid,
        $2::jsonb
      ) AS result
    `,
    params: (data) => [data.id, JSON.stringify(data.payload ?? {})],
  },

  DELETE: {
    sql: `
      SELECT public.delete_warehouse_zone(
        $1::uuid,
        $2::uuid
      ) AS result
    `,
    params: (data) => [data.id, data.deletedBy ?? null],
  },
};

export async function zone(operation, data = {}) {
  const config = OPERATIONS[operation];

  if (!config) {
    throw new Error(`Unsupported zone operation: ${operation}`);
  }

  const { rows } = await pool.query(config.sql, config.params(data));

  return rows[0].result;
}
