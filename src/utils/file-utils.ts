import { existsSync } from "fs";
import { access, constants } from "fs/promises";
import {
  createStandardError,
  TaskOMaticErrorCodes,
} from "./task-o-matic-error";

/**
 * Validates that a file exists at the given path (synchronous).
 * Throws an error with a custom message if the file doesn't exist.
 *
 * @param filePath - Path to the file to validate
 * @param customMessage - Optional custom error message
 * @throws TaskOMaticError if file doesn't exist
 *
 * @example
 * ```typescript
 * validateFileExists("./config.json", "Configuration file not found");
 * // Throws: TaskOMaticError with code INVALID_INPUT if file doesn't exist
 * ```
 */
export function validateFileExists(
  filePath: string,
  customMessage?: string
): void {
  if (!existsSync(filePath)) {
    throw createStandardError(
      TaskOMaticErrorCodes.INVALID_INPUT,
      customMessage || `File not found: ${filePath}`,
      {
        suggestions: ["Verify the file path is correct."],
      }
    );
  }
}

/**
 * Validates that a file exists at the given path (asynchronous).
 * Throws an error with a custom message if the file doesn't exist.
 *
 * @param filePath - Path to the file to validate
 * @param customMessage - Optional custom error message
 * @throws TaskOMaticError if file doesn't exist
 *
 * @example
 * ```typescript
 * await validateFileExistsAsync("./data.json");
 * // Throws: TaskOMaticError with code INVALID_INPUT if file doesn't exist
 * ```
 */
export async function validateFileExistsAsync(
  filePath: string,
  customMessage?: string
): Promise<void> {
  try {
    await access(filePath, constants.F_OK);
  } catch {
    throw createStandardError(
      TaskOMaticErrorCodes.INVALID_INPUT,
      customMessage || `File not found: ${filePath}`,
      {
        suggestions: ["Verify the file path is correct."],
      }
    );
  }
}

/**
 * Checks if a file exists at the given path (synchronous).
 * Returns true if file exists, false otherwise.
 * Unlike validateFileExists, this doesn't throw an error.
 *
 * @param filePath - Path to check
 * @returns true if file exists, false otherwise
 */
export function fileExists(filePath: string): boolean {
  return existsSync(filePath);
}

/**
 * Checks if a file exists at the given path (asynchronous).
 * Returns true if file exists, false otherwise.
 * Unlike validateFileExistsAsync, this doesn't throw an error.
 *
 * @param filePath - Path to check
 * @returns Promise resolving to true if file exists, false otherwise
 */
export async function fileExistsAsync(filePath: string): Promise<boolean> {
  try {
    await access(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}
