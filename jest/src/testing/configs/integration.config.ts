import { defineConfig } from "vitest/config";

/**
 * Integration test config - runs tests in testing/integration/
 * These tests run Jest against real fixture projects.
 */
export default defineConfig({
    test: {
        include: ["src/testing/integration/**/*.test.ts"],
        testTimeout: 60000,
        hookTimeout: 60000,
    },
});
