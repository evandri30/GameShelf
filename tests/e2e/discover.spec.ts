import { expect, test } from "@playwright/test"

test("lists popular games", async ({ page }) => {
    await page.goto("/games")

    await expect(page.getByRole("heading", { name: "Popular right now" })).toBeVisible()
    await expect(page.locator('a[href^="/games/"]').first()).toBeVisible()
})

test("searches by name", async ({ page }) => {
    await page.goto("/games")
    await page.getByRole("searchbox", { name: "Search games" }).first().fill("portal")
    await page.keyboard.press("Enter")

    await expect(page).toHaveURL(/search=portal/)
    await expect(page.getByRole("heading", { name: 'Results for "portal"' })).toBeVisible()
})

test("a filter updates the url and the heading", async ({ page }) => {
    await page.goto("/games")
    await page.getByLabel("Sort by").selectOption({ label: "Top rated" })

    await expect(page).toHaveURL(/ordering=-rating/)
    await expect(page.getByRole("heading", { name: "Filtered games" })).toBeVisible()
})

test("pages through results", async ({ page }) => {
    await page.goto("/games")
    await page.getByRole("navigation", { name: "Pagination" }).getByRole("link", { name: "Next page" }).click()

    await expect(page).toHaveURL(/page=2/)
    await expect(page.getByRole("link", { name: "Previous page" })).toBeVisible()
})

test("opens a game and goes back to the results", async ({ page }) => {
    await page.goto("/games?search=portal+2")
    await page.locator('a[href^="/games/portal-2"]').first().click()

    await expect(page).toHaveURL(/\/games\/portal-2/)
    await expect(page.getByRole("heading", { name: "Portal 2", level: 1 })).toBeVisible()

    await page.getByRole("link", { name: "Back to results" }).click()
    await expect(page).toHaveURL(/search=portal/)
})
