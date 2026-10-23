import { expect, test } from "@playwright/test"

test("an unknown route shows the custom 404", async ({ page }) => {
    const res = await page.goto("/totally/unknown/route")

    expect(res?.status()).toBe(404)
    await expect(page.getByRole("heading", { name: "This page isn't on the shelf" })).toBeVisible()
    await expect(page.getByRole("link", { name: "Discover games" })).toBeVisible()
})

// The detail page streams its shell before RAWG answers, so notFound() can no longer change the
// status code (it stays 200); Next marks the page noindex instead
test("an unknown game shows the custom 404 and is not indexed", async ({ page }) => {
    await page.goto("/games/this-game-does-not-exist-xyz-123")

    await expect(page.getByRole("heading", { name: "This page isn't on the shelf" })).toBeVisible()
    await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute("content", /noindex/)
})
