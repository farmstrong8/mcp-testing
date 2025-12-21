import { describe, test, expect, vi, beforeEach } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import {
    findJestConfig,
    detectWorkspaces,
    detectJestConfig,
} from "../jestConfig.js";

vi.mock("node:fs", () => ({
    existsSync: vi.fn(),
    readFileSync: vi.fn(),
}));

// Also mock packageManager since jestConfig imports it
vi.mock("../packageManager.js", () => ({
    detectPackageManager: vi.fn(() => "npm"),
}));

const mockExistsSync = vi.mocked(existsSync);
const mockReadFileSync = vi.mocked(readFileSync);

describe("findJestConfig", () => {
    beforeEach(() => {
        mockExistsSync.mockReset();
        mockReadFileSync.mockReset();
    });

    test("finds jest.config.js", () => {
        mockExistsSync.mockImplementation((path) =>
            String(path).endsWith("jest.config.js")
        );
        expect(findJestConfig("/project")).toBe("/project/jest.config.js");
    });

    test("finds jest.config.ts", () => {
        mockExistsSync.mockImplementation((path) =>
            String(path).endsWith("jest.config.ts")
        );
        expect(findJestConfig("/project")).toBe("/project/jest.config.ts");
    });

    test("finds jest.config.mjs", () => {
        mockExistsSync.mockImplementation((path) =>
            String(path).endsWith("jest.config.mjs")
        );
        expect(findJestConfig("/project")).toBe("/project/jest.config.mjs");
    });

    test("finds jest config in package.json", () => {
        mockExistsSync.mockImplementation((path) =>
            String(path).endsWith("package.json")
        );
        mockReadFileSync.mockReturnValue(JSON.stringify({ jest: {} }));
        expect(findJestConfig("/project")).toBe("/project/package.json");
    });

    test("returns null when no config found", () => {
        mockExistsSync.mockReturnValue(false);
        expect(findJestConfig("/project")).toBeNull();
    });

    test("prioritizes jest.config.js over package.json", () => {
        mockExistsSync.mockImplementation((path) => {
            const p = String(path);
            return p.endsWith("jest.config.js") || p.endsWith("package.json");
        });
        expect(findJestConfig("/project")).toBe("/project/jest.config.js");
    });
});

describe("detectWorkspaces", () => {
    beforeEach(() => {
        mockExistsSync.mockReset();
        mockReadFileSync.mockReset();
    });

    test("detects npm workspaces from package.json array", () => {
        mockExistsSync.mockImplementation((path) =>
            String(path).endsWith("package.json")
        );
        mockReadFileSync.mockReturnValue(
            JSON.stringify({ workspaces: ["packages/*"] })
        );
        expect(detectWorkspaces("/project")).toEqual(["packages/*"]);
    });

    test("detects npm workspaces from package.json object", () => {
        mockExistsSync.mockImplementation((path) =>
            String(path).endsWith("package.json")
        );
        mockReadFileSync.mockReturnValue(
            JSON.stringify({ workspaces: { packages: ["apps/*", "libs/*"] } })
        );
        expect(detectWorkspaces("/project")).toEqual(["apps/*", "libs/*"]);
    });

    test("detects pnpm workspaces from pnpm-workspace.yaml", () => {
        mockExistsSync.mockImplementation((path) =>
            String(path).endsWith("pnpm-workspace.yaml")
        );
        mockReadFileSync.mockReturnValue("packages:\n    - packages/*\n");
        expect(detectWorkspaces("/project")).toEqual(["packages/*"]);
    });

    test("returns empty array when no workspaces found", () => {
        mockExistsSync.mockReturnValue(false);
        expect(detectWorkspaces("/project")).toEqual([]);
    });
});

describe("detectJestConfig", () => {
    beforeEach(() => {
        mockExistsSync.mockReset();
        mockReadFileSync.mockReset();
    });

    test("returns complete config info", () => {
        mockExistsSync.mockImplementation((path) => {
            const p = String(path);
            return p.endsWith("jest.config.js") || p.endsWith("package.json");
        });
        mockReadFileSync.mockReturnValue(
            JSON.stringify({ workspaces: ["packages/*"] })
        );

        const info = detectJestConfig("/project");

        expect(info.projectPath).toBe("/project");
        expect(info.packageManager).toBe("npm");
        expect(info.configFile).toBe("/project/jest.config.js");
        expect(info.isMonorepo).toBe(true);
        expect(info.workspaces).toEqual(["packages/*"]);
    });

    test("identifies non-monorepo projects", () => {
        mockExistsSync.mockImplementation((path) =>
            String(path).endsWith("jest.config.js")
        );

        const info = detectJestConfig("/project");

        expect(info.isMonorepo).toBe(false);
        expect(info.workspaces).toEqual([]);
    });
});
