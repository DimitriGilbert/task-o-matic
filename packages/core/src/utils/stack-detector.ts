/**
 * Stack Detector Utility
 *
 * Helper functions for detecting technology stack from project files.
 * Used by ProjectAnalysisService to determine what technologies a project uses.
 */

import {
  DetectedLanguage,
  DetectedFramework,
  DetectedDatabase,
  DetectedORM,
  DetectedAuth,
  DetectedPackageManager,
  DetectedRuntime,
  DetectedStack,
} from "../types/project-analysis";

// ============================================================================
// DETECTION PATTERNS
// ============================================================================

/**
 * Patterns for detecting frameworks from package.json dependencies
 */
export const FRAMEWORK_PATTERNS: Record<
  string,
  { framework: DetectedFramework; priority: number }
> = {
  // Frontend frameworks (higher priority)
  next: { framework: "next", priority: 10 },
  nuxt: { framework: "nuxt", priority: 10 },
  "react-router-dom": { framework: "react-router", priority: 8 },
  "@tanstack/react-router": { framework: "tanstack-router", priority: 9 },
  "@tanstack/start": { framework: "tanstack-start", priority: 9 },
  svelte: { framework: "svelte", priority: 10 },
  "@sveltejs/kit": { framework: "svelte", priority: 10 },
  vue: { framework: "vue", priority: 10 },
  "@angular/core": { framework: "angular", priority: 10 },
  "solid-js": { framework: "solid", priority: 10 },
  astro: { framework: "astro", priority: 10 },
  expo: { framework: "expo", priority: 9 },
  remix: { framework: "remix", priority: 9 },
  // Backend frameworks
  express: { framework: "express", priority: 7 },
  hono: { framework: "hono", priority: 7 },
  fastify: { framework: "fastify", priority: 7 },
  koa: { framework: "koa", priority: 6 },
  "@nestjs/core": { framework: "nest", priority: 8 },
  elysia: { framework: "elysia", priority: 7 },
  convex: { framework: "convex", priority: 8 },
  // Core react (lower priority - usually paired with a meta-framework)
  react: { framework: "react", priority: 5 },
};

/**
 * Patterns for detecting databases from package.json dependencies
 */
export const DATABASE_PATTERNS: Record<string, DetectedDatabase> = {
  pg: "postgres",
  postgres: "postgres",
  "@neondatabase/serverless": "postgres",
  "@vercel/postgres": "postgres",
  mysql: "mysql",
  mysql2: "mysql",
  mongodb: "mongodb",
  mongoose: "mongodb",
  "better-sqlite3": "sqlite",
  sqlite3: "sqlite",
  "@libsql/client": "sqlite",
  redis: "redis",
  ioredis: "redis",
};

/**
 * Patterns for detecting ORMs from package.json dependencies
 */
export const ORM_PATTERNS: Record<string, DetectedORM> = {
  prisma: "prisma",
  "@prisma/client": "prisma",
  drizzle: "drizzle",
  "drizzle-orm": "drizzle",
  typeorm: "typeorm",
  sequelize: "sequelize",
  mongoose: "mongoose",
  kysely: "kysely",
};

/**
 * Patterns for detecting auth solutions from package.json dependencies
 */
export const AUTH_PATTERNS: Record<string, DetectedAuth> = {
  "better-auth": "better-auth",
  "@clerk/nextjs": "clerk",
  "@clerk/clerk-react": "clerk",
  "next-auth": "next-auth",
  "@auth/core": "next-auth",
  "auth0-js": "auth0",
  "@auth0/auth0-react": "auth0",
  "@supabase/supabase-js": "supabase-auth",
  "firebase-auth": "firebase-auth",
  lucia: "lucia",
  "@lucia-auth/core": "lucia",
};

/**
 * Lock file to package manager mapping
 */
export const LOCK_FILE_TO_MANAGER: Record<string, DetectedPackageManager> = {
  "bun.lock": "bun",
  "bun.lockb": "bun",
  "pnpm-lock.yaml": "pnpm",
  "yarn.lock": "yarn",
  "package-lock.json": "npm",
};

/**
 * Config files that indicate specific frameworks
 */
