import pool from "../config/db.js";
import { crud } from "../utils/Product.js";

function normalizeCustomAttributes(attributes) {
  // If already an object, use it.
  if (
    attributes &&
    typeof attributes === "object" &&
    !Array.isArray(attributes)
  ) {
    return attributes;
  }

  // Convert the frontend array into a JSON object.
  if (Array.isArray(attributes)) {
    return Object.fromEntries(
      attributes
        .filter((attribute) => attribute.name?.trim() !== "")
        .map((attribute) => [attribute.name.trim(), attribute.value ?? ""]),
    );
  }

  return {};
}

export const itemListService = {
  // GET ALL PRODUCTS

  async list(filters, page, pageSize) {
    return crud("LIST", { filters, page, pageSize });
  },

  // GET PRODUCT WITH INCOMING STOCK DETAILS

  async getById(id) {
    // 1. Fetch the product.
    const itemResult = await crud("GET", { id });

    if (!itemResult.success) {
      return itemResult;
    }

    // 2. Fetch all incoming-stock records belonging to this product.
    const stockQuery = `
  SELECT list_warehouse_incoming_stock(
    $1::jsonb,
    $2::integer,
    $3::integer
  ) AS result
`;

    const stockResponse = await pool.query(stockQuery, [
      JSON.stringify({
        item_id: id,
      }),
      1,
      500,
    ]);

    const stockResult = stockResponse.rows[0].result;

    if (!stockResult.success) {
      return stockResult;
    }

    // 3. Return product and its incoming-stock records together.
    return {
      success: true,
      data: {
        item: itemResult.data,
        incomingStocks: stockResult.data ?? [],
      },
      error: null,
    };
  },

  // CREATE PRODUCT + INCOMING STOCK

  async create(data, userId) {
    const client = await pool.connect();

    let transactionStarted = false;

    try {
      await client.query("BEGIN");
      transactionStarted = true;

      // Separate stock fields from product fields.
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

      // 1. Create product.
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

      const itemId = itemResult.data?.id;

      if (!itemId) {
        throw new Error("Product creation did not return the product ID.");
      }

      // 2. Prepare incoming-stock data.
      const stockData = {
        warehouse_id: warehouseId,
        zone_id: warehouseZoneId,
        item_id: itemId,

        code: incomingStockCode,
        incoming_quantity: incomingQuantity,
        quantity_unit: quantityUnit,

        vendor_id: vendorId || null,

        // vendorItemId is currently treated as a text value
        // by the frontend. Do not send it as vendor_item_id
        // until the vendor_items UUID relationship is resolved.
        vendor_item_id: null,

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

        custom_attributes: normalizeCustomAttributes(customAttributes),

        status: incomingStockStatus || "PENDING",
        is_active: true,
        is_verified: stockVerified ?? false,

        created_by: userId,
        updated_by: userId,
      };

      // 3. Create incoming stock using the same transaction.
      const stockQuery = `
    SELECT public.create_warehouse_incoming_stock(
      $1::jsonb
    ) AS result
  `;

      const stockResponse = await client.query(stockQuery, [
        JSON.stringify(stockData),
      ]);

      const stockResult = stockResponse.rows[0].result;

      if (!stockResult.success) {
        await client.query("ROLLBACK");
        transactionStarted = false;

        return stockResult;
      }

      // 4. Commit both operations.
      await client.query("COMMIT");
      transactionStarted = false;

      return {
        success: true,
        data: {
          item: itemResult.data,
          incomingStock: stockResult.data,
        },
        error: null,
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

  // UPDATE PRODUCT + SELECTED INCOMING STOCK

  async update(id, data, userId) {
    const client = await pool.connect();

    let transactionStarted = false;

    try {
      await client.query("BEGIN");
      transactionStarted = true;

      // Separate product and stock information.
      const { incomingStockId, incomingStock, ...productData } = data;

      // 1. Update product information.
      const itemResult = await crud(
        "UPDATE",
        {
          id,
          data: {
            ...productData,
            updated_by: userId,
          },
          userId,
        },
        client,
      );

      if (!itemResult.success) {
        await client.query("ROLLBACK");
        transactionStarted = false;

        return itemResult;
      }

      let stockResult = null;

      // 2. Update the selected incoming-stock record.
      if (incomingStock) {
        if (!incomingStockId) {
          throw new Error(
            "Incoming stock ID is required to update a stock record.",
          );
        }

        const stockData = {
          warehouse_id: incomingStock.warehouse_id,
          zone_id: incomingStock.zone_id,
          item_id: id,

          code: incomingStock.code,
          incoming_quantity: incomingStock.incoming_quantity,
          quantity_unit: incomingStock.quantity_unit,

          vendor_id: incomingStock.vendor_id || null,
          vendor_item_id: incomingStock.vendor_item_id || null,

          is_direct: incomingStock.is_direct,
          source_document_type: incomingStock.source_document_type,

          quotation_number: incomingStock.quotation_number,
          purchase_order_number: incomingStock.purchase_order_number,
          goods_receipt_number: incomingStock.goods_receipt_number,
          invoice_number: incomingStock.invoice_number,
          credit_note_number: incomingStock.credit_note_number,
          payment_reference_number: incomingStock.payment_reference_number,
          reference_number: incomingStock.reference_number,

          unit_cost: incomingStock.unit_cost,
          total_cost: incomingStock.total_cost,
          currency_code: incomingStock.currency_code,

          expiry_date: incomingStock.expiry_date,
          received_at: incomingStock.received_at,
          notes: incomingStock.notes,

          custom_attributes: normalizeCustomAttributes(
            incomingStock.custom_attributes,
          ),

          status: incomingStock.status,
          is_active: incomingStock.is_active,
          is_verified: incomingStock.is_verified,

          version: incomingStock.version,
          updated_by: userId,
        };

        const stockQuery = `
      SELECT update_warehouse_incoming_stock(
        $1::uuid,
        $2::jsonb
      ) AS result
    `;

        const stockResponse = await client.query(stockQuery, [
          incomingStockId,
          JSON.stringify(stockData),
        ]);

        stockResult = stockResponse.rows[0].result;

        if (!stockResult.success) {
          await client.query("ROLLBACK");
          transactionStarted = false;

          return stockResult;
        }
      }

      // 3. Commit successful updates.
      await client.query("COMMIT");
      transactionStarted = false;

      return {
        success: true,
        data: {
          item: itemResult.data,
          incomingStock: stockResult?.data ?? null,
        },
        error: null,
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

  // DELETE PRODUCT

  async delete(id, userId) {
    return crud("DELETE", { id, userId });
  },
};
