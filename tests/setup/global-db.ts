import { execSync } from "node:child_process"
import { Client } from "pg"
import { loadTestEnv } from "./test-env"

// Creates the test database on first run, then applies the migrations to it
export default async function setupTestDatabase() {
    const { url, dbName } = loadTestEnv()

    const admin = new URL(url)
    admin.pathname = "/postgres"
    admin.search = ""
    const client = new Client({ connectionString: admin.toString() })
    await client.connect()
    try {
        const { rowCount } = await client.query("SELECT 1 FROM pg_database WHERE datname = $1", [dbName])
        if (!rowCount) await client.query(`CREATE DATABASE "${dbName.replace(/"/g, '""')}"`)
    } finally {
        await client.end()
    }

    execSync("npx prisma migrate deploy", { stdio: "pipe", env: { ...process.env, DATABASE_URL: url } })
}
