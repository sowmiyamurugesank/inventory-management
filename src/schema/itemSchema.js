
import { z } from "zod";

export const itemSchema = z.object({
  itemCode: z.string().trim().min(1, "Item code is required"),
  itemName: z.string().trim().min(1, "Item name is required"),
  itemType: z.string().min(1, "Item type is required"),
  category: z.string(),
  description: z.string(),
  brandName: z.string(),
  manufacturer: z.string(),
  manufacturerPartNumber: z.string(),
  baseUnit: z.string().min(1, "Base unit is required"),
  purchaseCost: z.coerce.number().min(0, "Cannot be negative"),
  sellingPrice: z.coerce.number().min(0, "Cannot be negative"),
  mrp: z.coerce.number().min(0, "Cannot be negative"),
  currency: z.string().min(1, "Currency is required"),
  verified: z.boolean(),
  itemAttributes: z.array(
    z.object({
      name: z.string(),
      value: z.string(),
    })
  ),
  customAttributes: z.array(
    z.object({
      name: z.string(),
      value: z.string(),
    })
  ),
});