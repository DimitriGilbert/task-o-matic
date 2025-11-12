import { Command } from "commander";
import chalk from "chalk";
import { listTasks } from "../lib/tasks/list";
import { createTask } from "../lib/tasks/create";
import { getTask } from "../lib/tasks/get";
import { getNextTask } from "../lib/tasks/next";
import { planTask, getTaskPlan, listTaskPlans, deleteTaskPlan } from "../lib/tasks/plan";
import { splitTask } from "../lib/tasks/split";
import { documentTask } from "../lib/tasks/document";
import { enhanceTask } from "../lib/tasks/enhance";
import { updateTask, setTaskStatus } from "../lib/tasks/update";
import { deleteTask } from "../lib/tasks/delete";
import { addTaskTags, removeTaskTags } from "../lib/tasks/tags";
import { listTaskSubtasks, getTaskTree } from "../lib/tasks/tree";
import { executeTask } from "../lib/task-execution";

import { createStreamingOptions } from "../utils/streaming-options";
import {
  displayTask,
  displayTaskDetails,
  displayTaskList,
  displayCreatedTask,
  displaySubtaskCreation,
  displayTaskUpdate,
  displayTaskDelete,
  displayTaskStatusChange,
  displayTagsUpdate,
  displayNextTask,
  displayTaskTree,
} from "../cli/display/task";
import {
  displayPlanCreation,
  displayPlanView,
  displayPlanList,
  displayPlanDeletion,
} from "../cli/display/plan";
import {
  displayEnhancementResult,
  displayDocumentationAnalysis,
  displayResearchSummary,
} from "../cli/display/common";

export const tasksCommand = new Command("tasks");

// List tasks
tasksCommand
  .command("list")
  .description("List all tasks")
  .option("--status <status>", "Filter by status (todo/in-progress/completed)")
  .option("--tag <tag>", "Filter by tag")
  .action(async (options) => {
    const tasks = await listTasks(options);

    displayTaskList(tasks);

    for (const task of tasks) {
      await displayTask(task, { showSubtasks: true });
    }
  });

// Create task
tasksCommand
  .command("create")
  .description("Create a new task with AI enhancement using Context7")
  .requiredOption("--title <title>", "Task title")
  .option("--content <content>", "Task content (supports markdown)")
  .option("--effort <effort>", "Estimated effort (small/medium/large)")
  .option("--parent-id <id>", "Parent task ID (creates subtask)")
  .option("--ai-enhance", "Enhance task with AI using Context7 documentation")
  .option("--stream", "Show streaming AI output during enhancement")
  .option("--ai-provider <provider>", "AI provider override")
  .option("--ai-model <model>", "AI model override")
  .option("--ai-key <key>", "AI API key override")
  .option("--ai-provider-url <url>", "AI provider URL override")
  .option("--reasoning <tokens>", "Enable reasoning for OpenRouter models (max reasoning tokens)")
  .action(async (options) => {
    if (options.aiEnhance) {
      console.log(
        chalk.blue("🤖 Enhancing task with Context7 documentation...")
      );
    }

    // Set up streaming options if stream flag is enabled
    const streamingOptions = createStreamingOptions(
      options.aiEnhance && options.stream,
      "Enhancement"
    );

    const { task, aiMetadata } = await createTask(options, streamingOptions);

    displayEnhancementResult(options.aiEnhance && options.stream);
    displayCreatedTask(task, aiMetadata);
  });

// Show task details
tasksCommand
  .command("show")
  .description("Show detailed information about a task")
  .requiredOption("--id <id>", "Task ID")
  .action(async (options) => {
    const task = await getTask(options.id);

    if (!task) {
      throw new Error(`Task with ID ${options.id} not found`);
    }

    await displayTaskDetails(task);
  });

