import { defineConfig } from "vitest/config";

/**
 * Root vitest config for integration tests.
 * Runs integration tests from the jest package.
 */
export default defineConfig({
    test: {
        include: ["jest/src/testing/integration/**/*.test.ts"],
        testTimeout: 60000,
    },
});

