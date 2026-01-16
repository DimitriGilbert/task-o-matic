## TECHNICAL BULLETIN NO. 008
### AI CONFIG BUILDER - AI CONFIGURATION CONSTRUCTION SYSTEM

**DOCUMENT ID:** `task-o-matic-ai-config-builder-v2`
**CLEARANCE:** `All Personnel`
**MANDATORY COMPLIANCE:** `Yes`

### ⚠️ CRITICAL SURVIVAL NOTICE

Citizen, the AI config builder is your translation module between the wasteland of CLI arguments and the internal bunker systems. Without it, your `aiProvider`, `aiModel`, and `aiKey` flags are just meaningless strings floating in the radioactive void. This utility converts them into proper configuration objects that the AI systems can actually use.

Think of it as the universal translator for Pre-Crisis Era technology to Survival System interfaces.

---

### ⚙️ CORE ARCHITECTURE

The AI configuration builder is a **simple transformation utility** with zero complexity:

- **Purpose**: Convert CLI-style AI options (`aiProvider`, `aiModel`, etc.) into internal AI configuration format
- **No Validation**: Pure transformation only. Input validation happens elsewhere
- **No Error Throwing**: Returns empty object for missing options, never crashes
- **Type Safe**: TypeScript ensures correct property mapping at compile time

**Why This Exists**: Prior to this utility, 10+ files duplicated the same transformation logic. Now we have one source of truth.

---

## 📋 TYPE DEFINITIONS

### AIOptions Interface

```typescript
export interface AIOptions {
  aiProvider?: string;
  aiModel?: string;
  aiKey?: string;
  aiProviderUrl?: string;
  aiReasoning?: string;
}
```

**Purpose**: CLI-friendly options format used by command-line arguments

**Properties**:

| Property | Type | Optional? | Description |
|----------|------|-----------|-------------|
| `aiProvider` | string | Yes | AI provider identifier |
| `aiModel` | string | Yes | Model name/identifier |
| `aiKey` | string | Yes | API authentication key |
| `aiProviderUrl` | string | Yes | Custom endpoint URL |
| `aiReasoning` | string | Yes | Reasoning token limit (string that gets parsed to number) |

---

## 🛠️ FUNCTIONS

### buildAIConfig

**Signature:**
```typescript
function buildAIConfig(options?: AIOptions): Partial<AIConfig>
```

**Purpose**: Transform CLI-style options into internal AI configuration format

**Parameters:**

| Parameter | Type | Optional? | Description |
|-----------|------|-----------|-------------|
| `options` | `AIOptions` | Yes | CLI options to transform |

**Returns:** `Partial<AIConfig>` - Partial configuration object with transformed properties

**Behavior:**
- Returns empty object `{}` if `options` is `undefined` or `null`
- Only includes properties that have truthy values in the input
- Performs direct property name transformation:
  - `aiProvider` → `provider`
  - `aiModel` → `model`
  - `aiKey` → `apiKey`
  - `aiProviderUrl` → `baseURL`
  - `aiReasoning` → `reasoning.maxTokens` (via `parseInt`)
- **No runtime validation** - trusts input values
- **No error throwing** - never fails

---

## 📝 TRANSFORMATION MAPPING

### Property Transformations

| Input (`AIOptions`) | Output (`AIConfig`) | Transformation Logic |
|-------------------|-------------------|---------------------|
| `aiProvider` | `provider` | Direct assignment with type assertion |
| `aiModel` | `model` | Direct assignment |
| `aiKey` | `apiKey` | Direct assignment |
| `aiProviderUrl` | `baseURL` | Direct assignment |
| `aiReasoning` | `reasoning.maxTokens` | `parseInt(input, 10)` |

### Type Assertions

The function asserts `aiProvider` as one of these literal types:
```typescript
"openrouter" | "openai" | "anthropic" | "custom"
```

**Note:** The `AIConfig` type definition in `types/index.ts` supports additional providers (`"gemini"`, `"zai"`), but the builder only transforms the four primary providers.

---

## 📚 USAGE EXAMPLES

### Example 1: Complete Configuration

```typescript
import { buildAIConfig } from "task-o-matic-core";

// From CLI arguments
const cliOptions = {
  aiProvider: "anthropic",
  aiModel: "claude-3.5-sonnet",
  aiKey: process.env.ANTHROPIC_API_KEY,
  aiProviderUrl: undefined,
  aiReasoning: "5000"
};

const config = buildAIConfig(cliOptions);
// Result:
// {
//   provider: "anthropic",
//   model: "claude-3.5-sonnet",
//   apiKey: "sk-ant-...",
//   reasoning: { maxTokens: 5000 }
// }
```

