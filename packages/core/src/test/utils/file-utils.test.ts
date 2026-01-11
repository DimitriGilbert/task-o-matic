import assert from "assert";
import { join } from "path";
import { existsSync, mkdirSync, rmdirSync, writeFileSync } from "fs";
import { fileExists, validateFileExists, validateFileExistsAsync, fileExistsAsync, savePRDFile, saveStackFile, loadStackFile } from "../../utils/file-utils";
import { configManager } from "../../lib/config";
import { TaskOMaticErrorCodes } from "../../utils/task-o-matic-error";

describe("File Utilities", () => {
  let testDir: string;

  before(function () {
    testDir = join(process.cwd(), "temp-test-file-utils");
    if (!existsSync(testDir)) {
      mkdirSync(testDir);
    }
    configManager.setWorkingDirectory(testDir);
  });

  after(function () {
    try {
        if (existsSync(testDir)) {
             rmdirSync(testDir, { recursive: true });
        }
    } catch (e) {
        // Ignore cleanup errors
    }
  });

  describe("Validation", () => {
    it("validateFileExists should pass for existing file", () => {
      const existingFile = join(testDir, "exist.txt");
      writeFileSync(existingFile, "content");
      assert.doesNotThrow(() => validateFileExists(existingFile));
    });

    it("validateFileExists should throw for missing file", () => {
      const missingFile = join(testDir, "missing.txt");
      assert.throws(() => validateFileExists(missingFile), (err: any) => {
        return err.code === TaskOMaticErrorCodes.INVALID_INPUT;
      });
    });

    it("validateFileExistsAsync should pass for existing file", async () => {
      const existingFile = join(testDir, "exist-async.txt");
      writeFileSync(existingFile, "content");
      await validateFileExistsAsync(existingFile);
    });
  });

  describe("Existence Check", () => {
    it("fileExists should return true for existing file", () => {
      const existingFile = join(testDir, "exist-check.txt");
      writeFileSync(existingFile, "content");
      assert.strictEqual(fileExists(existingFile), true);
    });

    it("fileExists should return false for missing file", () => {
      const missingFile = join(testDir, "missing-check.txt");
      assert.strictEqual(fileExists(missingFile), false);
    });
  });

  describe("PRD File", () => {
      it("savePRDFile should save file to default location", () => {
          const content = "# PRD Content";
          const path = savePRDFile(content);
          assert.ok(existsSync(path));
      });
  });

  describe("Stack File", () => {
      it("saveStackFile should save and load json", () => {
          const data = { foo: "bar" };
          const path = saveStackFile(data);
          assert.ok(existsSync(path));
          const loaded = loadStackFile<{ foo: string }>();
          assert.deepStrictEqual(loaded, data);
      });
  });
});
