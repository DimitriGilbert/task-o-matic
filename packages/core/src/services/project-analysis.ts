/**
 * Project Analysis Service
 *
 * Core service for analyzing existing projects and detecting their stack.
 * This is the foundation for the "init attach" functionality that allows
 * Task-O-Matic to work with existing codebases.
 */

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { basename, join, relative } from "node:path";

import { logger } from "../lib/logger";
import {
  ProjectAnalysis,
  ProjectAnalysisOptions,
  ProjectAnalysisResult,
  DetectedStack,
  StackDetectionResult,
  ProjectStructure,
  DirectoryInfo,
  DetectedFeature,
  DocumentationFile,
  CodeComment,
} from "../types/project-analysis";
import {
  detectFullStack,
  parsePackageJson,
  detectPackageManager,
  LOCK_FILE_TO_MANAGER,
} from "../utils/stack-detector";

// ============================================================================
// DEFAULT OPTIONS
// ============================================================================

const DEFAULT_OPTIONS: Required<ProjectAnalysisOptions> = {
  workingDir: process.cwd(),
  skipTodos: false,
  skipFeatures: false,
  skipDocs: false,
  maxDepth: 5,
  ignorePatterns: [
    "node_modules",
    ".git",
    "dist",
    "build",
    ".next",
    ".nuxt",
    "coverage",
    ".task-o-matic",
    ".turbo",
    ".cache",
    "__pycache__",
    "venv",
    ".venv",
  ],
  verbose: false,
};

// ============================================================================
// FILE PATTERNS
// ============================================================================

const SOURCE_DIR_PATTERNS = ["src", "app", "pages", "lib", "components", "api"];
const DOC_PATTERNS = ["README.md", "CONTRIBUTING.md", "CHANGELOG.md", "docs"];
const CONFIG_FILES = [
  "package.json",
  "tsconfig.json",
  "next.config.js",
  "next.config.mjs",
  "next.config.ts",
  "vite.config.ts",
  "vite.config.js",
  "nuxt.config.js",
  "nuxt.config.ts",
  "svelte.config.js",
  "astro.config.mjs",
  ".eslintrc",
  ".eslintrc.js",
  ".eslintrc.json",
  ".prettierrc",
  "prettier.config.js",
  "biome.json",
  "docker-compose.yml",
  "Dockerfile",
  ".github",
  ".gitlab-ci.yml",
];

