import { tool, type Tool } from "ai";
import { z } from "zod/v3";
import { LocalStorage } from "../storage";

export class ResearchTools {
  private storage = new LocalStorage();
  //   /**
  //    * Creates a tool for getting cached Context7 content
  //    */
  // createCacheTool(): Tool {
  //   const cacheTool: Tool<string, string> = tool({
  //     description:
  //       "Get cached Context7 content using the cache file path from .task-o-matic/docs/_cache/",
  //     parameters: z.object({
  //       cacheKey: z
  //         .string()
  //         .describe(
  //           "The cache file path, e.g., 'react-hooks' or 'docs/_cache/react-hooks.json'"
  //         ),
  //     }),
  //     execute: async () => {
  //       try {
  //         const normalizedKey = cacheKey
  //           .replace(/^docs\/_cache\//, "")
  //           .replace(/\.json$/, "");
  //         const content =
  //           await this.storage.getCachedDocumentation(normalizedKey);

  //         if (!content) {
  //           return `Cache content not found for key: ${normalizedKey}`;
  //         }

  //         return content;
  //       } catch (error) {
  //         return `Error retrieving cache content: ${error instanceof Error ? error.message : String(error)}`;
  //       }
  //     },
  //   });
  //   return cacheTool;
  // }
  //   /**
  //    * Creates a tool for getting documentation file content
  //    */
  //   createDocumentationTool() {
  //     return tool({
  //       description: "Get documentation file content from .task-o-matic/docs/ directory",
  //       inputSchema: z.object({
  //         docKey: z
  //           .string()
  //           .describe("The documentation file path, e.g., 'react/components.md' or just 'components'"),
  //       }),
  //       execute: async ({ docKey }) => {
  //         try {
  //           // Handle both full path and just the filename
  //           const normalizedKey = docKey.replace(/^docs\//, "");
  //           const content = await this.storage.getDocumentationFile(normalizedKey);
  //           if (!content) {
  //             return {
  //               success: false,
  //               error: `Documentation file not found for key: ${normalizedKey}`,
  //             };
  //           }
  //           return {
  //             success: true,
  //             content,
  //             key: normalizedKey,
  //           };
  //         } catch (error) {
  //           return {
  //             success: false,
  //             error: error instanceof Error ? error.message : String(error),
  //           };
  //         }
  //       },
  //     });
  //   }
  //   /**
  //    * Creates a tool for listing available cache files
  //    */
  //   createListCacheTool() {
  //     return tool({
  //       description: "List all available cached Context7 files in .task-o-matic/docs/_cache/",
  //       inputSchema: z.object({
  //         filter: z
  //           .string()
  //           .optional()
  //           .describe("Optional filter to search for specific cache files (e.g., 'react', 'nextjs')"),
  //       }),
  //       execute: async ({ filter }) => {
  //         try {
  //           const availableKeys = await this.getAvailableCacheKeys();
  //           let filteredKeys = availableKeys;
  //           if (filter) {
  //             filteredKeys = availableKeys.filter(key =>
  //               key.toLowerCase().includes(filter.toLowerCase())
  //             );
  //           }
  //           return {
  //             success: true,
  //             cacheFiles: filteredKeys,
  //             total: filteredKeys.length,
  //             filter: filter || null,
  //           };
  //         } catch (error) {
  //           return {
  //             success: false,
  //             error: error instanceof Error ? error.message : String(error),
  //           };
  //         }
  //       },
  //     });
  //   }
  //   /**
  //    * Creates a tool for listing available documentation files
  //    */
  //   createListDocumentationTool() {
  //     return tool({
  //       description: "List all available documentation files in .task-o-matic/docs/ directory",
  //       inputSchema: z.object({
  //         filter: z
  //           .string()
  //           .optional()
  //           .describe("Optional filter to search for specific documentation files (e.g., 'react', 'api')"),
  //       }),
  //       execute: async ({ filter }) => {
  //         try {
  //           const availableFiles = await this.getAvailableDocumentationFiles();
  //           let filteredFiles = availableFiles;
  //           if (filter) {
  //             filteredFiles = availableFiles.filter(file =>
  //               file.toLowerCase().includes(filter.toLowerCase())
  //             );
  //           }
  //           return {
  //             success: true,
  //             documentationFiles: filteredFiles,
  //             total: filteredFiles.length,
  //             filter: filter || null,
  //           };
  //         } catch (error) {
  //           return {
  //             success: false,
  //             error: error instanceof Error ? error.message : String(error),
  //           };
  //         }
  //       },
  //     });
  //   }
  //   /**
  //    * Get all available cache keys
  //    */
  //   private async getAvailableCacheKeys(): Promise<string[]> {
  //     try {
  //       return await this.storage.listCachedDocumentationFiles();
  //     } catch (error) {
  //       console.error("Error getting available cache keys:", error);
  //       return [];
  //     }
  //   }
  //   /**
  //    * Get all available documentation files
  //    */
  //   private async getAvailableDocumentationFiles(): Promise<string[]> {
  //     try {
  //       return await this.storage.listDocumentationFiles();
  //     } catch (error) {
  //       console.error("Error getting available documentation files:", error);
  //       return [];
  //     }
  //   }
  //   /**
  //    * Get all research tools as a ToolSet
  //    */
  //   getResearchTools(): ToolSet {
  //     return {
  //       get_cache_context7: this.createCacheTool(),
  //       get_documentation: this.createDocumentationTool(),
  //       list_cache_files: this.createListCacheTool(),
  //       list_documentation_files: this.createListDocumentationTool(),
  //     };
  //   }
  //   /**
  //    * Get tool descriptions for system prompt
  //    */
  //   getToolDescriptions(): string {
  //     return `
  // ## Available Research Tools:
  // 1. **get_cache_context7**: Get cached Context7 content using cache file path
  //    - Input: cacheKey (string) - e.g., 'react-hooks' or 'docs/_cache/react-hooks.json'
  //    - Returns: Cached Context7 documentation content
  // 2. **get_documentation**: Get documentation file content from docs directory
  //    - Input: docKey (string) - e.g., 'components' or 'docs/components.md'
  //    - Returns: Processed documentation file content
  // 3. **list_cache_files**: List all available cached Context7 files
  //    - Input: filter (optional string) - Filter results by keyword
  //    - Returns: List of available cache files
  // 4. **list_documentation_files**: List all available documentation files
  //    - Input: filter (optional string) - Filter results by keyword
  //    - Returns: List of available documentation files
  // ## Usage Strategy:
  // 1. Use list_* tools first to discover available content
  // 2. Use get_* tools to retrieve specific content
  // 3. Combine with Context7 MCP tools for comprehensive research
  // `;
  //   }
}
