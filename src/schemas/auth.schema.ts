import { z } from "zod"

export const LoginSchema = z.object({
    email: z
        .string()
        .min(1, "Email is Required")
        .email("Invalid email format"),
    password: z
        .string()
        .min(1, "Password is Required")
        .min(6, "Password must be atleast 6 characters")
});

export const RegisterSchema = z.object({
    name: z
        .string()
        .min(1, "Name is Required")
        .min(3, "Name must be atleast 3 characters")
        .max(20, "Name is to long"),
    email: z
        .string()
        .min(1, "Email is required")
        .email("Invalid email format"),
    password: z
        .string()
        .min(1, "Password is required")
        .min(6, "Password must be at least 6 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
})