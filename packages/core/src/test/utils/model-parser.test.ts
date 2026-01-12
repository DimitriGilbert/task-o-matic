import assert from "assert";
import { parseModelString } from "../../utils/model-parser";

describe("Model Parser", () => {
  it("should parse simple model string", () => {
    const result = parseModelString("gpt-4o");
    assert.deepStrictEqual(result, {
      provider: undefined,
      model: "gpt-4o",
      reasoning: undefined,
    });
  });

  it("should parse provider and model", () => {
    const result = parseModelString("openai:gpt-4o");
    assert.deepStrictEqual(result, {
      provider: "openai",
      model: "gpt-4o",
      reasoning: undefined,
    });
  });

  it("should parse model with reasoning default budget", () => {
    const result = parseModelString("gpt-4o;reasoning");
    assert.deepStrictEqual(result, {
      provider: undefined,
      model: "gpt-4o",
      reasoning: "2000",
    });
  });

  it("should parse model with explicit reasoning budget", () => {
    const result = parseModelString("gpt-4o;reasoning=5000");
    assert.deepStrictEqual(result, {
      provider: undefined,
      model: "gpt-4o",
      reasoning: "5000",
    });
  });

  it("should parse provider, model, and reasoning", () => {
    const result = parseModelString("anthropic:claude-3-5-sonnet;reasoning=1000");
    assert.deepStrictEqual(result, {
      provider: "anthropic",
      model: "claude-3-5-sonnet",
      reasoning: "1000",
    });
  });

  it("should treat unknown provider as part of model name", () => {
    const result = parseModelString("unknown:model");
    assert.deepStrictEqual(result, {
      provider: undefined,
      model: "unknown:model",
      reasoning: undefined,
    });
  });

  it("should handle complex model names", () => {
    const result = parseModelString("google/gemini-pro-1.5");
    assert.deepStrictEqual(result, {
      provider: undefined,
      model: "google/gemini-pro-1.5",
      reasoning: undefined,
    });
  });
});
