
import pool from "../config/db.js";

export const purchaseOrderService = {
  async list() {
    const result = await pool.query(
      `SELECT *
       FROM purchase_orders
       WHERE is_active = TRUE
       ORDER BY created_at DESC`
    );

    return result.rows;
  },

  async getById(id) {
    const result = await pool.query(
      `SELECT *
       FROM purchase_orders
       WHERE id = $1
       AND is_active = TRUE`,
      [id]
    );

    return result.rows[0] || null;
  },

  async create(data) {
    const {
      code,
      poNumber,
      vendorId,
      poDate,
      expectedDeliveryDate,
      currencyCode,
      notes
    } = data;

    const result = await pool.query(
      `INSERT INTO purchase_orders (
        code,
        po_number,
        vendor_id,
        po_date,
        expected_delivery_date,
        currency_code,
        notes,
        purchase_method,
        status,
        is_active
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        code,
        poNumber,
        vendorId,
        poDate || null,
        expectedDeliveryDate || null,
        currencyCode || "INR",
        notes || null,
        "DIRECT",
        "DRAFT",
        true
      ]
    );

    return result.rows[0];
  },

  async update(id, data) {
    const {
      poNumber,
      vendorId,
      poDate,
      expectedDeliveryDate,
      notes
    } = data;

    const result = await pool.query(
      `UPDATE purchase_orders
       SET po_number = $1,
           vendor_id = $2,
           po_date = $3,
           expected_delivery_date = $4,
           notes = $5,
           updated_at = NOW()
       WHERE id = $6
       AND is_active = TRUE
       RETURNING *`,
      [
        poNumber,
        vendorId,
        poDate || null,
        expectedDeliveryDate || null,
        notes || null,
        id
      ]
    );

    return result.rows[0] || null;
  },

  async delete(id) {
    const result = await pool.query(
      `UPDATE purchase_orders
       SET is_active = FALSE,
           updated_at = NOW()
       WHERE id = $1
       AND is_active = TRUE
       RETURNING *`,
      [id]
    );

    return result.rows[0] || null;
  }
};
