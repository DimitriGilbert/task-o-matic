import assert from "assert";
import { TaskIDGenerator } from "../../utils/id-generator";
import { TaskOMaticErrorCodes } from "../../utils/task-o-matic-error";

describe("TaskIDGenerator", () => {
  describe("generate", () => {
    it("should generate ID with default prefix", () => {
      const id = TaskIDGenerator.generate();
      assert.ok(id.startsWith("task-"));
      assert.ok(TaskIDGenerator.validate(id));
    });

    it("should generate ID with custom prefix", () => {
      const id = TaskIDGenerator.generate("custom");
      assert.ok(id.startsWith("custom-"));
      assert.ok(TaskIDGenerator.validate(id));
    });
  });

  describe("validate", () => {
    it("should validate timestamped format", () => {
      assert.strictEqual(TaskIDGenerator.validate("task-123456-abcdef12"), true);
    });

    it("should validate hierarchical format", () => {
      assert.strictEqual(TaskIDGenerator.validate("1.2.3"), true);
    });

    it("should reject invalid format", () => {
      assert.strictEqual(TaskIDGenerator.validate("invalid id"), false);
    });
  });

  describe("Hierarchical IDs", () => {
    it("should generate child ID", () => {
      assert.strictEqual(TaskIDGenerator.generateChildId("1", 1), "1.1");
    });

    it("should parse hierarchical ID", () => {
      const result = TaskIDGenerator.parseHierarchicalId("1.2.3");
      assert.deepStrictEqual(result, { parentId: "1.2", childIndex: 3 });
    });
  });
});
