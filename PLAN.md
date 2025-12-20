# MCP Testing

## Project Structure

```
mcp-testing/
├── package.json              # "name": "mcp-testing", private, workspaces
├── tsconfig.base.json
├── .gitignore
├── README.md
├── jest/
│   ├── package.json          # "name": "mcp-jest"
│   ├── tsconfig.json
│   ├── vitest.config.ts
│   ├── README.md
│   └── src/
│       ├── index.ts
│       ├── packageManager.ts
│       ├── jestConfig.ts
│       ├── resultParser.ts
│       ├── testRunner.ts
│       └── __tests__/
├── vitest/                   # fast follow
│   ├── package.json          # "name": "mcp-vitest"
│   └── src/
├── examples/
│   ├── README.md
│   ├── simple-npm/
│   │   ├── README.md
│   │   ├── integration.test.ts
│   │   └── ...
│   ├── npm-workspaces/
│   └── pnpm-workspaces/
└── .github/workflows/
```

## User Installation

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

---

## Commits

| #   | Commit                                               | Description                                                |
| --- | ---------------------------------------------------- | ---------------------------------------------------------- |
| 1   | `chore: initialize mcp-testing monorepo`             | Root package.json, tsconfig.base.json, .gitignore          |
| 2   | `feat(jest): scaffold mcp-jest package`              | jest/package.json, tsconfig, vitest.config, README         |
| 3   | `test: add example projects`                         | examples/ with simple-npm, npm-workspaces, pnpm-workspaces |
| 4   | `feat(jest): add package manager detection`          | packageManager.ts + unit tests                             |
| 5   | `feat(jest): add config and monorepo detection`      | jestConfig.ts + unit tests                                 |
| 6   | `feat(jest): add result parser`                      | resultParser.ts + unit tests                               |
| 7   | `feat(jest): add test runner with integration tests` | testRunner.ts + integration tests per example              |
| 8   | `feat(jest): implement MCP server`                   | index.ts with 4 tools                                      |
| 9   | `ci: add workflows`                                  | GitHub Actions for test + publish                          |
| 10  | `docs: add documentation`                            | Root README, jest/README                                   |

---

## Commit 1: Monorepo Foundation

**Files:**

`package.json`:

```json
{
    "name": "mcp-testing",
    "private": true,
    "workspaces": ["jest", "vitest"],
    "scripts": {
        "build": "npm run build --workspaces --if-present",
        "test": "npm run test --workspaces --if-present"
    }
}
```

`tsconfig.base.json`:

```json
{
    "compilerOptions": {
        "target": "ES2022",
        "module": "NodeNext",
        "moduleResolution": "NodeNext",
        "strict": true,
        "declaration": true,
        "declarationMap": true,
        "sourceMap": true,
        "esModuleInterop": true,
        "skipLibCheck": true
    }
}
```

`.gitignore`, root `README.md`

**Commit:** `chore: initialize mcp-testing monorepo`

---

## Commit 2: Jest Package Scaffold

**Files:**

`jest/package.json`:

```json
{
    "name": "mcp-jest",
    "version": "0.1.0",
    "type": "module",
    "bin": { "mcp-jest": "./dist/index.js" },
    "main": "./dist/index.js",
    "files": ["dist"],
    "scripts": {
        "build": "tsc",
        "test": "vitest run"
    }
}
```

`jest/tsconfig.json`:

```json
{
    "extends": "../tsconfig.base.json",
    "compilerOptions": {
        "outDir": "./dist",
        "rootDir": "./src"
    },
    "include": ["src"]
}
```

`jest/vitest.config.ts`, `jest/README.md`

**Commit:** `feat(jest): scaffold mcp-jest package`

---

## Commit 3: Example Projects

**Files:**

-   `examples/README.md`
-   `examples/simple-npm/` - basic npm project, intentionally failing test
-   `examples/npm-workspaces/` - npm monorepo
-   `examples/pnpm-workspaces/` - pnpm monorepo

Each with README explaining its purpose.

**Commit:** `test: add example projects`

---

## Commit 4: Package Manager Detection

**Files:**

-   `jest/src/packageManager.ts`
-   `jest/src/__tests__/packageManager.test.ts`

**Commit:** `feat(jest): add package manager detection`

---

## Commit 5: Jest Config Detection

**Files:**

-   `jest/src/jestConfig.ts`
-   `jest/src/__tests__/jestConfig.test.ts`

**Commit:** `feat(jest): add config and monorepo detection`

---

## Commit 6: Result Parser

**Files:**

-   `jest/src/resultParser.ts` - Parse Jest --json output
-   `jest/src/__tests__/resultParser.test.ts`

**Commit:** `feat(jest): add result parser`

---

## Commit 7: Test Runner + Integration Tests

**Files:**

-   `jest/src/testRunner.ts`
-   `examples/simple-npm/integration.test.ts`
-   `examples/npm-workspaces/integration.test.ts`
-   `examples/pnpm-workspaces/integration.test.ts`
-   Root `vitest.config.ts` for running integration tests

**Commit:** `feat(jest): add test runner with integration tests`

---

## Commit 8: MCP Server

**Files:**

-   `jest/src/index.ts` with shebang `#!/usr/bin/env node`

**Tools:**
| Tool | Purpose |
|------|---------|
| `run_jest_tests` | Run tests, return structured results |
| `run_jest_test_by_name` | Run by name pattern |
| `debug_jest_test` | Raw verbose output |
| `detect_jest_config` | Show config/monorepo info |

**Commit:** `feat(jest): implement MCP server`

---

## Commit 9: CI/CD

**Files:**

-   `.github/workflows/test.yml` - test on push/PR
-   `.github/workflows/publish.yml` - publish on tag

**Commit:** `ci: add workflows`

---

## Commit 10: Documentation

**Files:**

-   Root `README.md` - overview, links to packages
-   `jest/README.md` - installation, tools, output schema

**Commit:** `docs: add documentation`

---

## Structured Output Schema

```typescript
interface TestResults {
    command: string;
    success: boolean;
    summary: {
        total: number;
        passed: number;
        failed: number;
        skipped: number;
        duration: number;
    };
    failures: TestFailure[];
}

interface TestFailure {
    testName: string;
    fullName: string;
    file: string;
    line: number | null;
    matcherName: string | null;
    expected: string | null;
    received: string | null;
    message: string;
}
```

---

## Pre-requisites

1. Rename folder: `mcp-test-runners` → `mcp-testing`
2. Initialize git: `git init`
