/**
 * Tests for ProjectAnalysisService
 */

import assert from "node:assert";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { ProjectAnalysisService } from "../../services/project-analysis";

describe("ProjectAnalysisService", () => {
  const testDir = join(process.cwd(), "tmp-test-project-analysis");

  beforeEach(() => {
    // Create test directory
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true });
    }
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    // Cleanup test directory
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true });
    }
  });

  describe("detectStack", () => {
    it("should detect stack from package.json", async () => {
      // Create a mock Next.js project
      writeFileSync(
        join(testDir, "package.json"),
        JSON.stringify({
          name: "test-nextjs-app",
          dependencies: {
            next: "^14.0.0",
            react: "^18.0.0",
          },
          devDependencies: {
            typescript: "^5.0.0",
          },
        })
      );
      writeFileSync(join(testDir, "tsconfig.json"), "{}");
      writeFileSync(join(testDir, "bun.lock"), "");

      const service = new ProjectAnalysisService();
      const result = await service.detectStack(testDir);

      assert.strictEqual(result.success, true);
      assert.strictEqual(result.stack.language, "typescript");
      assert.ok(result.stack.frameworks.includes("next"));
      assert.strictEqual(result.stack.packageManager, "bun");
      assert.strictEqual(result.stack._source, "detected");
    });

    it("should return fallback stack for empty directory", async () => {
      const service = new ProjectAnalysisService();
      const result = await service.detectStack(testDir);

      assert.strictEqual(result.success, true);
      assert.ok(result.warnings && result.warnings.length > 0);
      assert.strictEqual(result.stack.language, "unknown");
    });

    it("should handle non-existent directory", async () => {
      const service = new ProjectAnalysisService();
      const result = await service.detectStack("/non/existent/path");

      assert.strictEqual(result.success, false);
      assert.ok(result.warnings && result.warnings.length > 0);
    });
  });

  describe("findExistingDocumentation", () => {
    it("should find README.md", async () => {
      writeFileSync(join(testDir, "README.md"), "# Test Project\n\nDescription");

      const service = new ProjectAnalysisService();
      const docs = await service.findExistingDocumentation(testDir);

      assert.strictEqual(docs.length, 1);
      assert.strictEqual(docs[0].type, "readme");
      assert.strictEqual(docs[0].title, "Test Project");
    });

    it("should find multiple documentation files", async () => {
      writeFileSync(join(testDir, "README.md"), "# Test Project");
      writeFileSync(join(testDir, "CONTRIBUTING.md"), "# Contributing");
      writeFileSync(join(testDir, "CHANGELOG.md"), "# Changelog");

      const service = new ProjectAnalysisService();
      const docs = await service.findExistingDocumentation(testDir);

      assert.strictEqual(docs.length, 3);
      assert.ok(docs.some((d) => d.type === "readme"));
      assert.ok(docs.some((d) => d.type === "contributing"));
      assert.ok(docs.some((d) => d.type === "changelog"));
    });

    it("should find docs in docs/ directory", async () => {
      mkdirSync(join(testDir, "docs"), { recursive: true });
      writeFileSync(join(testDir, "docs", "api.md"), "# API Documentation");
      writeFileSync(join(testDir, "docs", "architecture.md"), "# Architecture");

      const service = new ProjectAnalysisService();
      const docs = await service.findExistingDocumentation(testDir);

      assert.ok(docs.length >= 2);
    });
  });

  describe("extractTodos", () => {
    it("should extract TODO comments from source files", async () => {
      mkdirSync(join(testDir, "src"), { recursive: true });
      writeFileSync(
        join(testDir, "src", "index.ts"),
        `
// TODO: Implement authentication
function login() {
  // FIXME: This is broken
  return null;
}

// NOTE: This is a note
// HACK: Temporary workaround
`
      );

      const service = new ProjectAnalysisService();
      const todos = await service.extractTodos(testDir);

      assert.ok(todos.length >= 2);
      assert.ok(todos.some((t) => t.type === "TODO"));
      assert.ok(todos.some((t) => t.type === "FIXME"));
    });

    it("should return empty array for no todos", async () => {
      mkdirSync(join(testDir, "src"), { recursive: true });
      writeFileSync(
        join(testDir, "src", "index.ts"),
        `
function clean() {
  return "no todos here";
}
`
      );

      const service = new ProjectAnalysisService();
      const todos = await service.extractTodos(testDir);

      assert.strictEqual(todos.length, 0);
    });

    it("should skip node_modules", async () => {
      mkdirSync(join(testDir, "node_modules", "some-package"), {
        recursive: true,
      });
      writeFileSync(
        join(testDir, "node_modules", "some-package", "index.js"),
        "// TODO: Should be ignored"
      );

      const service = new ProjectAnalysisService();
      const todos = await service.extractTodos(testDir);

      assert.strictEqual(todos.length, 0);
    });
  });

  describe("analyzeProjectStructure", () => {
    it("should detect monorepo structure", async () => {
      writeFileSync(join(testDir, "turbo.json"), "{}");
      mkdirSync(join(testDir, "packages", "app"), { recursive: true });
      mkdirSync(join(testDir, "packages", "core"), { recursive: true });

      const service = new ProjectAnalysisService();
      const structure = await service.analyzeProjectStructure(testDir);

      assert.strictEqual(structure.isMonorepo, true);
      assert.ok(structure.packages?.includes("app"));
      assert.ok(structure.packages?.includes("core"));
    });

    it("should detect source directories", async () => {
      mkdirSync(join(testDir, "src"), { recursive: true });
      mkdirSync(join(testDir, "app"), { recursive: true });
      writeFileSync(join(testDir, "src", "index.ts"), "export default {}");

      const service = new ProjectAnalysisService();
      const structure = await service.analyzeProjectStructure(testDir);

      assert.ok(structure.sourceDirectories.some((d) => d.path === "src"));
      assert.ok(structure.sourceDirectories.some((d) => d.path === "app"));
    });

    it("should detect tests directory", async () => {
      mkdirSync(join(testDir, "tests"), { recursive: true });

      const service = new ProjectAnalysisService();
      const structure = await service.analyzeProjectStructure(testDir);

      assert.strictEqual(structure.hasTests, true);
    });

    it("should detect CI/CD configuration", async () => {
      mkdirSync(join(testDir, ".github", "workflows"), { recursive: true });

      const service = new ProjectAnalysisService();
      const structure = await service.analyzeProjectStructure(testDir);

      assert.strictEqual(structure.hasCICD, true);
    });

    it("should detect Docker configuration", async () => {
      writeFileSync(join(testDir, "Dockerfile"), "FROM node:20");

      const service = new ProjectAnalysisService();
      const structure = await service.analyzeProjectStructure(testDir);

      assert.strictEqual(structure.hasDocker, true);
    });

    it("should find entry points", async () => {
      mkdirSync(join(testDir, "src"), { recursive: true });
      writeFileSync(join(testDir, "src", "index.ts"), "export default {}");

      const service = new ProjectAnalysisService();
      const structure = await service.analyzeProjectStructure(testDir);

      assert.ok(structure.entryPoints.includes("src/index.ts"));
    });
  });

  describe("analyzeProject", () => {
    it("should perform full project analysis", async () => {
      // Create a complete mock project
      writeFileSync(
        join(testDir, "package.json"),
        JSON.stringify({
          name: "full-test-app",
          version: "1.0.0",
          description: "A test application",
          dependencies: {
            next: "^14.0.0",
            "@prisma/client": "^5.0.0",
          },
          devDependencies: {
            typescript: "^5.0.0",
          },
        })
      );
      writeFileSync(join(testDir, "tsconfig.json"), "{}");
      writeFileSync(join(testDir, "README.md"), "# Full Test App");
      mkdirSync(join(testDir, "src"), { recursive: true });
      writeFileSync(
        join(testDir, "src", "index.ts"),
        "// TODO: Add main logic\nexport default {}"
      );

      const service = new ProjectAnalysisService();
      const result = await service.analyzeProject(testDir);

      assert.strictEqual(result.success, true);
      assert.strictEqual(result.analysis.projectName, "full-test-app");
      assert.strictEqual(result.analysis.version, "1.0.0");
      assert.strictEqual(result.analysis.description, "A test application");
      assert.strictEqual(result.analysis.stack.language, "typescript");
      assert.ok(result.analysis.stack.frameworks.includes("next"));
      assert.strictEqual(result.analysis.stack.orm, "prisma");
      assert.ok(result.analysis.documentation.length > 0);
      assert.ok(result.analysis.todos.length > 0);
      assert.ok(result.analysis.analysisDuration > 0);
    });

    it("should handle non-existent directory", async () => {
      const service = new ProjectAnalysisService();
      const result = await service.analyzeProject("/non/existent/path");

      assert.strictEqual(result.success, false);
      assert.ok(result.warnings && result.warnings.length > 0);
    });

    it("should respect skipTodos option", async () => {
      mkdirSync(join(testDir, "src"), { recursive: true });
      writeFileSync(
        join(testDir, "src", "index.ts"),
        "// TODO: Should be skipped"
      );

      const service = new ProjectAnalysisService({ skipTodos: true });
      const result = await service.analyzeProject(testDir);

      assert.strictEqual(result.analysis.todos.length, 0);
    });

    it("should respect skipDocs option", async () => {
      writeFileSync(join(testDir, "README.md"), "# Should be skipped");

      const service = new ProjectAnalysisService({ skipDocs: true });
      const result = await service.analyzeProject(testDir);

      assert.strictEqual(result.analysis.documentation.length, 0);
    });

    it("should generate suggestions", async () => {
      // Create a minimal project without tests or CI
      writeFileSync(
        join(testDir, "package.json"),
        JSON.stringify({ name: "minimal-app" })
      );

      const service = new ProjectAnalysisService();
      const result = await service.analyzeProject(testDir);

      assert.ok(result.suggestions && result.suggestions.length > 0);
    });
  });
});