export const CONFIG_FILE_PATTERNS: Record<string, DetectedFramework> = {
  "next.config.js": "next",
  "next.config.mjs": "next",
  "next.config.ts": "next",
  "nuxt.config.js": "nuxt",
  "nuxt.config.ts": "nuxt",
  "svelte.config.js": "svelte",
  "astro.config.mjs": "astro",
  "astro.config.ts": "astro",
  "angular.json": "angular",
  "vue.config.js": "vue",
  "vite.config.ts": "react", // Default to react for vite, can be overridden
  "convex.json": "convex",
  "remix.config.js": "remix",
};

// ============================================================================
// DETECTION FUNCTIONS
// ============================================================================

/**
 * Parse package.json and return parsed object
 */
export function parsePackageJson(content: string): {
  name?: string;
  version?: string;
  description?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  scripts?: Record<string, string>;
} | null {
  try {
    return JSON.parse(content);
  } catch {
    return null;
  }
}

/**
 * Detect language from project files
 */
export function detectLanguage(
  hasTsConfig: boolean,
  packageJson: { devDependencies?: Record<string, string> } | null
): DetectedLanguage {
  if (hasTsConfig) {
    return "typescript";
  }

  if (packageJson?.devDependencies?.typescript) {
    return "typescript";
  }

  // If we have package.json, it's likely JS/TS
  if (packageJson) {
    return "javascript";
  }

  return "unknown";
}

/**
 * Detect frameworks from dependencies
 */
export function detectFrameworks(dependencies: Record<string, string>): {
  frameworks: DetectedFramework[];
  primaryFramework: DetectedFramework | undefined;
} {
  const detected: { framework: DetectedFramework; priority: number }[] = [];

  for (const [dep, info] of Object.entries(FRAMEWORK_PATTERNS)) {
    if (dependencies[dep]) {
      detected.push(info);
    }
  }

  // Sort by priority (highest first)
  detected.sort((a, b) => b.priority - a.priority);

  const frameworks = [...new Set(detected.map((d) => d.framework))];
  const primaryFramework = frameworks[0];

  return { frameworks, primaryFramework };
}

/**
 * Detect database from dependencies
 */
export function detectDatabase(
  dependencies: Record<string, string>
): DetectedDatabase | undefined {
  for (const [dep, db] of Object.entries(DATABASE_PATTERNS)) {
    if (dependencies[dep]) {
      return db;
    }
  }
  return undefined;
}

/**
 * Detect ORM from dependencies
 */
export function detectORM(
  dependencies: Record<string, string>
): DetectedORM | undefined {
  for (const [dep, orm] of Object.entries(ORM_PATTERNS)) {
    if (dependencies[dep]) {
      return orm;
    }
  }
  return undefined;
}

/**
 * Detect auth solution from dependencies
 */
export function detectAuth(
  dependencies: Record<string, string>
): DetectedAuth | undefined {
  for (const [dep, auth] of Object.entries(AUTH_PATTERNS)) {
    if (dependencies[dep]) {
      return auth;
    }
  }
  return undefined;
}

/**
 * Detect package manager from lock files
 */
export function detectPackageManager(
  existingFiles: string[]
): DetectedPackageManager {
  for (const [lockFile, manager] of Object.entries(LOCK_FILE_TO_MANAGER)) {
    if (existingFiles.includes(lockFile)) {
      return manager;
    }
  }
  return "npm"; // Default to npm if no lock file found
}

/**
 * Detect runtime from package.json scripts and lock files
 */
export function detectRuntime(
  packageJson: { scripts?: Record<string, string> } | null,
  packageManager: DetectedPackageManager
): DetectedRuntime {
  // Check if using bun as package manager
  if (packageManager === "bun") {
    return "bun";
  }

  // Check scripts for bun usage
  if (packageJson?.scripts) {
    const scriptValues = Object.values(packageJson.scripts).join(" ");
    if (scriptValues.includes("bun ")) {
      return "bun";
    }
    if (scriptValues.includes("deno ")) {
      return "deno";
    }
  }

  return "node"; // Default to node
}

/**
 * Detect API style from dependencies
 */
