import { describe, expect, it } from "vitest"
import { CreateShelfSchema, UpdateShelfSchema } from "@/schemas/shelf.schema"

describe("CreateShelfSchema", () => {
    const valid = { rawgId: 3328, title: "The Witcher 3", slug: "the-witcher-3-wild-hunt", backgroundImage: null }

    it("accepts a game without a status", () => {
        expect(CreateShelfSchema.safeParse(valid).success).toBe(true)
    })

    it.each(["PLANNED", "PLAYING", "COMPLETED", "DROPPED"])("accepts status %s", (status) => {
        expect(CreateShelfSchema.safeParse({ ...valid, status }).success).toBe(true)
    })

    it.each([0, -1])("rejects rawgId %d", (rawgId) => {
        expect(CreateShelfSchema.safeParse({ ...valid, rawgId }).error?.issues[0].message).toBe("Invalid Game ID")
    })

    it("rejects an empty title and a title over 200 characters", () => {
        expect(CreateShelfSchema.safeParse({ ...valid, title: "" }).error?.issues[0].message).toBe("Title is Required")
        expect(CreateShelfSchema.safeParse({ ...valid, title: "x".repeat(201) }).error?.issues[0].message).toBe("Title too long")
    })

    it("accepts a RAWG cover image", () => {
        const backgroundImage = "https://media.rawg.io/media/games/618/618c2031a07bbff6b4f611f10b6bcdbc.jpg"
        expect(CreateShelfSchema.safeParse({ ...valid, backgroundImage }).success).toBe(true)
    })

    it.each([
        "http://169.254.169.254/latest/meta-data/",
        "http://localhost:5432/",
        "http://media.rawg.io/media/games/x.jpg",
        "https://evil.com/media/games/x.jpg",
        "https://media.rawg.io.evil.com/media/games/x.jpg",
        "not a url",
    ])("rejects cover image %s", (backgroundImage) => {
        expect(CreateShelfSchema.safeParse({ ...valid, backgroundImage }).error?.issues[0].message).toBe("Invalid cover image")
    })

    it("rejects an empty slug and an unknown status", () => {
        expect(CreateShelfSchema.safeParse({ ...valid, slug: "" }).success).toBe(false)
        expect(CreateShelfSchema.safeParse({ ...valid, status: "WISHLIST" }).success).toBe(false)
    })
})

describe("UpdateShelfSchema", () => {
    it("accepts an empty update", () => {
        expect(UpdateShelfSchema.safeParse({}).success).toBe(true)
    })

    it("rejects an unknown status with a readable message", () => {
        expect(UpdateShelfSchema.safeParse({ status: "DONE" }).error?.issues[0].message).toBe("Invalid Status")
    })

    it.each([0, 3, 5, null])("accepts rating %j", (rating) => {
        expect(UpdateShelfSchema.safeParse({ rating }).success).toBe(true)
    })

    it.each([6, -1, 2.5])("rejects rating %j", (rating) => {
        expect(UpdateShelfSchema.safeParse({ rating }).success).toBe(false)
    })

    it("accepts playtime 0 or null, rejects negatives and fractions", () => {
        expect(UpdateShelfSchema.safeParse({ playtime: 0 }).success).toBe(true)
        expect(UpdateShelfSchema.safeParse({ playtime: null }).success).toBe(true)
        expect(UpdateShelfSchema.safeParse({ playtime: -5 }).error?.issues[0].message).toBe("Playtime cannot be negative")
        expect(UpdateShelfSchema.safeParse({ playtime: 1.5 }).success).toBe(false)
    })

    it("caps the caption at 1000 characters", () => {
        expect(UpdateShelfSchema.safeParse({ caption: "x".repeat(1000) }).success).toBe(true)
        expect(UpdateShelfSchema.safeParse({ caption: "x".repeat(1001) }).error?.issues[0].message).toBe("Caption is too long")
    })
})
