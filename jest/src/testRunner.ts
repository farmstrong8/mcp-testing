import { spawn } from "node:child_process";
import { detectJestConfig, type JestConfigInfo } from "./jestConfig.js";
import { getExecCommand } from "./packageManager.js";
import {
    parseJestOutput,
    extractJsonFromOutput,
    type TestResults,
} from "./resultParser.js";

export interface RunOptions {
    /** Directory containing the project */
    projectPath: string;
    /** Test file or pattern to run (optional) */
    testPattern?: string;
    /** Test name pattern for -t flag (optional) */
    testNamePattern?: string;
    /** Run in verbose mode */
    verbose?: boolean;
    /** Additional Jest arguments */
    extraArgs?: string[];
}

export interface RunResult {
    /** Structured test results (null if JSON parsing failed) */
    results: TestResults | null;
    /** Raw stdout output */
    stdout: string;
    /** Raw stderr output */
    stderr: string;
    /** Exit code */
    exitCode: number;
}

/**
 * Builds the Jest command arguments for structured output.
 */
function buildJestArgs(
    options: RunOptions,
    configInfo: JestConfigInfo
): string[] {
    const args: string[] = ["--json"];

    if (configInfo.configFile) {
        args.push("--config", configInfo.configFile);
    }

    if (options.testPattern) {
        args.push(options.testPattern);
    }

    if (options.testNamePattern) {
        args.push("-t", options.testNamePattern);
    }

    if (options.verbose) {
        args.push("--verbose");
    }

    if (options.extraArgs) {
        args.push(...options.extraArgs);
    }

    return args;
}

/**
 * Spawns a process and collects output.
 * Does NOT use shell mode - arguments are passed directly to the process,
 * which correctly handles spaces in arguments without escaping.
 */
function spawnProcess(
    cmd: string,
    args: string[],
    cwd: string,
    env?: NodeJS.ProcessEnv
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
    return new Promise((resolve) => {
        const child = spawn(cmd, args, {
            cwd,
            env: env ?? process.env,
        });

        let stdout = "";
        let stderr = "";

        child.stdout.on("data", (data) => {
            stdout += data.toString();
        });

        child.stderr.on("data", (data) => {
            stderr += data.toString();
        });

        child.on("close", (code) => {
            resolve({ stdout, stderr, exitCode: code ?? 1 });
        });

        child.on("error", (err) => {
            resolve({
                stdout,
                stderr: stderr + "\n" + err.message,
                exitCode: 1,
            });
        });
    });
}

/**
 * Runs Jest tests and returns structured results.
 */
export async function runJestTests(options: RunOptions): Promise<RunResult> {
    const configInfo = detectJestConfig(options.projectPath);
    const execCommand = getExecCommand(configInfo.packageManager);
    const jestArgs = buildJestArgs(options, configInfo);

    // Split exec command (e.g., "pnpm exec" -> ["pnpm", "exec"])
    // Then append "jest" and the jest-specific args
    const [cmd, ...cmdArgs] = execCommand.split(" ");
    const fullArgs = [...cmdArgs, "jest", ...jestArgs];
    const fullCommand = `${execCommand} jest ${jestArgs.join(" ")}`;

    const { stdout, stderr, exitCode } = await spawnProcess(
        cmd,
        fullArgs,
        options.projectPath,
        {
            ...process.env,
            // Force color output off for cleaner parsing
            FORCE_COLOR: "0",
            NO_COLOR: "1",
        }
    );

    // Try to parse JSON from stdout or stderr (Jest outputs to different streams)
    let results: TestResults | null = null;
    const jsonStr =
        extractJsonFromOutput(stdout) ?? extractJsonFromOutput(stderr);
    if (jsonStr) {
        try {
            results = parseJestOutput(jsonStr, fullCommand);
        } catch {
            // JSON parsing failed, results stays null
        }
    }

    return { results, stdout, stderr, exitCode };
}

/**
 * Runs Jest tests in debug/verbose mode without JSON parsing.
 * Returns raw output for human debugging.
 */
export async function runJestDebug(options: RunOptions): Promise<RunResult> {
    const configInfo = detectJestConfig(options.projectPath);
    const execCommand = getExecCommand(configInfo.packageManager);

    const args: string[] = ["--verbose", "--no-coverage"];

    if (configInfo.configFile) {
        args.push("--config", configInfo.configFile);
    }

    if (options.testPattern) {
        args.push(options.testPattern);
    }

    if (options.testNamePattern) {
        args.push("-t", options.testNamePattern);
    }

    if (options.extraArgs) {
        args.push(...options.extraArgs);
    }

    const [cmd, ...cmdArgs] = execCommand.split(" ");
    const fullArgs = [...cmdArgs, "jest", ...args];

    const { stdout, stderr, exitCode } = await spawnProcess(
        cmd,
        fullArgs,
        options.projectPath
    );

    return { results: null, stdout, stderr, exitCode };
}
