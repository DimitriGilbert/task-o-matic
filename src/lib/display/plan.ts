
import chalk from "chalk";

export function displayPlanCreation(taskId: string, taskTitle: string): void {
  console.log(
    chalk.green(
      `\n✓ Implementation plan created and saved for: ${taskTitle} (${taskId})`,
    ),
  );
}

export function displayPlanView(
  taskTitle: string,
  taskId: string,
  plan: string,
  createdAt: number,
  updatedAt: number,
): void {
  console.log(
    chalk.green(`\n📋 Implementation Plan for ${taskTitle} (${taskId}):`),
  );
  console.log(chalk.gray(`Created: ${new Date(createdAt).toLocaleString()}`));
  console.log(chalk.gray(`Updated: ${new Date(updatedAt).toLocaleString()}`));
  console.log(chalk.cyan(`\n${plan}`));
}

export function displayPlanList(
  plans: Array<{
    taskId: string;
    plan: string;
    createdAt: number;
    updatedAt: number;
    taskTitle?: string;
  }>,
): void {
  if (plans.length === 0) {
    console.log(chalk.yellow("No plans found."));
    return;
  }

  console.log(chalk.blue(`\n📋 Available Plans (${plans.length}):`));

  for (const plan of plans) {
    console.log(
      chalk.white(`\n• ${plan.taskId}: ${plan.taskTitle || "Unknown Task"}`),
    );
    console.log(
      chalk.gray(`  Created: ${new Date(plan.createdAt).toLocaleDateString()}`),
    );
    console.log(
      chalk.gray(`  Updated: ${new Date(plan.updatedAt).toLocaleDateString()}`),
    );

    // Show first 100 characters of plan as preview
    const preview = plan.plan.substring(0, 100).replace(/\n/g, " ");
    console.log(
      chalk.cyan(`  Preview: ${preview}${plan.plan.length > 100 ? "..." : ""}`),
    );
  }
}

export function displayPlanDeletion(taskId: string, success: boolean): void {
  if (success) {
    console.log(chalk.green(`\n✓ Deleted plan for task: ${taskId}`));
  } else {
    console.log(chalk.yellow(`\n⚠️  No plan found for task: ${taskId}`));
  }
}
