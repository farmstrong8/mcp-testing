// Barrel file - re-exports public API

export { createServer } from "./server.js";
export { runJestTests, runJestDebug } from "./testRunner.js";
export type { RunOptions, RunResult } from "./testRunner.js";
export {
    detectJestConfig,
    findJestConfig,
    detectWorkspaces,
} from "./jestConfig.js";
export type { JestConfigInfo } from "./jestConfig.js";
export {
    detectPackageManager,
    getRunCommand,
    getExecCommand,
} from "./packageManager.js";
export type { PackageManager } from "./packageManager.js";
export { parseJestOutput, extractJsonFromOutput } from "./resultParser.js";
export type { TestResults, TestFailure } from "./resultParser.js";

// Zod schemas for validation
export {
    TestResultsSchema,
    TestFailureSchema,
    JestConfigInfoSchema,
} from "./schemas/index.js";
