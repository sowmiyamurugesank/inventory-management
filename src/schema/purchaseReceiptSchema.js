
import { z } from "zod";

const quantitySchema = z.coerce
  .number({ invalid_type_error: "Enter a valid quantity" })
  .min(0, "Quantity cannot be negative")
  .finite("Enter a valid quantity");

export const purchaseReturnPolicySchema = z
  .object({
    policyName: z.string().trim().min(1, "Policy Name is required"),

    description: z.string().optional().default(""),

    effectiveFrom: z.string().min(1, "Effective From date is required"),

    effectiveUntil: z.string().optional().default(""),

    returnWindow: z.coerce
      .number({ invalid_type_error: "Enter a valid return window" })
      .int("Return Window must be a whole number")
      .min(1, "Return Window must be at least 1 day"),

    windowStartsFrom: z
      .string()
      .min(1, "Window Starts From is required"),

    maximumReturnQuantity: z.preprocess(
      (value) =>
        value === "" || value === null || value === undefined
          ? null
          : Number(value),
      z
        .number()
        .int("Maximum Return Quantity must be a whole number")
        .min(1, "Maximum Return Quantity must be at least 1")
        .nullable()
    ),

    restockingFee: z.coerce
      .number()
      .min(0, "Restocking Fee cannot be negative")
      .max(100, "Restocking Fee cannot exceed 100%"),

    returnConditions: z.object({
      returnsAllowed: z.boolean(),
      damagedGoodsAccepted: z.boolean(),
      defectiveGoodsAccepted: z.boolean(),
      wrongItemsAccepted: z.boolean(),
      expiredGoodsAccepted: z.boolean(),
      openedItemsAccepted: z.boolean(),
      originalPackagingRequired: z.boolean(),
      originalInvoiceRequired: z.boolean(),
      inspectionRequired: z.boolean(),
      vendorApprovalRequired: z.boolean(),
    }),

    allowedResolutionMethods: z
      .array(
        z.enum(["REFUND", "CREDIT_NOTE", "REPLACEMENT", "FUTURE_CREDIT"])
      )
      .min(1, "Select at least one resolution method"),

    policyTerms: z
      .string()
      .trim()
      .min(1, "Please enter the return policy terms"),

    status: z.enum(["DRAFT", "ACTIVE", "SUSPENDED", "EXPIRED"]),
  })
  .superRefine((data, ctx) => {
    if (
      data.effectiveUntil &&
      data.effectiveFrom &&
      data.effectiveUntil < data.effectiveFrom
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["effectiveUntil"],
        message: "Effective Until must be on or after Effective From",
      });
    }
  });

export const purchaseReceiptSchema = z
  .object({
    purchaseOrderId: z.string().trim().min(1, "Purchase Order is required"),

    warehouseId: z.string().trim().min(1, "Warehouse is required"),

    receiptCode: z.string().trim().min(1, "Receipt Code is required"),

    grnNumber: z.string().trim().min(1, "GRN Number is required"),

    deliveryNoteNumber: z.string().optional().default(""),

    vehicleNumber: z.string().optional().default(""),

    receivedBy: z.string().trim().min(1, "Received By is required"),

    receiptDate: z.string().min(1, "Receipt Date is required"),

    currency: z.string().trim().min(1, "Currency is required"),

    receiptNotes: z.string().optional().default(""),

    items: z
      .array(
        z.object({
          purchaseOrderItemId: z
            .string()
            .trim()
            .min(1, "Purchase Order Item is required"),

          itemCode: z.string().optional().default(""),

          itemDescription: z
            .string()
            .trim()
            .min(1, "Product description is required"),

          orderedQuantity: quantitySchema,

          previouslyReceived: quantitySchema,

          remainingQuantity: quantitySchema,

          receivedQuantity: quantitySchema.refine(
            (value) => value > 0,
            "Received Quantity must be greater than 0"
          ),

          acceptedQuantity: quantitySchema,

          rejectedQuantity: quantitySchema,

          storageZoneId: z
            .string()
            .trim()
            .min(1, "Storage Zone is required"),

          inspectionStatus: z
            .string()
            .trim()
            .min(1, "Inspection Status is required"),

          unitCost: quantitySchema,

          rejectionReason: z.string().optional().default(""),

          itemNotes: z.string().optional().default(""),
        })
      )
      .min(1, "At least one receipt item is required"),
  })
  .superRefine((data, ctx) => {
    data.items.forEach((item, index) => {
      if (item.receivedQuantity > item.remainingQuantity) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["items", index, "receivedQuantity"],
          message: "Received quantity cannot exceed remaining quantity",
        });
      }

      if (
        item.acceptedQuantity + item.rejectedQuantity !==
        item.receivedQuantity
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["items", index, "acceptedQuantity"],
          message:
            "Accepted Quantity + Rejected Quantity must equal Received Quantity",
        });
      }

      if (item.rejectedQuantity > 0 && !item.rejectionReason?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["items", index, "rejectionReason"],
          message: "Rejection Reason is required for rejected items",
        });
      }

      if (
        item.previouslyReceived + item.receivedQuantity >
        item.orderedQuantity
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["items", index, "receivedQuantity"],
          message: "Total received quantity cannot exceed ordered quantity",
        });
      }
    });
  });

export default purchaseReceiptSchema;
