import { z } from "zod"

export const LoginSchema = z.object({
    email: z
        .email({
            error: (issue) => issue.input === "" ? "Email is Required" : "Invalid email format"
        }),
    password: z
        .string()
        .min(1, "Password is Required")
        .min(6, "Password must be atleast 6 characters")
});

// Rules for any new password: sign-up and password change
export const PasswordSchema = z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters")
    // bcrypt ignores everything past 72 bytes
    .max(72, "Password must be at most 72 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")

// Shown on the navbar and public profile; set at sign-up, changeable on the Profile page
export const DisplayNameSchema = z
    .string()
    .trim()
    .min(1, "Name is Required")
    .min(3, "Name must be atleast 3 characters")
    .max(20, "Name is to long")

export const RegisterSchema = z.object({
    name: DisplayNameSchema,
    email: z
        .email({
            error: (issue) => issue.input === "" ? "Email is required" : "Invalid email format"
        }),
    password: PasswordSchema
})