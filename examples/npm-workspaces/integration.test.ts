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

describe("npm-workspaces integration", () => {
    test("detects monorepo configuration", () => {
        const config = detectJestConfig(import.meta.dirname);

        expect(config.isMonorepo).toBe(true);
        expect(config.workspaces).toEqual(["packages/*"]);
        expect(config.configFile).toContain("jest.config.js");
    });

    test(
        "runs tests across all workspace packages",
        async () => {
            const result = await runJestTests({
                projectPath: import.meta.dirname,
            });

            expect(result.results).not.toBeNull();
            // 1 test in core + 2 tests in utils = 3 total
            expect(result.results!.summary.total).toBe(3);
            expect(result.results!.summary.failed).toBe(1);
        },
        { timeout: 30000 }
    );
});

