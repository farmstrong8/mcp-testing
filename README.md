# mcp-testing

MCP (Model Context Protocol) servers for running tests from AI assistants like Claude.

## Packages

| Package | Description | Status |
|---------|-------------|--------|
| [mcp-jest](./jest/) | Jest test runner MCP server | ✅ Available |
| mcp-vitest | Vitest test runner MCP server | 🚧 Coming soon |

## Why MCP for Testing?

Traditional test output is designed for humans reading terminals. MCP test servers provide:

- **Structured results** - Detailed pass/fail information with test names, file paths, and full context
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

# Run E2E tests (MCP protocol level)
npm run test:e2e --workspace=jest

# Run agent tests (requires ANTHROPIC_API_KEY in .env)
npm run test:agent --workspace=jest
```

## Architecture

```
mcp-testing/
├── jest/                         # mcp-jest package
│   └── src/
│       ├── server.ts             # MCP server with tool registrations
│       ├── core/                 # Core modules
│       │   ├── testRunner.ts     # Jest execution orchestration
│       │   ├── resultParser.ts   # JSON output parsing
│       │   ├── jestConfig.ts     # Config/monorepo detection
│       │   ├── packageManager.ts # npm/pnpm/yarn/bun detection
│       │   └── __tests__/        # Unit tests
│       ├── schemas/              # Zod schemas for tool I/O
│       └── testing/              # Test infrastructure
│           ├── fixtures/         # Test project fixtures
│           ├── integration/      # Integration tests
│           ├── e2e/              # E2E and agent tests
│           └── configs/          # Vitest configurations
└── vitest/                       # mcp-vitest (future)
```

## License

MIT
