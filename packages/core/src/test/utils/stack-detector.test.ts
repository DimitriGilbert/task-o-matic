/**
 * Tests for stack-detector utility
 */

import assert from "node:assert";

import {
  parsePackageJson,
  detectLanguage,
  detectFrameworks,
  detectDatabase,
  detectORM,
  detectAuth,
  detectPackageManager,
  detectRuntime,
  detectAPI,
  detectTesting,
  detectBuildTools,
  calculateConfidence,
  detectFullStack,
} from "../../utils/stack-detector";

describe("Stack Detector", () => {
  describe("parsePackageJson", () => {
    it("should parse valid package.json content", () => {
      const content = JSON.stringify({
        name: "test-project",
        version: "1.0.0",
        dependencies: { react: "^18.0.0" },
      });

      const result = parsePackageJson(content);
      assert.strictEqual(result?.name, "test-project");
      assert.strictEqual(result?.version, "1.0.0");
      assert.deepStrictEqual(result?.dependencies, { react: "^18.0.0" });
    });

    it("should return null for invalid JSON", () => {
      const result = parsePackageJson("not valid json");
      assert.strictEqual(result, null);
    });
  });

  describe("detectLanguage", () => {
    it("should detect TypeScript when tsconfig exists", () => {
      const result = detectLanguage(true, null);
      assert.strictEqual(result, "typescript");
    });

    it("should detect TypeScript from devDependencies", () => {
      const result = detectLanguage(false, {
        devDependencies: { typescript: "^5.0.0" },
      });
      assert.strictEqual(result, "typescript");
    });

    it("should detect JavaScript when package.json exists but no TS", () => {
      const result = detectLanguage(false, { devDependencies: {} });
      assert.strictEqual(result, "javascript");
    });

    it("should return unknown when no package.json", () => {
      const result = detectLanguage(false, null);
      assert.strictEqual(result, "unknown");
    });
  });

  describe("detectFrameworks", () => {
    it("should detect Next.js", () => {
      const result = detectFrameworks({ next: "^14.0.0" });
      assert.ok(result.frameworks.includes("next"));
      assert.strictEqual(result.primaryFramework, "next");
    });

    it("should detect multiple frameworks", () => {
      const result = detectFrameworks({
        next: "^14.0.0",
        express: "^4.0.0",
      });
      assert.ok(result.frameworks.includes("next"));
      assert.ok(result.frameworks.includes("express"));
    });

    it("should prioritize meta-frameworks over base frameworks", () => {
      const result = detectFrameworks({
        react: "^18.0.0",
        next: "^14.0.0",
      });
      assert.strictEqual(result.primaryFramework, "next");
    });

    it("should return empty array for no frameworks", () => {
      const result = detectFrameworks({ lodash: "^4.0.0" });
      assert.strictEqual(result.frameworks.length, 0);
      assert.strictEqual(result.primaryFramework, undefined);
    });
  });

  describe("detectDatabase", () => {
    it("should detect postgres from pg", () => {
      const result = detectDatabase({ pg: "^8.0.0" });
      assert.strictEqual(result, "postgres");
    });

    it("should detect mongodb", () => {
      const result = detectDatabase({ mongodb: "^6.0.0" });
      assert.strictEqual(result, "mongodb");
    });

    it("should detect sqlite", () => {
      const result = detectDatabase({ "better-sqlite3": "^9.0.0" });
      assert.strictEqual(result, "sqlite");
    });

    it("should return undefined for no database", () => {
      const result = detectDatabase({ lodash: "^4.0.0" });
      assert.strictEqual(result, undefined);
    });
  });

  describe("detectORM", () => {
    it("should detect Prisma", () => {
      const result = detectORM({ "@prisma/client": "^5.0.0" });
      assert.strictEqual(result, "prisma");
    });

    it("should detect Drizzle", () => {
      const result = detectORM({ "drizzle-orm": "^0.29.0" });
      assert.strictEqual(result, "drizzle");
    });

    it("should return undefined for no ORM", () => {
      const result = detectORM({ lodash: "^4.0.0" });
      assert.strictEqual(result, undefined);
    });
  });

  describe("detectAuth", () => {
    it("should detect better-auth", () => {
      const result = detectAuth({ "better-auth": "^1.0.0" });
      assert.strictEqual(result, "better-auth");
    });

    it("should detect Clerk", () => {
      const result = detectAuth({ "@clerk/nextjs": "^4.0.0" });
      assert.strictEqual(result, "clerk");
    });

    it("should detect next-auth", () => {
      const result = detectAuth({ "next-auth": "^4.0.0" });
      assert.strictEqual(result, "next-auth");
    });

    it("should return undefined for no auth", () => {
      const result = detectAuth({ lodash: "^4.0.0" });
      assert.strictEqual(result, undefined);
    });
  });

  describe("detectPackageManager", () => {
    it("should detect bun from bun.lock", () => {
      const result = detectPackageManager(["bun.lock", "package.json"]);
      assert.strictEqual(result, "bun");
    });

    it("should detect pnpm from pnpm-lock.yaml", () => {
      const result = detectPackageManager(["pnpm-lock.yaml", "package.json"]);
      assert.strictEqual(result, "pnpm");
    });

    it("should detect yarn from yarn.lock", () => {
      const result = detectPackageManager(["yarn.lock", "package.json"]);
      assert.strictEqual(result, "yarn");
    });

    it("should detect npm from package-lock.json", () => {
      const result = detectPackageManager(["package-lock.json", "package.json"]);
      assert.strictEqual(result, "npm");
    });

    it("should default to npm when no lock file", () => {
      const result = detectPackageManager(["package.json"]);
      assert.strictEqual(result, "npm");
    });
  });

  describe("detectRuntime", () => {
    it("should detect bun runtime from package manager", () => {
      const result = detectRuntime(null, "bun");
      assert.strictEqual(result, "bun");
    });

    it("should detect bun from scripts", () => {
      const result = detectRuntime(
        { scripts: { dev: "bun run src/index.ts" } },
        "npm"
      );
      assert.strictEqual(result, "bun");
    });

    it("should default to node", () => {
      const result = detectRuntime({ scripts: { dev: "node index.js" } }, "npm");
      assert.strictEqual(result, "node");
    });
  });

  describe("detectAPI", () => {
    it("should detect tRPC", () => {
      const result = detectAPI({ "@trpc/server": "^10.0.0" });
      assert.strictEqual(result, "trpc");
    });

    it("should detect GraphQL", () => {
      const result = detectAPI({ graphql: "^16.0.0" });
      assert.strictEqual(result, "graphql");
    });

    it("should default to rest", () => {
      const result = detectAPI({ express: "^4.0.0" });
      assert.strictEqual(result, "rest");
    });
  });

  describe("detectTesting", () => {
    it("should detect Jest", () => {
      const result = detectTesting({ jest: "^29.0.0" });
      assert.ok(result.includes("jest"));
    });

    it("should detect Vitest", () => {
      const result = detectTesting({ vitest: "^1.0.0" });
      assert.ok(result.includes("vitest"));
    });

    it("should detect multiple testing frameworks", () => {
      const result = detectTesting({
        vitest: "^1.0.0",
        "@playwright/test": "^1.0.0",
      });
      assert.ok(result.includes("vitest"));
      assert.ok(result.includes("playwright"));
    });
  });

  describe("detectBuildTools", () => {
    it("should detect Vite", () => {
      const result = detectBuildTools({ vite: "^5.0.0" });
      assert.ok(result.includes("vite"));
    });

    it("should detect Turborepo", () => {
      const result = detectBuildTools({ turbo: "^1.0.0" });
      assert.ok(result.includes("turborepo"));
    });
  });

  describe("calculateConfidence", () => {
    it("should return higher confidence for more detected components", () => {
      const minimal = calculateConfidence({ language: "unknown", frameworks: [] });
      const full = calculateConfidence({
        language: "typescript",
        frameworks: ["next"],
        database: "postgres",
        orm: "prisma",
        auth: "better-auth",
      });

      assert.ok(full > minimal);
    });

    it("should cap confidence at 1", () => {
      const result = calculateConfidence({
        language: "typescript",
        frameworks: ["next", "express"],
        database: "postgres",
        orm: "prisma",
        auth: "better-auth",
      });

      assert.ok(result <= 1);
    });
  });

  describe("detectFullStack", () => {
    it("should detect full stack from package.json", () => {
      const packageJson = JSON.stringify({
        name: "my-app",
        dependencies: {
          next: "^14.0.0",
          "@prisma/client": "^5.0.0",
          "better-auth": "^1.0.0",
        },
        devDependencies: {
          typescript: "^5.0.0",
          vitest: "^1.0.0",
        },
      });

      const result = detectFullStack(packageJson, ["bun.lock"], true);

      assert.strictEqual(result.language, "typescript");
      assert.ok(result.frameworks.includes("next"));
      assert.strictEqual(result.orm, "prisma");
      assert.strictEqual(result.auth, "better-auth");
      assert.strictEqual(result.packageManager, "bun");
      assert.strictEqual(result._source, "detected");
      assert.ok(result.confidence > 0.5);
    });

    it("should handle missing package.json", () => {
      const result = detectFullStack(null, [], false);

      assert.strictEqual(result.language, "unknown");
      assert.strictEqual(result._source, "detected");
    });
  });
});
