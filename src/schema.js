
import { z } from "zod";

export const itemSchema = z.object({
  code: z.string().trim().min(1, "Item code is required"),
  name: z.string().trim().min(1, "Item name is required"),
  item_type: z.string().min(1, "Select item type"),
  base_unit: z.string().min(1, "Select base unit"),
  purchase_cost: z.number().min(0),
  selling_price: z.number().min(0),
  mrp: z.number().min(0),
  is_verified: z.boolean(),
  attributes: z.array(
    z.object({
      name: z.string(),
      value: z.string(),
    })
  ),
  custom_attributes: z.array(
    z.object({
      name: z.string(),
      value: z.string(),
    })
  ),
});
