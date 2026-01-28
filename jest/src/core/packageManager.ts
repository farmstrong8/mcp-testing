import { existsSync } from "node:fs";
import { join } from "node:path";

export type PackageManager = "npm" | "pnpm" | "yarn" | "bun";

interface LockfileInfo {
    filename: string;
    manager: PackageManager;
}

const LOCKFILES: LockfileInfo[] = [
    { filename: "pnpm-lock.yaml", manager: "pnpm" },
    { filename: "yarn.lock", manager: "yarn" },
    { filename: "bun.lockb", manager: "bun" },
    { filename: "package-lock.json", manager: "npm" },
];

/**
 * Detects the package manager used in a project by checking for lockfiles.
 * Returns "npm" as the default if no lockfile is found.
 */
export function detectPackageManager(projectPath: string): PackageManager {
    for (const { filename, manager } of LOCKFILES) {
        if (existsSync(join(projectPath, filename))) {
            return manager;
        }
    }
    return "npm";
}

/**
 * Returns the command to run a script with the detected package manager.
 */
export function getRunCommand(manager: PackageManager): string {
    switch (manager) {
        case "npm":
            return "npm run";
        case "pnpm":
            return "pnpm run";
        case "yarn":
            return "yarn";
        case "bun":
            return "bun run";
    }
}

/**
 * Returns the command to execute a package binary (like jest).
 */
export function getExecCommand(manager: PackageManager): string {
    switch (manager) {
        case "npm":
            return "npx";
        case "pnpm":
            return "pnpm exec";
        case "yarn":
            return "yarn";
        case "bun":
            return "bunx";
    }
}
