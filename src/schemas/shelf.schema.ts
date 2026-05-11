import { z } from "zod"

export const CreateShelfSchema = z.object({
    rawgId: z.number().positive("Invalid Game ID"),
    title: z.string().min(1, "Title is Required").max(200, "Title too long"),
    slug: z.string().min(1, "Slug is Required"),
    backgroundImage: z.string().nullable()
})

export const UpdateShelfSchema = z.object({
    status: z.enum(["PLANNED", "PLAYING", "COMPLETED", "DROPPED"], {
        error: () => ({
            message: "Invalid Status"
        })
    }).optional(),
    rating: z.number().int().min(0).max(5).nullable().optional(),
    caption: z.string().max(1000, "Caption is too long").optional().nullable(),
    playtime: z.number().int().min(0, "Playtime cannot be negative").nullable().optional()
})