export function detectAPI(
  dependencies: Record<string, string>
): "trpc" | "graphql" | "rest" | "orpc" | "none" {
  if (dependencies["@trpc/server"] || dependencies["@trpc/client"]) {
    return "trpc";
  }
  if (dependencies["@orpc/server"] || dependencies["@orpc/client"]) {
    return "orpc";
  }
  if (
    dependencies.graphql ||
    dependencies["apollo-server"] ||
    dependencies["@apollo/server"]
  ) {
    return "graphql";
  }
  return "rest";
}

/**
 * Detect testing frameworks from dependencies
 */
export function detectTesting(
  devDependencies: Record<string, string>
): string[] {
  const testing: string[] = [];

  const patterns: Record<string, string> = {
    jest: "jest",
    vitest: "vitest",
    mocha: "mocha",
    "@playwright/test": "playwright",
    cypress: "cypress",
    "@testing-library/react": "testing-library",
    "@testing-library/vue": "testing-library",
  };

  for (const [dep, name] of Object.entries(patterns)) {
    if (devDependencies[dep]) {
      testing.push(name);
    }
  }

  return testing;
}

/**
 * Detect build tools from dependencies
 */
export function detectBuildTools(
  devDependencies: Record<string, string>
): string[] {
  const tools: string[] = [];

  const patterns: Record<string, string> = {
    vite: "vite",
    webpack: "webpack",
    esbuild: "esbuild",
    rollup: "rollup",
    tsup: "tsup",
    turbo: "turborepo",
    nx: "nx",
  };

  for (const [dep, name] of Object.entries(patterns)) {
    if (devDependencies[dep]) {
      tools.push(name);
    }
  }

  return tools;
}

/**
 * Calculate confidence based on detected components
 */
export function calculateConfidence(stack: Partial<DetectedStack>): number {
  let confidence = 0.5; // Base confidence

  if (stack.language && stack.language !== "unknown") {
    confidence += 0.1;
  }
  if (stack.frameworks && stack.frameworks.length > 0) {
    confidence += 0.2;
  }
  if (stack.database) {
    confidence += 0.1;
  }
  if (stack.orm) {
    confidence += 0.05;
  }
  if (stack.auth) {
    confidence += 0.05;
  }

  return Math.min(confidence, 1);
}

/**
 * Merge dependencies and devDependencies for detection
 */
export function mergeAllDependencies(packageJson: {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}): Record<string, string> {
  return {
    ...(packageJson.dependencies || {}),
    ...(packageJson.devDependencies || {}),
  };
}

/**
 * Detect framework from config files
 */
export function detectFrameworkFromConfigs(
  existingFiles: string[]
): DetectedFramework | undefined {
  for (const [file, framework] of Object.entries(CONFIG_FILE_PATTERNS)) {
    if (existingFiles.includes(file)) {
      return framework;
    }
  }
  return undefined;
}

/**
 * Full stack detection from all sources
 */
export function detectFullStack(
  packageJsonContent: string | null,
  existingFiles: string[],
  hasTsConfig: boolean
): DetectedStack {
  const packageJson = packageJsonContent
    ? parsePackageJson(packageJsonContent)
    : null;

  const allDeps = packageJson ? mergeAllDependencies(packageJson) : {};
  const devDeps = packageJson?.devDependencies || {};

  const language = detectLanguage(hasTsConfig, packageJson);
  const packageManager = detectPackageManager(existingFiles);
  const runtime = detectRuntime(packageJson, packageManager);

  // Framework detection from both deps and config files
  const { frameworks, primaryFramework } = detectFrameworks(allDeps);
  const configFramework = detectFrameworkFromConfigs(existingFiles);

  // Merge frameworks, preferring config file detection
  const finalFrameworks = configFramework
    ? [configFramework, ...frameworks.filter((f) => f !== configFramework)]
    : frameworks;

  const stack: DetectedStack = {
    language,
    frameworks: finalFrameworks.length > 0 ? finalFrameworks : ["unknown"],
    primaryFramework: configFramework || primaryFramework,
    database: detectDatabase(allDeps),
    orm: detectORM(allDeps),
    auth: detectAuth(allDeps),
    packageManager,
    runtime,
    api: detectAPI(allDeps),
    testing: detectTesting(devDeps),
    buildTools: detectBuildTools(devDeps),
    _source: "detected",
    confidence: 0,
    detectedAt: Date.now(),
  };

  stack.confidence = calculateConfidence(stack);

  return stack;
}
