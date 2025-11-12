
import chalk from "chalk";
import { Task, TaskAIMetadata } from "../../types";
import { getTaskAIMetadata, getSubtasks, getTaskContent } from "../tasks/get";

export interface TaskDisplayOptions {
  indent?: string;
  showSubtasks?: boolean;
  showMetadata?: boolean;
}

export async function displayTask(
  task: Task,
  options: TaskDisplayOptions = {},
): Promise<void> {
  const { indent = "", showSubtasks = true, showMetadata = false } = options;

  const statusColor =
    task.status === "completed"
      ? chalk.green
      : task.status === "in-progress"
        ? chalk.yellow
        : chalk.gray;

  console.log(
    `${indent}${statusColor(`[${task.status}]`)} ${chalk.bold(task.title)} ${chalk.gray(`(${task.id})`)}`,
  );

  if (showSubtasks && task.subtasks && task.subtasks.length > 0) {
    for (const subtask of task.subtasks) {
      await displayTask(subtask, {
        indent: indent + "\t",
        showSubtasks: false,
      });
    }
  }
}

export async function displayTaskDetails(task: Task): Promise<void> {
  console.log(chalk.blue("Task Details:"));
  console.log(`${chalk.cyan("ID:")} ${task.id}`);
  console.log(`${chalk.cyan("Title:")} ${chalk.bold(task.title)}`);
  console.log(`${chalk.cyan("Status:")} ${task.status}`);

  if (task.description) {
    console.log(`${chalk.cyan("Description:")} ${task.description}`);
  }

  if (task.contentFile) {
    const fullContent = await getTaskContent(task.id);
    if (fullContent) {
      console.log(`${chalk.cyan("Full Content:")}`);
      console.log(fullContent);
    }
  }

  if (task.estimatedEffort) {
    console.log(`${chalk.cyan("Estimated Effort:")} ${task.estimatedEffort}`);
  }

  if (task.tags && task.tags.length > 0) {
    console.log(`${chalk.cyan("Tags:")} ${task.tags.join(", ")}`);
  }

  const aiMetadata = await getTaskAIMetadata(task.id);
  if (aiMetadata?.aiGenerated) {
    console.log(`${chalk.magenta("🤖 AI-generated")}`);
    if (aiMetadata.aiProvider) {
      console.log(`${chalk.magenta("  Provider:")} ${aiMetadata.aiProvider}`);
    }
    if (aiMetadata.aiModel) {
      console.log(`${chalk.magenta("  Model:")} ${aiMetadata.aiModel}`);
    }
  }

  console.log(
    `${chalk.cyan("Created:")} ${new Date(task.createdAt).toLocaleString()}`,
  );
  console.log(
    `${chalk.cyan("Updated:")} ${new Date(task.updatedAt).toLocaleString()}`,
  );

  if (task.documentation?.research) {
    console.log(chalk.blue(`\n📚 Documentation Research:`));
    Object.entries(task.documentation.research).forEach(
      ([lib, entries]: [string, any]) => {
        console.log(chalk.cyan(`  ${lib}:`));
        entries.forEach((entry: any) => {
          console.log(chalk.gray(`    Query: "${entry.query}"`));
          console.log(chalk.gray(`    Cache: ${entry.cache}`));
        });
      },
    );
  }

  const subtasks = await getSubtasks(task.id);
  if (subtasks.length > 0) {
    console.log(chalk.blue(`\n📋 Subtasks (${subtasks.length}):`));
    for (let i = 0; i < subtasks.length; i++) {
      const subtask = subtasks[i];
      const statusColor =
        subtask.status === "completed"
          ? chalk.green
          : subtask.status === "in-progress"
            ? chalk.yellow
            : chalk.gray;

      console.log(
        `  ${i + 1}. ${statusColor(`[${subtask.status}]`)} ${chalk.bold(subtask.title)}`,
      );

      if (subtask.description) {
        console.log(
          chalk.gray(
            `     ${subtask.description.substring(0, 80)}${subtask.description.length > 80 ? "..." : ""}`,
          ),
        );
      }

      if (subtask.estimatedEffort) {
        console.log(chalk.cyan(`     Effort: ${subtask.estimatedEffort}`));
      }

      const subtaskAiMetadata = await getTaskAIMetadata(subtask.id);
      if (subtaskAiMetadata?.aiGenerated) {
        console.log(chalk.magenta(`     🤖 AI-generated`));
      }

      if (i < subtasks.length - 1) console.log("");
    }
  }
}

export function displayTaskList(tasks: Task[]): void {
  if (tasks.length === 0) {
    console.log(chalk.yellow("No tasks found."));
    return;
  }
}

export function displayCreatedTask(
  task: Task,
  aiMetadata?: TaskAIMetadata,
): void {
  console.log(chalk.green(`\n✓ Created task: ${task.title} (${task.id})`));

  if (task.contentFile) {
    console.log(chalk.cyan(`  Content saved to: ${task.contentFile}`));
  }

  if (aiMetadata?.aiGenerated) {
    console.log(chalk.magenta(`  🤖 Enhanced using Context7 documentation`));
  }
}

export function displaySubtaskCreation(subtasks: Task[]): void {
  console.log(chalk.green(`✓ Created ${subtasks.length} subtasks`));
  for (let i = 0; i < subtasks.length; i++) {
    const subtask = subtasks[i];
    console.log(chalk.cyan(`  ${i + 1}. ${subtask.title} (${subtask.id})`));
    if (subtask.estimatedEffort) {
      console.log(chalk.gray(`     Effort: ${subtask.estimatedEffort}`));
    }
  }
}

