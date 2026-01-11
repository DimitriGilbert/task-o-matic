import { createStandardError, TaskOMaticErrorCodes } from "task-o-matic-core";

/**
 * Validate that exactly one of two mutually exclusive options is provided
 *
 * @param options - The command options object
 * @param field1 - First field name in options
 * @param field2 - Second field name in options
 * @param field1Label - Display label for first field (defaults to field1)
 * @param field2Label - Display label for second field (defaults to field2)
 * @throws TaskOMaticError if neither or both fields are provided
 *
 * @example
 * ```typescript
 * validateMutuallyExclusive(options, "taskId", "all", "task-id", "all");
 * ```
 */
export function validateMutuallyExclusive(
  options: any,
  field1: string,
  field2: string,
  field1Label: string = field1,
  field2Label: string = field2
): void {
  const has1 = Boolean(options[field1]);
  const has2 = Boolean(options[field2]);

  if (!has1 && !has2) {
    throw createStandardError(
      TaskOMaticErrorCodes.INVALID_INPUT,
      `Either --${field1Label} or --${field2Label} must be specified`
    );
  }
  if (has1 && has2) {
    throw createStandardError(
      TaskOMaticErrorCodes.INVALID_INPUT,
      `Cannot specify both --${field1Label} and --${field2Label}`
    );
  }
}

/**
 * Field specification for validateOneRequired
 */
export interface FieldSpec {
  name: string; // Field name in options object
  label: string; // Display label for CLI flag
}

/**
 * Validate that exactly one of multiple mutually exclusive options is provided
 *
 * @param options - The command options object
 * @param fields - Array of field specifications
 * @throws TaskOMaticError if none or multiple fields are provided
 *
 * @example
 * ```typescript
 * validateOneRequired(options,
 *   { name: "taskId", label: "task-id" },
 *   { name: "all", label: "all" },
 *   { name: "status", label: "status" }
 * );
 * ```
 */
export function validateOneRequired(
  options: any,
  ...fields: FieldSpec[]
): void {
  const provided = fields.filter((f) => Boolean(options[f.name]));

  if (provided.length === 0) {
    const labels = fields.map((f) => `--${f.label}`).join(", ");
    throw createStandardError(
      TaskOMaticErrorCodes.INVALID_INPUT,
      `One of ${labels} must be specified`
    );
  }
  if (provided.length > 1) {
    const labels = provided.map((f) => `--${f.label}`).join(", ");
    throw createStandardError(
      TaskOMaticErrorCodes.INVALID_INPUT,
      `Cannot specify multiple options: ${labels}`
    );
  }
}

/**
 * Parse a comma-separated string option into an array of trimmed non-empty strings
 *
 * @param value - Comma-separated string value
 * @returns Array of trimmed non-empty strings
 *
 * @example
 * ```typescript
 * const ids = parseCsvOption("1, 2, 3"); // ["1", "2", "3"]
 * const tags = parseCsvOption("bug,feature,  "); // ["bug", "feature"]
 * ```
 */
export function parseCsvOption(value: string): string[] {
  return value
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}
