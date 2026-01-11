import { tool } from "ai";
import { z } from "zod/v3";
import { readFile, readdir, stat } from "fs/promises";
import { resolve, relative, join } from "path";

export const readFileTool = tool({
  description: "Read the contents of a file",
  inputSchema: z.object({
    filePath: z.string().describe("Path to the file to read"),
  }),
  execute: async ({ filePath }) => {
    try {
      const resolvedPath = resolve(filePath);
      const content = await readFile(resolvedPath, "utf-8");
      const stats = await stat(resolvedPath);

      return {
        success: true,
        content,
        path: relative(process.cwd(), resolvedPath),
        size: stats.size,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});

export const listDirectoryTool = tool({
  description: "List contents of a directory",
  inputSchema: z.object({
    dirPath: z.string().describe("Directory path to list"),
  }),
  execute: async ({ dirPath }) => {
    try {
      const resolvedPath = resolve(dirPath);
      const entries = await readdir(resolvedPath, { withFileTypes: true });

      const contents = await Promise.all(
        entries.map(async (entry) => {
          const fullPath = join(resolvedPath, entry.name);
          const stats = await stat(fullPath);
          return {
            name: entry.name,
            type: entry.isDirectory() ? "directory" : "file",
            path: relative(process.cwd(), fullPath),
            size: entry.isFile() ? stats.size : undefined,
          };
        })
      );

      return {
        success: true,
        contents,
        directory: relative(process.cwd(), resolvedPath),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        contents: [],
      };
    }
  },
});

export const filesystemTools = {
  readFile: readFileTool,
  listDirectory: listDirectoryTool,
};
