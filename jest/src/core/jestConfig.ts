import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { detectPackageManager, type PackageManager } from "./packageManager.js";

const CONFIG_FILES = [
    "jest.config.js",
    "jest.config.ts",
    "jest.config.mjs",
    "jest.config.cjs",
    "jest.config.json",
];

export interface JestConfigInfo {
    /** Path to the project root */
    projectPath: string;
    /** Detected package manager */
    packageManager: PackageManager;
    /** Path to Jest config file, if found */
    configFile: string | null;
    /** Whether this appears to be a monorepo */
    isMonorepo: boolean;
    /** Workspace packages, if monorepo detected */
    workspaces: string[];
}

/**
 * Finds the Jest configuration file in the project.
 */
export function findJestConfig(projectPath: string): string | null {
    for (const filename of CONFIG_FILES) {
        const configPath = join(projectPath, filename);
        if (existsSync(configPath)) {
            return configPath;
        }
    }

    // Check package.json for jest config
    const packageJsonPath = join(projectPath, "package.json");
    if (existsSync(packageJsonPath)) {
        try {
            const packageJson = JSON.parse(
                readFileSync(packageJsonPath, "utf-8")
            );
            if (packageJson.jest) {
                return packageJsonPath;
            }
        } catch {
            // Ignore parse errors
        }
    }

    return null;
}

/**
 * Detects workspaces from package.json or pnpm-workspace.yaml.
 */
export function detectWorkspaces(projectPath: string): string[] {
    // Check package.json workspaces
    const packageJsonPath = join(projectPath, "package.json");
    if (existsSync(packageJsonPath)) {
        try {
            const packageJson = JSON.parse(
                readFileSync(packageJsonPath, "utf-8")
            );
            if (Array.isArray(packageJson.workspaces)) {
                return packageJson.workspaces;
            }
            if (packageJson.workspaces?.packages) {
                return packageJson.workspaces.packages;
            }
        } catch {
            // Ignore parse errors
        }
    }

    // Check pnpm-workspace.yaml
    const pnpmWorkspacePath = join(projectPath, "pnpm-workspace.yaml");
    if (existsSync(pnpmWorkspacePath)) {
        try {
            const content = readFileSync(pnpmWorkspacePath, "utf-8");
            // Simple YAML parsing for packages array
            const match = content.match(/packages:\s*\n((?:\s+-\s*.+\n?)+)/);
            if (match) {
                return match[1]
                    .split("\n")
                    .map((line) => line.replace(/^\s*-\s*["']?|["']?\s*$/g, ""))
                    .filter(Boolean);
            }
        } catch {
            // Ignore parse errors
        }
    }

    return [];
}

/**
 * Detects Jest configuration and project structure.
 */
export function detectJestConfig(projectPath: string): JestConfigInfo {
    const packageManager = detectPackageManager(projectPath);
    const configFile = findJestConfig(projectPath);
    const workspaces = detectWorkspaces(projectPath);
    const isMonorepo = workspaces.length > 0;

    return {
        projectPath,
        packageManager,
        configFile,
        isMonorepo,
        workspaces,
    };
}