### Example 2: Minimal Configuration

```typescript
// Only essential options
const minimalConfig = buildAIConfig({
  aiProvider: "openai",
  aiModel: "gpt-4",
  aiKey: process.env.OPENAI_API_KEY
});

// Result:
// {
//   provider: "openai",
//   model: "gpt-4",
//   apiKey: "sk-..."
// }
```

### Example 3: Custom Provider

```typescript
const customProviderConfig = buildAIConfig({
  aiProvider: "custom",
  aiModel: "llama-3-70b",
  aiKey: process.env.CUSTOM_API_KEY,
  aiProviderUrl: "https://api.my-custom-ai.com/v1"
});

// Result:
// {
//   provider: "custom",
//   model: "llama-3-70b",
//   apiKey: "custom-key...",
//   baseURL: "https://api.my-custom-ai.com/v1"
// }
```

### Example 4: Empty Input

```typescript
const emptyConfig = buildAIConfig(undefined);
// Result: {}

const nullConfig = buildAIConfig(null);
// Result: {}
```

### Example 5: Partial Configuration with Falsy Values

```typescript
const partialConfig = buildAIConfig({
  aiProvider: "anthropic",
  aiModel: "",           // Empty string - falsy, excluded
  aiKey: undefined,      // Undefined - excluded
  aiReasoning: "8000"    // Truthy string - included
});

// Result:
// {
//   provider: "anthropic",
//   reasoning: { maxTokens: 8000 }
// }
```

---

## 🔧 INTEGRATION PATTERNS

### Pattern 1: CLI Command Integration

```typescript
// In CLI command file
import { buildAIConfig } from "task-o-matic-core";

export async function createTask(options: {
  aiProvider?: string;
  aiModel?: string;
  aiKey?: string;
  aiReasoning?: string;
}) {
  const aiConfig = buildAIConfig(options);

  // Use with AI service
  const result = await aiService.enhanceTask(taskId, {
    ...aiConfig,
    streamingOptions: { enabled: true }
  });
}
```

### Pattern 2: Environment Variable Mapping

```typescript
function loadEnvAIConfig() {
  return buildAIConfig({
    aiProvider: process.env.AI_PROVIDER,
    aiModel: process.env.AI_MODEL,
    aiKey: process.env.OPENAI_API_KEY,
    aiProviderUrl: process.env.CUSTOM_API_URL,
    aiReasoning: process.env.AI_REASONING_TOKENS
  });
}
```

### Pattern 3: Configuration Merging

```typescript
// Merge CLI options with default config
const defaultConfig = {
  provider: "anthropic",
  model: "claude-3.5-sonnet"
};

const cliOverride = buildAIConfig({
  aiProvider: "openrouter",
  aiModel: "anthropic/claude-3.5-sonnet"
});

const finalConfig = {
  ...defaultConfig,
  ...cliOverride
};
```

---

## ⚠️ IMPORTANT LIMITATIONS

### What This Utility Does NOT Do

1. **No Runtime Validation**: The function does not validate that:
   - `aiProvider` is one of the supported values
   - `aiModel` is a valid model name for the provider
   - `aiKey` is a properly formatted API key
   - `aiProviderUrl` is a valid URL format
   - `aiReasoning` can be parsed as a number

2. **No Error Handling**: The function never throws errors:
   - Invalid inputs are silently excluded
   - `parseInt` failures on `aiReasoning` result in `NaN`

3. **No Provider Default Values**: The function does not supply defaults:
   - If you omit `aiProvider`, `provider` is not in the result
   - If you omit `aiModel`, `model` is not in the result

4. **No Provider-specific Logic**: All providers are treated identically:
   - No special handling for OpenRouter reasoning
   - No model aliasing or name normalization
   - No key selection logic based on provider

5. **Limited Provider Support**: Only transforms four providers:
   - `"openrouter" | "openai" | "anthropic" | "custom"`
   - Does not transform `"gemini"` or `"zai"` providers (even though they exist in types)

---

## 🔍 BEHAVIORAL DETAILS

### parseInt Behavior

```typescript
// Valid number strings
buildAIConfig({ aiReasoning: "5000" })
// Result: { reasoning: { maxTokens: 5000 } }

// Invalid strings
buildAIConfig({ aiReasoning: "invalid" })
// Result: { reasoning: { maxTokens: NaN } }

// Edge cases
buildAIConfig({ aiReasoning: "" })
// Result: {} (empty string is falsy, property excluded)

buildAIConfig({ aiReasoning: "0" })
// Result: { reasoning: { maxTokens: 0 } } (0 is truthy in parseInt)
```

