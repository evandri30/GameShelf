import { randomUUID } from "node:crypto"
import bcrypt from "bcryptjs"
import { Client } from "pg"
import setupTestDatabase from "../setup/global-db"
import { E2E_USER } from "./helpers"

// Fresh database for every run: migrate, wipe, then seed the account the specs log in with
export default async function globalSetup() {
    await setupTestDatabase()

    const client = new Client({ connectionString: process.env.DATABASE_URL })
    await client.connect()
    try {
        await client.query(`TRUNCATE "ShelfListItem", "ShelfList", "Shelf", "User", "RateLimit" CASCADE`)
        await client.query(
            `INSERT INTO "User" ("id", "email", "password", "name", "username", "isPublic", "createdAt", "updatedAt")
             VALUES ($1, $2, $3, $4, 'e2eplayer', false, now(), now())`,
            [randomUUID(), E2E_USER.email, await bcrypt.hash(E2E_USER.password, 10), E2E_USER.name]
        )
    } finally {
        await client.end()
    }
}
