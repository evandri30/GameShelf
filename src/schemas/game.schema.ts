import { z } from 'zod';

export const GameSchema = z.object({
    id: z.number(),
    slug: z.string(),
    name: z.string(),
    background_image: z.string().url().nullable(),
    rating: z.number().min(0).max(5),
    released: z.string().nullable(),
    metacritic: z.number().nullable(),
    esrb_rating: z.object({
        id: z.number(),
        name: z.string(),
        slug: z.string()
    }).nullable(),
    genres: z.array(z.object({
        id: z.number(),
        name: z.string()
    })).nullable().transform(val => val ?? []),
    platforms: z.array(z.object({
        platform: z.object({
            id: z.number(),
            slug: z.string(),
            name: z.string()
        })
    })).nullable().transform(val => val ?? [])
});

export const GameDetailSchema = z.object({
    id: z.number(),
    slug: z.string(),
    name: z.string(),
    description: z.string(),
    background_image: z.string().url().nullable(),
    rating: z.number(),
    rating_top: z.number(),
    metacritic: z.number().nullable(),
    playtime: z.number(),
    released: z.string().nullable(),
    esrb_rating: z.object({
        id: z.number(),
        name: z.string(),
        slug: z.string()
    }).nullable(),
    genres: z.array(z.object({
        id: z.number(),
        name: z.string(),
        slug: z.string()
    })).nullable().transform(val => val ?? []),
    platforms: z.array(z.object({
        platform: z.object({
            id: z.number(),
            slug: z.string(),
            name: z.string()
        })
    })).nullable().transform(val => val ?? []),
    developers: z.array(z.object({
        id: z.number(),
        name: z.string(),
        slug: z.string()
    })).nullable().transform(val => val ?? []),
    publishers: z.array(z.object({
        id: z.number(),
        name: z.string(),
        slug: z.string()
    })).nullable().transform(val => val ?? []),
    tags: z.array(z.object({
        id: z.number(),
        name: z.string(),
        slug: z.string()
    })).nullable().transform(val => val ?? []),
    website: z.string().url().nullable().catch(null)
});

export const GameResponseSchema = z.object({
    count: z.number(),
    next: z.string().nullable(),
    previous: z.string().nullable(),
    results: z.array(GameSchema)
});