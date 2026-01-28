import { describe, test, expect, beforeAll, afterAll } from "vitest";
import { execSync } from "node:child_process";
import { join } from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const fixturesPath = join(import.meta.dirname, "../fixtures");
const serverPath = join(import.meta.dirname, "../../../dist/main.js");

describe("MCP Server E2E", () => {
    let client: Client;
    let transport: StdioClientTransport;

    beforeAll(async () => {
        // Install dependencies in fixtures
        execSync("npm install --silent", {
            cwd: join(fixturesPath, "all-passing"),
            stdio: "pipe",
        });
        execSync("npm install --silent", {
            cwd: join(fixturesPath, "all-failing"),
            stdio: "pipe",
        });

        // Create transport and client
        transport = new StdioClientTransport({
            command: "node",
            args: [serverPath],
        });

        client = new Client(
            { name: "test-client", version: "1.0.0" },
            { capabilities: {} }
        );

        await client.connect(transport);
    }, 120000);

    afterAll(async () => {
        await client.close();
    });

    test("lists all available tools", async () => {
        const result = await client.listTools();

        const toolNames = result.tools.map((t) => t.name);
        expect(toolNames).toContain("run_jest_tests");
        expect(toolNames).toContain("run_jest_test_by_name");
        expect(toolNames).toContain("debug_jest_test");
        expect(toolNames).toContain("detect_jest_config");
    });

    test("run_jest_tests returns success for all-passing fixture", async () => {
        const result = await client.callTool({
            name: "run_jest_tests",
            arguments: {
                projectPath: join(fixturesPath, "all-passing"),
            },
        });

        expect(result.isError).toBeFalsy();

        // Parse the structured content from the text response
        const content = result.content as Array<{ type: string; text: string }>;
        const textContent = content.find((c) => c.type === "text");
        expect(textContent).toBeDefined();

        const parsed = JSON.parse(textContent!.text);
        expect(parsed.success).toBe(true);
        expect(parsed.summary.total).toBe(2);
        expect(parsed.summary.passed).toBe(2);
        expect(parsed.summary.failed).toBe(0);
        expect(parsed.passes).toHaveLength(2);
    }, 30000);

    test("run_jest_tests returns failures for all-failing fixture", async () => {
        const result = await client.callTool({
            name: "run_jest_tests",
            arguments: {
                projectPath: join(fixturesPath, "all-failing"),
            },
        });

        expect(result.isError).toBeFalsy();

        const content = result.content as Array<{ type: string; text: string }>;
        const textContent = content.find((c) => c.type === "text");
        const parsed = JSON.parse(textContent!.text);

        expect(parsed.success).toBe(false);
        expect(parsed.summary.total).toBe(2);
        expect(parsed.summary.failed).toBe(2);
        expect(parsed.failures).toHaveLength(2);

        // Verify failure details are captured
        const failure = parsed.failures[0];
        expect(failure.testName).toBeDefined();
        expect(failure.fullName).toBeDefined();
        expect(failure.message).toBeDefined();
    }, 30000);

    test("run_jest_test_by_name filters by test name pattern", async () => {
        const result = await client.callTool({
            name: "run_jest_test_by_name",
            arguments: {
                projectPath: join(fixturesPath, "all-passing"),
                testNamePattern: "addition works",
            },
        });

        expect(result.isError).toBeFalsy();

        const content = result.content as Array<{ type: string; text: string }>;
        const textContent = content.find((c) => c.type === "text");
        const parsed = JSON.parse(textContent!.text);

        expect(parsed.success).toBe(true);
        expect(parsed.summary.passed).toBe(1);
        expect(parsed.summary.skipped).toBe(1);
    }, 30000);

    test("debug_jest_test returns raw output", async () => {
        const result = await client.callTool({
            name: "debug_jest_test",
            arguments: {
                projectPath: join(fixturesPath, "all-passing"),
            },
        });

        expect(result.isError).toBeFalsy();

        const content = result.content as Array<{ type: string; text: string }>;
        const textContent = content.find((c) => c.type === "text");
        expect(textContent!.text).toContain("Exit code:");
        expect(textContent!.text).toMatch(/PASS|pass/i);
    }, 30000);

    test("detect_jest_config returns config info", async () => {
        const result = await client.callTool({
            name: "detect_jest_config",
            arguments: {
                projectPath: join(fixturesPath, "all-passing"),
            },
        });

        expect(result.isError).toBeFalsy();

        const content = result.content as Array<{ type: string; text: string }>;
        const textContent = content.find((c) => c.type === "text");
        const parsed = JSON.parse(textContent!.text);

        expect(parsed.projectPath).toBe(join(fixturesPath, "all-passing"));
        expect(parsed.packageManager).toBe("npm");
        expect(parsed.configFile).toContain("jest.config.js");
    });
});
