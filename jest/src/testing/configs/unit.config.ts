import { defineConfig } from "vitest/config";

/**
 * Unit test config - runs tests in core/__tests__/
 */
export default defineConfig({
    test: {
        include: ["src/core/__tests__/**/*.test.ts"],
        testTimeout: 30000,
    },
});
