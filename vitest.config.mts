import { defineConfig } from "vitest/config"

export default defineConfig({
    // the @/ alias from tsconfig.json
    resolve: { tsconfigPaths: true },
    test: {
        environment: "node",
        projects: [
            {
                extends: true,
                test: {
                    name: "unit",
                    include: ["tests/unit/**/*.test.ts"],
                },
            },
            {
                extends: true,
                test: {
                    name: "integration",
                    include: ["tests/integration/**/*.test.ts"],
                    globalSetup: ["tests/setup/global-db.ts"],
                    setupFiles: ["tests/setup/env.ts"],
                    // every file shares the one test database
                    fileParallelism: false,
                    testTimeout: 20_000,
                    hookTimeout: 60_000,
                },
            },
        ],
    },
})
