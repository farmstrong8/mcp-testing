import { describe, test, expect, beforeAll } from "vitest";
import { execSync } from "node:child_process";
import { join } from "node:path";
import { runJestTests, runJestDebug } from "../../core/index.js";

const fixturesPath = join(import.meta.dirname, "../fixtures/simple-npm");

beforeAll(async () => {
    execSync("npm install --silent", { cwd: fixturesPath, stdio: "pipe" });
}, 60000);

describe("simple-npm integration", () => {
    test("runs all tests and parses results", async () => {
        const result = await runJestTests({
            projectPath: fixturesPath,
        });

        expect(result.results).not.toBeNull();
        expect(result.results!.summary.total).toBe(3);
        expect(result.results!.summary.passed).toBe(2);
        expect(result.results!.summary.failed).toBe(1);
        expect(result.results!.failures).toHaveLength(1);

        const failure = result.results!.failures[0];
        expect(failure.testName).toBe("intentionally failing test");
    }, 30000);

    test("filters by test name pattern", async () => {
        const result = await runJestTests({
            projectPath: fixturesPath,
            testNamePattern: "add returns sum",
        });

        expect(result.results).not.toBeNull();
        // Jest discovers all tests but only runs matching ones
        // total=3, but only 1 passed (the matching one), 2 skipped
        expect(result.results!.summary.passed).toBe(1);
        expect(result.results!.summary.failed).toBe(0);
        expect(result.results!.summary.skipped).toBe(2);
    }, 30000);

    test("debug mode returns verbose output", async () => {
        const result = await runJestDebug({
            projectPath: fixturesPath,
            testNamePattern: "add returns sum",
        });

        expect(result.results).toBeNull();
        expect(result.stdout + result.stderr).toMatch(/PASS|pass/i);
    }, 30000);
});
