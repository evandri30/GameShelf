import { expect, test } from "@playwright/test"
import { addGameToShelf, expectToast } from "./helpers"

test("create a list and add a shelf game to it", async ({ page }) => {
    await page.goto("/shelf/lists")
    await page.getByPlaceholder("e.g. Couch co-op").fill("Puzzle night")
    await page.getByRole("button", { name: "Create" }).click()

    await expectToast(page, '"Puzzle night" created')
    await expect(page).toHaveURL(/\/shelf\/lists\/.+/)
    const listUrl = page.url()

    await addGameToShelf(page, "the-talos-principle")
    await page.getByRole("button", { name: "Add to list" }).click()
    await page.getByRole("menuitemcheckbox", { name: "Puzzle night" }).click()
    await expect(page.getByRole("menuitemcheckbox", { name: "Puzzle night" })).toHaveAttribute("aria-checked", "true")

    await page.goto(listUrl)
    await expect(page.getByText("The Talos Principle").first()).toBeVisible()
})

test("the backlog lists planned games", async ({ page }) => {
    await addGameToShelf(page, "celeste")

    await page.goto("/shelf/backlog")
    await expect(page.getByRole("button", { name: "Move Celeste up" })).toBeVisible()
})
