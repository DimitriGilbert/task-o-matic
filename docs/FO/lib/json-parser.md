---
## TECHNICAL BULLETIN NO. 005
### JSON PARSER - DATA EXTRACTION SURVIVAL SYSTEM

**DOCUMENT ID:** `task-o-matic-json-parser-v2`
**CLEARANCE:** `All Personnel`
**MANDATORY COMPLIANCE:** `Yes`

### ⚠️ CRITICAL SURVIVAL NOTICE
Citizen, JSON Parser is your lifeline for extracting structured data from AI responses in chaotic wasteland of unstructured text. Without mastering this extraction system, you're drowning in a sea of malformed JSON and parsing errors.

**This documentation has been updated to reflect the ACTUAL source code reality. Pay attention - the wasteland doesn't forgive those who work with outdated manuals.**

---

### SYSTEM ARCHITECTURE OVERVIEW

JSON Parser provides robust extraction and normalization of JSON data from AI text responses that may contain markdown formatting, code blocks, comments, or other text artifacts. It implements multiple extraction strategies including a sophisticated stack-based approach for nested structures.

**Core Design Principles:**
- **Multi-Strategy Extraction**: Multiple approaches to find JSON in text
- **Stack-Based Parsing**: Robust extraction for nested structures
- **Comment Removal**: Handles "valid JS object" format with comments
- **Trailing Comma Cleanup**: Removes trailing commas before parsing
- **Key Normalization**: Case-insensitive property name handling

