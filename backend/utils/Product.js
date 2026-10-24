import pool from "../config/db.js";

const CRUD_OPERATIONS = {
  // ==========================================
  // ITEM LIST OPERATIONS
  // ==========================================

  LIST: {
    sql: `
            SELECT list_item_list(
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

  GET: {
    sql: `
            SELECT get_item_list($1::uuid) AS result
        `,
    params: (data) => [data.id],
  },

  CREATE: {
    sql: `
    SELECT public.create_item_list(
      $1::jsonb
    ) AS result
  `,
    params: (data) => [JSON.stringify(data.data)],
  },
  UPDATE: {
    sql: `
            SELECT update_item_list(
                $1::uuid,
                $2::jsonb,
                $3::uuid
            ) AS result
        `,
    params: (data) => [data.id, JSON.stringify(data.data), data.userId ?? null],
  },

  DELETE: {
    sql: `
            SELECT delete_item_list(
                $1::uuid,
                $2::uuid
            ) AS result
        `,
    params: (data) => [data.id, data.userId ?? null],
  },
};

export async function crud(operation, data = {}) {
  const config = CRUD_OPERATIONS[operation];

  if (!config) {
    throw new Error(`Unsupported CRUD operation: ${operation}`);
  }

  const params = config.params(data);

  const { rows } = await pool.query(config.sql, params);

  return rows[0].result;
}
