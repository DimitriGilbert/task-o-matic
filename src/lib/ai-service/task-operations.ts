import { streamText } from "ai";
import type { ToolSet } from "ai";
import {
  AIConfig,
  Task,
  StreamingOptions,
  RetryConfig,
  ParsedAITask,
} from "../../types";
import { PromptBuilder } from "../prompt-builder";
import { formatStackForContext } from "../../utils/stack-formatter";
import {
  TASK_BREAKDOWN_SYSTEM_PROMPT,
  TASK_ENHANCEMENT_SYSTEM_PROMPT,
  TASK_PLANNING_SYSTEM_PROMPT,
} from "../../prompts";
import { getContextBuilder } from "../../utils/ai-service-factory";
import { filesystemTools } from "./filesystem-tools";
import { BaseOperations } from "./base-operations";

export class TaskOperations extends BaseOperations {
  async breakdownTask(
    task: Task,
    config?: Partial<AIConfig>,
    promptOverride?: string,
    userMessage?: string,
    streamingOptions?: StreamingOptions,
    retryConfig?: Partial<RetryConfig>,
    fullContent?: string,
    stackInfo?: string,
    existingSubtasks?: Task[],
    enableFilesystemTools?: boolean
  ): Promise<
    Array<{ title: string; content: string; estimatedEffort?: string }>
  > {
    return this.retryHandler.executeWithRetry(
      async () => {
        let prompt: string;
        if (promptOverride) {
          prompt = promptOverride;
        } else {
          const variables: Record<string, string> = {
            TASK_TITLE: task.title,
            TASK_DESCRIPTION: task.description || "No description",
          };

          if (fullContent) {
            variables.TASK_CONTENT = fullContent;
          }

          if (existingSubtasks && existingSubtasks.length > 0) {
            const existingSubtasksText = existingSubtasks
              .map(
                (subtask, index) =>
                  `${index + 1}. ${subtask.title}: ${
                    subtask.description || "No description"
                  }`
              )
              .join("\n");
            variables.EXISTING_SUBTASKS = existingSubtasksText;
          }

          if (stackInfo) {
            variables.STACK_INFO = stackInfo;
          }

          const promptResult = PromptBuilder.buildPrompt({
            name: "task-breakdown",
            type: "user",
            variables,
          });

          if (!promptResult.success) {
            throw new Error(
              `Failed to build task breakdown prompt: ${promptResult.error}`
            );
          }

          prompt = promptResult.prompt!;
        }

        let response: string;

        if (enableFilesystemTools) {
          const model = this.modelProvider.getModel({
            ...this.modelProvider.getAIConfig(),
            ...config,
          });

          const allTools = {
            ...filesystemTools,
          };

          const result = await streamText({
            model,
            tools: allTools,
            system:
              TASK_BREAKDOWN_SYSTEM_PROMPT +
              `

You have access to filesystem tools that allow you to:
- readFile: Read the contents of any file in the project
- listDirectory: List contents of directories

Use these tools to understand the project structure, existing code, and dependencies when breaking down tasks into subtasks.`,
            messages: [{ role: "user", content: userMessage || prompt }],
            maxRetries: 0,
            onChunk: streamingOptions?.onChunk
              ? ({ chunk }) => {
                  if (chunk.type === "text-delta") {
                    streamingOptions.onChunk!(chunk.text);
                  } else if (chunk.type === "reasoning-delta") {
                    streamingOptions.onReasoning?.(chunk.text);
                  }
                }
              : undefined,
            onFinish: streamingOptions?.onFinish
              ? ({ text, finishReason, usage }) => {
                  streamingOptions.onFinish!({
                    text,
                    finishReason,
                    usage,
                    isAborted: false,
                  });
                }
              : undefined,
          });

          response = await result.text;
        } else {
          response = await this.streamText(
            "",
            config,
            TASK_BREAKDOWN_SYSTEM_PROMPT,
            userMessage || prompt,
            streamingOptions,
            { maxAttempts: 1 }
          );
        }

        const parseResult = this.jsonParser.parseJSONFromResponse<{
          subtasks: ParsedAITask[];
        }>(response);
        if (!parseResult.success) {
          throw new Error(
            parseResult.error || "Failed to parse task breakdown response"
          );
        }

        const parsed = parseResult.data;

        return (parsed?.subtasks || []).map((subtask: ParsedAITask) => ({
          title: subtask.title,
          content: subtask.description || "",
          estimatedEffort: subtask.effort,
        }));
      },
      retryConfig,
      "Task breakdown"
    );
  }

