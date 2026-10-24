import { beforeEach, describe, expect, it, vi } from "vitest"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { makeShelf, makeUser, resetDb } from "../helpers/db"

const { auth, revalidatePath, refresh, getGameBySlug } = vi.hoisted(() => ({
    auth: vi.fn(),
    revalidatePath: vi.fn(),
    refresh: vi.fn(),
    getGameBySlug: vi.fn(),
}))

// NextAuth and the router cache need a running Next server; the actions only care about their results
vi.mock("@/auth", () => ({ auth }))
vi.mock("next/cache", () => ({ revalidatePath, refresh }))
// addToShelf looks the game up on RAWG; tests answer for it
vi.mock("@/lib/rawg", () => ({ getGameBySlug }))

const {
    addToShelf, createList, deleteList, removeFromShelf, reorderBacklog, toggleListItem, updateList, updateShelf,
} = await import("@/app/shelf/actions")
const { changePassword, deleteAccount, removeAvatar, updateProfile, uploadAvatar } = await import("@/app/profile/actions")

let userId: string

// just enough of a WebP header to pass the magic-byte check
const WEBP = new Uint8Array([...new TextEncoder().encode("RIFF"), 0, 0, 0, 0, ...new TextEncoder().encode("WEBPVP8 ")])

function avatarForm(bytes: Uint8Array, type = "image/webp") {
    const form = new FormData()
    form.append("avatar", new File([bytes as Uint8Array<ArrayBuffer>], "avatar", { type }))
    return form
}

function logInAs(id: string | null) {
    auth.mockResolvedValue(id ? { user: { id } } : null)
}

const game = { rawgId: 4200, title: "Portal 2", slug: "portal-2", backgroundImage: null }
const rawgPortal = { id: 4200, slug: "portal-2", name: "Portal 2", background_image: "https://media.rawg.io/media/games/portal2.jpg" }

beforeEach(async () => {
    await resetDb()
    vi.clearAllMocks()
    getGameBySlug.mockResolvedValue(rawgPortal)
    vi.spyOn(console, "error").mockImplementation(() => {})
    userId = (await makeUser({ username: "evan" })).id
    logInAs(userId)
})

describe("every action requires a session", () => {
    it.each([
        ["addToShelf", () => addToShelf(game)],
        ["updateShelf", () => updateShelf("x", { rating: 1 })],
        ["removeFromShelf", () => removeFromShelf("x")],
        ["reorderBacklog", () => reorderBacklog([])],
        ["createList", () => createList({ name: "x" })],
        ["toggleListItem", () => toggleListItem("l", "s", true)],
        ["updateProfile", () => updateProfile({ isPublic: true })],
        ["deleteAccount", () => deleteAccount({ password: "Secret123" })],
        ["changePassword", () => changePassword({ currentPassword: "Secret123", newPassword: "Newpass123" })],
        ["uploadAvatar", () => uploadAvatar(avatarForm(WEBP))],
        ["removeAvatar", () => removeAvatar()],
    ])("%s", async (_, run) => {
        logInAs(null)
        expect(await run()).toEqual({ ok: false, error: "Please log in first" })
    })
})

describe("addToShelf", () => {
    it("stores RAWG's title, slug and cover, not what the client sent", async () => {
        expect((await addToShelf({ ...game, title: "Free V-Bucks", backgroundImage: "https://media.rawg.io/media/games/fake.jpg" })).ok).toBe(true)

        expect(getGameBySlug).toHaveBeenCalledWith("portal-2")
        expect(await prisma.shelf.findFirstOrThrow({ where: { userId } })).toMatchObject({
            title: "Portal 2", slug: "portal-2", backgroundImage: rawgPortal.background_image,
        })
    })

    it("rejects a rawgId that doesn't match the slug's game", async () => {
        expect(await addToShelf({ ...game, rawgId: 999 })).toEqual({ ok: false, error: "Game not found" })
        expect(await prisma.shelf.count()).toBe(0)
    })

    it("rejects a slug RAWG doesn't know", async () => {
        getGameBySlug.mockResolvedValue(null)
        expect(await addToShelf(game)).toEqual({ ok: false, error: "Game not found" })
    })

    it("reports when RAWG can't be reached", async () => {
        getGameBySlug.mockRejectedValue(new Error("timeout"))
        expect(await addToShelf(game)).toEqual({ ok: false, error: "Couldn't reach the game database, try again" })
        expect(await prisma.shelf.count()).toBe(0)
    })

    it("adds the game for the logged-in user", async () => {
        const result = await addToShelf(game)

        expect(result.ok).toBe(true)
        expect(await prisma.shelf.findFirstOrThrow({ where: { userId } })).toMatchObject({ rawgId: 4200, status: "PLANNED" })
    })

    it("rejects invalid input", async () => {
        expect(await addToShelf({ ...game, rawgId: -1 })).toEqual({ ok: false, error: "Invalid input" })
    })

    it("reports a game that is already on the shelf", async () => {
        await addToShelf(game)
        expect(await addToShelf(game)).toEqual({ ok: false, error: "Game already in shelf" })
    })

    // Regression: revalidating /games wiped the cached RAWG responses on every shelf change
    it("refreshes the router without revalidating /games", async () => {
        await addToShelf(game)

        expect(refresh).toHaveBeenCalled()
        expect(revalidatePath.mock.calls.map(([path]) => path)).not.toContain("/games")
        expect(revalidatePath).toHaveBeenCalledWith("/shelf", "layout")
    })
})

