import chalk from "chalk";

/**
 * Display the start of an operation
 *
 * @param operation - Name of the operation (e.g., "Enhancing", "Splitting")
 * @param target - Target of the operation (e.g., task title, file name)
 *
 * @example
 * ```typescript
 * displayOperationStart("Enhancing", "task-123");
 * // Output: 🚀 Enhancing task-123...
 * ```
 */
export function displayOperationStart(operation: string, target: string): void {
  console.log(chalk.blue(`\n🚀 ${operation} ${target}...`));
}

/**
 * Display successful completion of an operation
 *
 * @param operation - Name of the operation
 * @param details - Optional details to append
 *
 * @example
 * ```typescript
 * displayOperationSuccess("Enhancement", "with Context7");
 * // Output: ✅ Enhancement completed successfully: with Context7
 * ```
 */
export function displayOperationSuccess(
  operation: string,
  details?: string
): void {
  const message = details
    ? `✅ ${operation} completed successfully: ${details}`
    : `✅ ${operation} completed successfully`;
  console.log(chalk.green(message));
}

/**
 * Display an operation error
 *
 * @param operation - Name of the operation
 * @param error - The error that occurred
 *
 * @example
 * ```typescript
 * displayOperationError("Enhancement", new Error("API failed"));
 * // Output: ❌ Enhancement failed: API failed
 * ```
 */
export function displayOperationError(operation: string, error: Error): void {
  console.log(chalk.red(`❌ ${operation} failed: ${error.message}`));
}

/**
 * Display progress in a bulk operation
 *
 * @param current - Current item number (1-indexed)
 * @param total - Total number of items
 * @param operation - Operation being performed
 *
 * @example
 * ```typescript
 * displayBulkProgress(3, 10, "Enhancing task ABC");
 * // Output: [3/10] Enhancing task ABC...
 * ```
 */
export function displayBulkProgress(
  current: number,
  total: number,
  operation: string
): void {
  console.log(chalk.cyan(`\n[${current}/${total}] ${operation}...`));
}

/**
 * Display a separator line
 *
 * @param length - Length of the separator (default: 60)
 *
 * @example
 * ```typescript
 * displaySeparator();
 * // Output: ============================================================
 * ```
 */
export function displaySeparator(length: number = 60): void {
  console.log(chalk.blue("=".repeat(length)));
}

/**
 * Display a section header
 *
 * @param title - Section title
 *
 * @example
 * ```typescript
 * displaySectionHeader("Execution Summary");
 * // Output:
 * // ============================================================
 * // 📊 Execution Summary
 * // ============================================================
 * ```
 */
export function displaySectionHeader(title: string): void {
  displaySeparator();
  console.log(chalk.blue.bold(`📊 ${title}`));
  displaySeparator();
}
