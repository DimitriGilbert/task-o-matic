import { Command } from "commander";
import chalk from "chalk";
import { taskService } from "../services/tasks";
import { executeTask } from "../lib/task-execution";
import { createStreamingOptions } from "../utils/streaming-options";
import { displayProgress, displayError } from "../cli/display/progress";
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
    try {
      const tasks = await taskService.listTasks({
        status: options.status,
        tag: options.tag,
      });

      displayTaskList(tasks);

      for (const task of tasks) {
        await displayTask(task, { showSubtasks: true });
      }
    } catch (error) {
      displayError(error);
      process.exit(1);
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
    try {
      const streamingOptions = createStreamingOptions(
        options.aiEnhance && options.stream,
        "Enhancement"
      );

      const result = await taskService.createTask({
        title: options.title,
        content: options.content,
        parentId: options.parentId,
        effort: options.effort,
        aiEnhance: options.aiEnhance,
        aiOptions: {
          aiProvider: options.aiProvider,
          aiModel: options.aiModel,
          aiKey: options.aiKey,
          aiProviderUrl: options.aiProviderUrl,
          aiReasoning: options.reasoning,
        },
        streamingOptions,
        callbacks: {
          onProgress: displayProgress,
          onError: displayError,
        },
      });

      displayEnhancementResult(options.aiEnhance && options.stream);
      displayCreatedTask(result.task, result.aiMetadata);
    } catch (error) {
      displayError(error);
      process.exit(1);
    }
  });

