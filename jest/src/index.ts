// Barrel file - re-exports public API

export { createServer } from "./server.js";

// Core library exports
export {
    runJestTests,
    runJestDebug,
    detectJestConfig,
    findJestConfig,
    detectWorkspaces,
    detectPackageManager,
    getRunCommand,
    getExecCommand,
    parseJestOutput,
    extractJsonFromOutput,
} from "./core/index.js";
export type {
    RunOptions,
    RunResult,
    JestConfigInfo,
    PackageManager,
    TestResults,
    TestPass,
    TestFailure,
} from "./core/index.js";

// Zod schemas for validation
export {
    TestResultsSchema,
    TestFailureSchema,
    TestPassSchema,
    JestConfigInfoSchema,
} from "./schemas/index.js";
