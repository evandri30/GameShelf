import { describe, expect, it } from "vitest"
import { getCroppedImageUrl } from "@/utils/image"

const cover = "https://media.rawg.io/media/games/abc/cover.jpg"

describe("getCroppedImageUrl", () => {
    it("returns an empty string without a url", () => {
        expect(getCroppedImageUrl(null)).toBe("")
    })

    it("uses RAWG's 600x400 crop by default", () => {
        expect(getCroppedImageUrl(cover)).toBe("https://media.rawg.io/media/crop/600/400/games/abc/cover.jpg")
    })

    it("picks the smallest resize width that covers the request", () => {
        expect(getCroppedImageUrl(cover, 500, 300)).toBe("https://media.rawg.io/media/resize/640/-/games/abc/cover.jpg")
        expect(getCroppedImageUrl(cover, 1280, 720)).toBe("https://media.rawg.io/media/resize/1280/-/games/abc/cover.jpg")
    })

    it("caps the width at 1920", () => {
        expect(getCroppedImageUrl(cover, 5000, 3000)).toBe("https://media.rawg.io/media/resize/1920/-/games/abc/cover.jpg")
    })

    it("handles screenshots too", () => {
        expect(getCroppedImageUrl("https://media.rawg.io/media/screenshots/x/shot.jpg", 420, 236))
            .toBe("https://media.rawg.io/media/resize/420/-/screenshots/x/shot.jpg")
    })

    it("rewrites api.rawg.io to the media host", () => {
        expect(getCroppedImageUrl("https://api.rawg.io/media/games/abc/cover.jpg")).toBe("https://media.rawg.io/media/crop/600/400/games/abc/cover.jpg")
    })

    it("leaves urls it cannot resize alone", () => {
        expect(getCroppedImageUrl("https://example.com/cover.jpg")).toBe("https://example.com/cover.jpg")
    })
})
