import { tool } from "ai";
import { z } from "zod/v3";
import { resolve, relative, join } from "path";
import { readFile, readdir, stat } from "fs/promises";

// Define the interface for filesystem operations required by tools
export interface FileSystem {
  readFile(path: string, encoding: string): Promise<string>;
  readdir(path: string, options?: { withFileTypes?: boolean }): Promise<any[]>;
  stat(
    path: string
  ): Promise<{ size: number; isDirectory(): boolean; isFile(): boolean }>;
}

// Default Node.js implementation
export const nodeFileSystem: FileSystem = {
  readFile: (path, encoding) => readFile(path, encoding as BufferEncoding),
  readdir: async (path, options) => {
    // Cast to any to handle overload matching or explicit return type
    return readdir(path, options as any) as Promise<any[]>;
  },
  stat: (path) => stat(path),
};

export const createFilesystemTools = (fs: FileSystem = nodeFileSystem) => {
  const readFileTool = tool({
    description: "Read the contents of a file",
    inputSchema: z.object({
      filePath: z.string().describe("Path to the file to read"),
    }),
    execute: async ({ filePath }) => {
      try {
        // Resolve path relative to current working directory (process.cwd() might need abstraction too later, but for now we assume fs handles absolute paths or we pass resolved paths)
        // Note: For browser, 'resolve' from 'path' works if polyfilled, but process.cwd() might be static '/'
        // We will assume the fs implementation handles the paths provided.
        // However, the original code used resolve(filePath).
        // We should double check if the browser environment has properly polyfilled 'path'.
        // Usually web apps use 'path-browserify'.

        let resolvedPath = filePath;
        // Basic check if it looks relative
        if (!filePath.startsWith("/")) {
          try {
            resolvedPath = resolve(filePath);
          } catch (e) {
            // In some browser envs resolve might fail or not exist if process is missing methods
            // Fallback to simple join if needed, but usually path-browserify handles it.
            // For now, let's trust resolve or just use the path if errors.
          }
        }

        const content = await fs.readFile(resolvedPath, "utf-8");
        const stats = await fs.stat(resolvedPath);

        return {
          success: true,
          content,
          path: resolvedPath, // Return resolved path simplifies things
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

  const listDirectoryTool = tool({
    description: "List contents of a directory",
    inputSchema: z.object({
      dirPath: z.string().describe("Directory path to list"),
    }),
    execute: async ({ dirPath }) => {
      try {
        let resolvedPath = dirPath;
        if (!dirPath.startsWith("/")) {
          try {
            resolvedPath = resolve(dirPath);
          } catch (e) {}
        }

        const entries = await fs.readdir(resolvedPath, { withFileTypes: true });

        const contents = await Promise.all(
          entries.map(async (entry: any) => {
            const entryName = entry.name;
            const fullPath = join(resolvedPath, entryName);
            // Check if fs.stat is needed or if entry has type info
            const isDir = entry.isDirectory();
            const isFile = entry.isFile();

            let size = undefined;
            if (isFile) {
              try {
                const stats = await fs.stat(fullPath);
                size = stats.size;
              } catch (e) {}
            }

            return {
              name: entryName,
              type: isDir ? "directory" : "file",
              path: fullPath,
              size: size,
            };
          })
        );

        return {
          success: true,
          contents,
          directory: resolvedPath,
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

  return {
    readFile: readFileTool,
    listDirectory: listDirectoryTool,
  };
};

// Backward compatibility (using Node.js fs)
export const filesystemTools = createFilesystemTools(nodeFileSystem);
