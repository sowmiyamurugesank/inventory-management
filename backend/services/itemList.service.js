import pool from "../config/db.js";
import { crud } from "../utils/Product.js";

export const itemListService = {
  async list(filters, page, pageSize) {
    return crud("LIST", { filters, page, pageSize });
  },

  async getById(id) {
    return crud("GET", { id });
  },

  async create(data, userId) {
    const client = await pool.connect();

    let transactionStarted = false;

    try {
      await client.query("BEGIN");
      transactionStarted = true;

      // Separate stock fields from the product fields.
      const {
        warehouseId,
        warehouseZoneId,
        incomingStockCode,
        incomingQuantity,
        quantityUnit,
        incomingStockStatus,
        vendorId,
        vendorItemId,
        sourceDocumentType,
        directEntry,
        quotationNumber,
        purchaseOrderNumber,
        goodsReceiptNumber,
        invoiceNumber,
        creditNoteNumber,
        paymentReferenceNumber,
        otherReferenceNumber,
        expiryDate,
        unitCost,
        totalCost,
        stockCurrency,
        receivedAt,
        notes,
        stockVerified,
        customAttributes,
        ...productData
      } = data;

      // 1. Create the product using the transaction client.
      const itemResult = await crud(
        "CREATE",
        {
          data: productData,
          userId,
        },
        client,
      );

      if (!itemResult.success) {
        await client.query("ROLLBACK");
        transactionStarted = false;

        return itemResult;
      }

      // 2. Get the ID of the newly created product.
      const itemId = itemResult.data?.id;

      if (!itemId) {
        throw new Error("Product creation did not return the product ID.");
      }

      // 3. Prepare the incoming-stock record.
      const stockData = {
        warehouse_id: warehouseId,
        zone_id: warehouseZoneId,
        item_id: itemId,

        code: incomingStockCode,
        incoming_quantity: incomingQuantity,
        quantity_unit: quantityUnit,

        vendor_id: vendorId || null,
        vendor_item_id: vendorItemId || null,

        is_direct: directEntry ?? true,
        source_document_type: sourceDocumentType || "MANUAL",

        quotation_number: quotationNumber || null,
        purchase_order_number: purchaseOrderNumber || null,
        goods_receipt_number: goodsReceiptNumber || null,
        invoice_number: invoiceNumber || null,
        credit_note_number: creditNoteNumber || null,
        payment_reference_number: paymentReferenceNumber || null,
        reference_number: otherReferenceNumber || null,

        unit_cost: unitCost ?? null,
        total_cost: totalCost ?? null,
        currency_code: stockCurrency || "INR",

        expiry_date: expiryDate || null,
        received_at: receivedAt || null,
        notes: notes || null,

        custom_attributes: customAttributes || {},

        status: incomingStockStatus || "PENDING",
        is_active: true,
        is_verified: stockVerified ?? false,

        created_by: userId,
        updated_by: userId,
      };

      // 4. Create incoming stock using the same transaction client.
      const stockQuery = `
      SELECT public.create_warehouse_incoming_stock($1::jsonb)
      AS result
    `;

      const stockResponse = await client.query(stockQuery, [
        JSON.stringify(stockData),
      ]);

      const stockResult = stockResponse.rows[0].result;

      // 5. Roll back both operations if stock creation fails.
      if (!stockResult.success) {
        await client.query("ROLLBACK");
        transactionStarted = false;

        return stockResult;
      }

      // 6. Both product and incoming stock were created.
      await client.query("COMMIT");
      transactionStarted = false;

      return {
        success: true,
        data: {
          item: itemResult.data,
          incomingStock: stockResult.data,
        },
      };
    } catch (error) {
      if (transactionStarted) {
        await client.query("ROLLBACK");
      }

      throw error;
    } finally {
      client.release();
    }
  },
  async update(id, data, userId) {
    return crud("UPDATE", { id, data, userId });
  },

  async delete(id, userId) {
    return crud("DELETE", { id, userId });
  },
};
