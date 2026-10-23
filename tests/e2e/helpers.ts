import { expect, type Page } from "@playwright/test"

// Seeded by global-setup.ts
export const E2E_USER = { email: "e2e@test.dev", password: "Secret123", name: "E2E Player" }

export async function logIn(page: Page, email = E2E_USER.email, password = E2E_USER.password) {
    await page.goto("/auth")
    await page.getByLabel("Email", { exact: true }).fill(email)
    await page.getByLabel("Password", { exact: true }).fill(password)
    await page.getByRole("button", { name: "Log in" }).click()
}

export async function expectToast(page: Page, text: string | RegExp) {
    await expect(page.getByRole("alert").filter({ hasText: text }).first()).toBeVisible()
}

// Adds a RAWG game from its detail page and opens it in the shelf
export async function addGameToShelf(page: Page, slug: string) {
    await page.goto(`/games/${slug}`)
    await page.getByRole("button", { name: "Add to shelf" }).click()
    await expect(page.getByText(/In your shelf · Planned/)).toBeVisible()
    await page.getByRole("link", { name: "Open in shelf" }).click()
    await expect(page).toHaveURL(`/shelf/${slug}`)
}
