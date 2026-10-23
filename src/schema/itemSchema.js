
import { z } from "zod";

const attributeSchema = z.object({
  name: z.string().trim(),
  value: z.string(),
});

const nonNegativeNumber = (label) =>
  z.coerce
    .number({ invalid_type_error: `${label} must be a valid number` })
    .finite(`${label} must be a valid number`)
    .min(0, `${label} cannot be negative`);

const positiveQuantity = z.union([
  z.coerce.number().finite().positive("Incoming quantity must be greater than 0"),
  z.string().regex(/^[1-9]\d*$/, "Enter a valid positive quantity"),
]);

export const itemSchema = z.object({
  // 1. Product Information
  itemCode: z.string().trim().min(1, "Item code is required"),
  itemName: z.string().trim().min(2, "Item name must contain at least 2 characters"),
  itemType: z.enum(["PRODUCT", "SERVICE"], { message: "Item type is required" }),
  category: z.string().default(""),
  description: z.string().default(""),
  brandName: z.string().default(""),
  manufacturer: z.string().default(""),
  manufacturerPartNumber: z.string().default(""),
  baseUnit: z.string().trim().min(1, "Base unit is required"),
  currency: z.string().trim().min(1, "Currency is required").default("INR"),

  // 2. Pricing Information: Negative values are blocked
  purchaseCost: nonNegativeNumber("Purchase cost").default(0),
  sellingPrice: nonNegativeNumber("Selling price").default(0),
  mrp: nonNegativeNumber("MRP").default(0),
  initialItemStatus: z.enum(["OUT_OF_STOCK", "IN_STOCK", "LOW_STOCK"]).default("OUT_OF_STOCK"),

  // 3. Incoming Stock Details
  warehouseId: z.string().default(""),
  warehouseZoneId: z.string().default(""),
  incomingStockCode: z.string().default(""),
  incomingQuantity: z.union([
  z.coerce.number().finite().positive("Incoming quantity must be greater than 0"),
  z.string().regex(/^[1-9]\d*$/, "Incoming quantity must be greater than 0"),
]).optional(),
  quantityUnit: z.string().default(""),
  incomingStockStatus: z.enum(["PENDING", "RECEIVED", "CANCELLED"]).default("PENDING"),

  // 4. Supplier & Purchase References
  vendorId: z.string().default(""),
  vendorItemId: z.string().default(""),
  sourceDocumentType: z.string().min(1, "Source document type is required").default("MANUAL"),
  directEntry: z.boolean().default(true),
  quotationNumber: z.string().default(""),
  purchaseOrderNumber: z.string().default(""),
  goodsReceiptNumber: z.string().default(""),
  invoiceNumber: z.string().default(""),
  creditNoteNumber: z.string().default(""),
  paymentReferenceNumber: z.string().default(""),
  otherReferenceNumber: z.string().default(""),

  // 5. Cost, Receipt & Expiry
  expiryDate: z.string().default(""),
  unitCost: nonNegativeNumber("Unit cost").default(0),
  totalCost: nonNegativeNumber("Total cost").default(0),
  stockCurrency: z.string().default("INR"),
  receivedAt: z.string().default(""),

  // 6. Additional Settings
  active: z.boolean().default(true),
  verified: z.boolean().default(false),
  stockVerified: z.boolean().default(false),
  itemAttributes: z.array(attributeSchema).default([]),
  customAttributes: z.array(attributeSchema).default([]),
}).superRefine((data, ctx) => {
  if (!data.addIncomingStock) return;

  if (!data.warehouseId.trim()) {
    ctx.addIssue({ code: "custom", path: ["warehouseId"], message: "Warehouse is required" });
  }

  if (!data.warehouseZoneId.trim()) {
    ctx.addIssue({ code: "custom", path: ["warehouseZoneId"], message: "Warehouse zone is required" });
  }

  if (!data.incomingStockCode.trim()) {
    ctx.addIssue({ code: "custom", path: ["incomingStockCode"], message: "Incoming stock code is required" });
  }

  const quantity = Number(data.incomingQuantity);
  if (data.incomingQuantity === undefined || data.incomingQuantity === "" || !Number.isFinite(quantity) || quantity <= 0) {
    ctx.addIssue({ code: "custom", path: ["incomingQuantity"], message: "Incoming quantity must be greater than 0" });
  }

  if (!data.quantityUnit.trim()) {
    ctx.addIssue({ code: "custom", path: ["quantityUnit"], message: "Quantity unit is required" });
  }

  if (data.incomingStockStatus === "RECEIVED" && !data.receivedAt.trim()) {
    ctx.addIssue({ code: "custom", path: ["receivedAt"], message: "Received date and time is required" });
  }
});