// Document task
tasksCommand
  .command("document")
  .description(
    "Analyze and fetch documentation for a task using AI with Context7"
  )
  .requiredOption("--task-id <id>", "Task ID")
  .option("--force", "Force refresh documentation even if recent")
  .option("--stream", "Show streaming AI output during analysis")
  .option("--ai-provider <provider>", "AI provider override")
  .option("--ai-model <model>", "AI model override")
  .option("--ai-key <key>", "AI API key override")
  .option("--ai-provider-url <url>", "AI provider URL override")
  .option("--reasoning <tokens>", "Enable reasoning for OpenRouter models (max reasoning tokens)")
  .action(async (options) => {
    console.log(chalk.blue(`📚 Analyzing documentation needs for task...`));

    // Set up streaming options if stream flag is enabled
    const streamingOptions = createStreamingOptions(options.stream, "Analysis");

    const { task, analysis, documentation } = await documentTask(
      options,
      streamingOptions
    );

    if (documentation && !options.force) {
      const daysSinceFetch =
        (Date.now() - documentation.lastFetched) / (24 * 60 * 60 * 1000);
      console.log(
        chalk.green(
          `✓ Documentation is fresh (${Math.round(daysSinceFetch)} days old)`
        )
      );
      console.log(chalk.cyan(`Recap: ${documentation.recap}`));
      console.log(
        chalk.blue(`Libraries: ${documentation.libraries.join(", ")}`)
      );
      return;
    }

    if (!options.stream) {
      console.log(chalk.blue(`🔍 Using AI to analyze documentation needs...`));
    }

    if (analysis) {
      displayDocumentationAnalysis(analysis);
    }
    
    if (documentation?.research) {
      displayResearchSummary(documentation);
    }
  });

// Enhance existing task
tasksCommand
  .command("enhance")
  .description("Enhance an existing task with AI using Context7 documentation")
  .option("--task-id <id>", "Task ID to enhance")
  .option("--all", "Enhance all existing tasks")
  .option("--stream", "Show streaming AI output during enhancement")
  .option("--ai-provider <provider>", "AI provider override")
  .option("--ai-model <model>", "AI model override")
  .option("--ai-key <key>", "AI API key override")
  .option("--ai-provider-url <url>", "AI provider URL override")
  .option("--reasoning <tokens>", "Enable reasoning for OpenRouter models (max reasoning tokens)")
  .action(async (options) => {
    if (!options.taskId && !options.all) {
      throw new Error("Either --task-id or --all must be specified");
    }

    if (options.taskId && options.all) {
      throw new Error("Cannot specify both --task-id and --all");
    }

    const enhanceSingleTask = async (taskId: string) => {
      console.log(chalk.blue(`🤖 Enhancing task...`));

      // Set up streaming options if stream flag is enabled
      const streamingOptions = createStreamingOptions(
        options.stream,
        "Enhancement"
      );

      const { task, enhancedContent, aiMetadata } = await enhanceTask(
        { taskId: taskId, ...options },
        streamingOptions
      );

      if (!options.stream) {
        console.log(chalk.blue(`🤖 Enhancing task: ${task.title}`));
      }

      if (enhancedContent.length > 200) {
        console.log(chalk.cyan(`  Enhanced content saved to file.`));
      } else {
        console.log(
          chalk.cyan(`  Enhanced content updated in task description.`)
        );
      }

      console.log(chalk.green("✓ Task enhanced with Context7 documentation"));
      console.log(chalk.magenta(`  🤖 Enhanced using Context7 MCP tools`));
    };

    if (options.taskId) {
      await enhanceSingleTask(options.taskId);
    } else if (options.all) {
      const allTasks = await listTasks({});
      if (allTasks.length === 0) {
        console.log(chalk.yellow("No tasks found to enhance."));
        return;
      }

      console.log(
        chalk.blue(`🤖 Enhancing ${allTasks.length} tasks in order...`)
      );

      for (let i = 0; i < allTasks.length; i++) {
        const task = allTasks[i];
        console.log(
          chalk.cyan(
            `\n[${i + 1}/${allTasks.length}] Enhancing: ${task.title} (${task.id})`
          )
        );
        try {
          await enhanceSingleTask(task.id);
          console.log(chalk.green(`✓ Enhanced task ${task.id}`));
        } catch (error) {
          console.log(
            chalk.red(
              `❌ Failed to enhance task ${task.id}: ${error instanceof Error ? error.message : "Unknown error"}`
            )
          );
        }
      }

      console.log(
        chalk.green(
          `\n✓ Bulk enhancement complete! Processed ${allTasks.length} tasks.`
        )
      );
    }
  });

