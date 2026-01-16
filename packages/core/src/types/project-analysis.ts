/**
 * Project Analysis Types
 *
 * Types for analyzing existing projects and detecting their stack.
 * Used by the ProjectAnalysisService for "init attach" functionality.
 */

// ============================================================================
// DETECTED STACK TYPES
// ============================================================================

/**
 * Detected language in the project
 */
export type DetectedLanguage =
  | "typescript"
  | "javascript"
  | "python"
  | "go"
  | "rust"
  | "java"
  | "unknown";

/**
 * Detected framework in the project
 */
export type DetectedFramework =
  // Frontend frameworks
  | "next"
  | "react"
  | "vue"
  | "nuxt"
  | "svelte"
  | "angular"
  | "solid"
  | "astro"
  // Backend frameworks
  | "express"
  | "hono"
  | "fastify"
  | "koa"
  | "nest"
  | "elysia"
  | "convex"
  // Meta-frameworks
  | "tanstack-router"
  | "tanstack-start"
  | "react-router"
  | "remix"
  | "expo"
  // Other
  | "unknown";

/**
 * Detected database type
 */
export type DetectedDatabase =
  | "postgres"
  | "mysql"
  | "mongodb"
  | "sqlite"
  | "redis"
  | "unknown"
  | "none";

/**
 * Detected ORM
 */
export type DetectedORM =
  | "prisma"
  | "drizzle"
  | "typeorm"
  | "sequelize"
  | "mongoose"
  | "kysely"
  | "none";

/**
 * Detected auth solution
 */
export type DetectedAuth =
  | "better-auth"
  | "clerk"
  | "next-auth"
  | "auth0"
  | "supabase-auth"
  | "firebase-auth"
  | "lucia"
  | "none";

/**
 * Detected package manager
 */
export type DetectedPackageManager = "npm" | "pnpm" | "yarn" | "bun" | "unknown";

/**
 * Detected runtime
 */
export type DetectedRuntime = "node" | "bun" | "deno" | "workers" | "unknown";

/**
 * Source of the detection
 */
export type DetectionSource = "detected" | "manual" | "fallback";

/**
 * Complete detected stack information
 */
export interface DetectedStack {
  /** Primary programming language */
  language: DetectedLanguage;
  /** Framework(s) detected - can be multiple */
  frameworks: DetectedFramework[];
  /** Primary framework (first detected or most significant) */
  primaryFramework?: DetectedFramework;
  /** Database type if detected */
  database?: DetectedDatabase;
  /** ORM if detected */
  orm?: DetectedORM;
  /** Auth solution if detected */
  auth?: DetectedAuth;
  /** Package manager used */
  packageManager: DetectedPackageManager;
  /** Runtime environment */
  runtime: DetectedRuntime;
  /** API style if detected */
  api?: "trpc" | "graphql" | "rest" | "orpc" | "none";
  /** Testing framework if detected */
  testing?: string[];
  /** Build tools if detected */
  buildTools?: string[];
  /** How this information was obtained */
  _source: DetectionSource;
  /** Confidence level of detection (0-1) */
  confidence: number;
  /** Timestamp of detection */
  detectedAt: number;
}

// ============================================================================
// PROJECT STRUCTURE TYPES
// ============================================================================

/**
 * Information about a directory in the project
 */
export interface DirectoryInfo {
  /** Directory path relative to project root */
  path: string;
  /** Number of files in directory */
  fileCount: number;
  /** Primary purpose/role of this directory */
  purpose?: string;
}

/**
 * Information about the project structure
 */
export interface ProjectStructure {
  /** Root directory path */
  root: string;
  /** Whether this is a monorepo */
  isMonorepo: boolean;
  /** Package names if monorepo */
  packages?: string[];
  /** Detected source directories */
  sourceDirectories: DirectoryInfo[];
  /** Has tests directory */
  hasTests: boolean;
  /** Has docs directory */
  hasDocs: boolean;
  /** Has CI/CD configuration */
  hasCICD: boolean;
  /** Has Docker configuration */
  hasDocker: boolean;
  /** Entry points detected */
  entryPoints: string[];
  /** Configuration files found */
  configFiles: string[];
}

// ============================================================================
// DETECTED FEATURES TYPES
// ============================================================================

/**
 * A detected feature in the project
 */
export interface DetectedFeature {
  /** Feature name/category */
  name: string;
  /** Feature description */
  description: string;
  /** Files associated with this feature */
  files: string[];
  /** How confident we are this feature exists */
  confidence: number;
  /** Feature category */
  category:
    | "auth"
    | "api"
    | "database"
    | "ui"
    | "testing"
    | "deployment"
    | "other";
}

// ============================================================================
// DOCUMENTATION TYPES
// ============================================================================

/**
 * A documentation file found in the project
 */
export interface DocumentationFile {
  /** Path to the documentation file */
  path: string;
  /** Title extracted from the file */
  title?: string;
  /** Type of documentation */
  type: "readme" | "contributing" | "api" | "architecture" | "changelog" | "other";
  /** Size in bytes */
  size: number;
  /** Last modified timestamp */
  lastModified: number;
}

// ============================================================================
// CODE COMMENT TYPES
// ============================================================================

/**
 * A code comment (TODO, FIXME, etc.) found in the codebase
 */
export interface CodeComment {
  /** Type of comment */
  type: "TODO" | "FIXME" | "HACK" | "NOTE" | "XXX" | "BUG";
  /** The comment text */
  text: string;
  /** File path where comment was found */
  file: string;
  /** Line number */
  line: number;
  /** Associated function/class name if determinable */
  context?: string;
}

// ============================================================================
// MAIN PROJECT ANALYSIS TYPE
// ============================================================================

/**
 * Complete analysis result for a project
 */
export interface ProjectAnalysis {
  /** Project name (from package.json or directory) */
  projectName: string;
  /** Version from package.json */
  version?: string;
  /** Description from package.json */
  description?: string;
  /** Detected technology stack */
  stack: DetectedStack;
  /** Project structure information */
  structure: ProjectStructure;
  /** Detected features in the codebase */
  existingFeatures: DetectedFeature[];
  /** Documentation files found */
  documentation: DocumentationFile[];
  /** TODOs and FIXMEs extracted from code */
  todos: CodeComment[];
  /** When this analysis was performed */
  analyzedAt: number;
  /** Analysis duration in milliseconds */
  analysisDuration: number;
}

// ============================================================================
// ANALYSIS OPTIONS
// ============================================================================

/**
 * Options for project analysis
 */
export interface ProjectAnalysisOptions {
  /** Working directory to analyze (defaults to cwd) */
  workingDir?: string;
  /** Skip TODO/FIXME extraction (faster) */
  skipTodos?: boolean;
  /** Skip feature detection (faster) */
  skipFeatures?: boolean;
  /** Skip documentation scanning (faster) */
  skipDocs?: boolean;
  /** Maximum depth for directory scanning */
  maxDepth?: number;
  /** File patterns to ignore */
  ignorePatterns?: string[];
  /** Verbose logging during analysis */
  verbose?: boolean;
}

// ============================================================================
// SERVICE RESULT TYPES
// ============================================================================

/**
 * Result of stack detection
 */
export interface StackDetectionResult {
  success: boolean;
  stack: DetectedStack;
  /** Warnings during detection */
  warnings?: string[];
  /** Duration of detection in ms */
  duration: number;
}

/**
 * Result of project analysis
 */
export interface ProjectAnalysisResult {
  success: boolean;
  analysis: ProjectAnalysis;
  /** Warnings during analysis */
  warnings?: string[];
  /** Suggested next steps based on analysis */
  suggestions?: string[];
}
