import { z } from "zod";

const optionalText = (maxLength) =>
  z.string().trim().max(maxLength).optional().or(z.literal(""));

const optionalInteger = z.union([
  z.literal(""),
  z.coerce
    .number({
      invalid_type_error: "Enter a valid number",
    })
    .int("Must be a whole number")
    .min(0, "Cannot be negative"),
]);

const optionalDecimal = z.union([
  z.literal(""),
  z.coerce
    .number({
      invalid_type_error: "Enter a valid number",
    })
    .min(0, "Cannot be negative"),
]);

const supplierSchema = z.object({
  vendorType: z.enum(["Business", "Individual"]),

  vendorCode: z
    .string()
    .trim()
    .min(1, "Vendor code is required")
    .max(50, "Vendor code cannot exceed 50 characters"),

  numericCode: optionalInteger,

  vendorName: z
    .string()
    .trim()
    .min(1, "Vendor name is required")
    .max(200, "Vendor name cannot exceed 200 characters"),

  description: optionalText(5000),

  contactPerson: optionalText(200),

  email: z
    .string()
    .trim()
    .email("Enter a valid email address")
    .optional()
    .or(z.literal("")),

  phone: z
    .string()
    .trim()
    .max(30, "Phone number cannot exceed 30 characters")
    .optional()
    .or(z.literal("")),

  website: z
    .string()
    .trim()
    .max(255, "Website cannot exceed 255 characters")
    .optional()
    .or(z.literal("")),

  addressLine1: optionalText(200),
  addressLine2: optionalText(200),
  city: optionalText(100),
  state: optionalText(100),
  postalCode: optionalText(20),

  countryCode: z
    .string()
    .trim()
    .length(2, "Country code must contain 2 letters")
    .regex(/^[A-Za-z]{2}$/, "Country code must contain letters only"),

  gstin: z
    .string()
    .trim()
    .regex(
      /^$|^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/,
      "Enter a valid 15-character GSTIN",
    ),

  pan: z
    .string()
    .trim()
    .regex(/^$|^[A-Z]{5}[0-9]{4}[A-Z]$/, "Enter a valid 10-character PAN"),

  paymentTerms: optionalInteger,
  creditLimit: optionalDecimal,

  currency: z.enum(["INR", "USD", "EUR"]),

  activeVendor: z.boolean(),
  verifiedVendor: z.boolean(),
});

export default supplierSchema;
