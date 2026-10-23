import path from "node:path"
import { config } from "dotenv"

// Loads .env.test over whatever .env put in process.env, and refuses to run against anything
// that doesn't look like a test database: the suites truncate every table.
export function loadTestEnv() {
    config({ path: path.resolve(process.cwd(), ".env.test"), override: true, quiet: true })

    const url = process.env.DATABASE_URL ?? ""
    const dbName = new URL(url).pathname.slice(1)
    if (!dbName.includes("_test")) {
        throw new Error(`Refusing to run tests against "${dbName || url}": DATABASE_URL in .env.test must point at a *_test database`)
    }
    return { url, dbName }
}
