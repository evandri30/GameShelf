import { z } from "zod"
import { isRawgMediaUrl } from "@/utils/image"

export const CreateShelfSchema = z.object({
    rawgId: z.number().positive("Invalid Game ID"),
    title: z.string().min(1, "Title is Required").max(200, "Title too long"),
    slug: z.string().min(1, "Slug is Required"),
    backgroundImage: z.string().refine(isRawgMediaUrl, "Invalid cover image").nullable(),
    status: z.enum(["PLANNED", "PLAYING", "COMPLETED", "DROPPED"]).optional()
})

export const UpdateShelfSchema = z.object({
    status: z.enum(["PLANNED", "PLAYING", "COMPLETED", "DROPPED"], {
        error: () => ({
            message: "Invalid Status"
        })
    }).optional(),
    rating: z.number().int().min(0).max(5).nullable().optional(),
    caption: z.string().max(1000, "Caption is too long").optional().nullable(),
    // far above any real playtime, far below what the Int column holds
    playtime: z.number().int().min(0, "Playtime cannot be negative").max(99999, "Playtime is too large").nullable().optional(),
    // calendar days (YYYY-MM-DD) in the viewer's time zone; the action turns them into instants
    purchasedAt: z.iso.date("Invalid date").nullable().optional(),
    startedAt: z.iso.date("Invalid date").nullable().optional(),
    completedAt: z.iso.date("Invalid date").nullable().optional(),
    // whole rupiah
    purchasePrice: z.number().int().min(0, "Price cannot be negative").max(100_000_000, "Price is too large").nullable().optional()
})