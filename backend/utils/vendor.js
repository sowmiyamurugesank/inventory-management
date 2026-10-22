import pool from "../config/db.js";

const CRUD_OPERATIONS = {
  // ==========================================
  // SUPPLIER / VENDOR OPERATIONS
  // ==========================================

  VENDOR_LIST: {
    sql: `
            SELECT list_vendors(
                $1::jsonb,
                $2::integer,
                $3::integer
            ) AS result
        `,
    params: (data) => [
      JSON.stringify(data.filters ?? {}),
      data.page ?? 1,
      data.pageSize ?? 10,
    ],
  },

  VENDOR_GET: {
    sql: `
            SELECT get_vendor($1::uuid) AS result
        `,
    params: (data) => [data.id],
  },

  VENDOR_CREATE: {
    sql: `
            SELECT create_vendor($1::jsonb) AS result
        `,
    params: (data) => {
      const payload = {
        ...data.data,
        created_by: data.userId ?? null,
      };

      return [JSON.stringify(payload)];
    },
  },

  VENDOR_UPDATE: {
    sql: `
            SELECT update_vendor(
                $1::uuid,
                $2::jsonb
            ) AS result
        `,
    params: (data) => {
      const payload = {
        ...data.data,
        updated_by: data.userId ?? null,
      };

      return [data.id, JSON.stringify(payload)];
    },
  },

  VENDOR_DELETE: {
    sql: `
            SELECT delete_vendor(
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
