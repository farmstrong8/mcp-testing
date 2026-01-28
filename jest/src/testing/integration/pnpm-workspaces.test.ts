import { describe, test, expect, beforeAll } from "vitest";
import { execSync } from "node:child_process";
import { join } from "node:path";
import { runJestTests, detectJestConfig } from "../../core/index.js";

const fixturesPath = join(import.meta.dirname, "../fixtures/pnpm-workspaces");

beforeAll(async () => {
    execSync("npm install --silent", { cwd: fixturesPath, stdio: "pipe" });
}, 60000);

describe("pnpm-workspaces integration", () => {
    test("detects pnpm monorepo configuration", () => {
        const config = detectJestConfig(fixturesPath);

        expect(config.isMonorepo).toBe(true);
        expect(config.workspaces).toEqual(["packages/*"]);
    });

    test("runs tests in pnpm monorepo", async () => {
        const result = await runJestTests({
            projectPath: fixturesPath,
        });

        expect(result.results).not.toBeNull();
        expect(result.results!.summary.total).toBe(2);
        expect(result.results!.summary.failed).toBe(1);
    }, 30000);
});
