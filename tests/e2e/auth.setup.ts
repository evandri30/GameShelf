import { expect, test as setup } from "@playwright/test"
import { STORAGE_STATE } from "../../playwright.config"
import { logIn } from "./helpers"

// Logs the seeded user in once; the other specs reuse the session cookie
setup("log in as the seeded user", async ({ page }) => {
    await logIn(page)
    await expect(page).toHaveURL("/games")
    await page.context().storageState({ path: STORAGE_STATE })
})