const TODO_PATTERNS = /(?:\/\/|#|\/\*)\s*(TODO|FIXME|HACK|NOTE|XXX|BUG)[\s:]+(.+?)(?:\*\/)?$/gim;

// ============================================================================
// PROJECT ANALYSIS SERVICE
// ============================================================================

/**
 * ProjectAnalysisService - Analyzes existing projects to detect stack and structure
 *
 * @example
 * ```typescript
 * import { ProjectAnalysisService } from "task-o-matic";
 *
 * const analyzer = new ProjectAnalysisService();
 *
 * // Detect just the stack
 * const { stack } = await analyzer.detectStack("/path/to/project");
 *
 * // Full project analysis
 * const { analysis } = await analyzer.analyzeProject("/path/to/project");
 * ```
 */
export class ProjectAnalysisService {
  private options: Required<ProjectAnalysisOptions>;

  constructor(options?: ProjectAnalysisOptions) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  // ==========================================================================
  // PUBLIC API
  // ==========================================================================

  /**
   * Perform full project analysis
   */
  async analyzeProject(
    workingDir?: string
  ): Promise<ProjectAnalysisResult> {
    const startTime = Date.now();
    const dir = workingDir || this.options.workingDir;
    const warnings: string[] = [];

    try {
      if (!existsSync(dir)) {
        return {
          success: false,
          analysis: this.createEmptyAnalysis(dir),
          warnings: [`Directory does not exist: ${dir}`],
        };
      }

      // Get project name from package.json or directory name
      const packageJsonPath = join(dir, "package.json");
      const packageJson = existsSync(packageJsonPath)
        ? parsePackageJson(readFileSync(packageJsonPath, "utf-8"))
        : null;

      const projectName = packageJson?.name || basename(dir);
      const version = packageJson?.version;
      const description = packageJson?.description;

      // Detect stack
      const stackResult = await this.detectStack(dir);
      if (stackResult.warnings) {
        warnings.push(...stackResult.warnings);
      }

      // Analyze structure
      const structure = await this.analyzeProjectStructure(dir);

      // Detect features (if not skipped)
      const existingFeatures = this.options.skipFeatures
        ? []
        : await this.detectFeatures(dir, stackResult.stack);

      // Find documentation (if not skipped)
      const documentation = this.options.skipDocs
        ? []
        : await this.findExistingDocumentation(dir);

      // Extract TODOs (if not skipped)
      const todos = this.options.skipTodos ? [] : await this.extractTodos(dir);

      const analysis: ProjectAnalysis = {
        projectName,
        version,
        description,
        stack: stackResult.stack,
        structure,
        existingFeatures,
        documentation,
        todos,
        analyzedAt: Date.now(),
        analysisDuration: Date.now() - startTime,
      };

      return {
        success: true,
        analysis,
        warnings: warnings.length > 0 ? warnings : undefined,
        suggestions: this.generateSuggestions(analysis),
      };
    } catch (error) {
      logger.error(`Project analysis failed: ${error}`);
      return {
        success: false,
        analysis: this.createEmptyAnalysis(dir),
        warnings: [
          `Analysis failed: ${error instanceof Error ? error.message : String(error)}`,
        ],
      };
    }
  }

  /**
   * Detect technology stack from project files
   */
  async detectStack(workingDir?: string): Promise<StackDetectionResult> {
    const startTime = Date.now();
    const dir = workingDir || this.options.workingDir;
    const warnings: string[] = [];

    try {
      if (!existsSync(dir)) {
        return {
          success: false,
          stack: this.createFallbackStack(),
          warnings: [`Directory does not exist: ${dir}`],
          duration: Date.now() - startTime,
        };
      }

      // Read package.json
      const packageJsonPath = join(dir, "package.json");
      const packageJsonContent = existsSync(packageJsonPath)
        ? readFileSync(packageJsonPath, "utf-8")
        : null;

      if (!packageJsonContent) {
        warnings.push(
          "No package.json found. Detection will be limited."
        );
      }

      // Check for tsconfig.json
      const hasTsConfig =
        existsSync(join(dir, "tsconfig.json")) ||
        existsSync(join(dir, "tsconfig.base.json"));

      // Get list of files in root directory
      const rootFiles = this.safeReadDir(dir);

      // Perform detection
      const stack = detectFullStack(packageJsonContent, rootFiles, hasTsConfig);

      return {
        success: true,
        stack,
        warnings: warnings.length > 0 ? warnings : undefined,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      logger.error(`Stack detection failed: ${error}`);
      return {
        success: false,
        stack: this.createFallbackStack(),
        warnings: [
          `Detection failed: ${error instanceof Error ? error.message : String(error)}`,
        ],
        duration: Date.now() - startTime,
      };
    }
  }

  /**
   * Find existing documentation files in the project
   */
  async findExistingDocumentation(
    workingDir?: string
  ): Promise<DocumentationFile[]> {
    const dir = workingDir || this.options.workingDir;
    const docs: DocumentationFile[] = [];

    try {
      // Check root for common doc files
      const rootFiles = this.safeReadDir(dir);

      for (const file of rootFiles) {
        const filePath = join(dir, file);
        const stat = this.safeStat(filePath);

        if (!stat) continue;

        if (file.toLowerCase() === "readme.md") {
          docs.push({
            path: file,
            title: this.extractMarkdownTitle(filePath),
            type: "readme",
            size: stat.size,
            lastModified: stat.mtimeMs,
          });
        } else if (file.toLowerCase() === "contributing.md") {
          docs.push({
            path: file,
            type: "contributing",
            size: stat.size,
            lastModified: stat.mtimeMs,
          });
        } else if (file.toLowerCase() === "changelog.md") {
          docs.push({
            path: file,
            type: "changelog",
            size: stat.size,
            lastModified: stat.mtimeMs,
          });
        }
      }

      // Check docs directory
      const docsDir = join(dir, "docs");
      if (existsSync(docsDir) && statSync(docsDir).isDirectory()) {
        const docFiles = this.findMarkdownFiles(docsDir, dir);
        docs.push(...docFiles);
      }

      return docs;
    } catch (error) {
      logger.warn(`Failed to find documentation: ${error}`);
      return docs;
    }
  }

  /**
   * Extract TODO/FIXME comments from source files
   */
  async extractTodos(workingDir?: string): Promise<CodeComment[]> {
    const dir = workingDir || this.options.workingDir;
    const todos: CodeComment[] = [];

    try {
      // Find source directories
      const sourceDirs = this.findSourceDirectories(dir);

      for (const sourceDir of sourceDirs) {
        const extracted = this.extractTodosFromDirectory(sourceDir, dir);
        todos.push(...extracted);

        // Limit to avoid memory issues
        if (todos.length >= 100) {
          break;
        }
      }

      return todos.slice(0, 100); // Cap at 100 todos
    } catch (error) {
      logger.warn(`Failed to extract TODOs: ${error}`);
      return todos;
    }
  }

  /**
   * Analyze project structure
   */
  async analyzeProjectStructure(workingDir?: string): Promise<ProjectStructure> {
    const dir = workingDir || this.options.workingDir;

    const rootFiles = this.safeReadDir(dir);

    // Check for monorepo indicators
    const isMonorepo =
      rootFiles.includes("pnpm-workspace.yaml") ||
      rootFiles.includes("lerna.json") ||
      rootFiles.includes("turbo.json") ||
      existsSync(join(dir, "packages"));

    // Get packages if monorepo
    const packages: string[] = [];
    if (isMonorepo) {
      const packagesDir = join(dir, "packages");
      if (existsSync(packagesDir)) {
        const packageDirs = this.safeReadDir(packagesDir);
        packages.push(...packageDirs.filter((p) => !p.startsWith(".")));
      }
    }

    // Analyze source directories
    const sourceDirectories: DirectoryInfo[] = [];
    for (const pattern of SOURCE_DIR_PATTERNS) {
      const srcPath = join(dir, pattern);
      if (existsSync(srcPath) && statSync(srcPath).isDirectory()) {
        const fileCount = this.countFiles(srcPath);
        sourceDirectories.push({
          path: pattern,
          fileCount,
          purpose: this.inferDirectoryPurpose(pattern),
        });
      }
    }

    // Check for common project elements
    const hasTests =
      existsSync(join(dir, "tests")) ||
      existsSync(join(dir, "test")) ||
      existsSync(join(dir, "__tests__")) ||
      existsSync(join(dir, "src", "test"));

    const hasDocs =
      existsSync(join(dir, "docs")) || existsSync(join(dir, "documentation"));

    const hasCICD =
      existsSync(join(dir, ".github", "workflows")) ||
      existsSync(join(dir, ".gitlab-ci.yml")) ||
      existsSync(join(dir, ".circleci"));

    const hasDocker =
      existsSync(join(dir, "Dockerfile")) ||
      existsSync(join(dir, "docker-compose.yml")) ||
      existsSync(join(dir, "docker-compose.yaml"));

    // Find entry points
    const entryPoints: string[] = [];
    const possibleEntries = [
      "src/index.ts",
      "src/index.js",
      "src/main.ts",
      "src/main.js",
      "index.ts",
      "index.js",
      "src/app.ts",
      "src/app.js",
      "src/server.ts",
      "src/server.js",
      "app/layout.tsx",
      "pages/_app.tsx",
      "pages/index.tsx",
    ];

    for (const entry of possibleEntries) {
      if (existsSync(join(dir, entry))) {
        entryPoints.push(entry);
      }
    }

    // Find config files
    const configFiles = rootFiles.filter((f) => CONFIG_FILES.includes(f));

    return {
      root: dir,
      isMonorepo,
      packages: packages.length > 0 ? packages : undefined,
      sourceDirectories,
      hasTests,
      hasDocs,
      hasCICD,
      hasDocker,
      entryPoints,
      configFiles,
    };
  }

  // ==========================================================================
  // PRIVATE HELPERS
  // ==========================================================================

  private createEmptyAnalysis(dir: string): ProjectAnalysis {
    return {
      projectName: basename(dir),
      stack: this.createFallbackStack(),
      structure: {
        root: dir,
        isMonorepo: false,
        sourceDirectories: [],
        hasTests: false,
        hasDocs: false,
        hasCICD: false,
        hasDocker: false,
        entryPoints: [],
        configFiles: [],
      },
      existingFeatures: [],
      documentation: [],
      todos: [],
      analyzedAt: Date.now(),
      analysisDuration: 0,
    };
  }

  private createFallbackStack(): DetectedStack {
    return {
      language: "unknown",
      frameworks: ["unknown"],
      packageManager: "npm",
      runtime: "node",
      _source: "fallback",
      confidence: 0,
      detectedAt: Date.now(),
    };
  }

  private safeReadDir(dir: string): string[] {
    try {
      if (existsSync(dir) && statSync(dir).isDirectory()) {
        return readdirSync(dir);
      }
    } catch {
      // Ignore errors
    }
    return [];
  }

  private safeStat(
    path: string
  ): { size: number; mtimeMs: number; isDirectory: boolean } | null {
    try {
      const stat = statSync(path);
      return {
        size: stat.size,
        mtimeMs: stat.mtimeMs,
        isDirectory: stat.isDirectory(),
      };
    } catch {
      return null;
    }
  }

  private extractMarkdownTitle(filePath: string): string | undefined {
    try {
      const content = readFileSync(filePath, "utf-8");
      const match = content.match(/^#\s+(.+)$/m);
      return match ? match[1].trim() : undefined;
    } catch {
      return undefined;
    }
  }

  private findMarkdownFiles(
    dir: string,
    rootDir: string,
    depth = 0
  ): DocumentationFile[] {
    if (depth > 3) return []; // Limit depth

    const docs: DocumentationFile[] = [];
    const files = this.safeReadDir(dir);

    for (const file of files) {
      const filePath = join(dir, file);
      const stat = this.safeStat(filePath);

      if (!stat) continue;

      if (stat.isDirectory && !this.options.ignorePatterns.includes(file)) {
        docs.push(...this.findMarkdownFiles(filePath, rootDir, depth + 1));
      } else if (file.endsWith(".md")) {
        docs.push({
          path: relative(rootDir, filePath),
          title: this.extractMarkdownTitle(filePath),
          type: this.inferDocType(file),
          size: stat.size,
          lastModified: stat.mtimeMs,
        });
      }
    }

    return docs;
  }

  private inferDocType(
    filename: string
  ): "readme" | "contributing" | "api" | "architecture" | "changelog" | "other" {
    const lower = filename.toLowerCase();
    if (lower.includes("readme")) return "readme";
    if (lower.includes("contributing")) return "contributing";
    if (lower.includes("api")) return "api";
    if (lower.includes("architecture") || lower.includes("design"))
      return "architecture";
    if (lower.includes("changelog") || lower.includes("history"))
      return "changelog";
    return "other";
  }

  private findSourceDirectories(dir: string): string[] {
    const sourceDirs: string[] = [];

    for (const pattern of SOURCE_DIR_PATTERNS) {
      const srcPath = join(dir, pattern);
      if (existsSync(srcPath) && statSync(srcPath).isDirectory()) {
        sourceDirs.push(srcPath);
      }
    }

    // Also check root for source files
    const rootFiles = this.safeReadDir(dir);
    const hasSourceFiles = rootFiles.some(
      (f) => f.endsWith(".ts") || f.endsWith(".js") || f.endsWith(".tsx")
    );
    if (hasSourceFiles && sourceDirs.length === 0) {
      sourceDirs.push(dir);
    }

    return sourceDirs;
  }

  private extractTodosFromDirectory(
    dir: string,
    rootDir: string,
    depth = 0
  ): CodeComment[] {
    if (depth > this.options.maxDepth) return [];

    const todos: CodeComment[] = [];
    const files = this.safeReadDir(dir);

    for (const file of files) {
      if (this.options.ignorePatterns.includes(file)) continue;

      const filePath = join(dir, file);
      const stat = this.safeStat(filePath);

      if (!stat) continue;

      if (stat.isDirectory) {
        todos.push(
          ...this.extractTodosFromDirectory(filePath, rootDir, depth + 1)
        );
      } else if (this.isSourceFile(file)) {
        todos.push(...this.extractTodosFromFile(filePath, rootDir));
      }

      if (todos.length >= 100) break;
    }

    return todos;
  }

  private isSourceFile(filename: string): boolean {
    const extensions = [".ts", ".tsx", ".js", ".jsx", ".py", ".go", ".rs"];
    return extensions.some((ext) => filename.endsWith(ext));
  }

  private extractTodosFromFile(
    filePath: string,
    rootDir: string
  ): CodeComment[] {
    const todos: CodeComment[] = [];

    try {
      const content = readFileSync(filePath, "utf-8");
      const lines = content.split("\n");

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const match = line.match(
          /(?:\/\/|#|\/\*)\s*(TODO|FIXME|HACK|NOTE|XXX|BUG)[\s:]+(.+?)(?:\*\/)?$/i
        );

        if (match) {
          todos.push({
            type: match[1].toUpperCase() as CodeComment["type"],
            text: match[2].trim(),
            file: relative(rootDir, filePath),
            line: i + 1,
          });
        }
      }
    } catch {
      // Ignore file read errors
    }

    return todos;
  }

  private countFiles(dir: string, depth = 0): number {
    if (depth > 3) return 0;

    let count = 0;
    const files = this.safeReadDir(dir);

    for (const file of files) {
      if (this.options.ignorePatterns.includes(file)) continue;

      const filePath = join(dir, file);
      const stat = this.safeStat(filePath);

      if (!stat) continue;

      if (stat.isDirectory) {
        count += this.countFiles(filePath, depth + 1);
      } else {
        count++;
      }
    }

    return count;
  }

  private inferDirectoryPurpose(dirName: string): string {
    const purposes: Record<string, string> = {
      src: "Main source code",
      app: "Application code (Next.js App Router / general)",
      pages: "Page components / routes",
      lib: "Shared libraries and utilities",
      components: "UI components",
      api: "API routes and handlers",
      utils: "Utility functions",
      hooks: "React hooks",
      services: "Service layer / business logic",
      types: "Type definitions",
    };

    return purposes[dirName.toLowerCase()] || "Unknown";
  }

  private async detectFeatures(
    dir: string,
    stack: DetectedStack
  ): Promise<DetectedFeature[]> {
    const features: DetectedFeature[] = [];

    // Detect auth feature
    if (stack.auth && stack.auth !== "none") {
      features.push({
        name: "Authentication",
        description: `${stack.auth} authentication detected`,
        files: this.findFilesContaining(dir, ["auth", "login", "signin"]),
        confidence: 0.9,
        category: "auth",
      });
    }

    // Detect database feature
    if (stack.database && stack.database !== "none") {
      features.push({
        name: "Database",
        description: `${stack.database} database with ${stack.orm || "no ORM"} detected`,
        files: this.findSchemaFiles(dir),
        confidence: 0.9,
        category: "database",
      });
    }

    // Detect API feature
    if (stack.api && stack.api !== "none") {
      features.push({
        name: "API Layer",
        description: `${stack.api} API detected`,
        files: this.findFilesContaining(dir, ["api", "router", "trpc"]),
        confidence: 0.8,
        category: "api",
      });
    }

    return features;
  }

  private findFilesContaining(dir: string, keywords: string[]): string[] {
    const matches: string[] = [];

    const search = (searchDir: string, depth = 0) => {
      if (depth > 2 || matches.length >= 10) return;

      const files = this.safeReadDir(searchDir);
      for (const file of files) {
        if (this.options.ignorePatterns.includes(file)) continue;

        const lower = file.toLowerCase();
        if (keywords.some((k) => lower.includes(k))) {
          matches.push(relative(dir, join(searchDir, file)));
        }

        const filePath = join(searchDir, file);
        const stat = this.safeStat(filePath);
        if (stat?.isDirectory) {
          search(filePath, depth + 1);
        }
      }
    };

    search(dir);
    return matches.slice(0, 10);
  }

  private findSchemaFiles(dir: string): string[] {
    const schemaFiles: string[] = [];

    // Check for Prisma schema
    const prismaPath = join(dir, "prisma", "schema.prisma");
    if (existsSync(prismaPath)) {
      schemaFiles.push("prisma/schema.prisma");
    }

    // Check for Drizzle schema
    const drizzlePaths = ["drizzle", "src/db", "src/drizzle", "db"];
    for (const p of drizzlePaths) {
      const drizzlePath = join(dir, p);
      if (existsSync(drizzlePath)) {
        const files = this.safeReadDir(drizzlePath);
        const schemaFile = files.find(
          (f) => f.includes("schema") && (f.endsWith(".ts") || f.endsWith(".js"))
        );
        if (schemaFile) {
          schemaFiles.push(join(p, schemaFile));
        }
      }
    }

    return schemaFiles;
  }

  private generateSuggestions(analysis: ProjectAnalysis): string[] {
    const suggestions: string[] = [];

    if (analysis.todos.length > 0) {
      suggestions.push(
        `Found ${analysis.todos.length} TODO comments that could be converted to tasks`
      );
    }

    if (!analysis.structure.hasTests) {
      suggestions.push("Consider adding tests to improve code quality");
    }

    if (!analysis.structure.hasCICD) {
      suggestions.push("Consider setting up CI/CD for automated testing");
    }

    if (analysis.documentation.length === 0) {
      suggestions.push("Add documentation to improve project maintainability");
    }

    if (analysis.stack.confidence < 0.6) {
      suggestions.push(
        "Stack detection confidence is low. Consider manually verifying the detected technologies."
      );
    }

    return suggestions;
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let projectAnalysisServiceInstance: ProjectAnalysisService | undefined;

export function getProjectAnalysisService(): ProjectAnalysisService {
  if (!projectAnalysisServiceInstance) {
    projectAnalysisServiceInstance = new ProjectAnalysisService();
  }
  return projectAnalysisServiceInstance;
}
