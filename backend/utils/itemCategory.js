import pool from "../config/db.js";

const OPERATIONS = {
  LIST: {
    sql: `
      SELECT public.list_item_categories(
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
      SELECT public.get_item_category(
        $1::uuid
      ) AS result
    `,
    params: (data) => [data.id],
  },

  CREATE: {
    sql: `
      SELECT public.create_item_category(
        $1::jsonb
      ) AS result
    `,
    params: (data) => [JSON.stringify(data.data)],
  },

  UPDATE: {
    sql: `
      SELECT public.update_item_category(
        $1::uuid,
        $2::jsonb
      ) AS result
    `,
    params: (data) => [data.id, JSON.stringify(data.data)],
  },

  DELETE: {
    sql: `
      SELECT public.delete_item_category(
        $1::uuid,
        $2::uuid
      ) AS result
    `,
    params: (data) => [data.id, data.deletedBy ?? null],
  },
};

export async function itemCategory(operation, data = {}) {
  const config = OPERATIONS[operation];

  if (!config) {
    throw new Error(`Unsupported item category operation: ${operation}`);
  }

  const params = config.params(data);

  const { rows } = await pool.query(config.sql, params);

  return rows[0].result;
}