// Split task into subtasks
tasksCommand
  .command("split")
  .description("Split a task into smaller subtasks using AI")
  .option("--task-id <id>", "Task ID to split")
  .option("--all", "Split all existing tasks that don't have subtasks")
  .option("--stream", "Show streaming AI output during breakdown")
  .option("--ai-provider <provider>", "AI provider override")
  .option("--ai-model <model>", "AI model override")
  .option("--ai-key <key>", "AI API key override")
  .option("--ai-provider-url <url>", "AI provider URL override")
  .option("--reasoning <tokens>", "Enable reasoning for OpenRouter models (max reasoning tokens)")
  .action(async (options) => {
    if (!options.taskId && !options.all) {
      throw new Error("Either --task-id or --all must be specified");
    }

    if (options.taskId && options.all) {
      throw new Error("Cannot specify both --task-id and --all");
    }

    const splitSingleTask = async (taskId: string) => {
      console.log(chalk.blue(`🔧 Breaking down task into subtasks...`));

      // Set up streaming options if stream flag is enabled
      const streamingOptions = createStreamingOptions(
        options.stream,
        "Task breakdown"
      );

      try {
        const result = await splitTask({ taskId, ...options }, streamingOptions);

        if (!options.stream) {
          console.log(
            chalk.blue(`🔧 Breaking down task: ${result.task.title}`)
          );
        }

        displaySubtaskCreation(result.subtasks);

        // Display AI metadata
        console.log(chalk.gray(`\n📊 AI Splitting Details:`));
        console.log(chalk.gray(`   Provider: ${result.aiMetadata.aiProvider}`));
        console.log(chalk.gray(`   Model: ${result.aiMetadata.aiModel}`));
        console.log(
          chalk.gray(`   Subtasks created: ${result.subtasks.length}`)
        );
        console.log(
          chalk.gray(
            `   Confidence: ${result.aiMetadata.confidence ? (result.aiMetadata.confidence * 100).toFixed(1) : "N/A"}%`
          )
        );
      } catch (error) {
        if (error instanceof Error && error.message.includes("already has")) {
          console.log(chalk.yellow(`⚠️ ${error.message}`));
          return;
        }
        throw error;
      }
    };

    if (options.taskId) {
      await splitSingleTask(options.taskId);
    } else if (options.all) {
      const allTasks = await listTasks({});
      if (allTasks.length === 0) {
        console.log(chalk.yellow("No tasks found to split."));
        return;
      }

      console.log(chalk.blue(`🔧 Splitting ${allTasks.length} tasks...`));

      for (let i = 0; i < allTasks.length; i++) {
        const task = allTasks[i];
        console.log(
          chalk.cyan(`\n[${i + 1}/${allTasks.length}] Splitting: ${task.title}`)
        );
        try {
          await splitSingleTask(task.id);
        } catch (error) {
          console.log(
            chalk.red(
              `❌ Failed to split task ${task.id}: ${error instanceof Error ? error.message : "Unknown error"}`
            )
          );
        }
      }

      console.log(
        chalk.green(
          `\n✓ Bulk splitting complete! Processed ${allTasks.length} tasks.`
        )
      );
    }
  });

// Plan task implementation
tasksCommand
  .command("plan")
  .description("Create detailed implementation plan for a task or subtask")
  .requiredOption("--id <id>", "Task or subtask ID to plan")
  .option("--stream", "Show streaming AI output during planning")
  .option("--ai-provider <provider>", "AI provider override")
  .option("--ai-model <model>", "AI model override")
  .option("--ai-key <key>", "AI API key override")
  .option("--ai-provider-url <url>", "AI provider URL override")
  .option("--reasoning <tokens>", "Enable reasoning for OpenRouter models (max reasoning tokens)")
  .action(async (options) => {
    console.log(
      chalk.blue(
        `📋 Creating implementation plan for task/subtask ${options.id}...`
      )
    );

    // Set up streaming options if stream flag is enabled
    const streamingOptions = createStreamingOptions(options.stream, "Planning");

    const result = await planTask(options, streamingOptions);

    if (!options.stream) {
      console.log(chalk.blue(`📋 Planning task: ${result.task.title}`));
    }

    // Display the plan
    displayPlanCreation(options.id, result.task.title);
    console.log(chalk.cyan(result.planText));
  });

