import inquirer from "inquirer";
import chalk from "chalk";

/**
 * Ask for user confirmation before performing a bulk operation
 *
 * @param operationName - Name of the operation (e.g., "enhance", "split")
 * @param taskCount - Number of tasks that will be affected
 * @param force - If true, skip confirmation and return true
 * @returns Promise resolving to true if confirmed, false otherwise
 *
 * @example
 * ```typescript
 * const confirmed = await confirmBulkOperation("enhance", 10, options.force);
 * if (!confirmed) {
 *   console.log(chalk.yellow("Operation cancelled"));
 *   return;
 * }
 * ```
 */
export async function confirmBulkOperation(
  operationName: string,
  taskCount: number,
  force: boolean = false
): Promise<boolean> {
  if (force) return true;

  console.log(
    chalk.yellow(
      `\n⚠️  This will ${operationName.toLowerCase()} ${taskCount} task(s).`
    )
  );

  const { confirmed } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirmed",
      message: `Are you sure you want to proceed?`,
      default: false,
    },
  ]);

  return confirmed;
}
