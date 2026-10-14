
import { z } from "zod";
import bcrypt from "bcryptjs";

import {
    listAccounts,
    getAccount,
    createAccount,
    updateAccount,
    deleteAccount,
} from "../services/staffLogin.service.js";

const uuidSchema = z.string().uuid();

const createSchema = z.object({
    staff_id: uuidSchema,
    username: z.string().trim().min(1).max(100),
    password: z.string().min(8).max(128),
    account_status: z
        .enum(["PENDING", "ACTIVE", "LOCKED", "DISABLED"])
        .optional(),
    custom_attributes: z.record(z.string(), z.unknown()).optional(),
});

const updateSchema = z.object({
    username: z.string().trim().min(1).max(100).optional(),
    password: z.string().min(8).max(128).optional(),
    account_status: z
        .enum(["PENDING", "ACTIVE", "LOCKED", "DISABLED"])
        .optional(),
    failed_login_attempts: z.number().int().min(0).optional(),
    locked_until: z.string().datetime({ offset: true }).nullable().optional(),
    custom_attributes: z.record(z.string(), z.unknown()).optional(),
    version: z.number().int().positive().optional(),
    updated_by: uuidSchema.optional(),
}).refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
});

function sendDatabaseResult(res, result, successStatus = 200) {
    if (!result?.success) {
        const message = result?.error || "Database operation failed";

        const status =
            /not found|already deleted/i.test(message) ? 404 :
                /already exists|unique|conflict/i.test(message) ? 409 :
                    400;

        return res.status(status).json(result);
    }

    return res.status(successStatus).json(result);
}

export async function list(req, res, next) {
    try {
        const page = Number(req.query.page ?? 1);
        const pageSize = Number(req.query.pageSize ?? 50);

        if (
            !Number.isInteger(page) ||
            !Number.isInteger(pageSize) ||
            page < 1 ||
            pageSize < 1
        ) {
            return res.status(400).json({
                success: false,
                error: "page and pageSize must be positive integers",
            });
        }

        const allowedFilters = [
            "staff_id",
            "username",
            "account_status",
            "failed_login_attempts",
            "is_locked",
            "created_from",
            "created_to",
        ];

        const filters = {};

        for (const key of allowedFilters) {
            if (req.query[key] !== undefined) {
                filters[key] = req.query[key];
            }
        }

        if (
            filters.staff_id &&
            !uuidSchema.safeParse(filters.staff_id).success
        ) {
            return res.status(400).json({
                success: false,
                error: "Invalid staff_id",
            });
        }

        if (
            filters.account_status &&
            !["PENDING", "ACTIVE", "LOCKED", "DISABLED"].includes(
                filters.account_status
            )
        ) {
            return res.status(400).json({
                success: false,
                error: "Invalid account_status",
            });
        }

        if (
            filters.is_locked !== undefined &&
            !["true", "false"].includes(filters.is_locked)
        ) {
            return res.status(400).json({
                success: false,
                error: "is_locked must be true or false",
            });
        }

        const result = await listAccounts(filters, page, pageSize);
        return sendDatabaseResult(res, result);
    } catch (error) {
        next(error);
    }
}

export async function getOne(req, res, next) {
    try {
        if (!uuidSchema.safeParse(req.params.id).success) {
            return res.status(400).json({
                success: false,
                error: "Invalid account ID",
            });
        }

        const result = await getAccount(req.params.id);
        return sendDatabaseResult(res, result);
    } catch (error) {
        next(error);
    }
}

export async function create(req, res, next) {
    try {
        const parsed = createSchema.safeParse(req.body);

        if (!parsed.success) {
            return res.status(400).json({
                success: false,
                error: "Invalid input",
                details: parsed.error.issues,
            });
        }

        const {
            password,
            ...account
        } = parsed.data;

        // Hash the password on the server; never store plaintext.
        const password_hash = await bcrypt.hash(password, 12);

        const result = await createAccount({
            ...account,
            password_hash,
        });

        return sendDatabaseResult(res, result, 201);
    } catch (error) {
        next(error);
    }
}

export async function update(req, res, next) {
    try {
        if (!uuidSchema.safeParse(req.params.id).success) {
            return res.status(400).json({
                success: false,
                error: "Invalid account ID",
            });
        }

        const parsed = updateSchema.safeParse(req.body);

        if (!parsed.success) {
            return res.status(400).json({
                success: false,
                error: "Invalid input",
                details: parsed.error.issues,
            });
        }

        const { password, ...fields } = parsed.data;
        const data = { ...fields };

        if (password) {
            data.password_hash = await bcrypt.hash(password, 12);
            data.password_changed_at = new Date().toISOString();
        }

        const result = await updateAccount(req.params.id, data);
        return sendDatabaseResult(res, result);
    } catch (error) {
        next(error);
    }
}

export async function remove(req, res, next) {
    try {
        if (!uuidSchema.safeParse(req.params.id).success) {
            return res.status(400).json({
                success: false,
                error: "Invalid account ID",
            });
        }

        // Set this from the authenticated user's ID once auth middleware
        // is enabled. Never trust an arbitrary deleted_by value from a client.
        const result = await deleteAccount(req.params.id, null);
        return sendDatabaseResult(res, result);
    } catch (error) {
        next(error);
    }
}