describe("updateShelf", () => {
    it("saves a valid update", async () => {
        const shelf = await makeShelf(userId)
        expect(await updateShelf(shelf.id, { status: "COMPLETED", rating: 4, playtime: 120 })).toEqual({ ok: true })

        expect(await prisma.shelf.findUniqueOrThrow({ where: { id: shelf.id } })).toMatchObject({ status: "COMPLETED", rating: 4, playtime: 120 })
    })

    it("returns the schema's message for invalid input", async () => {
        const shelf = await makeShelf(userId)
        expect(await updateShelf(shelf.id, { playtime: -1 })).toEqual({ ok: false, error: "Playtime cannot be negative" })
    })

    it("cannot touch another user's game", async () => {
        const other = await makeUser()
        const theirs = await makeShelf(other.id, { rating: 2 })

        expect(await updateShelf(theirs.id, { rating: 5 })).toEqual({ ok: false, error: "Game not found in your shelf" })
        expect((await prisma.shelf.findUniqueOrThrow({ where: { id: theirs.id } })).rating).toBe(2)
    })

    it("does not revalidate /games", async () => {
        const shelf = await makeShelf(userId)
        await updateShelf(shelf.id, { rating: 3 })

        expect(revalidatePath.mock.calls.map(([path]) => path)).not.toContain("/games")
        expect(refresh).toHaveBeenCalled()
    })
})

describe("removeFromShelf", () => {
    it("removes the user's game", async () => {
        const shelf = await makeShelf(userId)
        expect(await removeFromShelf(shelf.id)).toEqual({ ok: true })
        expect(await prisma.shelf.count()).toBe(0)
    })

    it("reports a missing game", async () => {
        expect(await removeFromShelf("missing")).toEqual({ ok: false, error: "Game not found in your shelf" })
    })
})

describe("reorderBacklog", () => {
    it("saves the new order", async () => {
        const a = await makeShelf(userId, { backlogPosition: 1 })
        const b = await makeShelf(userId, { backlogPosition: 2 })

        expect(await reorderBacklog([b.id, a.id])).toEqual({ ok: true })
        expect((await prisma.shelf.findUniqueOrThrow({ where: { id: b.id } })).backlogPosition).toBe(1)
    })

    it("rejects a malformed order", async () => {
        expect(await reorderBacklog([""])).toEqual({ ok: false, error: "Invalid order" })
    })
})

describe("lists", () => {
    it("creates, updates, fills and deletes a list", async () => {
        const created = await createList({ name: "  Couch co-op  " })
        expect(created.ok).toBe(true)
        const listId = created.ok ? created.data!.id : ""

        expect(await updateList(listId, { name: "Local co-op" })).toEqual({ ok: true })

        const shelf = await makeShelf(userId)
        expect(await toggleListItem(listId, shelf.id, true)).toEqual({ ok: true })
        expect(await prisma.shelfListItem.count()).toBe(1)

        expect(await deleteList(listId)).toEqual({ ok: true })
        expect(await prisma.shelfList.count()).toBe(0)
    })

    it("validates the list name", async () => {
        expect(await createList({ name: "" })).toEqual({ ok: false, error: "Give the list a name" })
    })

    it("reports lists that are not the user's", async () => {
        expect(await updateList("missing", { name: "x" })).toEqual({ ok: false, error: "List not found" })
        expect(await deleteList("missing")).toEqual({ ok: false, error: "List not found" })
        expect(await toggleListItem("missing", "missing", true)).toEqual({ ok: false, error: "List or game not found" })
    })
})

describe("updateProfile", () => {
    it("saves a new username and visibility", async () => {
        expect(await updateProfile({ username: "Evan-R", isPublic: true })).toMatchObject({ ok: true, data: { username: "evan-r", isPublic: true } })
    })

    it("reports a username that is taken", async () => {
        await makeUser({ username: "taken" })
        expect(await updateProfile({ username: "taken" })).toEqual({ ok: false, error: "That username is taken" })
    })

    it("rejects an invalid username", async () => {
        const result = await updateProfile({ username: "-x" })
        expect(result.ok).toBe(false)
    })

    it("saves a trimmed nickname", async () => {
        const result = await updateProfile({ name: "  Evan R  " })
        expect(result).toMatchObject({ ok: true, data: { name: "Evan R" } })
        expect((await prisma.user.findUnique({ where: { id: userId } }))?.name).toBe("Evan R")
    })

    it("rejects a nickname that is too short", async () => {
        expect((await updateProfile({ name: "ab" })).ok).toBe(false)
    })
})

