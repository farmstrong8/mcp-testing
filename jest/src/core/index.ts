// Barrel file for core library exports

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
export type { TestResults, TestPass, TestFailure } from "./resultParser.js";
