import { expect, test } from "@playwright/test"

test.describe("logged out", () => {
    test.use({ storageState: { cookies: [], origins: [] } })

    for (const path of ["/games", "/games/portal-2", "/shelf", "/shelf/lists", "/dashboard", "/profile"]) {
        test(`${path} redirects to the landing page`, async ({ page }) => {
            await page.goto(path)
            await expect(page).toHaveURL("/")
        })
    }

    test("the landing page offers a way in", async ({ page }) => {
        await page.goto("/")
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
        await expect(page.getByRole("link", { name: "Get Started" })).toBeVisible()
    })
})

test.describe("logged in", () => {
    test("the landing page forwards to Discover", async ({ page }) => {
        await page.goto("/")
        await expect(page).toHaveURL("/games")
    })

    test("the private pages open", async ({ page }) => {
        for (const path of ["/shelf", "/dashboard", "/profile"]) {
            await page.goto(path)
            await expect(page).toHaveURL(path)
        }
    })
})
