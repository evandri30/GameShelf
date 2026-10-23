import { beforeEach, describe, expect, it } from "vitest"
import { prisma } from "@/lib/prisma"
import {
    createUserList,
    deleteUserList,
    getListMembership,
    getUserList,
    getUserLists,
    setListMembership,
    updateUserList,
} from "@/services/list.service"
import { makeShelf, makeUser, resetDb } from "../helpers/db"

let userId: string

beforeEach(async () => {
    await resetDb()
    userId = (await makeUser()).id
})

describe("list CRUD", () => {
    it("creates, renames and deletes a list", async () => {
        const { id } = await createUserList(userId, "Couch co-op", null)
        await updateUserList(userId, id, { name: "Local co-op", description: "With friends" })

        expect(await getUserList(userId, id)).toMatchObject({ name: "Local co-op", description: "With friends", items: [] })

        await deleteUserList(userId, id)
        expect(await getUserList(userId, id)).toBeNull()
    })

    it("hides and protects lists of other users", async () => {
        const other = await makeUser()
        const { id } = await createUserList(other.id, "Theirs", null)

        expect(await getUserList(userId, id)).toBeNull()
        await expect(updateUserList(userId, id, { name: "Mine now" })).rejects.toMatchObject({ code: "P2025" })
        await expect(deleteUserList(userId, id)).rejects.toMatchObject({ code: "P2025" })
    })

    it("counts items in the overview", async () => {
        const { id } = await createUserList(userId, "RPGs", null)
        const game = await makeShelf(userId)
        await setListMembership(userId, id, game.id, true)

        const [list] = await getUserLists(userId)
        expect(list._count.items).toBe(1)
    })
})

describe("setListMembership", () => {
    it("adds a game once even when asked twice", async () => {
        const { id } = await createUserList(userId, "RPGs", null)
        const game = await makeShelf(userId)

        expect(await setListMembership(userId, id, game.id, true)).toBe(true)
        expect(await setListMembership(userId, id, game.id, true)).toBe(true)

        expect(await prisma.shelfListItem.count()).toBe(1)
    })

    it("removes a game", async () => {
        const { id } = await createUserList(userId, "RPGs", null)
        const game = await makeShelf(userId)
        await setListMembership(userId, id, game.id, true)
        await setListMembership(userId, id, game.id, false)

        expect(await prisma.shelfListItem.count()).toBe(0)
    })

    it("refuses another user's list or game", async () => {
        const other = await makeUser()
        const mine = await createUserList(userId, "Mine", null)
        const theirs = await createUserList(other.id, "Theirs", null)
        const myGame = await makeShelf(userId)
        const theirGame = await makeShelf(other.id)

        expect(await setListMembership(userId, theirs.id, myGame.id, true)).toBe(false)
        expect(await setListMembership(userId, mine.id, theirGame.id, true)).toBe(false)
        expect(await prisma.shelfListItem.count()).toBe(0)
    })

    it("removing a shelf game also removes it from lists", async () => {
        const { id } = await createUserList(userId, "RPGs", null)
        const game = await makeShelf(userId)
        await setListMembership(userId, id, game.id, true)

        await prisma.shelf.delete({ where: { id: game.id } })
        expect(await prisma.shelfListItem.count()).toBe(0)
    })
})

describe("getListMembership", () => {
    it("flags which lists hold the game, sorted by name", async () => {
        const b = await createUserList(userId, "B list", null)
        await createUserList(userId, "A list", null)
        const game = await makeShelf(userId)
        await setListMembership(userId, b.id, game.id, true)

        expect((await getListMembership(userId, game.id)).map(({ name, hasGame }) => ({ name, hasGame }))).toEqual([
            { name: "A list", hasGame: false },
            { name: "B list", hasGame: true },
        ])
    })
})
