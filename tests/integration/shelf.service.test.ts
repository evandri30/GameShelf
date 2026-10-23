import { beforeEach, describe, expect, it } from "vitest"
import { prisma } from "@/lib/prisma"
import {
    createUserShelf,
    deleteUserShelf,
    editUserShelf,
    getBacklog,
    getCompletionsByMonth,
    getDashboardData,
    getReviewYears,
    getUserShelfIndex,
    getYearInReview,
    reorderUserBacklog,
} from "@/services/shelf.service"
import { makeShelf, makeUser, resetDb } from "../helpers/db"

let userId: string

beforeEach(async () => {
    await resetDb()
    userId = (await makeUser()).id
})

function add(rawgId: number, status?: "PLANNED" | "PLAYING" | "COMPLETED" | "DROPPED") {
    return createUserShelf(userId, rawgId, `Game ${rawgId}`, `game-${rawgId}`, null, status)
}

describe("createUserShelf", () => {
    it("queues planned games at the end of the backlog", async () => {
        const games = [await add(1), await add(2), await add(3)]
        expect(games.map((g) => g.backlogPosition)).toEqual([1, 2, 3])
    })

    it("starts the clock for a game added as PLAYING", async () => {
        const game = await add(1, "PLAYING")
        expect(game.startedAt).toBeInstanceOf(Date)
        expect(game.completedAt).toBeNull()
        expect(game.backlogPosition).toBeNull()
    })

    it("sets both dates for a game added as COMPLETED", async () => {
        const game = await add(1, "COMPLETED")
        expect(game.startedAt).toBeInstanceOf(Date)
        expect(game.completedAt).toBeInstanceOf(Date)
    })

    it("refuses the same game twice for one user", async () => {
        await add(1)
        await expect(add(1)).rejects.toMatchObject({ code: "P2002" })
    })

    it("lets two users shelve the same game", async () => {
        const other = await makeUser()
        await add(1)
        await expect(createUserShelf(other.id, 1, "Game 1", "game-1", null)).resolves.toBeTruthy()
    })
})

describe("editUserShelf", () => {
    it("moving to PLAYING sets startedAt and leaves the backlog", async () => {
        const game = await add(1)
        const updated = await editUserShelf(game.id, userId, { status: "PLAYING" })

        expect(updated.startedAt).toBeInstanceOf(Date)
        expect(updated.backlogPosition).toBeNull()
    })

    it("moving to COMPLETED keeps the original start date", async () => {
        const game = await add(1, "PLAYING")
        const updated = await editUserShelf(game.id, userId, { status: "COMPLETED" })

        expect(updated.startedAt).toEqual(game.startedAt)
        expect(updated.completedAt).toBeInstanceOf(Date)
    })

    it("reopening a completed game clears completedAt", async () => {
        const game = await add(1, "COMPLETED")
        const updated = await editUserShelf(game.id, userId, { status: "PLAYING" })

        expect(updated.completedAt).toBeNull()
        expect(updated.startedAt).toEqual(game.startedAt)
    })

    it("moving back to PLANNED puts the game at the end of the backlog", async () => {
        await add(1)
        await add(2)
        const playing = await add(3, "PLAYING")
        const updated = await editUserShelf(playing.id, userId, { status: "PLANNED" })

        expect(updated.backlogPosition).toBe(3)
        expect(updated.completedAt).toBeNull()
    })

    it("re-sending the same status leaves the timeline alone", async () => {
        const game = await add(1, "COMPLETED")
        const updated = await editUserShelf(game.id, userId, { status: "COMPLETED", rating: 5 })

        expect(updated.completedAt).toEqual(game.completedAt)
        expect(updated.rating).toBe(5)
    })

    it("updates rating, playtime and caption without touching the status", async () => {
        const game = await add(1)
        const updated = await editUserShelf(game.id, userId, { rating: 4, playtime: 120, caption: "Great" })

        expect(updated).toMatchObject({ status: "PLANNED", rating: 4, playtime: 120, caption: "Great", backlogPosition: 1 })
    })

    it("cannot edit another user's game", async () => {
        const other = await makeUser()
        const game = await add(1)

        await expect(editUserShelf(game.id, other.id, { rating: 1 })).rejects.toMatchObject({ code: "P2025" })
        await expect(editUserShelf(game.id, other.id, { status: "DROPPED" })).rejects.toMatchObject({ code: "P2025" })
    })
})

describe("deleteUserShelf", () => {
    it("removes the user's game", async () => {
        const game = await add(1)
        await deleteUserShelf(game.id, userId)
        expect(await prisma.shelf.count()).toBe(0)
    })

    it("cannot remove another user's game", async () => {
        const other = await makeUser()
        const game = await add(1)
        await expect(deleteUserShelf(game.id, other.id)).rejects.toMatchObject({ code: "P2025" })
    })
})