describe("avatar", () => {
    it("stores the photo and points User.image at it", async () => {
        const result = await uploadAvatar(avatarForm(WEBP))
        expect(result.ok).toBe(true)
        const user = await prisma.user.findUnique({ where: { id: userId }, include: { avatar: true } })
        expect(user?.image).toMatch(new RegExp(`^/api/avatar/${userId}\\?v=\\d+$`))
        expect(result).toEqual({ ok: true, data: { image: user?.image } })
        expect(user?.avatar?.mimeType).toBe("image/webp")
    })

    it("rejects files that aren't the image they claim to be", async () => {
        expect((await uploadAvatar(avatarForm(new TextEncoder().encode("<svg/>"), "image/png"))).ok).toBe(false)
        expect((await uploadAvatar(avatarForm(WEBP, "image/svg+xml"))).ok).toBe(false)
        expect(await prisma.userAvatar.count()).toBe(0)
    })

    it("rejects oversized files", async () => {
        const big = new Uint8Array(600 * 1024)
        big.set(WEBP)
        expect(await uploadAvatar(avatarForm(big))).toEqual({ ok: false, error: "That image is too large" })
    })

    it("removes the photo", async () => {
        await uploadAvatar(avatarForm(WEBP))
        expect(await removeAvatar()).toEqual({ ok: true })
        expect((await prisma.user.findUnique({ where: { id: userId } }))?.image).toBeNull()
        expect(await prisma.userAvatar.count()).toBe(0)
    })
})

describe("deleteAccount", () => {
    it("keeps the account when the password is wrong", async () => {
        expect(await deleteAccount({ password: "Wrong123" })).toEqual({ ok: false, error: "Wrong password" })
        expect(await prisma.user.count({ where: { id: userId } })).toBe(1)
    })

    it("deletes the user with their shelf and lists, and nobody else's", async () => {
        const shelf = await makeShelf(userId)
        const list = await prisma.shelfList.create({ data: { userId, name: "Co-op" } })
        await prisma.shelfListItem.create({ data: { listId: list.id, shelfId: shelf.id } })
        const other = await makeUser()
        await makeShelf(other.id)

        expect(await deleteAccount({ password: "Secret123" })).toEqual({ ok: true })

        expect(await prisma.user.count({ where: { id: userId } })).toBe(0)
        expect(await prisma.shelf.count({ where: { userId } })).toBe(0)
        expect(await prisma.shelfList.count({ where: { userId } })).toBe(0)
        expect(await prisma.shelfListItem.count()).toBe(0)
        expect(await prisma.shelf.count({ where: { userId: other.id } })).toBe(1)
        expect(revalidatePath).toHaveBeenCalledWith("/u", "layout")
    })

    it("stops after 5 attempts in the window", async () => {
        for (let i = 0; i < 5; i++) await deleteAccount({ password: "Wrong123" })

        expect(await deleteAccount({ password: "Secret123" })).toEqual({ ok: false, error: "Too many attempts. Try again later." })
        expect(await prisma.user.count({ where: { id: userId } })).toBe(1)
    })
})

describe("changePassword", () => {
    const input = { currentPassword: "Secret123", newPassword: "Newpass123" }

    async function storedHash() {
        return (await prisma.user.findUniqueOrThrow({ where: { id: userId } })).password!
    }

    it("saves the new password", async () => {
        expect(await changePassword(input)).toEqual({ ok: true })
        expect(await bcrypt.compare("Newpass123", await storedHash())).toBe(true)
        expect(await bcrypt.compare("Secret123", await storedHash())).toBe(false)
    })

    it("keeps the old password when the current one is wrong", async () => {
        expect(await changePassword({ ...input, currentPassword: "Wrong123" })).toEqual({ ok: false, error: "Current password is wrong" })
        expect(await bcrypt.compare("Secret123", await storedHash())).toBe(true)
    })

    it("applies the sign-up password rules", async () => {
        expect(await changePassword({ ...input, newPassword: "weakpass" })).toEqual({ ok: false, error: "Password must contain at least one uppercase letter" })
    })

    it("rejects reusing the current password", async () => {
        expect(await changePassword({ ...input, newPassword: "Secret123" })).toEqual({ ok: false, error: "Pick a password you haven't used here" })
    })

    it("stops after 5 attempts in the window", async () => {
        for (let i = 0; i < 5; i++) await changePassword({ ...input, currentPassword: "Wrong123" })

        expect(await changePassword(input)).toEqual({ ok: false, error: "Too many attempts. Try again later." })
        expect(await bcrypt.compare("Secret123", await storedHash())).toBe(true)
    })
})
