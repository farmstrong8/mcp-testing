import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { runJestTests, runJestDebug } from "./testRunner.js";
import { detectJestConfig } from "./jestConfig.js";
import { TestResultsSchema, JestConfigInfoSchema } from "./schemas/index.js";

/**
 * Creates and configures the MCP server with all Jest tools.
 *
 * Note: SDK version is pinned to 1.17.5 due to a known TypeScript type
 * recursion bug in versions 1.18.2+ that causes OOM during compilation.
 * Track: https://github.com/modelcontextprotocol/typescript-sdk/issues
 *
 * The DNS rebinding vulnerability (GHSA-w48q-cv73-mx4w) in <1.24.0 only
 * affects HTTP-based servers; this server uses stdio transport.
 */
export function createServer(): McpServer {
    const server = new McpServer({
        name: "mcp-jest",
        version: "0.1.0",
    });

    // Tool: run_jest_tests
    server.registerTool(
        "run_jest_tests",
        {
            description:
                "Run Jest tests in a project and return structured results with pass/fail counts and failure details",
            inputSchema: {
                projectPath: z
                    .string()
                    .describe(
                        "Path to the project directory containing Jest tests"
                    ),
                testPattern: z
                    .string()
                    .optional()
                    .describe(
                        "Optional file path or pattern to filter test files"
                    ),
            },
            outputSchema: {
                results: TestResultsSchema.nullable(),
                error: z.string().optional(),
            },
        },
        async ({ projectPath, testPattern }) => {
            const result = await runJestTests({ projectPath, testPattern });

            if (result.results) {
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(result.results, null, 2),
                        },
                    ],
                    structuredContent: {
                        results: result.results,
                    },
                };
            } else {
                return {
                    content: [
                        {
                            type: "text",
                            text: `Jest execution failed to produce parseable output.\n\nSTDOUT:\n${result.stdout}\n\nSTDERR:\n${result.stderr}`,
                        },
                    ],
                    structuredContent: {
                        results: null,
                        error: `Jest execution failed. STDOUT: ${result.stdout}\nSTDERR: ${result.stderr}`,
                    },
                    isError: true,
                };
            }
        }
    );

    // Tool: run_jest_test_by_name
    server.registerTool(
        "run_jest_test_by_name",
        {
            description:
                "Run Jest tests matching a specific test name pattern (uses Jest's -t flag)",
            inputSchema: {
                projectPath: z
                    .string()
                    .describe(
                        "Path to the project directory containing Jest tests"
                    ),
                testNamePattern: z
                    .string()
                    .describe("Test name pattern to match (regex supported)"),
                testPattern: z
                    .string()
                    .optional()
                    .describe(
                        "Optional file path or pattern to filter test files"
                    ),
            },
            outputSchema: {
                results: TestResultsSchema.nullable(),
                error: z.string().optional(),
            },
        },
        async ({ projectPath, testNamePattern, testPattern }) => {
            const result = await runJestTests({
                projectPath,
                testPattern,
                testNamePattern,
            });

            if (result.results) {
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(result.results, null, 2),
                        },
                    ],
                    structuredContent: {
                        results: result.results,
                    },
                };
            } else {
                return {
                    content: [
                        {
                            type: "text",
                            text: `Jest execution failed to produce parseable output.\n\nSTDOUT:\n${result.stdout}\n\nSTDERR:\n${result.stderr}`,
                        },
                    ],
                    structuredContent: {
                        results: null,
                        error: `Jest execution failed. STDOUT: ${result.stdout}\nSTDERR: ${result.stderr}`,
                    },
                    isError: true,
                };
            }
        }
    );

    // Tool: debug_jest_test
    server.registerTool(
        "debug_jest_test",
        {
            description:
                "Run Jest tests in verbose mode and return raw output for debugging",
            inputSchema: {
                projectPath: z
                    .string()
                    .describe(
                        "Path to the project directory containing Jest tests"
                    ),
                testPattern: z
                    .string()
                    .optional()
                    .describe(
                        "Optional file path or pattern to filter test files"
                    ),
                testNamePattern: z
                    .string()
                    .optional()
                    .describe("Optional test name pattern to match"),
            },
            outputSchema: {
                exitCode: z.number().describe("Process exit code"),
                output: z.string().describe("Combined stdout and stderr"),
            },
        },
        async ({ projectPath, testPattern, testNamePattern }) => {
            const result = await runJestDebug({
                projectPath,
                testPattern,
                testNamePattern,
            });

            const combinedOutput = `${result.stdout}\n${result.stderr}`;
            return {
                content: [
                    {
                        type: "text",
                        text: `Exit code: ${result.exitCode}\n\nOutput:\n${combinedOutput}`,
                    },
                ],
                structuredContent: {
                    exitCode: result.exitCode,
                    output: combinedOutput,
                },
            };
        }
    );

    // Tool: detect_jest_config
    server.registerTool(
        "detect_jest_config",
        {
            description:
                "Detect Jest configuration, package manager, and monorepo structure in a project",
            inputSchema: {
                projectPath: z
                    .string()
                    .describe("Path to the project directory to analyze"),
            },
            outputSchema: {
                config: JestConfigInfoSchema,
            },
        },
        async ({ projectPath }) => {
            const config = detectJestConfig(projectPath);

            return {
                content: [
                    { type: "text", text: JSON.stringify(config, null, 2) },
                ],
                structuredContent: {
                    config,
                },
            };
        }
    );

    return server;
}
