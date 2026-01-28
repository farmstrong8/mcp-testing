/**
 * Structured output for test results, designed for AI consumption.
 */
export interface TestResults {
    command: string;
    success: boolean;
    summary: {
        total: number;
        passed: number;
        failed: number;
        skipped: number;
        duration: number;
    };
    passes: TestPass[];
    failures: TestFailure[];
}

export interface TestPass {
    testName: string;
    fullName: string;
    file: string;
}

export interface TestFailure {
    testName: string;
    fullName: string;
    file: string;
    line: number | null;
    matcherName: string | null;
    expected: string | null;
    received: string | null;
    message: string;
}

/**
 * Jest's JSON output format (simplified to fields we use).
 */
interface JestJsonOutput {
    success: boolean;
    numTotalTests: number;
    numPassedTests: number;
    numFailedTests: number;
    numPendingTests: number;
    testResults: JestTestResult[];
}

interface JestTestResult {
    name: string;
    status: "passed" | "failed" | "pending";
    assertionResults: JestAssertionResult[];
    endTime?: number;
    startTime?: number;
}

interface JestAssertionResult {
    ancestorTitles: string[];
    title: string;
    status: "passed" | "failed" | "pending";
    failureMessages: string[];
    location?: { line: number; column: number } | null;
}

/**
 * Extracts line number from a Jest failure message stack trace.
 */
function extractLineNumber(message: string, file: string): number | null {
    // Look for patterns like "at path/file.js:42:10"
    const escapedFile = file.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`${escapedFile}:(\\d+):\\d+`);
    const match = message.match(regex);
    if (match) {
        return parseInt(match[1], 10);
    }
    return null;
}

/**
 * Extracts expected/received values from a Jest failure message.
 */
function extractExpectedReceived(message: string): {
    expected: string | null;
    received: string | null;
    matcherName: string | null;
} {
    let expected: string | null = null;
    let received: string | null = null;
    let matcherName: string | null = null;

    // Extract matcher name from "expect(received).toBe(expected)"
    const matcherMatch = message.match(/expect\(.*?\)\.(to\w+)/);
    if (matcherMatch) {
        matcherName = matcherMatch[1];
    }

    // Extract expected value
    const expectedMatch = message.match(/Expected:?\s*(.+)/m);
    if (expectedMatch) {
        expected = expectedMatch[1].trim();
    }

    // Extract received value
    const receivedMatch = message.match(/Received:?\s*(.+)/m);
    if (receivedMatch) {
        received = receivedMatch[1].trim();
    }

    return { expected, received, matcherName };
}

/**
 * Cleans up Jest error messages by removing ANSI codes and excessive whitespace.
 */
function cleanErrorMessage(message: string): string {
    return (
        message
            // Remove ANSI escape codes
            .replace(/\x1b\[[0-9;]*m/g, "")
            // Normalize whitespace
            .replace(/\r\n/g, "\n")
            .trim()
    );
}

/**
 * Parses Jest JSON output into structured TestResults.
 */
export function parseJestOutput(
    jsonOutput: string,
    command: string
): TestResults {
    const data: JestJsonOutput = JSON.parse(jsonOutput);

    const passes: TestPass[] = [];
    const failures: TestFailure[] = [];

    for (const testResult of data.testResults) {
        for (const assertion of testResult.assertionResults) {
            const fullName = [
                ...assertion.ancestorTitles,
                assertion.title,
            ].join(" > ");

            if (assertion.status === "passed") {
                passes.push({
                    testName: assertion.title,
                    fullName,
                    file: testResult.name,
                });
            } else if (assertion.status === "failed") {
                const message = assertion.failureMessages.join("\n");
                const { expected, received, matcherName } =
                    extractExpectedReceived(message);

                failures.push({
                    testName: assertion.title,
                    fullName,
                    file: testResult.name,
                    line:
                        assertion.location?.line ??
                        extractLineNumber(message, testResult.name),
                    matcherName,
                    expected,
                    received,
                    message: cleanErrorMessage(message),
                });
            }
        }
    }

    // Calculate duration from test results
    let duration = 0;
    for (const testResult of data.testResults) {
        if (testResult.endTime && testResult.startTime) {
            duration += testResult.endTime - testResult.startTime;
        }
    }

    return {
        command,
        success: data.success,
        summary: {
            total: data.numTotalTests,
            passed: data.numPassedTests,
            failed: data.numFailedTests,
            skipped: data.numPendingTests,
            duration,
        },
        passes,
        failures,
    };
}

/**
 * Tries to extract JSON from Jest output that may include non-JSON content.
 */
export function extractJsonFromOutput(output: string): string | null {
    // Jest JSON output starts with { and ends with }
    const start = output.indexOf("{");
    const end = output.lastIndexOf("}");

    if (start === -1 || end === -1 || end <= start) {
        return null;
    }

    return output.slice(start, end + 1);
}
