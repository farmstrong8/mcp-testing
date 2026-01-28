# mcp-testing

MCP (Model Context Protocol) servers for running tests from AI assistants like Claude.

## Packages

| Package | Description | Status |
|---------|-------------|--------|
| [mcp-jest](./jest/) | Jest test runner MCP server | ✅ Available |
| mcp-vitest | Vitest test runner MCP server | 🚧 Coming soon |

## Why MCP for Testing?

Traditional test output is designed for humans reading terminals. MCP test servers provide:

- **Structured results** - Pass/fail counts, failure details in a consistent format
- **AI-optimized output** - Information organized for LLM comprehension
- **Context for debugging** - Expected vs received values, file locations, error messages

## Development

```bash
# Install dependencies
npm install

# Build all packages
npm run build

# Run unit tests
npm test

# Run integration tests
npm run test:integration
```

## Architecture

```
mcp-testing/
├── jest/                    # mcp-jest package
│   └── src/
│       ├── server.ts        # MCP server with tool registrations
│       ├── testRunner.ts    # Jest execution orchestration
│       ├── resultParser.ts  # JSON output parsing
│       ├── jestConfig.ts    # Config/monorepo detection
│       └── packageManager.ts # npm/pnpm/yarn/bun detection
├── examples/                # Test fixtures
│   ├── simple-npm/
│   ├── npm-workspaces/
│   └── pnpm-workspaces/
└── vitest/                  # mcp-vitest (future)
```

## License

MIT
