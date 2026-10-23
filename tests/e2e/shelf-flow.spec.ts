import { expect, test } from "@playwright/test"
import { addGameToShelf, expectToast } from "./helpers"

test("add a game, track it, see it on Discover, then remove it", async ({ page }) => {
    await addGameToShelf(page, "portal-2")

    // status, rating and play hours all save straight away
    await page.getByRole("radio", { name: "Completed" }).click()
    await expectToast(page, "Moved to Completed")
    await page.getByRole("radiogroup", { name: "Rating" }).getByRole("radio", { name: "4 stars" }).click()
    await page.getByLabel("Play hours").fill("10")
    await page.getByLabel("Play hours").press("Enter")
    await expect(page.getByText("Saved").first()).toBeVisible()

    await page.reload()
    await expect(page.getByRole("radio", { name: "Completed" })).toHaveAttribute("aria-checked", "true")
    await expect(page.getByRole("radio", { name: "4 stars" })).toHaveAttribute("aria-checked", "true")
    await expect(page.getByLabel("Play hours")).toHaveValue("10")

    // Discover badges the game with its shelf status
    await page.goto("/games?search=portal+2")
    await expect(page.getByRole("button", { name: "Portal 2: Completed. Change status" })).toBeVisible()

    // the stats page counts it
    await page.goto("/dashboard")
    await expect(page.getByText("Portal 2").first()).toBeVisible()

    await page.goto("/shelf")
    await page.getByRole("button", { name: "Actions for Portal 2" }).click()
    await page.getByRole("menuitem", { name: "Remove from shelf" }).click()
    await page.getByRole("button", { name: "Yes, remove" }).click()
    await expect(page.getByRole("button", { name: "Actions for Portal 2" })).toBeHidden()
})

test("quick add from a Discover card", async ({ page }) => {
    await page.goto("/games?search=half-life+2")
    await page.getByRole("button", { name: "Add Half-Life 2 to shelf" }).first().click()
    await page.getByRole("menuitemradio", { name: "Playing" }).click()

    await expectToast(page, "Half-Life 2 added as Playing")
    await expect(page.getByRole("button", { name: "Half-Life 2: Playing. Change status" }).first()).toBeVisible()
})

test("adding the same game twice says it is already there", async ({ page }) => {
    await page.goto("/games/the-witcher-3-wild-hunt")
    await page.getByRole("button", { name: "Add to shelf" }).click()
    await expect(page.getByText(/In your shelf/)).toBeVisible()

    await page.reload()
    await expect(page.getByText(/In your shelf/)).toBeVisible()
    await expect(page.getByRole("button", { name: "Add to shelf" })).toBeHidden()
})