// Show task details
tasksCommand
  .command("show")
  .description("Show detailed information about a task")
  .requiredOption("--id <id>", "Task ID")
  .action(async (options) => {
    try {
      const task = await taskService.getTask(options.id);

      if (!task) {
        throw new Error(`Task with ID ${options.id} not found`);
      }

      await displayTaskDetails(task);
    } catch (error) {
      displayError(error);
      process.exit(1);
    }
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
    try {
      const streamingOptions = createStreamingOptions(options.stream, "Analysis");

      const result = await taskService.documentTask(
        options.taskId,
        options.force,
        {
          aiProvider: options.aiProvider,
          aiModel: options.aiModel,
          aiKey: options.aiKey,
          aiProviderUrl: options.aiProviderUrl,
          aiReasoning: options.reasoning,
        },
        streamingOptions,
        {
          onProgress: displayProgress,
          onError: displayError,
        }
      );

      if (result.documentation && !options.force) {
        const daysSinceFetch =
          (Date.now() - result.documentation.lastFetched) / (24 * 60 * 60 * 1000);
        console.log(
          chalk.green(
            `✓ Documentation is fresh (${Math.round(daysSinceFetch)} days old)`
          )
        );
        console.log(chalk.cyan(`Recap: ${result.documentation.recap}`));
        console.log(
          chalk.blue(`Libraries: ${result.documentation.libraries.join(", ")}`)
        );
        return;
      }

      if (result.analysis) {
        displayDocumentationAnalysis(result.analysis);
      }

      if (result.documentation?.research) {
        displayResearchSummary(result.documentation);
      }
    } catch (error) {
      displayError(error);
      process.exit(1);
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
    try {
      if (!options.taskId && !options.all) {
        throw new Error("Either --task-id or --all must be specified");
      }

      if (options.taskId && options.all) {
        throw new Error("Cannot specify both --task-id and --all");
      }

      const enhanceSingleTask = async (taskId: string) => {
        const streamingOptions = createStreamingOptions(
          options.stream,
          "Enhancement"
        );

        const result = await taskService.enhanceTask(
          taskId,
          {
            aiProvider: options.aiProvider,
            aiModel: options.aiModel,
            aiKey: options.aiKey,
            aiProviderUrl: options.aiProviderUrl,
            aiReasoning: options.reasoning,
          },
          streamingOptions,
          {
            onProgress: displayProgress,
            onError: displayError,
          }
        );

        if (result.enhancedContent.length > 200) {
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
        const allTasks = await taskService.listTasks({});
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
    } catch (error) {
      displayError(error);
      process.exit(1);
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
  .option("--tools", "Enable filesystem tools for project analysis")
  .action(async (options) => {
    try {
      if (!options.taskId && !options.all) {
        throw new Error("Either --task-id or --all must be specified");
      }

      if (options.taskId && options.all) {
        throw new Error("Cannot specify both --task-id and --all");
      }

      const splitSingleTask = async (taskId: string) => {
        const streamingOptions = createStreamingOptions(
          options.stream,
          "Task breakdown"
        );

        try {
          const result = await taskService.splitTask(
            taskId,
            {
              aiProvider: options.aiProvider,
              aiModel: options.aiModel,
              aiKey: options.aiKey,
              aiProviderUrl: options.aiProviderUrl,
              aiReasoning: options.reasoning,
            },
            undefined,
            undefined,
            streamingOptions,
            {
              onProgress: displayProgress,
              onError: displayError,
            },
            options.tools
          );

          displaySubtaskCreation(result.subtasks);

          // Display AI metadata
          console.log(chalk.gray(`\n📊 AI Splitting Details:`));
          console.log(chalk.gray(`   Provider: ${result.metadata.aiProvider}`));
          console.log(chalk.gray(`   Model: ${result.metadata.aiModel}`));
          console.log(
            chalk.gray(`   Subtasks created: ${result.subtasks.length}`)
          );
          console.log(
            chalk.gray(
              `   Confidence: ${result.metadata.confidence ? (result.metadata.confidence * 100).toFixed(1) : "N/A"}%`
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
        const allTasks = await taskService.listTasks({});
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
    } catch (error) {
      displayError(error);
      process.exit(1);
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
    try {
      const streamingOptions = createStreamingOptions(options.stream, "Planning");

      const result = await taskService.planTask(
        options.id,
        {
          aiProvider: options.aiProvider,
          aiModel: options.aiModel,
          aiKey: options.aiKey,
          aiProviderUrl: options.aiProviderUrl,
          aiReasoning: options.reasoning,
        },
        streamingOptions,
        {
          onProgress: displayProgress,
          onError: displayError,
        }
      );

      // Display the plan
      displayPlanCreation(options.id, result.task.title);
      console.log(chalk.cyan(result.plan));
    } catch (error) {
      displayError(error);
      process.exit(1);
    }
  });

// Get plan command
tasksCommand
  .command("get-plan")
  .description("View existing implementation plan for a task or subtask")
  .requiredOption("--id <id>", "Task or subtask ID")
  .action(async (options) => {
    try {
      const plan = await taskService.getTaskPlan(options.id);

      if (!plan) {
        console.log(
          chalk.yellow(`⚠️  No plan found for task/subtask ${options.id}`)
        );
        return;
      }

      const task = await taskService.getTask(options.id);
      const taskTitle = task ? task.title : options.id;

      displayPlanView(
        taskTitle,
        options.id,
        plan.plan,
        plan.createdAt,
        plan.updatedAt
      );
    } catch (error) {
      displayError(error);
      process.exit(1);
    }
  });

// List plans command
tasksCommand
  .command("list-plan")
  .description("List all available implementation plans")
  .action(async () => {
    try {
      const plans = await taskService.listTaskPlans();

      // Get task titles for each plan
      const plansWithTitles = await Promise.all(
        plans.map(async (plan) => {
          const task = await taskService.getTask(plan.taskId);
          return {
            ...plan,
            taskTitle: task ? task.title : plan.taskId,
          };
        })
      );

      displayPlanList(plansWithTitles);
    } catch (error) {
      displayError(error);
      process.exit(1);
    }
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
    try {
      const { id, ...updates } = options;
      if (Object.keys(updates).length === 0) {
        throw new Error("At least one field must be specified for update");
      }

      const updatedTask = await taskService.updateTask(id, {
        title: updates.title,
        description: updates.description,
        status: updates.status,
        effort: updates.effort,
        tags: updates.tags,
      });

      displayTaskUpdate(updatedTask, updates);
    } catch (error) {
      displayError(error);
      process.exit(1);
    }
  });

// Delete task command
tasksCommand
  .command("delete")
  .description("Delete a task")
  .requiredOption("--id <id>", "Task ID to delete")
  .option("--force", "Skip confirmation and delete anyway")
  .option("--cascade", "Delete all subtasks as well")
  .action(async (options) => {
    try {
      if (!options.force) {
        const task = await taskService.getTask(options.id);
        if (!task) {
          throw new Error(`Task with ID ${options.id} not found`);
        }

        console.log(chalk.red(`\n⚠️  Are you sure you want to delete task: ${task.title} (${task.id})?`));
        console.log(chalk.red("This action cannot be undone."));

        // Simple confirmation - in a real CLI you might want a proper prompt
        console.log(chalk.yellow("Use --force to confirm deletion."));
        return;
      }

      const result = await taskService.deleteTask(options.id, {
        cascade: options.cascade,
        force: options.force,
      });

      displayTaskDelete(result.deleted, result.orphanedSubtasks);
    } catch (error) {
      displayError(error);
      process.exit(1);
    }
  });

// Set status command
tasksCommand
  .command("status")
  .description("Set task status")
  .requiredOption("--id <id>", "Task ID")
  .requiredOption("--status <status>", "New status (todo/in-progress/completed)")
  .action(async (options) => {
    try {
      const task = await taskService.getTask(options.id);
      if (!task) {
        throw new Error(`Task with ID ${options.id} not found`);
      }

      const oldStatus = task.status;
      const updatedTask = await taskService.setTaskStatus(options.id, options.status);

      displayTaskStatusChange(updatedTask, oldStatus, options.status);
    } catch (error) {
      displayError(error);
      process.exit(1);
    }
  });

// Add tags command
tasksCommand
  .command("add-tags")
  .description("Add tags to a task")
  .requiredOption("--id <id>", "Task ID")
  .requiredOption("--tags <tags>", "Tags to add (comma-separated)")
  .action(async (options) => {
    try {
      const tags = options.tags.split(',').map((tag: string) => tag.trim());
      const updatedTask = await taskService.addTags(options.id, tags);

      displayTagsUpdate(updatedTask, tags, []);
    } catch (error) {
      displayError(error);
      process.exit(1);
    }
  });

// Remove tags command
tasksCommand
  .command("remove-tags")
  .description("Remove tags from a task")
  .requiredOption("--id <id>", "Task ID")
  .requiredOption("--tags <tags>", "Tags to remove (comma-separated)")
  .action(async (options) => {
    try {
      const tags = options.tags.split(',').map((tag: string) => tag.trim());
      const updatedTask = await taskService.removeTags(options.id, tags);

      displayTagsUpdate(updatedTask, [], tags);
    } catch (error) {
      displayError(error);
      process.exit(1);
    }
  });

// Delete plan command
tasksCommand
  .command("delete-plan")
  .description("Delete implementation plan for a task")
  .requiredOption("--id <id>", "Task ID")
  .action(async (options) => {
    try {
      const success = await taskService.deleteTaskPlan(options.id);
      displayPlanDeletion(options.id, success);
    } catch (error) {
      displayError(error);
      process.exit(1);
    }
  });

// List subtasks command
tasksCommand
  .command("subtasks")
  .description("List subtasks for a task")
  .requiredOption("--id <id>", "Parent task ID")
  .action(async (options) => {
    try {
      const subtasks = await taskService.getSubtasks(options.id);

      if (subtasks.length === 0) {
        console.log(chalk.yellow(`No subtasks found for task ${options.id}`));
        return;
      }

      const parentTask = await taskService.getTask(options.id);
      const parentTitle = parentTask ? parentTask.title : options.id;

      console.log(chalk.blue(`\n📋 Subtasks for ${parentTitle} (${options.id}):`));
      console.log("");

      for (let i = 0; i < subtasks.length; i++) {
        const subtask = subtasks[i];
        await displayTask(subtask, { indent: '  ', showSubtasks: false });
      }
    } catch (error) {
      displayError(error);
      process.exit(1);
    }
  });

// Task tree command
tasksCommand
  .command("tree")
  .description("Display hierarchical task tree")
  .option("--id <id>", "Root task ID (optional - shows full tree if not specified)")
  .action(async (options) => {
    try {
      const tasks = await taskService.getTaskTree(options.id);
      await displayTaskTree(tasks, options.id);
    } catch (error) {
      displayError(error);
      process.exit(1);
    }
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
    try {
      // Default to todo status if not specified
      const searchOptions = {
        ...options,
        status: options.status || "todo"
      };

      const nextTask = await taskService.getNextTask(searchOptions);

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
    } catch (error) {
      displayError(error);
      process.exit(1);
    }
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

// Get task documentation
tasksCommand
  .command("get-documentation")
  .description("Get existing documentation for a task")
  .requiredOption("--id <id>", "Task ID")
  .action(async (options) => {
    try {
      const task = await taskService.getTask(options.id);
      if (!task) {
        throw new Error(`Task with ID ${options.id} not found`);
      }

      const documentation = await taskService.getTaskDocumentation(options.id);
      
      if (!documentation) {
        console.log(chalk.yellow(`⚠️  No documentation found for task ${options.id}`));
        console.log(chalk.gray(`   Task: ${task.title}`));
        return;
      }

      console.log(chalk.blue(`\n📖 Documentation for Task: ${task.title} (${options.id})`));
      console.log(chalk.gray(`   File: .task-o-matic/docs/tasks/${options.id}.md`));
      console.log("");
      console.log(documentation);
    } catch (error) {
      displayError(error);
      process.exit(1);
    }
  });

// Add documentation from file
tasksCommand
  .command("add-documentation")
  .description("Add documentation to a task from a file")
  .requiredOption("--id <id>", "Task ID")
  .requiredOption("--doc-file <path>", "Path to documentation file")
  .option("--overwrite", "Overwrite existing documentation")
  .action(async (options) => {
    try {
      const task = await taskService.getTask(options.id);
      if (!task) {
        throw new Error(`Task with ID ${options.id} not found`);
      }

      // Check if documentation already exists
      const existingDoc = await taskService.getTaskDocumentation(options.id);
      if (existingDoc && !options.overwrite) {
        console.log(chalk.yellow(`⚠️  Documentation already exists for task ${options.id}`));
        console.log(chalk.gray(`   Use --overwrite to replace existing documentation`));
        return;
      }

      const result = await taskService.addTaskDocumentationFromFile(options.id, options.docFile);
      
      console.log(chalk.green(`✓ Documentation added to task: ${task.title} (${options.id})`));
      console.log(chalk.gray(`   Source file: ${options.docFile}`));
      console.log(chalk.gray(`   Saved to: ${result.filePath}`));
      
      if (options.overwrite) {
        console.log(chalk.cyan(`   Previous documentation was overwritten`));
      }
    } catch (error) {
      displayError(error);
      process.exit(1);
    }
  });

// Set task plan
tasksCommand
  .command("set-plan")
  .description("Set implementation plan for a task")
  .requiredOption("--id <id>", "Task ID")
  .option("--plan <text>", "Plan text (use quotes for multi-line)")
  .option("--plan-file <path>", "Path to file containing the plan")
  .action(async (options) => {
    try {
      const task = await taskService.getTask(options.id);
      if (!task) {
        throw new Error(`Task with ID ${options.id} not found`);
      }

      if (!options.plan && !options.planFile) {
        throw new Error("Either --plan or --plan-file must be specified");
      }

      if (options.plan && options.planFile) {
        throw new Error("Cannot specify both --plan and --plan-file");
      }

      const result = await taskService.setTaskPlan(
        options.id,
        options.plan || undefined,
        options.planFile || undefined
      );

      console.log(chalk.green(`✓ Plan set for task: ${task.title} (${options.id})`));
      console.log(chalk.gray(`   Plan file: ${result.planFile}`));
      
      if (options.planFile) {
        console.log(chalk.gray(`   Source file: ${options.planFile}`));
      }
    } catch (error) {
      displayError(error);
      process.exit(1);
    }
  });
