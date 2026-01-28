import { defineConfig } from "vitest/config";
import { loadEnv } from "vite";

/**
 * Agent E2E test config - runs agent-based tests.
 * These tests use Claude API to verify tools work from an agent's perspective.
 * Requires ANTHROPIC_API_KEY environment variable.
 */
export default defineConfig(({ mode }) => {
    // Load .env from repo root (one level up from jest/)
    const env = loadEnv(mode, process.cwd() + "/..", "");

    return {
        test: {
            include: ["src/testing/e2e/agent.e2e.test.ts"],
            testTimeout: 120000,
            hookTimeout: 120000,
            env: {
                ANTHROPIC_API_KEY: env.ANTHROPIC_API_KEY,
            },
        },
    };
});