### Property Order

The returned object maintains this property order:
1. `provider` (if provided)
2. `model` (if provided)
3. `apiKey` (if provided)
4. `baseURL` (if provided)
5. `reasoning` (if provided)

### Conditional Spread Behavior

```typescript
// All truthy values included
buildAIConfig({
  aiProvider: "anthropic",     // truthy → included
  aiModel: "claude-3.5",       // truthy → included
  aiKey: "sk-ant-...",         // truthy → included
  aiProviderUrl: "https://...", // truthy → included
  aiReasoning: "5000"          // truthy → included
})
// Result includes all 5 properties

// Falsy values excluded
buildAIConfig({
  aiProvider: "",           // falsy → excluded
  aiModel: undefined,       // falsy → excluded
  aiKey: null,              // falsy → excluded
  aiProviderUrl: undefined, // falsy → excluded
  aiReasoning: undefined    // falsy → excluded
})
// Result: {}
```

---

## 🧪 TESTING RECOMMENDATIONS

### Test Cases

```typescript
import assert from "assert";

// Test 1: Complete configuration
assert.deepStrictEqual(
  buildAIConfig({
    aiProvider: "anthropic",
    aiModel: "claude-3.5-sonnet",
    aiKey: "sk-test",
    aiProviderUrl: "https://api.test.com",
    aiReasoning: "8000"
  }),
  {
    provider: "anthropic",
    model: "claude-3.5-sonnet",
    apiKey: "sk-test",
    baseURL: "https://api.test.com",
    reasoning: { maxTokens: 8000 }
  }
);

// Test 2: Empty/undefined input
assert.deepStrictEqual(buildAIConfig(undefined), {});
assert.deepStrictEqual(buildAIConfig(null), {});

// Test 3: Falsy values excluded
assert.deepStrictEqual(
  buildAIConfig({
    aiProvider: "anthropic",
    aiModel: "",
    aiKey: undefined
  }),
  { provider: "anthropic" }
);

// Test 4: Only provider
assert.deepStrictEqual(
  buildAIConfig({ aiProvider: "openai" }),
  { provider: "openai" }
);

// Test 5: Reasoning parsing
assert.deepStrictEqual(
  buildAIConfig({ aiReasoning: "5000" }),
  { reasoning: { maxTokens: 5000 } }
);
```

---

## ❓ FREQUENTLY ASKED QUESTIONS FROM THE FIELD

**Q: Why doesn't this utility validate input?**

A: Citizen, validation is handled at the service layer where we have context about what's actually being done. This utility is a pure transformation function—keep it simple, let others do the checking.

**Q: What happens if I pass an invalid provider name?**

A: The function will still return it. The type assertion says "trust me, it's one of the four providers," but at runtime, anything goes. If you pass `aiProvider: "invalid"`, you'll get `{ provider: "invalid" }` back. The error will surface when the AI service tries to use it.

**Q: Can I use this with "gemini" or "zai" providers?**

A: The transformation logic only handles the four primary providers (`openrouter`, `openai`, `anthropic`, `custom`). For `gemini` or `zai`, you'd need to extend the type assertion or build the config object manually.

**Q: Why is `aiReasoning` a string if it's converted to a number?**

A: CLI arguments are always strings. The builder handles the conversion so you don't have to remember to parse it everywhere.

**Q: What if `parseInt(aiReasoning, 10)` fails?**

A: You'll get `NaN` in the `maxTokens` value. The AI service will likely reject this when it tries to use it. Input validation prevents this scenario in practice.

**Q: Can I chain multiple `buildAIConfig` calls to merge configs?**

A: Not directly—use object spread instead:
```typescript
const merged = {
  ...buildAIConfig(config1),
  ...buildAIConfig(config2)
};
```

**Q: Why does this return `Partial<AIConfig>` instead of `AIConfig`?**

A: Because not all properties are required, and missing values are excluded rather than set to undefined. This allows for flexible partial configuration that can be merged with defaults elsewhere.

---

## 🏁 FINAL REMINDER

Citizen, the AI config builder is simple by design. It doesn't validate, it doesn't throw errors, it doesn't load defaults. It transforms one object format to another, nothing more.

Use it where you need to bridge CLI arguments to internal configuration, and handle validation elsewhere in your systems.

**Remember:** In the post-apocalyptic codebase, simple utilities survive. Complex ones break under pressure. Keep it clean, keep it simple, and live to refactor another day.

---

**DOCUMENT CONTROL:**

- **Version:** 2.0 (Revised for accuracy)
- **Clearance:** All Personnel
- **Classification:** Public Documentation

[Build well. Configure wisely. Survive.]
