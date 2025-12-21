import { describe, test, expect, beforeAll } from "vitest";
import { execSync } from "node:child_process";
import { runJestTests } from "../../jest/src/testRunner.js";
import { detectJestConfig } from "../../jest/src/jestConfig.js";

beforeAll(
    async () => {
        execSync("npm install --silent", { cwd: import.meta.dirname, stdio: "pipe" });
    },
    { timeout: 60000 }
);

describe("pnpm-workspaces integration", () => {
    test("detects pnpm monorepo configuration", () => {
        const config = detectJestConfig(import.meta.dirname);

        expect(config.isMonorepo).toBe(true);
        expect(config.workspaces).toEqual(["packages/*"]);
    });

    test(
        "runs tests in pnpm monorepo",
        async () => {
            const result = await runJestTests({
                projectPath: import.meta.dirname,
            });

            expect(result.results).not.toBeNull();
            expect(result.results!.summary.total).toBe(2);
            expect(result.results!.summary.failed).toBe(1);
        },
        { timeout: 30000 }
    );
});

