
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";

import pool from "../config/db.js";
import { updateAccount } from "../services/staffLogin.service.js";

const loginSchema = z.object({
    email: z.string().trim().email(),
    password: z.string().min(1).max(128),
    rememberMe: z.boolean().optional(),
});

export async function login(req, res, next) {
    try {
        const parsed = loginSchema.safeParse(req.body);

        if (!parsed.success) {
            return res.status(400).json({
                success: false,
                error: "Enter a valid email and password",
            });
        }

        const { email, password, rememberMe = false } = parsed.data;

        // The password hash is only read by the backend.
        const { rows } = await pool.query(
            `SELECT id, staff_id, username, password_hash,
              account_status, failed_login_attempts, locked_until
       FROM staff_login_accounts
       WHERE lower(username) = lower($1)
         AND deleted_at IS NULL
       LIMIT 1`,
            [email]
        );

        const account = rows[0];

        // Keep the response generic to avoid disclosing whether an account exists.
        if (!account) {
            return res.status(401).json({
                success: false,
                error: "Invalid email or password",
            });
        }

        if (
            account.account_status !== "ACTIVE" ||
            (account.locked_until &&
                new Date(account.locked_until) > new Date())
        ) {
            return res.status(403).json({
                success: false,
                error: "This account cannot sign in. Contact your administrator.",
            });
        }

        const passwordMatches = await bcrypt.compare(
            password,
            account.password_hash
        );

        if (!passwordMatches) {
            const attempts = account.failed_login_attempts + 1;
            const shouldLock = attempts >= 5;

            await updateAccount(account.id, {
                failed_login_attempts: attempts,
                ...(shouldLock
                    ? {
                        account_status: "LOCKED",
                        locked_until: new Date(
                            Date.now() + 15 * 60 * 1000
                        ).toISOString(),
                    }
                    : {}),
            });

            return res.status(401).json({
                success: false,
                error: "Invalid email or password",
            });
        }

        // Shorter token by default; remember-me allows a longer session.
        const expiresIn = rememberMe
            ? "7d"
            : process.env.JWT_EXPIRES_IN || "1h";

        const token = jwt.sign(
            {
                sub: account.id,
                staffId: account.staff_id,
            },
            process.env.JWT_SECRET,
            { expiresIn }
        );

        // Update last-login details and reset failed attempts.
        const updated = await updateAccount(account.id, {
            failed_login_attempts: 0,
            locked_until: null,
            last_login_at: new Date().toISOString(),
        });

        if (!updated?.success) {
            return res.status(500).json({
                success: false,
                error: "Unable to complete sign-in",
            });
        }

        return res.json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: account.id,
                staff_id: account.staff_id,
                username: account.username,
            },
        });
    } catch (error) {
        next(error);
    }
}

export async function signup(req, res) {
    return res.status(501).json({
        success: false,
        error:
            "Signup needs the staff and company table definitions before it can be implemented safely.",
    });
}