describe("backlog", () => {
    it("lists planned games in queue order", async () => {
        const [a, b, c] = [await add(1), await add(2), await add(3)]
        await add(4, "PLAYING")

        await reorderUserBacklog(userId, [c.id, a.id, b.id])

        expect((await getBacklog(userId)).map((g) => g.id)).toEqual([c.id, a.id, b.id])
    })

    it("ignores ids that are not the user's planned games", async () => {
        const planned = await add(1)
        const playing = await add(2, "PLAYING")
        const other = await makeUser()
        const foreign = await createUserShelf(other.id, 3, "Game 3", "game-3", null)

        await reorderUserBacklog(userId, [playing.id, foreign.id, planned.id])

        expect((await prisma.shelf.findUniqueOrThrow({ where: { id: playing.id } })).backlogPosition).toBeNull()
        expect((await prisma.shelf.findUniqueOrThrow({ where: { id: foreign.id } })).backlogPosition).toBe(1)
        expect((await prisma.shelf.findUniqueOrThrow({ where: { id: planned.id } })).backlogPosition).toBe(3)
    })
})

describe("getUserShelfIndex", () => {
    it("maps rawgId to the shelf entry", async () => {
        const game = await add(42, "PLAYING")
        expect(await getUserShelfIndex(userId)).toEqual({ 42: { id: game.id, status: "PLAYING", slug: "game-42" } })
    })
})

describe("stats", () => {
    const at = (iso: string) => new Date(iso)

    it("getYearInReview sums the year's completed games", async () => {
        await makeShelf(userId, { status: "COMPLETED", rating: 5, playtime: 40, completedAt: at("2025-03-10"), startedAt: at("2025-02-01"), createdAt: at("2025-01-15") })
        await makeShelf(userId, { status: "COMPLETED", rating: 3, playtime: 10, completedAt: at("2025-03-20") })
        await makeShelf(userId, { status: "COMPLETED", playtime: 5, completedAt: at("2025-11-01") })
        // other year, must not count
        await makeShelf(userId, { status: "COMPLETED", rating: 1, playtime: 99, completedAt: at("2024-12-31") })

        const review = await getYearInReview(userId, 2025)

        expect(review.completed).toHaveLength(3)
        expect(review.hours).toBe(55)
        expect(review.averageRating).toBe(4)
        expect(review.favorites.map((g) => g.rating)).toEqual([5, 3])
        expect(review.months[2].count).toBe(2)
        expect(review.months[10].count).toBe(1)
        expect(review.started).toBe(1)
    })

    it("getYearInReview has no average when nothing is rated", async () => {
        await makeShelf(userId, { status: "COMPLETED", completedAt: at("2025-05-01") })
        expect((await getYearInReview(userId, 2025)).averageRating).toBeNull()
    })

    it("getReviewYears lists years with completions, newest first", async () => {
        await makeShelf(userId, { status: "COMPLETED", completedAt: at("2023-06-01") })
        await makeShelf(userId, { status: "COMPLETED", completedAt: at("2025-06-01") })
        await makeShelf(userId, { status: "COMPLETED", completedAt: at("2025-07-01") })
        await makeShelf(userId, { status: "PLAYING" })

        expect(await getReviewYears(userId)).toEqual([2025, 2023])
    })

    it("getCompletionsByMonth buckets the last 12 months, oldest first", async () => {
        await makeShelf(userId, { status: "COMPLETED", completedAt: new Date() })
        await makeShelf(userId, { status: "COMPLETED", completedAt: new Date() })

        const buckets = await getCompletionsByMonth(userId)

        expect(buckets).toHaveLength(12)
        expect(buckets.at(-1)).toMatchObject({ month: new Date().getUTCMonth(), count: 2 })
        expect(buckets.slice(0, -1).every((b) => b.count === 0)).toBe(true)
    })

    it("getDashboardData totals the shelf and ignores 0 ratings in the average", async () => {
        await makeShelf(userId, { status: "COMPLETED", rating: 4, playtime: 10 })
        await makeShelf(userId, { status: "PLAYING", rating: 0, playtime: 5 })
        await makeShelf(userId, { status: "PLANNED", rating: 2 })

        const data = await getDashboardData(userId)

        expect(data?.totalGames).toBe(3)
        expect(data?.totalHours).toBe(15)
        expect(data?.averageRating).toBe(3)
        expect(data?.ratedGames).toBe(2)
        expect(data?.stats.COMPLETED).toEqual({ count: 1, playtime: 10 })
        // planned and dropped games never show up as top games
        expect(data?.topGames.map((g) => g.status).sort()).toEqual(["COMPLETED", "PLAYING"])
    })

    it("getDashboardData returns null for an unknown user", async () => {
        expect(await getDashboardData("missing")).toBeNull()
    })
})