  async enhanceTask(
    title: string,
    description?: string,
    config?: Partial<AIConfig>,
    promptOverride?: string,
    userMessage?: string,
    taskId?: string,
    streamingOptions?: StreamingOptions,
    retryConfig?: Partial<RetryConfig>
  ): Promise<string> {
    return this.retryHandler.executeWithRetry(
      async () => {
        let contextInfo = "";
        let prdContent = "";

        if (taskId) {
          const contextBuilder = getContextBuilder();
          try {
            const context = await contextBuilder.buildContext(taskId);
            if (context.documentation || context.stack || context.prdContent) {
              contextInfo = "\n\nAvailable Context:\n";

              if (context.stack) {
                contextInfo += formatStackForContext(context.stack) + "\n";
              }

              if (context.documentation) {
                contextInfo += `Documentation Available: ${context.documentation.recap}\n`;
                if (context.documentation.files.length > 0) {
                  contextInfo += `Documentation Files: ${context.documentation.files
                    .map((f) => f.path)
                    .join(", ")}\n`;
                }
              }

              if (context.prdContent) {
                prdContent = context.prdContent;
              }
            }
          } catch (error) {
            throw error;
          }
        }

        let prompt: string;
        if (promptOverride) {
          prompt = promptOverride;
        } else {
          const promptResult = PromptBuilder.buildPrompt({
            name: "task-enhancement",
            type: "user",
            variables: {
              TASK_TITLE: title,
              TASK_DESCRIPTION: description || "None",
              CONTEXT_INFO: contextInfo,
              PRD_CONTENT: prdContent || "No PRD content available",
            },
          });

          if (!promptResult.success) {
            throw new Error(
              `Failed to build task enhancement prompt: ${promptResult.error}`
            );
          }

          prompt = promptResult.prompt!;
        }

        return this.streamText(
          "",
          config,
          TASK_ENHANCEMENT_SYSTEM_PROMPT,
          userMessage || prompt,
          streamingOptions,
          { maxAttempts: 1 }
        );
      },
      retryConfig,
      "Task enhancement"
    );
  }

  async planTask(
    taskContext: string,
    taskDetails: string,
    config?: Partial<AIConfig>,
    promptOverride?: string,
    userMessage?: string,
    streamingOptions?: StreamingOptions,
    retryConfig?: Partial<RetryConfig>
  ): Promise<any> {
    return this.retryHandler.executeWithRetry(
      async () => {
        let prompt: string;
        if (promptOverride) {
          prompt = promptOverride;
        } else {
          const promptResult = PromptBuilder.buildPrompt({
            name: "task-planning",
            type: "user",
            variables: {
              TASK_CONTEXT: taskContext,
              TASK_DETAILS: taskDetails,
            },
          });

          if (!promptResult.success) {
            throw new Error(
              `Failed to build task planning prompt: ${promptResult.error}`
            );
          }

          prompt = promptResult.prompt!;
        }

        const model = this.modelProvider.getModel({
          ...this.modelProvider.getAIConfig(),
          ...config,
        });

        const mcpTools = await this.context7Client.getMCPTools();
        const allTools = {
          ...(mcpTools as ToolSet),
          ...filesystemTools,
        };

        const result = streamText({
          model,
          tools: allTools,
          system:
            TASK_PLANNING_SYSTEM_PROMPT +
            `

You have access to filesystem tools that allow you to:
- readFile: Read the contents of any file in the project
- listDirectory: List contents of directories

Use these tools to understand the project structure, existing code, and dependencies when creating implementation plans.`,
          messages: [{ role: "user", content: userMessage || prompt }],
          maxRetries: 0,
          onChunk: streamingOptions?.onChunk
            ? ({ chunk }) => {
                if (chunk.type === "text-delta") {
                  streamingOptions.onChunk!(chunk.text);
                } else if (chunk.type === "reasoning-delta") {
                  streamingOptions.onReasoning?.(chunk.text);
                }
              }
            : undefined,
          onFinish: streamingOptions?.onFinish
            ? ({ text, finishReason, usage }) => {
                streamingOptions.onFinish!({
                  text,
                  finishReason,
                  usage,
                  isAborted: false,
                });
              }
            : undefined,
        });

        return (await result).text;
      },
      retryConfig,
      "Task planning"
    );
  }
}
