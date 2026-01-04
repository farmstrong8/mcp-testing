# mcp-jest

MCP server for running Jest tests from AI assistants.

## Installation

Add to your Claude Desktop configuration (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
    "mcpServers": {
        "jest": {
            "command": "npx",
            "args": ["-y", "mcp-jest"]
        }
    }
}
```

Or install globally:

```bash
npm install -g mcp-jest
```

## Tools

### `run_jest_tests`

Run Jest tests and return structured results with pass/fail counts and failure details.

**Input:**
- `projectPath` (required) - Path to the project directory
- `testPattern` (optional) - File pattern to filter tests

**Example prompt:** "Run the tests in /path/to/project"

### `run_jest_test_by_name`

Run tests matching a specific test name pattern (uses Jest's `-t` flag).

**Input:**
- `projectPath` (required) - Path to the project directory
- `testNamePattern` (required) - Test name pattern (regex supported)
- `testPattern` (optional) - File pattern to filter tests

**Example prompt:** "Run only the 'should validate user input' test"

### `debug_jest_test`

Run tests in verbose mode and return raw output for debugging.

**Input:**
- `projectPath` (required) - Path to the project directory
- `testPattern` (optional) - File pattern to filter tests
- `testNamePattern` (optional) - Test name pattern

**Example prompt:** "Debug the failing authentication tests"

### `detect_jest_config`

Detect Jest configuration, package manager, and monorepo structure.

**Input:**
- `projectPath` (required) - Path to the project directory

**Example prompt:** "What's the Jest setup in /path/to/project?"

## Output Schema

### TestResults

```typescript
interface TestResults {
    command: string;      // The Jest command executed
    success: boolean;     // Whether all tests passed
    summary: {
        total: number;    // Total test count
        passed: number;   // Passing tests
        failed: number;   // Failing tests
        skipped: number;  // Skipped tests
        duration: number; // Duration in ms
    };
    failures: TestFailure[];
}
```

### TestFailure

```typescript
interface TestFailure {
    testName: string;      // Test name
    fullName: string;      // Full name with describe blocks
    file: string;          // File path
    line: number | null;   // Line number
    matcherName: string | null;  // e.g., "toBe", "toEqual"
    expected: string | null;     // Expected value
    received: string | null;     // Actual value
    message: string;             // Error message
}
```

## Features

- **Package manager detection** - Automatically uses npm, pnpm, yarn, or bun
- **Monorepo support** - Detects npm/pnpm workspaces
- **Jest config detection** - Finds jest.config.js/ts/mjs/cjs/json
- **Structured output** - Results parsed into AI-friendly format

## Supported Jest Versions

Tested with Jest 27, 28, 29. The `--json` output format has been stable across these versions.

## Development

```bash
# Build
npm run build

# Run tests
npm test
```

## License

MIT
