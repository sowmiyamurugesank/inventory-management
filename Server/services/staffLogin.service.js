
import pool from "../config/db.js";

export async function listAccounts(filters = {}, page = 1, pageSize = 50) {
    const { rows } = await pool.query(
        `SELECT list_staff_login_accounts($1::jsonb, $2::int, $3::int) AS result`,
        [JSON.stringify(filters), page, pageSize]
    );

    return rows[0].result;
}

export async function getAccount(id) {
    const { rows } = await pool.query(
        `SELECT get_staff_login_account($1::uuid) AS result`,
        [id]
    );

    return rows[0].result;
}

export async function createAccount(data) {
    const { rows } = await pool.query(
        `SELECT create_staff_login_account($1::jsonb) AS result`,
        [JSON.stringify(data)]
    );

    return rows[0].result;
}

export async function updateAccount(id, data) {
    const { rows } = await pool.query(
        `SELECT update_staff_login_account($1::uuid, $2::jsonb) AS result`,
        [id, JSON.stringify(data)]
    );

    return rows[0].result;
}

export async function deleteAccount(id, deletedBy = null) {
    const { rows } = await pool.query(
        `SELECT delete_staff_login_account($1::uuid, $2::uuid) AS result`,
        [id, deletedBy]
    );

    return rows[0].result;
}