// Get plan command
tasksCommand
  .command("get-plan")
  .description("View existing implementation plan for a task or subtask")
  .requiredOption("--id <id>", "Task or subtask ID")
  .action(async (options) => {
    const plan = await getTaskPlan(options.id);

    if (!plan) {
      console.log(
        chalk.yellow(`⚠️  No plan found for task/subtask ${options.id}`)
      );
      return;
    }

    const task = await getTask(options.id);
    const taskTitle = task ? task.title : options.id;

    displayPlanView(
      taskTitle,
      options.id,
      plan.plan,
      plan.createdAt,
      plan.updatedAt
    );
  });

// List plans command
tasksCommand
  .command("list-plan")
  .description("List all available implementation plans")
  .action(async () => {
    const plans = await listTaskPlans();

    // Get task titles for each plan
    const plansWithTitles = await Promise.all(
      plans.map(async (plan) => {
        const task = await getTask(plan.taskId);
        return {
          ...plan,
          taskTitle: task ? task.title : plan.taskId,
        };
      })
    );

    displayPlanList(plansWithTitles);
  });

// Update task command
tasksCommand
  .command("update")
  .description("Update an existing task")
  .requiredOption("--id <id>", "Task ID to update")
  .option("--title <title>", "New task title")
  .option("--description <description>", "New task description")
  .option("--status <status>", "New status (todo/in-progress/completed)")
  .option("--effort <effort>", "New estimated effort (small/medium/large)")
  .option("--tags <tags>", "New tags (comma-separated)")
  .action(async (options) => {
    const { id, ...updates } = options;
    if (Object.keys(updates).length === 0) {
      throw new Error("At least one field must be specified for update");
    }

    const updatedTask = await updateTask(options);
    
    if (!updatedTask) {
      throw new Error(`Failed to update task ${options.id}`);
    }

    displayTaskUpdate(updatedTask, updates);
  });

// Delete task command
tasksCommand
  .command("delete")
  .description("Delete a task")
  .requiredOption("--id <id>", "Task ID to delete")
  .option("--force", "Skip confirmation and delete anyway")
  .option("--cascade", "Delete all subtasks as well")
  .action(async (options) => {
    if (!options.force) {
      const task = await getTask(options.id);
      if (!task) {
        throw new Error(`Task with ID ${options.id} not found`);
      }
      
      console.log(chalk.red(`\n⚠️  Are you sure you want to delete task: ${task.title} (${task.id})?`));
      console.log(chalk.red("This action cannot be undone."));
      
      // Simple confirmation - in a real CLI you might want a proper prompt
      console.log(chalk.yellow("Use --force to confirm deletion."));
      return;
    }

    const result = await deleteTask(options);
    displayTaskDelete(result.deleted, result.orphanedSubtasks);
  });

// Set status command
tasksCommand
  .command("status")
  .description("Set task status")
  .requiredOption("--id <id>", "Task ID")
  .requiredOption("--status <status>", "New status (todo/in-progress/completed)")
  .action(async (options) => {
    const task = await getTask(options.id);
    if (!task) {
      throw new Error(`Task with ID ${options.id} not found`);
    }

    const oldStatus = task.status;
    const updatedTask = await setTaskStatus(options);
    
    if (!updatedTask) {
      throw new Error(`Failed to update status for task ${options.id}`);
    }

    displayTaskStatusChange(updatedTask, oldStatus, options.status);
  });

// Add tags command
tasksCommand
  .command("add-tags")
  .description("Add tags to a task")
  .requiredOption("--id <id>", "Task ID")
  .requiredOption("--tags <tags>", "Tags to add (comma-separated)")
  .action(async (options) => {
    const updatedTask = await addTaskTags(options);
    
    if (!updatedTask) {
      throw new Error(`Failed to add tags to task ${options.id}`);
    }

    displayTagsUpdate(updatedTask, options.tags.split(',').map((tag: string) => tag.trim()), []);
  });

