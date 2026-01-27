import { z } from "zod";

/**
 * Schema for individual test pass details.
 * Simpler than TestFailure since we don't need error-specific fields.
 */
export const TestPassSchema = z.object({
    testName: z.string().describe("Name of the passing test"),
    fullName: z.string().describe("Full test name including describe blocks"),
    file: z.string().describe("Path to the test file"),
});

export type TestPass = z.infer<typeof TestPassSchema>;
