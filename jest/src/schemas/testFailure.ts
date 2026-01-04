import { z } from "zod";

/**
 * Schema for individual test failure details.
 */
export const TestFailureSchema = z.object({
    testName: z.string().describe("Name of the failing test"),
    fullName: z.string().describe("Full test name including describe blocks"),
    file: z.string().describe("Path to the test file"),
    line: z.number().nullable().describe("Line number of the failure"),
    matcherName: z
        .string()
        .nullable()
        .describe("Jest matcher that failed (e.g., toBe, toEqual)"),
    expected: z.string().nullable().describe("Expected value"),
    received: z.string().nullable().describe("Actual value received"),
    message: z.string().describe("Error message"),
});

export type TestFailure = z.infer<typeof TestFailureSchema>;

