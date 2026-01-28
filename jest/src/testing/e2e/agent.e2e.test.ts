import { describe, test, expect, beforeAll } from "vitest";
import { execSync } from "node:child_process";
import { join } from "node:path";
import Anthropic from "@anthropic-ai/sdk";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const fixturesPath = join(import.meta.dirname, "../fixtures");
const serverPath = join(import.meta.dirname, "../../../dist/main.js");

/**
 * Converts MCP tool definitions to Anthropic tool format.
 */
function mcpToolsToAnthropic(
    mcpTools: Array<{ name: string; description?: string; inputSchema: unknown }>
): Anthropic.Tool[] {
    return mcpTools.map((tool) => ({
        name: tool.name,
        description: tool.description ?? "",
        input_schema: tool.inputSchema as Anthropic.Tool.InputSchema,
    }));
}

describe("Agent-Based E2E Tests", () => {
    let anthropic: Anthropic;
    let mcpClient: Client;
    let transport: StdioClientTransport;
    let tools: Anthropic.Tool[];

    beforeAll(async () => {
        // Fail if no API key - prevents false positives from skipped tests
        if (!process.env.ANTHROPIC_API_KEY) {
            throw new Error(
                "ANTHROPIC_API_KEY environment variable is required for agent tests. " +
                "Set it in .env at the repo root or export it in your shell."
            );
        }

        // Install fixture dependencies
        execSync("npm install --silent", {
            cwd: join(fixturesPath, "all-passing"),
            stdio: "pipe",
        });
        execSync("npm install --silent", {
            cwd: join(fixturesPath, "all-failing"),
            stdio: "pipe",
        });

        // Initialize Anthropic client
        anthropic = new Anthropic();

        // Initialize MCP client to get tool definitions
        transport = new StdioClientTransport({
            command: "node",
            args: [serverPath],
        });

        mcpClient = new Client(
            { name: "agent-test-client", version: "1.0.0" },
            { capabilities: {} }
        );

        await mcpClient.connect(transport);

        // Get tools from MCP server and convert to Anthropic format
        const mcpToolsResult = await mcpClient.listTools();
        tools = mcpToolsToAnthropic(mcpToolsResult.tools);
    }, 120000);

    test(
        "agent invokes run_jest_tests with correct arguments",
        async () => {
            const passingPath = join(fixturesPath, "all-passing");

            const message = await anthropic.messages.create({
                model: "claude-sonnet-4-20250514",
                max_tokens: 1024,
                tools,
                messages: [
                    {
                        role: "user",
                        content: `Call the run_jest_tests tool with projectPath="${passingPath}".
After receiving the result, respond with exactly one of:
- "RESULT:PASS:count={number}" if all tests passed (use the passed count)
- "RESULT:FAIL:count={number}" if any tests failed (use the failed count)
Do not include any other text.`,
                    },
                ],
            });

            // Find the tool use block
            const toolUse = message.content.find(
                (block) => block.type === "tool_use"
            );
            expect(toolUse).toBeDefined();
            expect(toolUse!.type).toBe("tool_use");

            if (toolUse?.type === "tool_use") {
                expect(toolUse.name).toBe("run_jest_tests");
                expect((toolUse.input as { projectPath: string }).projectPath).toBe(
                    passingPath
                );

                // Execute the tool call via MCP
                const toolResult = await mcpClient.callTool({
                    name: toolUse.name,
                    arguments: toolUse.input as Record<string, unknown>,
                });

                // Continue the conversation with tool result
                const content = toolResult.content as Array<{
                    type: string;
                    text: string;
                }>;
                const textContent = content.find((c) => c.type === "text");

                const followUp = await anthropic.messages.create({
                    model: "claude-sonnet-4-20250514",
                    max_tokens: 256,
                    tools,
                    messages: [
                        {
                            role: "user",
                            content: `Call the run_jest_tests tool with projectPath="${passingPath}".
After receiving the result, respond with exactly one of:
- "RESULT:PASS:count={number}" if all tests passed (use the passed count)
- "RESULT:FAIL:count={number}" if any tests failed (use the failed count)
Do not include any other text.`,
                        },
                        { role: "assistant", content: message.content },
                        {
                            role: "user",
                            content: [
                                {
                                    type: "tool_result",
                                    tool_use_id: toolUse.id,
                                    content: textContent!.text,
                                },
                            ],
                        },
                    ],
                });

                // Check the final response matches expected format
                const textBlock = followUp.content.find(
                    (block) => block.type === "text"
                );
                expect(textBlock).toBeDefined();
                if (textBlock?.type === "text") {
                    expect(textBlock.text).toMatch(/RESULT:PASS:count=2/);
                }
            }
        },
        60000
    );

    test(
        "agent extracts failure details correctly",
        async () => {
            const failingPath = join(fixturesPath, "all-failing");

            const message = await anthropic.messages.create({
                model: "claude-sonnet-4-20250514",
                max_tokens: 1024,
                tools,
                messages: [
                    {
                        role: "user",
                        content: `Call the run_jest_tests tool with projectPath="${failingPath}".
After receiving the result, respond with exactly:
"FAILURE:{testName}" using the first failure's testName field.
Do not include any other text.`,
                    },
                ],
            });

            const toolUse = message.content.find(
                (block) => block.type === "tool_use"
            );
            expect(toolUse).toBeDefined();

            if (toolUse?.type === "tool_use") {
                // Execute the tool call
                const toolResult = await mcpClient.callTool({
                    name: toolUse.name,
                    arguments: toolUse.input as Record<string, unknown>,
                });

                const content = toolResult.content as Array<{
                    type: string;
                    text: string;
                }>;
                const textContent = content.find((c) => c.type === "text");

                const followUp = await anthropic.messages.create({
                    model: "claude-sonnet-4-20250514",
                    max_tokens: 256,
                    tools,
                    messages: [
                        {
                            role: "user",
                            content: `Call the run_jest_tests tool with projectPath="${failingPath}".
After receiving the result, respond with exactly:
"FAILURE:{testName}" using the first failure's testName field.
Do not include any other text.`,
                        },
                        { role: "assistant", content: message.content },
                        {
                            role: "user",
                            content: [
                                {
                                    type: "tool_result",
                                    tool_use_id: toolUse.id,
                                    content: textContent!.text,
                                },
                            ],
                        },
                    ],
                });

                const textBlock = followUp.content.find(
                    (block) => block.type === "text"
                );
                expect(textBlock).toBeDefined();
                if (textBlock?.type === "text") {
                    // Should contain FAILURE: followed by a test name
                    expect(textBlock.text).toMatch(/FAILURE:.+/);
                }
            }
        },
        60000
    );
});
