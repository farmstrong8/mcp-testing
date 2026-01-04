import { z } from "zod";

/**
 * Schema for Jest configuration detection results.
 */
export const JestConfigInfoSchema = z.object({
    projectPath: z.string().describe("Path to the project root"),
    packageManager: z
        .enum(["npm", "pnpm", "yarn", "bun"])
        .describe("Detected package manager"),
    configFile: z
        .string()
        .nullable()
        .describe("Path to Jest config file, if found"),
    isMonorepo: z
        .boolean()
        .describe("Whether this appears to be a monorepo"),
    workspaces: z
        .array(z.string())
        .describe("Workspace packages, if monorepo detected"),
});

export type JestConfigInfo = z.infer<typeof JestConfigInfoSchema>;

