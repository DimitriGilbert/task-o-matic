import { JSONParseResult } from "../../types";

export class JSONParser {
  /**
   * Extracts JSON from text that may contain markdown codeblocks or other formatting
   */
  /**
   * Extracts the first valid JSON object or array from text using a stack-based approach
   * This is much more robust than regex for nested structures or text with multiple brace pairs
   */
  private extractJSONString(text: string): string | null {
    // 1. Try to extract from markdown codeblock first (most reliable)
    const codeblockPatterns = [
      /```json\s*([\s\S]*?)```/i,
      /```JSON\s*([\s\S]*?)```/i,
      /```\s*([\s\S]*?)```/,
    ];

    for (const pattern of codeblockPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    // 2. Stack-based extraction for raw text
    // Find all potential start indices ({ or [)
    const candidates: Array<{ start: number; char: string }> = [];
    for (let i = 0; i < text.length; i++) {
      if (text[i] === "{" || text[i] === "[") {
        candidates.push({ start: i, char: text[i] });
      }
    }
    // console.log(
    //   `[DEBUG] Found ${candidates.length} candidates for JSON extraction`
    // );

    // Try to extract a valid JSON from each candidate start
    for (const candidate of candidates) {
      const extracted = this.extractBalancedString(
        text,
        candidate.start,
        candidate.char
      );
      if (extracted) {
        // 1. Try raw parse first (safest if valid JSON)
        try {
          JSON.parse(extracted);
          return extracted;
        } catch (e) {
          // Ignore, fall through to cleaning
        }

        // 2. Try cleaning (comments, trailing commas)
        try {
          const cleaned = this.cleanJSON(extracted);
          JSON.parse(cleaned);
          return cleaned;
        } catch (e) {
          // console.error(
          //   `[DEBUG] JSON Parse failed for candidate at index ${candidate.start}:`,
          //   e
          // );
          // If parse fails, continue to next candidate
          continue;
        }
      }
    }

    return null;
  }

  /**
   * Extracts a balanced string starting from a specific index
   */
  private extractBalancedString(
    text: string,
    startIndex: number,
    startChar: string
  ): string | null {
    const endChar = startChar === "{" ? "}" : "]";
    let balance = 0;
    let inString = false;
    let escaped = false;

    for (let i = startIndex; i < text.length; i++) {
      const char = text[i];

      if (escaped) {
        escaped = false;
        continue;
      }

      if (char === "\\") {
        escaped = true;
        continue;
      }

      if (char === '"') {
        inString = !inString;
        continue;
      }

      if (!inString) {
        if (char === startChar) {
          balance++;
        } else if (char === endChar) {
          balance--;
          if (balance === 0) {
            return text.substring(startIndex, i + 1);
          }
        }
      }
    }

    return null;
  }

  /**
   * Cleans JSON string by removing comments and trailing commas
   * This handles "valid JS object" format that LLMs often output
   */
  private cleanJSON(text: string): string {
    return text
      .replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, "") // Remove comments
      .replace(/,(\s*[}\]])/g, "$1") // Remove trailing commas
      .trim();
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
   * - Stack-based extraction for robustness against surrounding text
   * - Comment and trailing comma removal
   * - Case-insensitive property names
   */
  parseJSONFromResponse<T>(text: string): JSONParseResult<T> {
    // console.log(`[DEBUG] JSONParser received text (${text.length} chars)`);
    // console.log(
    //   `[DEBUG] First 100 chars: ${JSON.stringify(text.substring(0, 100))}`
    // );
    // console.log(`[DEBUG] Last 100 chars: ${JSON.stringify(text.slice(-100))}`);

    try {
      // Try to extract JSON from the response
      const jsonStr = this.extractJSONString(text);

      if (!jsonStr) {
        // console.error("[DEBUG] extractJSONString returned null");
        return {
          success: false,
          error:
            "Could not extract JSON from AI response. No JSON object or codeblock found.",
          rawText: text,
        };
      }

      // Parse the JSON (it should be clean now)
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