// Remove tags command
tasksCommand
  .command("remove-tags")
  .description("Remove tags from a task")
  .requiredOption("--id <id>", "Task ID")
  .requiredOption("--tags <tags>", "Tags to remove (comma-separated)")
  .action(async (options) => {
    const updatedTask = await removeTaskTags(options);
    
    if (!updatedTask) {
      throw new Error(`Failed to remove tags from task ${options.id}`);
    }

    displayTagsUpdate(updatedTask, [], options.tags.split(',').map((tag: string) => tag.trim()));
  });

// Delete plan command
tasksCommand
  .command("delete-plan")
  .description("Delete implementation plan for a task")
  .requiredOption("--id <id>", "Task ID")
  .action(async (options) => {
    const success = await deleteTaskPlan(options.id);
    displayPlanDeletion(options.id, success);
  });

// List subtasks command
tasksCommand
  .command("subtasks")
  .description("List subtasks for a task")
  .requiredOption("--id <id>", "Parent task ID")
  .action(async (options) => {
    const subtasks = await listTaskSubtasks(options.id);
    
    if (subtasks.length === 0) {
      console.log(chalk.yellow(`No subtasks found for task ${options.id}`));
      return;
    }

    const parentTask = await getTask(options.id);
    const parentTitle = parentTask ? parentTask.title : options.id;
    
    console.log(chalk.blue(`\n📋 Subtasks for ${parentTitle} (${options.id}):`));
    console.log("");
    
    for (let i = 0; i < subtasks.length; i++) {
      const subtask = subtasks[i];
      await displayTask(subtask, { indent: '  ', showSubtasks: false });
    }
  });

// Task tree command
tasksCommand
  .command("tree")
  .description("Display hierarchical task tree")
  .option("--id <id>", "Root task ID (optional - shows full tree if not specified)")
  .action(async (options) => {
    const tasks = await getTaskTree(options.id);
    await displayTaskTree(tasks, options.id);
  });

// Get next task command
tasksCommand
  .command("get-next")
  .description("Get the next task to work on (defaults to hierarchical order)")
  .option("--status <status>", "Filter by status (todo/in-progress)")
  .option("--tag <tag>", "Filter by tag")
  .option("--effort <effort>", "Filter by effort (small/medium/large)")
  .option("--priority <priority>", "Sort priority (newest/oldest/effort)", "hierarchical")
  .action(async (options) => {
    // Default to todo status if not specified
    const searchOptions = {
      ...options,
      status: options.status || "todo"
    };
    
    const nextTask = await getNextTask(searchOptions);
    
    if (!nextTask) {
      console.log(chalk.yellow("No tasks found matching the criteria."));
      return;
    }
    
    const criteria = [
      searchOptions.status && `status: ${searchOptions.status}`,
      options.tag && `tag: ${options.tag}`,
      options.effort && `effort: ${options.effort}`,
      options.priority && `priority: ${options.priority}`
    ].filter(Boolean).join(", ");
    
    displayNextTask(nextTask, criteria || "next todo task");
  });

// Execute task command
tasksCommand
  .command("execute")
  .description("Execute a task using an external coding assistant")
  .requiredOption("--id <id>", "Task ID to execute")
  .option("--tool <tool>", "External tool to use (opencode/claude/gemini/codex)", "opencode")
  .option("--message <message>", "Custom message to send to the tool (uses task plan if not provided)")
  .option("--dry", "Show what would be executed without running it")
  .option("--validate <command>", "Validation command to run after execution (can be used multiple times)", (value: string, previous: string[] = []) => {
    return [...previous, value];
  })
  .action(async (options) => {
    try {
      await executeTask({
        taskId: options.id,
        tool: options.tool,
        message: options.message,
        dry: options.dry,
        validate: options.validate || [],
      });
    } catch (error) {
      console.error(
        chalk.red("Execution failed:"),
        error instanceof Error ? error.message : "Unknown error"
      );
      process.exit(1);
    }
  });
