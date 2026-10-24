import { z } from "zod"
import { DisplayNameSchema, PasswordSchema } from "@/schemas/auth.schema"
// 3-20 chars, lowercase letters/numbers with - or _ inside
export const USERNAME_PATTERN = /^[a-z0-9](?:[a-z0-9_-]{1,18})[a-z0-9]$/

export const ProfileSettingsSchema = z.object({
    name: DisplayNameSchema.optional(),
    username: z
        .string()
        .trim()
        .toLowerCase()
        .regex(USERNAME_PATTERN, "3–20 characters: letters, numbers, - or _ (not at the start or end)")
        .optional(),
    isPublic: z.boolean().optional(),
})

// The browser shrinks photos to 256px WebP first, so real uploads are far below this
export const AVATAR_MAX_BYTES = 512 * 1024
export const AVATAR_TYPES = ["image/webp", "image/jpeg", "image/png"] as const

export const ListSchema = z.object({
    name: z.string().trim().min(1, "Give the list a name").max(60, "Name is too long"),
    description: z.string().trim().max(200, "Description is too long").nullable().optional(),
})

export const BacklogOrderSchema = z.array(z.string().min(1)).max(1000)

// Deleting the account asks for the password again, so a stolen session alone can't do it
export const DeleteAccountSchema = z.object({
    password: z.string().min(1, "Enter your password").max(72),
})

export const ChangePasswordSchema = z
    .object({
        currentPassword: z.string().min(1, "Enter your current password").max(72),
        newPassword: PasswordSchema,
    })
    .refine((v) => v.currentPassword !== v.newPassword, { message: "Pick a password you haven't used here", path: ["newPassword"] })