**Extraction Strategies**:
1. **Markdown Codeblocks**: Extract from ```json, ```JSON, or generic ``` blocks
2. **Stack-Based Extraction**: Finds balanced JSON objects/arrays using stack algorithm
3. **JSON Cleaning**: Removes comments and trailing commas
4. **Validation**: Verify extracted content starts with { or [
5. **Fallback**: Returns null if extraction fails

---

### COMPLETE API DOCUMENTATION

#### Class: JSONParser

**Purpose**: Extract and normalize JSON from AI text responses with multiple fallback strategies including robust stack-based extraction.

**Constructor**: No explicit constructor required. Stateless utility class.

---

#### Method: extractJSONString()

**Purpose**: Extract JSON string from text using stack-based approach with markdown codeblock fallback.

**Signature**:
```typescript
private extractJSONString(text: string): string | null
```

**Parameters**:
- `text` (string, required): Text containing JSON to extract

**Return Value**:
- `string | null`: Extracted JSON string or null if not found

**Extraction Strategy Order**:

**Strategy 1: Markdown Codeblock Extraction**
```typescript
const codeblockPatterns = [
  /```json\s*([\s\S]*?)```/i,      // ```json ... ```
  /```JSON\s*([\s\S]*?)```/i,      // ```JSON ... ```
  /```\s*([\s\S]*?)```/               // Generic ``` ... ```
];
```

**Strategy 2: Stack-Based Extraction**
- Scans text for all potential start indices `{` or `[`
- For each candidate, attempts to extract balanced structure using `extractBalancedString()`
- Validates extracted JSON by attempting to parse it
- If parse fails, attempts cleaning with `cleanJSON()` (removes comments/trailing commas)
- Returns first valid JSON found

**Validation Logic**:
- Verify extracted content starts with `{` or `[`
- Try parsing with `JSON.parse()`
- If parsing fails, attempt cleaning and retry
- Return first valid match found

**Examples**:

**Markdown Codeblock Extraction**:
```typescript
const parser = new JSONParser();

// Extract from markdown codeblock
const text = `
Here's the response:
\`\`\`json
{
  "tasks": [
    {
      "title": "Build API endpoint",
      "description": "Create REST API for user management"
    }
  ]
}
\`\`\`
`;

const jsonStr = parser.extractJSONString(text);
console.log(jsonStr);
// Output: {
//   "tasks": [
//     {
//       "title": "Build API endpoint",
//       "description": "Create REST API for user management"
//     }
//   ]
// }
```

**Complex Nested Structure (Stack-Based)**:
```typescript
const text = `
The result is:
{
  "project": {
    "name": "MyApp",
    "features": {
      "auth": true,
      "api": [
        {"endpoint": "/users", "method": "GET"},
        {"endpoint": "/posts", "method": "GET"}
      ]
    }
  }
}
`;

const jsonStr = parser.extractJSONString(text);
console.log(jsonStr);
// Output: Correctly extracts the entire nested structure
```

**JSON with Comments**:
```typescript
const text = `
\`\`\`json
{
  // User configuration
  "users": [
    {
      "name": "Alice",  // Admin user
      "role": "admin",
    },  // Trailing comma - valid in JS
    {
      "name": "Bob",
      "role": "user",
    }
  ],
}
\`\`\`
`;

const jsonStr = parser.extractJSONString(text);
// Output: {
//   "users": [
//     {"name": "Alice", "role": "admin"},
//     {"name": "Bob", "role": "user"}
//   ]
// }
// Note: Comments and trailing commas removed automatically
```

---

#### Method: extractBalancedString()

**Purpose**: Extract a balanced JSON string (object or array) starting from a specific index.

**Signature**:
```typescript
private extractBalancedString(
  text: string,
  startIndex: number,
  startChar: string
): string | null
```

**Parameters**:
- `text` (string, required): Full text to search within
- `startIndex` (number, required): Starting index for extraction
- `startChar` (string, required): Opening character (`{` or `[`)

**Return Value**:
- `string | null`: Extracted balanced string or null if balance never achieved

**Balancing Algorithm**:
1. **Initialize**: Set balance counter to 0, track string/escape status
2. **Iterate**: Process each character starting from startIndex
3. **Escape Handling**: Track backslash-escaped characters
4. **String Handling**: Track when inside quoted strings (ignore braces/brackets in strings)
5. **Balance Counting**: Increment balance on startChar, decrement on matching endChar
6. **Return**: When balance reaches 0, return substring from startIndex

**Edge Cases Handled**:
- **Nested Strings**: Braces inside string literals are ignored
- **Escaped Quotes**: Backslash-escaped quotes in strings are handled correctly
- **Nested Structures**: Deep nesting is fully supported

**Examples**:

**Basic Object Extraction**:
```typescript
const text = 'text before {"key": "value"} text after';
const result = parser.extractBalancedString(text, 11, "{");
console.log(result);
// Output: {"key": "value"}
```

**Nested Structure Extraction**:
```typescript
const text = `
{
  "outer": {
    "inner": [
      {"a": 1},
      {"b": 2}
    ]
  }
}
`;

const result = parser.extractBalancedString(text, 0, "{");
console.log(result);
// Output: Full nested object structure with inner arrays
```

**String Handling**:
```typescript
const text = '{"key": "value with {braces} inside"}';
const result = parser.extractBalancedString(text, 0, "{");
console.log(result);
// Output: {"key": "value with {braces} inside"}
// Note: Braces inside string are correctly ignored
```

---

#### Method: cleanJSON()

**Purpose**: Clean JSON string by removing comments and trailing commas.

**Signature**:
```typescript
private cleanJSON(text: string): string
```

**Parameters**:
- `text` (string, required): JSON string to clean

**Return Value**:
- `string`: Cleaned JSON string

**Cleaning Operations**:

**Remove Comments**:
```typescript
// Block comments: /* ... */
text.replace(/\/\*[\s\S]*?\*\//g, "")

// Line comments: // ...
text.replace(/\/\/.*/g, "")
```

**Remove Trailing Commas**:
```typescript
// Trailing comma before } or ]
text.replace(/,(\s*[}\]])/g, "$1")
```

**Examples**:

**Remove Block Comments**:
```typescript
const dirtyJSON = `{
  /* This is a block comment */
  "key": "value",
  /* Another comment */
  "key2": "value2"
}`;

const cleaned = parser.cleanJSON(dirtyJSON);
console.log(cleaned);
// Output: {
//   "key": "value",
//   "key2": "value2"
// }
```

**Remove Line Comments**:
```typescript
const dirtyJSON = `{
  "key": "value",  // This is a line comment
  "key2": "value2"  // Another comment
}`;

const cleaned = parser.cleanJSON(dirtyJSON);
console.log(cleaned);
// Output: {
//   "key": "value",
//   "key2": "value2"
// }
```

**Remove Trailing Commas**:
```typescript
const dirtyJSON = `{
  "items": [
    {"id": 1},
    {"id": 2},
    {"id": 3},  // Trailing comma
  ],
}`;

const cleaned = parser.cleanJSON(dirtyJSON);
console.log(cleaned);
// Output: {
//   "items": [
//     {"id": 1},
//     {"id": 2},
//     {"id": 3}
//   ]
// }
```

---

#### Method: normalizeKeys()

**Purpose**: Normalize object keys to handle case variations (e.g., "Tasks" -> "tasks").

**Signature**:
```typescript
private normalizeKeys(obj: any): any
```

**Parameters**:
- `obj` (any, required): Object to normalize keys for

**Return Value**:
- `any`: Object with normalized keys

**Normalization Rules**:
- **Null/Undefined**: Pass through unchanged
- **Arrays**: Recursively normalize each element
- **Objects**: Convert first letter of each key to lowercase
- **Primitives**: Return unchanged

**Key Transformation**:
```typescript
const normalizedKey = key.charAt(0).toLowerCase() + key.slice(1);
```

**Examples**:

**Basic Key Normalization**:
```typescript
const input = {
  "Title": "Build user interface",
  "Description": "Create React components",
  "STATUS": "todo",
  "Tasks": [
    {"Title": "Component A"},
    {"Title": "Component B"}
  ]
};

const normalized = parser.normalizeKeys(input);
console.log(normalized);
// Output: {
//   "title": "Build user interface",
//   "description": "Create React components",
//   "status": "todo",
//   "tasks": [
//     {"title": "Component A"},
//     {"title": "Component B"}
//   ]
// }
```

**Deep Nested Normalization**:
```typescript
const input = {
  "Project": {
    "Name": "MyApp",
    "Config": {
      "API_URL": "https://api.example.com",
      "TIMEOUT": 5000
    },
    "Features": [
      {
        "Name": "Authentication",
        "Enabled": true
      }
    ]
  }
};

const normalized = parser.normalizeKeys(input);
console.log(normalized);
// Output: {
//   "project": {
//     "name": "MyApp",
//     "config": {
//       "api_url": "https://api.example.com",
//       "timeout": 5000
//     },
//     "features": [
//       {
//         "name": "Authentication",
//         "enabled": true
//       }
//     ]
//   }
// }
```

---

#### Method: parseJSONFromResponse()

**Purpose**: Parse JSON from AI text response with improved error handling, stack-based extraction, comment removal, and key normalization.

**Signature**:
```typescript
parseJSONFromResponse<T>(text: string): JSONParseResult<T>
```

**Parameters**:
- `text` (string, required): AI response text to parse

**Return Value**:
```typescript
JSONParseResult<T> {
  success: boolean;         // True if parsing succeeded
  data?: T;               // Parsed data (if successful)
  error?: string;          // Error message (if failed)
  rawText: string;         // Original text for debugging
}
```

**Processing Pipeline**:
1. **Extraction Attempt**: Try to extract JSON string using multiple strategies (markdown first, then stack-based)
2. **Validation**: Verify JSON string was found
3. **Parsing**: Attempt JSON.parse() on extracted string
4. **Normalization**: Apply key normalization to parsed object
5. **Error Handling**: Catch and report parsing errors

**Error Handling**:
- **No JSON Found**: "Could not extract JSON from AI response. No JSON object or codeblock found."
- **Parse Errors**: Original JSON parsing error message
- **Context Preservation**: Raw text always included for debugging

**Examples**:

**Successful Parsing**:
```typescript
const parser = new JSONParser();

const aiResponse = `
Here's your task breakdown:

\`\`\`json
{
  "subtasks": [
    {
      "title": "Set up development environment",
      "description": "Install dependencies and configure tools",
      "effort": "2 hours"
    },
    {
      "title": "Implement core functionality",
      "description": "Build main features",
      "effort": "8 hours"
    }
  ]
}
\`\`\`
`;

const result = parser.parseJSONFromResponse(aiResponse);
console.log(result);
// Output: {
//   success: true,
//   data: {
//     subtasks: [
//       {
//         title: "Set up development environment",
//         description: "Install dependencies and configure tools",
//         effort: "2 hours"
//       },
//       {
//         title: "Implement core functionality",
//         description: "Build main features",
//         effort: "8 hours"
//       }
//     ]
//   },
//   rawText: "Here's your task breakdown:\n\n```json\n{...}\n```"
// }
```

**Case Normalization**:
```typescript
const aiResponse = `
\`\`\`json
{
  "Tasks": [
    {"Title": "Design database schema", "Effort": "4h"},
    {"Title": "Create API endpoints", "Effort": "6h"}
  ],
  "Summary": "Database and API design"
}
\`\`\`
`;

const result = parser.parseJSONFromResponse(aiResponse);
console.log(result.data);
// Output: {
//   tasks: [
//     {title: "Design database schema", effort: "4h"},
//     {title: "Create API endpoints", effort: "6h"}
//   ],
//   summary: "Database and API design"
// }
```

**Parse Error Handling**:
```typescript
const aiResponse = `
\`\`\`json
{
  "tasks": [
    {"title": "Task 1", "invalid": json}
  ]
}
\`\`\`
`;

const result = parser.parseJSONFromResponse(aiResponse);
console.log(result);
// Output: {
//   success: false,
//   error: "Unexpected token i in JSON at position 45",
//   rawText: "```json\n{...}\n```"
// }
```

**No JSON Found**:
```typescript
const aiResponse = "I apologize, but I cannot generate JSON for this request due to insufficient information.";

const result = parser.parseJSONFromResponse(aiResponse);
console.log(result);
// Output: {
//   success: false,
//   error: "Could not extract JSON from AI response. No JSON object or codeblock found.",
//   rawText: "I apologize, but I cannot generate JSON for this request..."
// }
```

**TypeScript Integration**:
```typescript
interface TaskBreakdown {
  subtasks: Array<{
    title: string;
    description: string;
    effort?: string;
  }>;
}

const result = parser.parseJSONFromResponse<TaskBreakdown>(aiResponse);

if (result.success && result.data) {
  // TypeScript knows result.data is TaskBreakdown
  result.data.subtasks.forEach(subtask => {
    console.log(`Task: ${subtask.title}`);
    console.log(`Effort: ${subtask.effort || 'Unknown'}`);
  });
} else {
  console.error("Failed to parse task breakdown:", result.error);
}
```

**Complex Nested Structure**:
```typescript
const aiResponse = `
\`\`\`json
{
  "Project": {
    "Name": "E-commerce Platform",
    "Phases": [
      {
        "Phase": "Design",
        "Tasks": [
          {"Title": "UI mockups", "Priority": "High"},
          {"Title": "Database design", "Priority": "High"}
        ]
      }
    ]
  },
  "Metadata": {
    "Created": "2024-01-01",
    "Version": "1.0"
  }
}
\`\`\`
`;

const result = parser.parseJSONFromResponse(aiResponse);
console.log(result.data);
// Output: {
//   project: {
//     name: "E-commerce Platform",
//     phases: [
//       {
//         phase: "Design",
//         tasks: [
//           {title: "UI mockups", priority: "High"},
//           {title: "Database design", priority: "High"}
//         ]
//       }
//     ]
//   },
//   metadata: {
//     created: "2024-01-01",
//     version: "1.0"
//   }
// }
```

---

### INTEGRATION PROTOCOLS

#### Extraction Strategy Protocol
JSON extraction follows this priority:
1. **Markdown JSON Blocks**: ```json or ```JSON codeblocks (first attempt)
2. **Markdown Generic Blocks**: ``` codeblocks (no language specified)
3. **Stack-Based Extraction**: Find all `{` and `[` candidates, extract balanced structures
4. **Cleaning**: Try removing comments and trailing commas
5. **Failure**: Return null if no valid JSON found

#### Normalization Protocol
Key normalization follows these rules:
1. **First Letter**: Convert to lowercase
2. **Remaining Letters**: Preserve original case
3. **Recursive Processing**: Apply to all nested objects
4. **Array Handling**: Process each element individually
5. **Primitive Preservation**: Leave non-objects unchanged

#### Error Handling Protocol
Error processing follows this pattern:
1. **Extraction Failure**: Clear message about missing JSON
2. **Parse Failure**: Original JSON parsing error message
3. **Context Preservation**: Always include raw text
4. **Type Safety**: Return typed result structure

### SURVIVAL SCENARIOS

#### Scenario 1: Robust AI Response Parsing
```typescript
class AIResponseProcessor {
  private jsonParser = new JSONParser();

  processTaskBreakdown(response: string): TaskBreakdown | null {
    const result = this.jsonParser.parseJSONFromResponse<TaskBreakdown>(response);

    if (!result.success) {
      console.error("Failed to parse AI response:", result.error);
      console.debug("Raw response:", result.rawText);
      return null;
    }

    return result.data || null;
  }

  processPRDParse(response: string): PRDResult | null {
    const result = this.jsonParser.parseJSONFromResponse<PRDResult>(response);

    if (!result.success) {
      // Try alternative parsing for malformed responses
      const fallback = this.tryAlternativeParsing(response);
      return fallback;
    }

    return result.data || null;
  }

  private tryAlternativeParsing(response: string): PRDResult | null {
    // Handle cases where AI returns malformed but fixable JSON
    try {
      // The new implementation already tries cleaning automatically
      // This fallback is for other edge cases
      const result = this.jsonParser.parseJSONFromResponse<PRDResult>(response);
      return result.success ? result.data || null : null;
    } catch {
      return null;
    }
  }
}
```

#### Scenario 2: Multi-Format Response Handling
```typescript
class UniversalResponseParser {
  private jsonParser = new JSONParser();

  parseAnyResponse(response: string): ParsedResult {
    // Try JSON parsing first (now with robust stack-based extraction)
    const jsonResult = this.jsonParser.parseJSONFromResponse(response);
    if (jsonResult.success) {
      return {
        type: 'json',
        data: jsonResult.data,
        raw: response
      };
    }

    // Try YAML parsing (if implemented)
    const yamlResult = this.tryYamlParsing(response);
    if (yamlResult.success) {
      return {
        type: 'yaml',
        data: yamlResult.data,
        raw: response
      };
    }

    // Try plain text extraction
    const textResult = this.extractPlainText(response);
    return {
      type: 'text',
      data: textResult,
      raw: response
    };
  }

  private extractPlainText(response: string): { title?: string; content?: string } {
    // Extract structured info from unstructured text
    const lines = response.split('\n').filter(line => line.trim());

    const title = lines.find(line =>
      line.toLowerCase().includes('title:') ||
      line.toLowerCase().includes('summary:')
    );

    const content = lines.filter(line =>
      !line.toLowerCase().includes('title:') &&
      !line.toLowerCase().includes('summary:')
    ).join('\n');

    return {
      title: title?.split(':')[1]?.trim(),
      content: content.trim() || undefined
    };
  }
}
```

#### Scenario 3: Error Recovery and Validation
```typescript
class RobustJSONParser {
  private jsonParser = new JSONParser();

  parseWithValidation<T>(response: string, schema?: ValidationSchema<T>): ValidationResult<T> {
    const parseResult = this.jsonParser.parseJSONFromResponse<T>(response);

    if (!parseResult.success) {
      return {
        success: false,
        error: parseResult.error,
        raw: response,
        data: undefined
      };
    }

    const data = parseResult.data!;

    // Validate against schema if provided
    if (schema) {
      const validation = this.validateAgainstSchema(data, schema);
      if (!validation.valid) {
        return {
          success: false,
          error: `Validation failed: ${validation.errors.join(', ')}`,
          raw: response,
          data: undefined
        };
      }
    }

    // Additional business logic validation
    const businessValidation = this.validateBusinessRules(data);
    if (!businessValidation.valid) {
      return {
        success: false,
        error: `Business validation failed: ${businessValidation.errors.join(', ')}`,
        raw: response,
        data: undefined
      };
    }

    return {
      success: true,
      data,
      raw: response
    };
  }

  private validateAgainstSchema<T>(data: T, schema: ValidationSchema<T>): ValidationResult {
    // Implement schema validation logic
    const errors: string[] = [];

    for (const [key, rules] of Object.entries(schema)) {
      const value = (data as any)[key];

      if (rules.required && (value === undefined || value === null)) {
        errors.push(`${key} is required`);
      }

      if (rules.type && typeof value !== rules.type) {
        errors.push(`${key} must be of type ${rules.type}`);
      }

      if (rules.validator && !rules.validator(value)) {
        errors.push(`${key} failed custom validation`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  private validateBusinessRules<T>(data: T): ValidationResult {
    // Implement business-specific validation
    const errors: string[] = [];

    // Example: Check if arrays have required structure
    if ((data as any).tasks && !Array.isArray((data as any).tasks)) {
      errors.push('tasks must be an array');
    }

    // Example: Check for required fields in nested objects
    if ((data as any).project && !(data as any).project.name) {
      errors.push('project.name is required');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
```

#### Scenario 4: Performance Monitoring and Debugging
```typescript
class MonitoredJSONParser {
  private jsonParser = new JSONParser();
  private metrics = {
    totalParseAttempts: 0,
    successfulParses: 0,
    failedParses: 0,
    extractionStrategies: {
      markdown: 0,
      stackBased: 0,
      failed: 0
    }
  };

  parseWithMetrics<T>(response: string): ParseResult<T> {
    this.metrics.totalParseAttempts++;

    const startTime = Date.now();
    const result = this.jsonParser.parseJSONFromResponse<T>(response);
    const duration = Date.now() - startTime;

    if (result.success) {
      this.metrics.successfulParses++;

      // Track which extraction strategy worked
      if (response.includes('```json') || response.includes('```JSON')) {
        this.metrics.extractionStrategies.markdown++;
      } else if (response.includes('{') || response.includes('[')) {
        this.metrics.extractionStrategies.stackBased++;
      }
    } else {
      this.metrics.failedParses++;
      this.metrics.extractionStrategies.failed++;
    }

    // Log performance metrics
    console.log(`Parse attempt ${this.metrics.totalParseAttempts}:`, {
      success: result.success,
      duration: `${duration}ms`,
      strategy: result.success ?
        (response.includes('```') ? 'markdown' : 'stackBased') : 'failed'
    });

    return {
      ...result,
      metrics: {
        attempt: this.metrics.totalParseAttempts,
        duration,
        strategy: result.success ?
          (response.includes('```') ? 'markdown' : 'stackBased') : 'failed'
      }
    };
  }

  getMetrics() {
    const successRate = (this.metrics.successfulParses / this.metrics.totalParseAttempts) * 100;

    return {
      ...this.metrics,
      successRate: `${successRate.toFixed(2)}%`,
      extractionStrategyDistribution: {
        markdown: `${(this.metrics.extractionStrategies.markdown / this.metrics.totalParseAttempts * 100).toFixed(2)}%`,
        stackBased: `${(this.metrics.extractionStrategies.stackBased / this.metrics.totalParseAttempts * 100).toFixed(2)}%`,
        failed: `${(this.metrics.extractionStrategies.failed / this.metrics.totalParseAttempts * 100).toFixed(2)}%`
      }
    };
  }

  resetMetrics() {
    this.metrics = {
      totalParseAttempts: 0,
      successfulParses: 0,
      failedParses: 0,
      extractionStrategies: {
        markdown: 0,
        stackBased: 0,
        failed: 0
      }
    };
  }
}
```

---

### TECHNICAL SPECIFICATIONS

#### Performance Characteristics
- **Extraction Speed**: O(n²) for stack-based extraction (worst case: all candidates), O(n) for markdown extraction
- **Memory Usage**: Minimal temporary string allocations
- **Regex Efficiency**: Optimized patterns for common cases
- **Recursive Depth**: Handles deeply nested structures

#### Reliability Features
- **Multiple Strategies**: Fallback extraction methods (markdown + stack-based)
- **Comment Removal**: Handles "valid JS object" format with comments
- **Trailing Comma Cleanup**: Removes trailing commas before parsing
- **Case Insensitivity**: Robust key normalization
- **Error Preservation**: Original error messages maintained

#### Limitations and Considerations
- **Malformed JSON**: Cannot fix fundamentally broken JSON structure (mismatched braces/brackets)
- **Multiple JSON Objects**: Extracts first valid match only (by design)
- **Binary Data**: Not designed for binary or non-text content
- **Performance**: Large texts may require optimization for candidate scanning

#### Security Considerations
- **Code Injection**: JSON parsing prevents code execution (standard JSON.parse)
- **Memory Safety**: No eval() or unsafe parsing
- **Input Validation**: All inputs validated before processing
- **Error Sanitization**: Error messages preserved as-is

---

**Remember:** Citizen, JSON Parser is your metal detector in minefield of AI responses. The new stack-based extraction provides robust parsing even for deeply nested structures, while automatic comment and trailing comma cleanup handles "valid JS object" formats. Master these extraction techniques, or watch your system collapse under weight of malformed responses.

This documentation reflects the ACTUAL source code with stack-based extraction, comment removal, and trailing comma cleanup features. Version discrepancies indicate you're working from outdated information. Stay vigilant, stay updated.

---

**END OF BULLETIN**
