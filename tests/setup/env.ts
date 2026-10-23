import { loadTestEnv } from "./test-env"

// Runs before each integration file imports @/lib/prisma, so the client connects to the test database
loadTestEnv()
