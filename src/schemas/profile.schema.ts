import { z } from "zod"
// 3-20 chars, lowercase letters/numbers with - or _ inside
export const USERNAME_PATTERN = /^[a-z0-9](?:[a-z0-9_-]{1,18})[a-z0-9]$/

export const ProfileSettingsSchema = z.object({
    username: z
        .string()
        .trim()
        .toLowerCase()
        .regex(USERNAME_PATTERN, "3–20 characters: letters, numbers, - or _ (not at the start or end)")
        .optional(),
    isPublic: z.boolean().optional(),
})

export const ListSchema = z.object({
    name: z.string().trim().min(1, "Give the list a name").max(60, "Name is too long"),
    description: z.string().trim().max(200, "Description is too long").nullable().optional(),
})

export const BacklogOrderSchema = z.array(z.string().min(1)).max(1000)