export function displayTaskUpdate(task: Task, updates: any): void {
  console.log(chalk.green(`\n✓ Updated task: ${task.title} (${task.id})`));

  const changedFields = Object.keys(updates);
  if (changedFields.length > 0) {
    console.log(chalk.cyan(`  Changed fields: ${changedFields.join(", ")}`));
  }

  if (updates.status) {
    const statusColor =
      updates.status === "completed"
        ? chalk.green
        : updates.status === "in-progress"
          ? chalk.yellow
          : chalk.gray;
    console.log(statusColor(`  Status: ${updates.status}`));
  }

  if (updates.title) {
    console.log(chalk.cyan(`  Title: ${updates.title}`));
  }

  if (updates.tags && updates.tags.length > 0) {
    console.log(chalk.cyan(`  Tags: ${updates.tags.join(", ")}`));
  }
}

export function displayTaskDelete(
  deleted: Task[],
  orphanedSubtasks: Task[],
): void {
  console.log(chalk.green(`\n✓ Deleted ${deleted.length} task(s):`));

  for (const task of deleted) {
    console.log(chalk.cyan(`  • ${task.title} (${task.id})`));
  }

  if (orphanedSubtasks.length > 0) {
    console.log(
      chalk.yellow(`\n⚠️  Orphaned ${orphanedSubtasks.length} subtask(s):`),
    );
    for (const subtask of orphanedSubtasks) {
      console.log(chalk.yellow(`  • ${subtask.title} (${subtask.id})`));
    }
  }
}

export function displayTaskStatusChange(
  task: Task,
  oldStatus: string,
  newStatus: string,
): void {
  const newStatusColor =
    newStatus === "completed"
      ? chalk.green
      : newStatus === "in-progress"
        ? chalk.yellow
        : chalk.gray;

  console.log(
    chalk.green(`\n✓ Status changed for task: ${task.title} (${task.id})`),
  );
  console.log(chalk.gray(`  From: ${oldStatus}`));
  console.log(newStatusColor(`  To: ${newStatus}`));
}

export function displayTagsUpdate(
  task: Task,
  addedTags: string[],
  removedTags: string[],
): void {
  console.log(
    chalk.green(`\n✓ Updated tags for task: ${task.title} (${task.id})`),
  );

  if (addedTags.length > 0) {
    console.log(chalk.green(`  Added tags: ${addedTags.join(", ")}`));
  }

  if (removedTags.length > 0) {
    console.log(chalk.red(`  Removed tags: ${removedTags.join(", ")}`));
  }

  if (task.tags && task.tags.length > 0) {
    console.log(chalk.cyan(`  Current tags: ${task.tags.join(", ")}`));
  }
}

export function displayNextTask(task: Task, criteria: string): void {
  console.log(chalk.blue(`\n🎯 Next task (${criteria}):`));
  console.log(chalk.green(`✓ ${task.title} (${task.id})`));
  
  const statusColor = 
    task.status === "completed" ? chalk.green :
    task.status === "in-progress" ? chalk.yellow :
    chalk.gray;
  
  console.log(statusColor(`  Status: ${task.status}`));
  
  if (task.description) {
    console.log(chalk.cyan(`  Description: ${task.description.substring(0, 100)}${task.description.length > 100 ? "..." : ""}`));
  }
  
  if (task.estimatedEffort) {
    console.log(chalk.cyan(`  Effort: ${task.estimatedEffort}`));
  }
  
  if (task.tags && task.tags.length > 0) {
    console.log(chalk.cyan(`  Tags: ${task.tags.join(", ")}`));
  }
  
  console.log(chalk.gray(`  Created: ${new Date(task.createdAt).toLocaleString()}`));
}

export async function displayTaskTree(
  tasks: Task[],
  rootId?: string,
): Promise<void> {
  if (tasks.length === 0) {
    console.log(chalk.yellow("No tasks found."));
    return;
  }

  if (rootId) {
    console.log(chalk.blue(`\n🌳 Task Tree for ${rootId}:`));
  } else {
    console.log(chalk.blue(`\n🌳 Complete Task Tree:`));
  }

  const displayTaskWithIndent = async (
    task: Task,
    indent: string = "",
    isLast: boolean = false,
  ) => {
    const statusColor =
      task.status === "completed"
        ? chalk.green
        : task.status === "in-progress"
          ? chalk.yellow
          : chalk.gray;

    const connector = isLast ? "└── " : "├── ";
    const subtasks = await getSubtasks(task.id);
    const hasSubtasks = subtasks.length > 0;

    console.log(
      `${indent}${connector}${statusColor(`[${task.status}]`)} ${chalk.bold(task.title)} ${chalk.gray(`(${task.id})`)}`,
    );

    if (task.tags && task.tags.length > 0) {
      console.log(
        `${indent}${isLast ? "    " : "│   "}${chalk.cyan(`🏷️  ${task.tags.join(", ")}`)}`,
      );
    }

    if (hasSubtasks) {
      const subtaskIndent = indent + (isLast ? "    " : "│   ");
      for (let i = 0; i < subtasks.length; i++) {
        const isLastSubtask = i === subtasks.length - 1;
        await displayTaskWithIndent(subtasks[i], subtaskIndent, isLastSubtask);
      }
    }
  };

  // If rootId is specified, find and display only that tree
  if (rootId) {
    const rootTask = tasks.find((t) => t.id === rootId);
    if (rootTask) {
      await displayTaskWithIndent(rootTask, "", true);
    }
  } else {
    // Display only top-level tasks (those without parentId)
    const topLevelTasks = tasks.filter((task) => !task.parentId);
    for (let i = 0; i < topLevelTasks.length; i++) {
      const isLast = i === topLevelTasks.length - 1;
      await displayTaskWithIndent(topLevelTasks[i], "", isLast);
    }
  }
}
