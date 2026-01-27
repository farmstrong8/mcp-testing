import { describe, test, expect } from "vitest";
import { parseJestOutput, extractJsonFromOutput } from "../resultParser.js";

const SAMPLE_PASSING_OUTPUT = JSON.stringify({
    success: true,
    numTotalTests: 2,
    numPassedTests: 2,
    numFailedTests: 0,
    numPendingTests: 0,
    testResults: [
        {
            name: "/path/to/math.test.js",
            status: "passed",
            startTime: 1000,
            endTime: 1050,
            assertionResults: [
                {
                    ancestorTitles: ["math"],
                    title: "adds numbers",
                    status: "passed",
                    failureMessages: [],
                },
                {
                    ancestorTitles: ["math"],
                    title: "subtracts numbers",
                    status: "passed",
                    failureMessages: [],
                },
            ],
        },
    ],
});

const SAMPLE_FAILING_OUTPUT = JSON.stringify({
    success: false,
    numTotalTests: 3,
    numPassedTests: 2,
    numFailedTests: 1,
    numPendingTests: 0,
    testResults: [
        {
            name: "/path/to/math.test.js",
            status: "failed",
            startTime: 1000,
            endTime: 1100,
            assertionResults: [
                {
                    ancestorTitles: ["math"],
                    title: "adds numbers",
                    status: "passed",
                    failureMessages: [],
                },
                {
                    ancestorTitles: ["math"],
                    title: "fails intentionally",
                    status: "failed",
                    failureMessages: [
                        "expect(received).toBe(expected)\n\nExpected: 3\nReceived: 2\n\n    at /path/to/math.test.js:15:20",
                    ],
                    location: { line: 15, column: 20 },
                },
            ],
        },
    ],
});

const SAMPLE_SKIPPED_OUTPUT = JSON.stringify({
    success: true,
    numTotalTests: 3,
    numPassedTests: 2,
    numFailedTests: 0,
    numPendingTests: 1,
    testResults: [
        {
            name: "/path/to/math.test.js",
            status: "passed",
            startTime: 1000,
            endTime: 1050,
            assertionResults: [
                {
                    ancestorTitles: ["math"],
                    title: "adds numbers",
                    status: "passed",
                    failureMessages: [],
                },
                {
                    ancestorTitles: ["math"],
                    title: "skipped test",
                    status: "pending",
                    failureMessages: [],
                },
            ],
        },
    ],
});

describe("parseJestOutput", () => {
    test("parses passing test output", () => {
        const result = parseJestOutput(SAMPLE_PASSING_OUTPUT, "npm test");

        expect(result.success).toBe(true);
        expect(result.command).toBe("npm test");
        expect(result.summary.total).toBe(2);
        expect(result.summary.passed).toBe(2);
        expect(result.summary.failed).toBe(0);
        expect(result.summary.skipped).toBe(0);
        expect(result.failures).toHaveLength(0);

        expect(result.passes).toHaveLength(2);
        expect(result.passes[0]).toEqual({
            testName: "adds numbers",
            fullName: "math > adds numbers",
            file: "/path/to/math.test.js",
        });
        expect(result.passes[1]).toEqual({
            testName: "subtracts numbers",
            fullName: "math > subtracts numbers",
            file: "/path/to/math.test.js",
        });
    });

    test("parses failing test output with failure details", () => {
        const result = parseJestOutput(SAMPLE_FAILING_OUTPUT, "npm test");

        expect(result.success).toBe(false);
        expect(result.summary.total).toBe(3);
        expect(result.summary.passed).toBe(2);
        expect(result.summary.failed).toBe(1);
        expect(result.failures).toHaveLength(1);

        const failure = result.failures[0];
        expect(failure.testName).toBe("fails intentionally");
        expect(failure.fullName).toBe("math > fails intentionally");
        expect(failure.file).toBe("/path/to/math.test.js");
        expect(failure.line).toBe(15);
        expect(failure.matcherName).toBe("toBe");
        expect(failure.expected).toBe("3");
        expect(failure.received).toBe("2");

        // Verify passing tests are still captured alongside failures
        expect(result.passes).toHaveLength(1);
        expect(result.passes[0].testName).toBe("adds numbers");
    });

    test("parses skipped tests", () => {
        const result = parseJestOutput(SAMPLE_SKIPPED_OUTPUT, "npm test");

        expect(result.success).toBe(true);
        expect(result.summary.total).toBe(3);
        expect(result.summary.passed).toBe(2);
        expect(result.summary.skipped).toBe(1);

        // Skipped tests should not appear in passes array
        expect(result.passes).toHaveLength(1);
        expect(result.passes[0].testName).toBe("adds numbers");
    });

    test("calculates duration from test results", () => {
        const result = parseJestOutput(SAMPLE_PASSING_OUTPUT, "npm test");
        expect(result.summary.duration).toBe(50);
    });

    test("extracts line number from stack trace when location missing", () => {
        const outputWithoutLocation = JSON.stringify({
            success: false,
            numTotalTests: 1,
            numPassedTests: 0,
            numFailedTests: 1,
            numPendingTests: 0,
            testResults: [
                {
                    name: "/project/src/app.test.js",
                    status: "failed",
                    assertionResults: [
                        {
                            ancestorTitles: [],
                            title: "test",
                            status: "failed",
                            failureMessages: [
                                "Error\n    at /project/src/app.test.js:42:10",
                            ],
                            // No location field
                        },
                    ],
                },
            ],
        });

        const result = parseJestOutput(outputWithoutLocation, "npm test");
        expect(result.failures[0].line).toBe(42);
    });
});

describe("extractJsonFromOutput", () => {
    test("extracts JSON from clean output", () => {
        const json = extractJsonFromOutput('{"success": true}');
        expect(json).toBe('{"success": true}');
    });

    test("extracts JSON from output with prefix", () => {
        const json = extractJsonFromOutput(
            'Some logging\n{"success": true}\nMore output'
        );
        expect(json).toBe('{"success": true}');
    });

    test("extracts JSON from output with ANSI codes before", () => {
        const json = extractJsonFromOutput(
            '\x1b[32mRunning tests...\x1b[0m\n{"success": true}'
        );
        expect(json).toBe('{"success": true}');
    });

    test("returns null for output without JSON", () => {
        const json = extractJsonFromOutput("no json here");
        expect(json).toBeNull();
    });

    test("returns null for malformed braces", () => {
        const json = extractJsonFromOutput("} before {");
        expect(json).toBeNull();
    });
});

