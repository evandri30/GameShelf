import { expect, test } from "@playwright/test"
import { E2E_USER, expectToast, logIn } from "./helpers"

// These start logged out
test.use({ storageState: { cookies: [], origins: [] } })

test("registers a new account and lands on Discover", async ({ page }) => {
    await page.goto("/auth")
    await page.getByRole("button", { name: "Sign up" }).click()

    await page.getByLabel("Name", { exact: true }).fill("New Player")
    await page.getByLabel("Email", { exact: true }).fill(`new-${Date.now()}@test.dev`)
    await page.getByLabel("Password", { exact: true }).fill("Secret123")
    await page.getByRole("button", { name: "Create account" }).click()

    await expect(page).toHaveURL("/games")
    await expectToast(page, "Account created")
})

test("shows validation errors under the fields", async ({ page }) => {
    await page.goto("/auth")
    await page.getByRole("button", { name: "Sign up" }).click()

    await page.getByLabel("Name", { exact: true }).fill("ab")
    await page.getByLabel("Email", { exact: true }).fill("not-an-email")
    await page.getByLabel("Password", { exact: true }).fill("weak")
    await page.getByRole("button", { name: "Create account" }).click()

    await expect(page.getByLabel("Email", { exact: true })).toHaveAttribute("aria-invalid", "true")
    await expect(page.getByLabel("Password", { exact: true })).toHaveAttribute("aria-invalid", "true")
    await expect(page).toHaveURL("/auth")
})

test("rejects a wrong password", async ({ page }) => {
    await logIn(page, E2E_USER.email, "WrongPass1")

    await expectToast(page, "Invalid email or password")
    await expect(page).toHaveURL("/auth")
})

test("logs in, then logs out", async ({ page }) => {
    await logIn(page)
    await expect(page).toHaveURL("/games")

    await page.getByRole("button", { name: "Open user menu" }).click()
    await page.getByRole("menuitem", { name: "Logout" }).click()

    await expect(page).toHaveURL("/")
    await page.goto("/shelf")
    await expect(page).toHaveURL("/")
})

test("toggles password visibility", async ({ page }) => {
    await page.goto("/auth")
    const password = page.getByLabel("Password", { exact: true })
    await password.fill("Secret123")

    await page.getByRole("button", { name: "Show password" }).click()
    await expect(password).toHaveAttribute("type", "text")
})
