import { z } from "zod"
import { CreateShelfSchema, UpdateShelfSchema } from "@/schemas/shelf.schema"
import type { ShelfStatus } from "@/generated/prisma/browser"

export type ShelfProps = {
    id: string;
    title: string;
    slug: string;
    status: ShelfStatus;
    backgroundImage: string | null;
    rating: number | null;
    caption: string | null;
    playtime: number | null;
}

export type ShelfFDetailProps = ShelfProps & {
    user: {
        name: string | null;
        image: string | null;
    }
    rawgId: number;
    createdAt: Date;
    updatedAt: Date;
}


export type CreateShelfInput = z.infer<typeof CreateShelfSchema>
export type UpdateShelfInput = z.infer<typeof UpdateShelfSchema>