import { defineConfig } from "vitest/config";

/**
 * MCP E2E test config - runs server E2E tests.
 * These tests spawn the MCP server and test via the protocol.
 */
export default defineConfig({
    test: {
        include: ["src/testing/e2e/server.e2e.test.ts"],
        testTimeout: 120000,
        hookTimeout: 120000,
    },
});
