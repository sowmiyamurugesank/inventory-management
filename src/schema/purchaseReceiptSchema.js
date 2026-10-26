import { z } from "zod";

export const purchaseReceiptSchema = z.object({
  purchaseOrderId: z.string().min(1, "Purchase Order is required"),
  warehouseId: z.string().min(1, "Warehouse is required"),
  receiptCode: z.string().trim().min(1, "Receipt Code is required"),
  receivedBy: z.string().trim().min(1, "Received By is required"),
  receivedAt: z.string().min(1, "Received Date is required"),
  items: z.array(
    z.object({
      receivedQty: z.coerce.number().min(0, "Quantity cannot be negative"),
      acceptedQty: z.coerce.number().min(0, "Accepted quantity cannot be negative"),
      rejectedQty: z.coerce.number().min(0, "Rejected quantity cannot be negative"),
      rejectionReason: z.string().optional(),
    }).superRefine((item, ctx) => {
      if (item.acceptedQty + item.rejectedQty !== item.receivedQty) {
        ctx.addIssue({
          code: "custom",
          path: ["acceptedQty"],
          message: "Accepted + Rejected must equal Received Quantity",
        });
      }

      if (item.rejectedQty > 0 && !item.rejectionReason?.trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["rejectionReason"],
          message: "Rejection reason is required",
        });
      }
    })
  ).min(1, "At least one item is required"),
  notes: z.string().optional(),
});