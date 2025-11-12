import { JSONParseResult } from "../../types";

export class JSONParser {
  /**
   * Parses JSON from AI text response with improved error handling
   * @deprecated Use generateObject instead for structured output
   */
  parseJSONFromResponse<T>(text: string): JSONParseResult<T> {
    try {
      // Try to extract JSON from the response (handle various formats)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return {
          success: false,
          error: "Could not extract JSON from AI response",
          rawText: text,
        };
      }

      const jsonStr = jsonMatch[0];
      const parsed = JSON.parse(jsonStr) as T;

      return {
        success: true,
        data: parsed,
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