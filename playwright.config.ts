import { defineConfig, devices } from "@playwright/test"
import { loadTestEnv } from "./tests/setup/test-env"

// The app under test talks to the *_test database from .env.test
loadTestEnv()

const PORT = 3100
export const STORAGE_STATE = "tests/e2e/.auth/user.json"

export default defineConfig({
    testDir: "tests/e2e",
    globalSetup: "./tests/e2e/global-setup.ts",
    // the specs share one seeded account and one database
    fullyParallel: false,
    workers: 1,
    // the real RAWG API sometimes stalls; a retry shows up as "flaky" in the report instead of a failure
    retries: 1,
    // RAWG answers in ~1s on a cold cache
    timeout: 60_000,
    expect: { timeout: 15_000 },
    reporter: [["list"], ["html", { open: "never" }]],
    use: {
        baseURL: `http://localhost:${PORT}`,
        trace: "retain-on-failure",
        screenshot: "only-on-failure",
    },
    projects: [
        { name: "setup", testMatch: /auth\.setup\.ts/ },
        {
            name: "chromium",
            use: { ...devices["Desktop Chrome"], storageState: STORAGE_STATE },
            dependencies: ["setup"],
        },
    ],
    // a production build, so it never fights over the dev server's .next/dev
    webServer: {
        command: `npm run build && npm run start -- -p ${PORT}`,
        url: `http://localhost:${PORT}`,
        timeout: 300_000,
        reuseExistingServer: !process.env.CI,
        env: { ...process.env as Record<string, string> },
        stdout: "ignore",
        stderr: "pipe",
    },
})
