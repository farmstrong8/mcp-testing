import { describe, test, expect, beforeAll } from "vitest";
import { execSync } from "node:child_process";
import { join } from "node:path";
import { runJestTests, detectJestConfig } from "../../core/index.js";

const fixturesPath = join(import.meta.dirname, "../fixtures/npm-workspaces");

beforeAll(async () => {
    execSync("npm install --silent", { cwd: fixturesPath, stdio: "pipe" });
}, 60000);

describe("npm-workspaces integration", () => {
    test("detects monorepo configuration", () => {
        const config = detectJestConfig(fixturesPath);

        expect(config.isMonorepo).toBe(true);
        expect(config.workspaces).toEqual(["packages/*"]);
        expect(config.configFile).toContain("jest.config.js");
    });

    test("runs tests across all workspace packages", async () => {
        const result = await runJestTests({
            projectPath: fixturesPath,
        });

        expect(result.results).not.toBeNull();
        // 1 test in core + 2 tests in utils = 3 total
        expect(result.results!.summary.total).toBe(3);
        expect(result.results!.summary.failed).toBe(1);
    }, 30000);
});
