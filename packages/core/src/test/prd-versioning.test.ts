import * as assert from "node:assert";
import { FileSystemStorage } from "../lib/storage/file-system";
import type { TaskRepository } from "../lib/storage/types";
import type { PRDVersion } from "../types";

describe("PRD Versioning Storage", () => {
  let storage: TaskRepository;

  beforeEach(async () => {
    storage = new FileSystemStorage();
    // We can't easily clean up PRD versions without accessing the file system directly or exposing a cleanup method.
    // But since we use unique file names or just rely on overwrites/appends, it should be fine.
    // For this test, we'll use a unique PRD file name for each test case to avoid collision.
  });

  const createVersion = (version: number): PRDVersion => ({
    version,
    content: `PRD Content v${version}`,
    createdAt: Date.now(),
    changes: [],
    implementedTasks: [],
    message: `Version ${version}`,
    prdFile: "prd/test.md"
  });

  describe("savePRDVersion & getPRDVersions", () => {
    it("should save and retrieve PRD versions", async () => {
      const prdFile = `prd/test-save-${Date.now()}.md`;
      const version1 = { ...createVersion(1), prdFile };

      await storage.savePRDVersion(prdFile, version1);

      const versionData = await storage.getPRDVersions(prdFile);
      assert.ok(versionData);
      assert.strictEqual(versionData.prdFile, prdFile);
      assert.strictEqual(versionData.versions.length, 1);
      assert.deepStrictEqual(versionData.versions[0], version1);
      assert.strictEqual(versionData.currentVersion, 1);
    });

    it("should append new versions", async () => {
      const prdFile = `prd/test-append-${Date.now()}.md`;
      const version1 = { ...createVersion(1), prdFile };
      const version2 = { ...createVersion(2), prdFile };

      await storage.savePRDVersion(prdFile, version1);
      await storage.savePRDVersion(prdFile, version2);

      const versionData = await storage.getPRDVersions(prdFile);
      assert.ok(versionData);
      assert.strictEqual(versionData.versions.length, 2);
      assert.deepStrictEqual(versionData.versions[0], version1);
      assert.deepStrictEqual(versionData.versions[1], version2);
      assert.strictEqual(versionData.currentVersion, 2);
    });

    it("should update existing version if version number matches", async () => {
      const prdFile = `prd/test-update-${Date.now()}.md`;
      const version1 = { ...createVersion(1), prdFile };
      const version1Updated = { ...version1, content: "Updated content" };

      await storage.savePRDVersion(prdFile, version1);
      await storage.savePRDVersion(prdFile, version1Updated);

      const versionData = await storage.getPRDVersions(prdFile);
      assert.ok(versionData);
      assert.strictEqual(versionData.versions.length, 1);
      assert.strictEqual(versionData.versions[0].content, "Updated content");
    });
  });

  describe("getLatestPRDVersion", () => {
    it("should return the latest version", async () => {
      const prdFile = `prd/test-latest-${Date.now()}.md`;
      const version1 = { ...createVersion(1), prdFile };
      const version2 = { ...createVersion(2), prdFile };
      const version3 = { ...createVersion(3), prdFile };

      await storage.savePRDVersion(prdFile, version1);
      await storage.savePRDVersion(prdFile, version2);
      await storage.savePRDVersion(prdFile, version3);

      const latest = await storage.getLatestPRDVersion(prdFile);
      assert.ok(latest);
      assert.strictEqual(latest.version, 3);
      assert.deepStrictEqual(latest, version3);
    });

    it("should return null for non-existent PRD versions", async () => {
      const latest = await storage.getLatestPRDVersion("non-existent.md");
      assert.strictEqual(latest, null);
    });
  });
});
