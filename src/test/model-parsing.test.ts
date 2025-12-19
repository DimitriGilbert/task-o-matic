import assert from "assert";
import { parseModelString } from "../commands/prd";

describe("parseModelString", () => {
  it("parses simple provider:model", () => {
    const result = parseModelString("anthropic:claude-3");
    assert.deepStrictEqual(result, {
      provider: "anthropic",
      model: "claude-3",
      reasoning: undefined,
    });
  });

  it("parses model only (implicit provider)", () => {
    const result = parseModelString("claude-3");
    assert.deepStrictEqual(result, {
      provider: undefined,
      model: "claude-3",
      reasoning: undefined,
    });
  });

  it("parses model with colons (unknown provider)", () => {
    const result = parseModelString("google/gemini:free");
    assert.deepStrictEqual(result, {
      provider: undefined,
      model: "google/gemini:free",
      reasoning: undefined,
    });
  });

  it("parses provider and model with colons", () => {
    const result = parseModelString("openrouter:google/gemini:free");
    assert.deepStrictEqual(result, {
      provider: "openrouter",
      model: "google/gemini:free",
      reasoning: undefined,
    });
  });

  it("parses reasoning flag (default budget)", () => {
    const result = parseModelString("anthropic:claude-3;reasoning");
    assert.deepStrictEqual(result, {
      provider: "anthropic",
      model: "claude-3",
      reasoning: "2000",
    });
  });

  it("parses reasoning with specific budget", () => {
    const result = parseModelString("anthropic:claude-3;reasoning=1000");
    assert.deepStrictEqual(result, {
      provider: "anthropic",
      model: "claude-3",
      reasoning: "1000",
    });
  });

  it("parses reasoning with complex model name", () => {
    const result = parseModelString(
      "openrouter:google/gemini:free;reasoning=5000"
    );
    assert.deepStrictEqual(result, {
      provider: "openrouter",
      model: "google/gemini:free",
      reasoning: "5000",
    });
  });

  it("parses reasoning with model only", () => {
    const result = parseModelString("claude-3;reasoning");
    assert.deepStrictEqual(result, {
      provider: undefined,
      model: "claude-3",
      reasoning: "2000",
    });
  });
});
