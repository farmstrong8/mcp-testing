import { z } from "zod";
import { TestFailureSchema } from "./testFailure.js";
import { TestPassSchema } from "./testPass.js";

/**
 * Schema for structured test results.
 */
export const TestResultsSchema = z.object({
    command: z.string().describe("The Jest command that was executed"),
    success: z.boolean().describe("Whether all tests passed"),
    summary: z.object({
        total: z.number().describe("Total number of tests"),
        passed: z.number().describe("Number of passing tests"),
        failed: z.number().describe("Number of failing tests"),
        skipped: z.number().describe("Number of skipped tests"),
        duration: z.number().describe("Test duration in milliseconds"),
    }),
    passes: z.array(TestPassSchema).describe("Details of each passing test"),
    failures: z
        .array(TestFailureSchema)
        .describe("Details of each failing test"),
});

export type TestResults = z.infer<typeof TestResultsSchema>;

