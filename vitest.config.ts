import { defineConfig } from "vitest/config";

/**
 * Root vitest config for integration tests.
 * Runs tests in examples/ that exercise mcp-jest against real projects.
 */
export default defineConfig({
    test: {
        include: ["examples/**/integration.test.ts"],
        testTimeout: 60000,
    },
});

