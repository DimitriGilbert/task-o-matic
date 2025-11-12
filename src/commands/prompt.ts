import { Command } from "commander";
import { PromptBuilder, PromptBuilderOptions } from "../lib/prompt-builder";
import { exit } from "process";

interface PromptCommandOptions {
  type?: "system" | "user";
  list?: boolean;
  metadata?: string;
  prdContent?: string;
  prdFile?: string;
  taskTitle?: string;
  taskDescription?: string;
  taskFile?: string;
  stackInfo?: string;
  contextInfo?: string;
  userFeedback?: string;
  var?: string[];
}

export const promptCommand = new Command("prompt")
  .description(
    "Build AI service prompts with variable replacement for external tools"
  )
  .argument(
    "[name]",
    "Prompt name (e.g., prd-parsing, task-enhancement, task-breakdown, prd-rework, documentation-detection)"
  )
  .option(
    "-t, --type <type>",
    "Prompt type: system or user (default: user)",
    "user"
  )
  .option("-l, --list", "List all available prompts and exit", false)
  .option(
    "-m, --metadata <name>",
    "Show metadata for a specific prompt and exit"
  )
  .option("--prd-content <content>", "PRD content (for PRD-related prompts)")
  .option("--prd-file <filepath>", "Load PRD content from file")
  .option("--task-title <title>", "Task title (for task-related prompts)")
  .option(
    "--task-description <description>",
    "Task description (for task-related prompts)"
  )
  .option("--task-file <filepath>", "Load task description from file")
  .option(
    "--stack-info <info>",
    'Technology stack information (e.g., "Frontend: Next.js, Backend: Convex")'
  )
  .option("--context-info <info>", "Additional context information")
  .option("--user-feedback <feedback>", "User feedback (for prd-rework prompt)")
  .option(
    "--var <key=value>",
    "Custom variable in format key=value (can be used multiple times)",
    (value, previous: string[] = []) => {
      return [...previous, value];
    },
    []
  )
  .action(async (name: string | undefined, options: PromptCommandOptions) => {
    try {
      // Handle list option
      if (options.list) {
        console.log(PromptBuilder.listPrompts());
        return;
      }

      // Handle metadata option
      if (options.metadata) {
        const metadata = PromptBuilder.getPromptMetadata(
          options.metadata,
          options.type
        );
        if (!metadata) {
          console.error(`Prompt not found: ${options.metadata}`);
          exit(1);
        }

        console.log(`Prompt: ${metadata.name}`);
        console.log(`Type: ${metadata.type}`);
        console.log(`Description: ${metadata.description}`);
        console.log(
          `Required variables: ${metadata.requiredVariables.length > 0 ? metadata.requiredVariables.join(", ") : "None"}`
        );
        console.log(
          `Optional variables: ${metadata.optionalVariables.length > 0 ? metadata.optionalVariables.join(", ") : "None"}`
        );
        console.log("\nPrompt text:");
        console.log(metadata.promptText);
        return;
      }

      // Check if name is provided when not using list or metadata
      if (!name) {
        console.error(
          "Error: Prompt name is required unless using --list or --metadata"
        );
        console.log("Use --help to see available options and examples");
        exit(1);
      }

      // Validate prompt type
      if (options.type !== "system" && options.type !== "user") {
        console.error('Error: --type must be either "system" or "user"');
        exit(1);
      }

      // Build variables object
      const variables: Record<string, string> = {};

      // Parse custom variables (--var key=value)
      if (options.var) {
        for (const varPair of options.var) {
          const [key, ...valueParts] = varPair.split("=");
          if (!key || valueParts.length === 0) {
            console.error(
              `Error: Invalid variable format: ${varPair}. Expected format: key=value`
            );
            exit(1);
          }
          variables[key] = valueParts.join("=");
        }
      }

      // Handle PRD content
      let prdContent = options.prdContent;
      if (options.prdFile) {
        prdContent = PromptBuilder.loadPRDContent(options.prdFile);
      }
      if (prdContent) {
        variables.PRD_CONTENT = prdContent;
      } else if (!prdContent && !variables.PRD_CONTENT) {
        // Auto-detect PRD content if not provided
        prdContent = await PromptBuilder.autoDetectPRDContent();
        if (prdContent) {
          variables.PRD_CONTENT = prdContent;
        }
      }

      // Handle task information
      let taskDescription = options.taskDescription;
      if (options.taskFile) {
        taskDescription = await PromptBuilder.buildTaskContext(
          "",
          "",
          options.taskFile
        );
      }
      if (options.taskTitle) {
        variables.TASK_TITLE = options.taskTitle;
      }
      if (taskDescription) {
        variables.TASK_DESCRIPTION = taskDescription;
      }
      
      // If we have both title and description, build rich context
      if (options.taskTitle && (options.taskDescription || options.taskFile)) {
        const richContext = await PromptBuilder.buildTaskContext(
          options.taskTitle,
          options.taskDescription,
          options.taskFile
        );
        variables.TASK_CONTEXT = richContext;
      }

      // Handle stack info (don't auto-detect if custom var provided)
      if (options.stackInfo) {
        variables.STACK_INFO = options.stackInfo;
      } else if (!variables.STACK_INFO) {
        // Auto-detect stack info from current directory
        const stackInfo = await PromptBuilder.detectStackInfo(process.cwd());
        if (stackInfo !== "Not detected") {
          variables.STACK_INFO = stackInfo;
        }
      }

      // Build CONTEXT_INFO from stack and PRD if not explicitly provided
      if (!options.contextInfo && !variables.CONTEXT_INFO) {
        const contextParts: string[] = [];
        
        // Add stack info if available
        if (variables.STACK_INFO) {
          contextParts.push(`**Technology Stack:** ${variables.STACK_INFO}`);
        }
        
        // Add PRD content if available
        if (variables.PRD_CONTENT) {
          contextParts.push(`**Product Requirements:**\n${variables.PRD_CONTENT}`);
        }
        
        // Set combined context info
        if (contextParts.length > 0) {
          variables.CONTEXT_INFO = contextParts.join('\n\n');
        }
      }
      
      // Handle other variables
      if (options.contextInfo) {
        variables.CONTEXT_INFO = options.contextInfo;
      }
      if (options.userFeedback) {
        variables.USER_FEEDBACK = options.userFeedback;
      }

      // Build the prompt
      const result = PromptBuilder.buildPrompt({
        name,
        type: options.type,
        variables,
      });

      if (!result.success) {
        console.error(`Error: ${result.error}`);
        if (result.missingVariables && result.missingVariables.length > 0) {
          console.error("\nMissing required variables:");
          result.missingVariables.forEach((v) => console.error(`  - ${v}`));

          // Show available variables for the prompt
          if (result.metadata) {
            console.error("\nAvailable variables:");
            if (result.metadata.requiredVariables.length > 0) {
              console.error("  Required:");
              result.metadata.requiredVariables.forEach((v) =>
                console.error(`    - ${v}`)
              );
            }
            if (result.metadata.optionalVariables.length > 0) {
              console.error("  Optional:");
              result.metadata.optionalVariables.forEach((v) =>
                console.error(`    - ${v}`)
              );
            }
          }
        }
        exit(1);
      }

      // Output the built prompt
      console.log(result.prompt);
    } catch (error) {
      console.error(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
      exit(1);
    }
  });

// Add help examples
promptCommand.on("--help", () => {
  console.log("");
  console.log("Examples:");
  console.log("  # List all available prompts");
  console.log("  $ task-o-matic prompt --list");
  console.log("");
  console.log("  # Show metadata for a specific prompt");
  console.log("  $ task-o-matic prompt --metadata prd-parsing");
  console.log(
    "  $ task-o-matic prompt --metadata task-enhancement --type user"
  );
  console.log("");
  console.log("  # Build PRD parsing prompt with content from file");
  console.log("  $ task-o-matic prompt prd-parsing --prd-file ./my-prd.md");
  console.log("");
  console.log("  # Build task enhancement prompt with task info");
  console.log(
    '  $ task-o-matic prompt task-enhancement --task-title "Add user auth" --task-description "Implement JWT authentication"'
  );
  console.log("");
  console.log("  # Build with custom variables");
  console.log(
    '  $ task-o-matic prompt prd-parsing --var PRD_CONTENT="My PRD content" --var STACK_INFO="Next.js, Convex"'
  );
  console.log("");
  console.log("  # Build system prompt");
  console.log("  $ task-o-matic prompt prd-parsing --type system");
});
