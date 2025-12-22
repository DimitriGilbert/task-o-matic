import { JSONParseResult } from "../../types";

export class JSONParser {
  /**
   * Extracts JSON from text that may contain markdown codeblocks or other formatting
   */
  private extractJSONString(text: string): string | null {
    // Strategy 1: Try to extract from markdown codeblock (```json ... ``` or ``` ... ```)
    const codeblockPatterns = [
      /```json\s*([\s\S]*?)```/i,
      /```JSON\s*([\s\S]*?)```/i,
      /```\s*([\s\S]*?)```/,
    ];

    for (const pattern of codeblockPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const extracted = match[1].trim();
        // Verify it looks like JSON (starts with { or [)
        if (extracted.startsWith("{") || extracted.startsWith("[")) {
          return extracted;
        }
      }
    }

    // Strategy 2: Try to extract JSON object/array directly
    // Determine priority based on which structure appears first
    const firstBrace = text.indexOf("{");
    const firstBracket = text.indexOf("[");

    // Default order
    let directPatterns = [
      /\{[\s\S]*\}/, // Object
      /\[[\s\S]*\]/, // Array
    ];

    // If Array bracket appears before Object brace (and exists), prioritize Array
    if (
      firstBracket !== -1 &&
      (firstBrace === -1 || firstBracket < firstBrace)
    ) {
      directPatterns = [
        /\[[\s\S]*\]/, // Array
        /\{[\s\S]*\}/, // Object
      ];
    }

    // Also consider strict Priority if one is found
    for (const pattern of directPatterns) {
      const match = text.match(pattern);
      if (match) {
        // Quick sanity check: does it parse?
        // This prevents capturing " inner content " when outer content exists but regex failed for some reason
        try {
          JSON.parse(match[0]);
          return match[0];
        } catch (e) {
          // Continue to next pattern if this one isn't valid JSON alone
          // This handles cases where we might match a substring that isn't the full JSON
          continue;
        }
      }
    }

    return null;
  }

  /**
   * Normalizes object keys to handle case variations (e.g., "Tasks" -> "tasks")
   */
  private normalizeKeys(obj: any): any {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.normalizeKeys(item));
    }

    if (typeof obj === "object") {
      const normalized: any = {};
      for (const key in obj) {
        // Convert first letter to lowercase
        const normalizedKey = key.charAt(0).toLowerCase() + key.slice(1);
        normalized[normalizedKey] = this.normalizeKeys(obj[key]);
      }
      return normalized;
    }

    return obj;
  }

  /**
   * Parses JSON from AI text response with improved error handling
   * Now supports:
   * - Extracting from markdown codeblocks (```json, ```JSON, or ```)
   * - Case-insensitive property names (Tasks -> tasks, Summary -> summary)
   * - Multiple extraction strategies
   *
   * @deprecated Use generateObject instead for structured output
   */
  parseJSONFromResponse<T>(text: string): JSONParseResult<T> {
    try {
      // Try to extract JSON from the response (handle various formats)
      const jsonStr = this.extractJSONString(text);

      if (!jsonStr) {
        return {
          success: false,
          error:
            "Could not extract JSON from AI response. No JSON object or codeblock found.",
          rawText: text,
        };
      }

      // Parse the JSON
      let parsed = JSON.parse(jsonStr);

      // Normalize keys to handle case variations (Tasks -> tasks, etc.)
      parsed = this.normalizeKeys(parsed);

      return {
        success: true,
        data: parsed as T,
        rawText: text,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        rawText: text,
      };
    }
  }
}
