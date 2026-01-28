import { describe, test, expect, vi, beforeEach } from "vitest";
import { existsSync } from "node:fs";
import {
    detectPackageManager,
    getRunCommand,
    getExecCommand,
} from "../packageManager.js";

vi.mock("node:fs", () => ({
    existsSync: vi.fn(),
}));

const mockExistsSync = vi.mocked(existsSync);

describe("detectPackageManager", () => {
    beforeEach(() => {
        mockExistsSync.mockReset();
    });

    test("detects pnpm from pnpm-lock.yaml", () => {
        mockExistsSync.mockImplementation((path) =>
            String(path).endsWith("pnpm-lock.yaml")
        );
        expect(detectPackageManager("/project")).toBe("pnpm");
    });

    test("detects yarn from yarn.lock", () => {
        mockExistsSync.mockImplementation((path) =>
            String(path).endsWith("yarn.lock")
        );
        expect(detectPackageManager("/project")).toBe("yarn");
    });

    test("detects bun from bun.lockb", () => {
        mockExistsSync.mockImplementation((path) =>
            String(path).endsWith("bun.lockb")
        );
        expect(detectPackageManager("/project")).toBe("bun");
    });

    test("detects npm from package-lock.json", () => {
        mockExistsSync.mockImplementation((path) =>
            String(path).endsWith("package-lock.json")
        );
        expect(detectPackageManager("/project")).toBe("npm");
    });

    test("defaults to npm when no lockfile found", () => {
        mockExistsSync.mockReturnValue(false);
        expect(detectPackageManager("/project")).toBe("npm");
    });

    test("prioritizes pnpm over npm when both exist", () => {
        mockExistsSync.mockImplementation((path) => {
            const p = String(path);
            return (
                p.endsWith("pnpm-lock.yaml") || p.endsWith("package-lock.json")
            );
        });
        expect(detectPackageManager("/project")).toBe("pnpm");
    });
});

describe("getRunCommand", () => {
    test("returns correct commands for each manager", () => {
        expect(getRunCommand("npm")).toBe("npm run");
        expect(getRunCommand("pnpm")).toBe("pnpm run");
        expect(getRunCommand("yarn")).toBe("yarn");
        expect(getRunCommand("bun")).toBe("bun run");
    });
});

describe("getExecCommand", () => {
    test("returns correct exec commands for each manager", () => {
        expect(getExecCommand("npm")).toBe("npx");
        expect(getExecCommand("pnpm")).toBe("pnpm exec");
        expect(getExecCommand("yarn")).toBe("yarn");
        expect(getExecCommand("bun")).toBe("bunx");
    });
});
