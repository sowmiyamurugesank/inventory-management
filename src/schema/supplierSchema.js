import { z } from "zod";

const supplierSchema = z.object({

    // Vendor Information

    vendorType: z
        .string()
        .min(1, "Please select vendor type"),

    vendorCode: z
        .string()
        .trim()
        .min(1, "Please enter vendor code")
        .regex(
            /^[A-Za-z0-9]+$/,
            "Only letters and numbers are allowed"
        ),

    numericCode: z
        .string()
        .refine(
            (value) => value === "" || /^\d+$/.test(value),
            "Only numbers are allowed"
        ),

    vendorName: z
        .string()
        .trim()
        .min(1, "Please enter vendor name")
        .regex(
            /^[A-Za-z ]+$/,
            "Only letters and spaces are allowed"
        ),

    description: z.string(),

    // Contact Details

    contactPerson: z
        .string()
        .refine(
            (value) =>
                value === "" || /^[A-Za-z ]+$/.test(value),
            "Only letters and spaces are allowed"
        ),

    email: z
        .string()
        .refine(
            (value) =>
                value === "" ||
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
            "Enter a valid email"
        ),

    phone: z
        .string()
        .refine(
            (value) => value === "" || /^\d+$/.test(value),
            "Only numbers are allowed"
        ),

    website: z
        .string()
        .refine(
            (value) =>
                value === "" ||
                /^https?:\/\/.+\..+/.test(value),
            "Enter a valid website URL"
        ),

    // Address Details

    addressLine1: z.string(),

    addressLine2: z.string(),

    city: z
        .string()
        .refine(
            (value) =>
                value === "" || /^[A-Za-z ]+$/.test(value),
            "Only letters and spaces are allowed"
        ),

    state: z
        .string()
        .refine(
            (value) =>
                value === "" || /^[A-Za-z ]+$/.test(value),
            "Only letters and spaces are allowed"
        ),

    postalCode: z
        .string()
        .refine(
            (value) => value === "" || /^\d+$/.test(value),
            "Only numbers are allowed"
        ),

    countryCode: z
        .string()
        .trim()
        .min(1, "Please enter country code")
        .regex(
            /^[A-Za-z]+$/,
            "Only letters are allowed"
        ),

    // Tax & Payment Details

    gstin: z
        .string()
        .refine(
            (value) =>
                value === "" || /^[A-Za-z0-9]+$/.test(value),
            "Only letters and numbers are allowed"
        ),

    pan: z
        .string()
        .refine(
            (value) =>
                value === "" || /^[A-Za-z0-9]+$/.test(value),
            "Only letters and numbers are allowed"
        ),

    paymentTerms: z
        .string()
        .refine(
            (value) => value === "" || /^\d+$/.test(value),
            "Only numbers are allowed"
        ),

    creditLimit: z
        .string()
        .refine(
            (value) =>
                value === "" || /^\d+(\.\d+)?$/.test(value),
            "Enter a valid amount"
        ),

    currency: z
        .string()
        .min(1, "Please select currency"),

    // Vendor Status

    activeVendor: z.boolean(),

    verifiedVendor: z.boolean(),

});

export default supplierSchema;