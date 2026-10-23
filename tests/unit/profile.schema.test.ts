import { describe, expect, it } from "vitest"
import { BacklogOrderSchema, ListSchema, ProfileSettingsSchema, USERNAME_PATTERN } from "@/schemas/profile.schema"

describe("USERNAME_PATTERN", () => {
    it.each(["abc", "evan-ridho", "player_1", "a".repeat(20)])("accepts %j", (name) => {
        expect(USERNAME_PATTERN.test(name)).toBe(true)
    })

    it.each(["ab", "-abc", "abc_", "a".repeat(21), "Evan", "evan ridho", "evan.ridho"])("rejects %j", (name) => {
        expect(USERNAME_PATTERN.test(name)).toBe(false)
    })
})

describe("ProfileSettingsSchema", () => {
    it("trims and lowercases the username before checking it", () => {
        expect(ProfileSettingsSchema.parse({ username: "  EvanRidho " }).username).toBe("evanridho")
    })

    it("rejects an invalid username", () => {
        expect(ProfileSettingsSchema.safeParse({ username: "x" }).success).toBe(false)
    })

    it("allows toggling visibility alone", () => {
        expect(ProfileSettingsSchema.parse({ isPublic: true })).toEqual({ isPublic: true })
    })
})

describe("ListSchema", () => {
    it("trims the name and accepts a missing description", () => {
        expect(ListSchema.parse({ name: "  Couch co-op  " })).toEqual({ name: "Couch co-op" })
    })

    it.each([
        [{ name: "   " }, "Give the list a name"],
        [{ name: "x".repeat(61) }, "Name is too long"],
        [{ name: "ok", description: "x".repeat(201) }, "Description is too long"],
    ])("rejects %j", (input, message) => {
        expect(ListSchema.safeParse(input).error?.issues[0].message).toBe(message)
    })
})

describe("BacklogOrderSchema", () => {
    it("accepts a list of ids", () => {
        expect(BacklogOrderSchema.safeParse(["a", "b"]).success).toBe(true)
    })

    it("rejects empty ids and more than 1000 ids", () => {
        expect(BacklogOrderSchema.safeParse([""]).success).toBe(false)
        expect(BacklogOrderSchema.safeParse(Array.from({ length: 1001 }, (_, i) => `id${i}`)).success).toBe(false)
    })
})
