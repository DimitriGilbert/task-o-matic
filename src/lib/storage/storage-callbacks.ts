import { readFile, writeFile, unlink, readdir, stat } from "fs/promises";
import { join, dirname } from "path";
import { existsSync, mkdirSync } from "fs";

/**
 * Simple storage callbacks - just read/write key-value pairs
 * This allows the library to be used with ANY storage backend (DB, Redis, S3, etc.)
 */
export interface StorageCallbacks {
  // Read a value by key (path), return null if not found
  read: (key: string) => Promise<string | null>;

  // Write a value by key (path)
  write: (key: string, value: string) => Promise<void>;

  // Delete a value by key (path)
  delete: (key: string) => Promise<void>;

  // List keys with optional prefix filter
  list: (prefix?: string) => Promise<string[]>;

  // Check if key exists
  exists: (key: string) => Promise<boolean>;
}

/**
 * Default file system callbacks (Node.js environment)
 * Uses fs/promises to implement the storage interface
 */
export function createFileSystemCallbacks(
  baseDir: string = process.cwd()
): StorageCallbacks {
  const resolvePath = (key: string) => join(baseDir, key);

  const ensureDir = (filePath: string) => {
    const dir = dirname(filePath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  };

  return {
    read: async (key: string) => {
      try {
        const path = resolvePath(key);
        if (!existsSync(path)) return null;
        return await readFile(path, "utf-8");
      } catch (error) {
        if ((error as any).code === "ENOENT") return null;
        throw error;
      }
    },

    write: async (key: string, value: string) => {
      const path = resolvePath(key);
      ensureDir(path);
      await writeFile(path, value, "utf-8");
    },

    delete: async (key: string) => {
      try {
        const path = resolvePath(key);
        if (existsSync(path)) {
          await unlink(path);
        }
      } catch (error) {
        // Ignore if already gone
        if ((error as any).code !== "ENOENT") throw error;
      }
    },

    list: async (prefix?: string) => {
      const searchPath = prefix ? resolvePath(prefix) : baseDir;

      try {
        // If it's a directory, recursively list all files in it
        if (existsSync(searchPath) && (await stat(searchPath)).isDirectory()) {
          const files: string[] = [];

          const scan = async (dir: string, currentPrefix: string) => {
            const items = await readdir(dir);
            for (const item of items) {
              const fullPath = join(dir, item);
              const itemPrefix = currentPrefix
                ? join(currentPrefix, item)
                : item;

              if ((await stat(fullPath)).isDirectory()) {
                await scan(fullPath, itemPrefix);
              } else {
                files.push(itemPrefix);
              }
            }
          };

          await scan(searchPath, prefix || "");
          return files;
        }

        // If it's a file prefix (e.g. "tasks/task-")
        const dir = dirname(searchPath);
        if (existsSync(dir)) {
          const files = await readdir(dir);
          const namePrefix = prefix ? prefix.split("/").pop() || "" : "";
          return files
            .filter((f) => f.startsWith(namePrefix))
            .map((f) => join(dirname(prefix || ""), f));
        }

        return [];
      } catch (error) {
        return [];
      }
    },

    exists: async (key: string) => {
      return existsSync(resolvePath(key));
    },
  };
}
