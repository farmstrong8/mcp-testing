# mcp-jest

MCP server for running Jest tests from AI assistants.

## Installation

Add to your MCP client configuration:

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

## Tools

| Tool | Description |
|------|-------------|
| `run_jest_tests` | Run tests and return structured results |
| `run_jest_test_by_name` | Run tests matching a name pattern |
| `debug_jest_test` | Run with verbose output for debugging |
| `detect_jest_config` | Show Jest configuration and monorepo info |

