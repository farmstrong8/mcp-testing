import { describe, test, expect, beforeAll } from "vitest";
import { execSync } from "node:child_process";
import { runJestTests, runJestDebug } from "../../jest/src/testRunner.js";

beforeAll(
    async () => {
        execSync("npm install --silent", { cwd: import.meta.dirname, stdio: "pipe" });
    },
    { timeout: 60000 }
);

describe("simple-npm integration", () => {
    test(
        "runs all tests and parses results",
        async () => {
            const result = await runJestTests({
                projectPath: import.meta.dirname,
            });

            expect(result.results).not.toBeNull();
            expect(result.results!.summary.total).toBe(3);
            expect(result.results!.summary.passed).toBe(2);
            expect(result.results!.summary.failed).toBe(1);
            expect(result.results!.failures).toHaveLength(1);

            const failure = result.results!.failures[0];
            expect(failure.testName).toBe("intentionally failing test");
        },
        { timeout: 30000 }
    );

    test(
        "filters by test name pattern",
        async () => {
            const result = await runJestTests({
                projectPath: import.meta.dirname,
                testNamePattern: "add returns sum",
            });

            expect(result.results).not.toBeNull();
            // Jest discovers all tests but only runs matching ones
            // total=3, but only 1 passed (the matching one), 2 skipped
            expect(result.results!.summary.passed).toBe(1);
            expect(result.results!.summary.failed).toBe(0);
            expect(result.results!.summary.skipped).toBe(2);
        },
        { timeout: 30000 }
    );

    test(
        "debug mode returns verbose output",
        async () => {
            const result = await runJestDebug({
                projectPath: import.meta.dirname,
                testNamePattern: "add returns sum",
            });

            expect(result.results).toBeNull();
            expect(result.stdout + result.stderr).toMatch(/PASS|pass/i);
        },
        { timeout: 30000 }
    );
});

