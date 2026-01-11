import assert from "assert";
import { isValidAIProvider } from "../lib/validation";

describe("Validation Utils", () => {
  describe("isValidAIProvider", () => {
    it("should return true for valid providers", () => {
      assert.strictEqual(isValidAIProvider("openrouter"), true);
      assert.strictEqual(isValidAIProvider("openai"), true);
      assert.strictEqual(isValidAIProvider("anthropic"), true);
      assert.strictEqual(isValidAIProvider("custom"), true);
    });

    it("should return false for invalid providers", () => {
      assert.strictEqual(isValidAIProvider("invalid"), false);
      assert.strictEqual(isValidAIProvider(""), false);
      assert.strictEqual(isValidAIProvider("gpt-4"), false);
    });
  });
});
