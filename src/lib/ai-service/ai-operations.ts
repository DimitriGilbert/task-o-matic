import { streamText, stepCountIs } from "ai";
import type { ToolSet } from "ai";
import type { LanguageModelV2 } from "@ai-sdk/provider";
import {
  AIConfig,
  Task,
  AIPRDParseResult,
  DocumentationDetection,
  StreamingOptions,
  RetryConfig,
  ParsedAITask,
  PRDResponse,
  TaskDocumentation,
} from "../../types";
import { ContextBuilder } from "../context-builder";
import { PromptBuilder } from "../prompt-builder";
import { formatStackForContext } from "../../utils/stack-formatter";
import {
  PRD_PARSING_SYSTEM_PROMPT,
  TASK_BREAKDOWN_SYSTEM_PROMPT,
  TASK_ENHANCEMENT_SYSTEM_PROMPT,
  PRD_REWORK_SYSTEM_PROMPT,
  TASK_PLANNING_SYSTEM_PROMPT,
} from "../../prompts";
import { getStorage } from "../../utils/ai-service-factory";
import { JSONParser } from "./json-parser";
import { Context7Client } from "./mcp-client";
import { RetryHandler } from "./retry-handler";
import { ModelProvider } from "./model-provider";
import { filesystemTools } from "./filesystem-tools";

export class AIOperations {
  private jsonParser = new JSONParser();
  private context7Client = new Context7Client();
  private retryHandler = new RetryHandler();
  private modelProvider = new ModelProvider();
  // private researchTools = new ResearchTools(); // COMMENTED OUT - TESTING

  async streamText(
    prompt: string,
    config?: Partial<AIConfig>,
    systemPrompt?: string,
    userMessage?: string,
    streamingOptions?: StreamingOptions,
    retryConfig?: Partial<RetryConfig>,
  ): Promise<string> {
    const aiConfig = { ...this.modelProvider.getAIConfig(), ...config };

    return this.retryHandler.executeWithRetry(
      async () => {
        const model = this.modelProvider.getModel(aiConfig);

        const result = streamText({
          model,
          system: systemPrompt,
          messages: [{ role: "user", content: userMessage || prompt }],
          maxRetries: 0, // Disable built-in retries since we handle them manually
          onError: ({ error }) => {
            // Call user's error callback if provided
            streamingOptions?.onError?.(error);
            // Re-throw the FULL error to maintain existing error handling behavior
            throw error;
          },
          onChunk: streamingOptions?.onChunk
            ? ({ chunk }) => {
                if (chunk.type === "text-delta") {
                  streamingOptions.onChunk!(chunk.text);
                } else if (
                  chunk.type === "tool-result" &&
                  chunk.toolName === "get-library-docs"
                ) {
                  const docs = chunk.output;
                  if (docs && typeof docs === "object" && "content" in docs) {
                    this.context7Client.saveContext7Documentation(
                      chunk.input?.context7CompatibleLibraryID || "unknown",
                      docs.content,
                      chunk.input?.topic || "general",
                    );
                  } else if (docs && typeof docs === "string") {
                    this.context7Client.saveContext7Documentation(
                      chunk.input?.context7CompatibleLibraryID || "unknown",
                      docs,
                      chunk.input?.topic || "general",
                    );
                  }
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
          // Add reasoning configuration only for OpenRouter with explicit reasoning parameter
          ...(aiConfig.provider === "openrouter" &&
          aiConfig.reasoning &&
          aiConfig.reasoning.maxTokens
            ? {
                providerOptions: {
                  openrouter: {
                    reasoning: {
                      max_tokens: aiConfig.reasoning.maxTokens,
                    },
                  },
                },
              }
            : {}),
        });

        let fullText = "";
        for await (const textPart of result.textStream) {
          fullText += textPart;
        }

        return fullText;
      },
      retryConfig,
      "AI streaming",
    );
  }

  async parsePRD(
    prdContent: string,
    config?: Partial<AIConfig>,
    promptOverride?: string,
    userMessage?: string,
    streamingOptions?: StreamingOptions,
    retryConfig?: Partial<RetryConfig>,
    workingDirectory?: string, // Working directory passed from service layer
    enableFilesystemTools?: boolean,
  ): Promise<AIPRDParseResult> {
    return this.retryHandler.executeWithRetry(
      async () => {
        // Get stack context for better PRD parsing using PromptBuilder
        // Pass working directory explicitly to avoid process.cwd() issues
        let stackInfo = "";
        try {
          stackInfo = await PromptBuilder.detectStackInfo(workingDirectory);
          if (stackInfo === "Not detected") {
            stackInfo = "";
          }
        } catch (error) {
          // Stack info not available, will use empty string
        }

        // Use PromptBuilder if no prompt override provided
        let enhancedPrompt: string;
        if (promptOverride) {
          enhancedPrompt = promptOverride;
        } else {
          const variables: Record<string, string> = {
            PRD_CONTENT: prdContent,
          };

          // Only include stack info if we have it
          if (stackInfo) {
            variables.STACK_INFO = stackInfo;
          }

          const promptResult = PromptBuilder.buildPrompt({
            name: "prd-parsing",
            type: "user",
            variables,
          });

          if (!promptResult.success) {
            throw new Error(
              `Failed to build PRD parsing prompt: ${promptResult.error}`,
            );
          }

          enhancedPrompt = promptResult.prompt!; // TypeScript: prompt is guaranteed when success is true
        }

        let response: string;

        if (enableFilesystemTools) {
          // Use filesystem tools when enabled
          const model = this.modelProvider.getModel({ ...this.modelProvider.getAIConfig(), ...config });
          
          const allTools = {
            ...filesystemTools,
          };

          const result = streamText({
            model,
            tools: allTools, // Filesystem tools for project analysis
            system: PRD_PARSING_SYSTEM_PROMPT + `

You have access to filesystem tools that allow you to:
- readFile: Read the contents of any file in the project
- listDirectory: List contents of directories

Use these tools to understand the project structure, existing code patterns, and dependencies when parsing the PRD and creating tasks.`,
            messages: [{ role: "user", content: userMessage || enhancedPrompt }],
            maxRetries: 0,
            onChunk: streamingOptions?.onChunk
              ? ({ chunk }) => {
                  if (chunk.type === "text-delta") {
                    streamingOptions.onChunk!(chunk.text);
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

          response = (await result).text;
        } else {
          // Use standard streamText without tools
          response = await this.streamText(
            "", // empty prompt since we use messages
            config,
            PRD_PARSING_SYSTEM_PROMPT,
            userMessage || enhancedPrompt,
            streamingOptions,
            { maxAttempts: 1 }, // Disable retries here since we're handling them at the outer level
          );
        }

        // Parse JSON from response using proper typing
        const parseResult =
          this.jsonParser.parseJSONFromResponse<PRDResponse>(response);
        if (!parseResult.success) {
          throw new Error(parseResult.error || "Failed to parse PRD response");
        }

        const parsed = parseResult.data;

        // Transform to our format with proper IDs for dependencies
        const tasks: Task[] = (parsed?.tasks || []).map(
          (task: ParsedAITask, index: number) => {
            const taskId = (task.id as string) || (index + 1).toString();

            // Extract all AI-generated keys except the ones we handle separately
            const {
              title,
              description,
              content,
              effort,
              dependencies,
              ...extraData
            } = task;

            // Create comprehensive content from all AI data
            let fullContent = "";
            if (description || content) {
              fullContent = description || content || "";
            }

            // Add any extra AI-generated data as structured content
            if (Object.keys(extraData).length > 0) {
              fullContent += "\n\n## Additional AI-Generated Information\n";
              for (const [key, value] of Object.entries(extraData)) {
                fullContent += `\n**${key}:** ${JSON.stringify(value, null, 2)}`;
              }
            }

            return {
              id: taskId,
              title: task.title,
              description:
                (task.description || task.content || "").substring(0, 200) +
                ((task.description || task.content || "").length > 200
                  ? "..."
                  : ""),
              content: fullContent,
              status: "todo" as const,
              createdAt: Date.now(),
              updatedAt: Date.now(),
              estimatedEffort: task.effort,
              dependencies: task.dependencies || [],
              tags: (task.tags as string[]) || [],
            };
          },
        );

        return {
          tasks,
          summary: parsed?.summary || "PRD parsed successfully",
          estimatedDuration: parsed?.estimatedDuration || "Unknown",
          confidence: parsed?.confidence || 0.7,
        };
      },
      retryConfig,
      "PRD parsing",
    );
  }

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
    enableFilesystemTools?: boolean,
  ): Promise<
    Array<{ title: string; content: string; estimatedEffort?: string }>
  > {
    return this.retryHandler.executeWithRetry(
      async () => {
        // Use PromptBuilder if no prompt override provided
        let prompt: string;
        if (promptOverride) {
          prompt = promptOverride;
        } else {
          // Build enhanced variables for task breakdown
          const variables: Record<string, string> = {
            TASK_TITLE: task.title,
            TASK_DESCRIPTION: task.description || "No description",
          };

          // Add full content if available
          if (fullContent) {
            variables.TASK_CONTENT = fullContent;
          }

          // Add existing subtasks if available
          if (existingSubtasks && existingSubtasks.length > 0) {
            const existingSubtasksText = existingSubtasks
              .map(
                (subtask, index) =>
                  `${index + 1}. ${subtask.title}: ${subtask.description || "No description"}`,
              )
              .join("\n");
            variables.EXISTING_SUBTASKS = existingSubtasksText;
          }

          // Add stack info if available
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
              `Failed to build task breakdown prompt: ${promptResult.error}`,
            );
          }

          prompt = promptResult.prompt!;
        }

        let response: string;

        if (enableFilesystemTools) {
          // Use filesystem tools when enabled
          const model = this.modelProvider.getModel({ ...this.modelProvider.getAIConfig(), ...config });
          
          const allTools = {
            ...filesystemTools,
          };

          const result = streamText({
            model,
            tools: allTools, // Filesystem tools for project analysis
            system: TASK_BREAKDOWN_SYSTEM_PROMPT + `

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

          response = (await result).text;
        } else {
          // Use standard streamText without tools
          response = await this.streamText(
            "", // empty prompt since we use messages
            config,
            TASK_BREAKDOWN_SYSTEM_PROMPT,
            userMessage || prompt,
            streamingOptions,
            { maxAttempts: 1 }, // Disable retries here since we're handling them at the outer level
          );
        }

        // Parse JSON from response using proper typing
        const parseResult = this.jsonParser.parseJSONFromResponse<{
          subtasks: ParsedAITask[];
        }>(response);
        if (!parseResult.success) {
          throw new Error(
            parseResult.error || "Failed to parse task breakdown response",
          );
        }

        const parsed = parseResult.data;

        // Return plain task data - let storage layer handle IDs and metadata
        return (parsed?.subtasks || []).map((subtask: ParsedAITask) => ({
          title: subtask.title,
          content: subtask.description || "",
          estimatedEffort: subtask.effort,
        }));
      },
      retryConfig,
      "Task breakdown",
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
    retryConfig?: Partial<RetryConfig>,
  ): Promise<string> {
    return this.retryHandler.executeWithRetry(
      async () => {
        let contextInfo = "";

        let prdContent = "";

        // If taskId is provided, include existing documentation context
        if (taskId) {
          const contextBuilder = new ContextBuilder();
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
                  contextInfo += `Documentation Files: ${context.documentation.files.map((f) => f.path).join(", ")}\n`;
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

        // Use PromptBuilder if no prompt override provided
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
              `Failed to build task enhancement prompt: ${promptResult.error}`,
            );
          }

          prompt = promptResult.prompt!;
        }

        return this.streamText(
          "", // empty prompt since we use messages
          config,
          TASK_ENHANCEMENT_SYSTEM_PROMPT,
          userMessage || prompt,
          streamingOptions,
          { maxAttempts: 1 }, // Disable retries here since we're handling them at the outer level
        );
      },
      retryConfig,
      "Task enhancement",
    );
  }

  async reworkPRD(
    prdContent: string,
    feedback: string,
    config?: Partial<AIConfig>,
    promptOverride?: string,
    userMessage?: string,
    streamingOptions?: StreamingOptions,
    retryConfig?: Partial<RetryConfig>,
    workingDirectory?: string, // Working directory passed from service layer
    enableFilesystemTools?: boolean,
  ): Promise<string> {
    return this.retryHandler.executeWithRetry(
      async () => {
        // Get stack context for better PRD rework using PromptBuilder
        // Pass working directory explicitly to avoid process.cwd() issues
        let stackInfo = "";
        try {
          stackInfo = await PromptBuilder.detectStackInfo(workingDirectory);
          if (stackInfo === "Not detected") {
            stackInfo = "";
          }
        } catch (error) {
          // Stack info not available, will use empty string
        }

        // Use PromptBuilder if no prompt override provided
        let prompt: string;
        if (promptOverride) {
          prompt = promptOverride;
        } else {
          const variables: Record<string, string> = {
            PRD_CONTENT: prdContent,
            USER_FEEDBACK: feedback,
          };

          // Only include stack info if we have it
          if (stackInfo) {
            variables.STACK_INFO = stackInfo;
          }

          const promptResult = PromptBuilder.buildPrompt({
            name: "prd-rework",
            type: "user",
            variables,
          });

          if (!promptResult.success) {
            throw new Error(
              `Failed to build PRD rework prompt: ${promptResult.error}`,
            );
          }

          prompt = promptResult.prompt!;
        }

        if (enableFilesystemTools) {
          // Use filesystem tools when enabled
          const model = this.modelProvider.getModel({ ...this.modelProvider.getAIConfig(), ...config });
          
          const allTools = {
            ...filesystemTools,
          };

          const result = streamText({
            model,
            tools: allTools, // Filesystem tools for project analysis
            system: PRD_REWORK_SYSTEM_PROMPT + `

You have access to filesystem tools that allow you to:
- readFile: Read the contents of any file in the project
- listDirectory: List contents of directories

Use these tools to understand the current project structure, existing code patterns, and dependencies when reworking the PRD based on feedback.`,
            messages: [{ role: "user", content: userMessage || prompt }],
            maxRetries: 0,
            onChunk: streamingOptions?.onChunk
              ? ({ chunk }) => {
                  if (chunk.type === "text-delta") {
                    streamingOptions.onChunk!(chunk.text);
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
        } else {
          // Use standard streamText without tools
          return this.streamText(
            "", // empty prompt since we use messages
            config,
            PRD_REWORK_SYSTEM_PROMPT,
            userMessage || prompt,
            streamingOptions,
            { maxAttempts: 1 }, // Disable retries here since we're handling them at the outer level
          );
        }
      },
      retryConfig,
      "PRD rework",
    );
  }

  // Context7 Integration Methods
  async enhanceTaskWithDocumentation(
    taskId: string,
    taskTitle: string,
    taskDescription: string,
    stackInfo?: string,
    streamingOptions?: StreamingOptions,
    retryConfig?: Partial<RetryConfig>,
    config?: Partial<AIConfig>,
    existingResearch?: Record<string, Array<{ query: string; doc: string }>>,
    // existingResearch?: (TaskDocumentation | undefined)[],
  ): Promise<string> {
    return this.retryHandler
      .executeWithRetry(
        async () => {
          // Context7 integration via HTTP calls
          const mcpTools = await this.context7Client.getMCPTools();
          const defaultAIConfig = this.modelProvider.getAIConfig();
          const aiConfig = config
            ? { ...defaultAIConfig, ...config }
            : defaultAIConfig;
          const model = this.modelProvider.getModel(aiConfig);

          // Get custom research tools
          // const customResearchTools = this.researchTools.getResearchTools();

          // Build context for this operation using the actual task ID
          const contextBuilder = new ContextBuilder();
          const builtContext = await contextBuilder.buildContext("1.1");

          // Build existing research context
          const existingResearchContext = existingResearch
            ? Object.entries(existingResearch)
                .map(
                  ([lib, entries]) =>
                    `### ${lib}\n${entries.map((e) => `- Query: "${e.query}"`).join("\n")}`,
                )
                .join("\n\n")
            : "No existing research available.";
          // const existingResearchContext = existingResearch
          //   ? "## Existing research\n" +
          //     existingResearch
          //       .map(
          //         (rs) =>
          //           rs &&
          //           `${rs.recap}\n#### librairies\n${rs.libraries.join(`- \n`)}\n\n#### files:\n${rs.libraries.join(`- \n`)}`,
          //       )
          //       .join("\n\n")
          //   : "No existing research available.";

          // Use PromptBuilder for consistent prompt handling
          const promptResult = PromptBuilder.buildPrompt({
            name: "task-enhancement",
            type: "user",
            variables: {
              TASK_TITLE: taskTitle,
              TASK_DESCRIPTION: taskDescription,
              CONTEXT_INFO: `Technology stack: ${stackInfo || "Not specified"}`,
              EXISTING_RESEARCH: existingResearchContext,
              PRD_CONTENT:
                builtContext.prdContent || "No PRD content available",
            },
          });

          if (!promptResult.success) {
            throw new Error(
              `Failed to build task enhancement prompt: ${promptResult.error}`,
            );
          }

          const prompt = promptResult.prompt!;

          // Merge Context7 MCP tools with filesystem tools
          const allTools = {
            ...(mcpTools as ToolSet),
            ...filesystemTools,
          };

          const result = streamText({
            model,
            tools: allTools, // Context7 MCP tools + filesystem tools
            system:
              TASK_ENHANCEMENT_SYSTEM_PROMPT +
              `

You have access to Context7 documentation tools and filesystem tools.

## Available Tools:
- Context7 MCP tools (context7_resolve_library_id, context7_get_library_docs) for library documentation
- readFile: Read the contents of any file in the project
- listDirectory: List contents of directories

## Research Strategy:
1. Use Context7 MCP tools for library documentation research
2. Use filesystem tools to understand project structure, existing code, and dependencies
3. Synthesize information from all sources to enhance the task

Technology stack context: ${stackInfo || "Not specified"}

## Available Cached Research:
${existingResearchContext}`,
            messages: [
              {
                role: "user",
                content: prompt,
              },
            ],
            maxRetries: 0, // Disable built-in retries since we handle them manually
            stopWhen: stepCountIs(8), // Allow more steps for comprehensive research
            onError: ({ error }) => {
              // Call user's error callback if provided
              streamingOptions?.onError?.(error);
              // Re-throw errors to maintain existing error handling behavior
              throw error;
            },
            onChunk: streamingOptions?.onChunk
              ? ({ chunk }) => {
                  if (chunk.type === "text-delta") {
                    streamingOptions.onChunk!(chunk.text);
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

          // Process tool calls and results properly
          const toolCalls = await result.toolCalls;
          const toolResults = await result.toolResults;

          // Log tool interactions for debugging
          if (toolCalls.length > 0) {
            console.log(
              "AI made tool calls:",
              toolCalls.map((tc) => ({ tool: tc.toolName, input: tc.input })),
            );
          }

          if (toolResults.length > 0) {
            console.log(
              "Tool results received:",
              toolResults.map((tr) => ({
                tool: tr.toolName,
                output: tr.output,
              })),
            );
          }

          // Process the stream properly to ensure tool calls execute
          let fullText = "";
          for await (const textPart of result.textStream) {
            fullText += textPart;
            if (streamingOptions?.onChunk) {
              streamingOptions.onChunk(textPart);
            }
          }

          return fullText;
        },
        retryConfig,
        "Task enhancement with documentation",
      )
      .finally(async () => {
        await this.context7Client.closeMCPConnection();
      });
  }

  async analyzeDocumentationNeeds(
    taskId: string,
    taskTitle: string,
    taskDescription: string,
    stackInfo?: string,
    streamingOptions?: StreamingOptions,
    retryConfig?: Partial<RetryConfig>,
    config?: Partial<AIConfig>,
    existingResearch?: (TaskDocumentation | undefined)[],
  ): Promise<DocumentationDetection> {
    return this.retryHandler
      .executeWithRetry(
        async () => {
          const mcpTools = await this.context7Client.getMCPTools();
          const defaultAIConfig = this.modelProvider.getAIConfig();
          const aiConfig = config
            ? { ...defaultAIConfig, ...config }
            : defaultAIConfig;
          const model = this.modelProvider.getModel(aiConfig);

          // Build existing research context

          const existingResearchContext = existingResearch
            ? "## Existing research\n" +
              existingResearch
                .map(
                  (rs) =>
                    rs &&
                    `${rs.recap}\n#### librairies\n${rs.libraries.join(`- \n`)}\n\n#### files:\n${rs.libraries.join(`- \n`)}`,
                )
                .join("\n\n")
            : "No existing research available.";

          // Use PromptBuilder for consistent prompt handling
          const promptResult = PromptBuilder.buildPrompt({
            name: "documentation-detection",
            type: "user",
            variables: {
              TASK_TITLE: taskTitle,
              TASK_DESCRIPTION: taskDescription,
              STACK_INFO: stackInfo || "Not specified",
              EXISTING_RESEARCH: existingResearchContext,
            },
          });

          if (!promptResult.success) {
            throw new Error(
              `Failed to build documentation detection prompt: ${promptResult.error}`,
            );
          }

          const prompt = promptResult.prompt!;

          // Track actual libraries and files saved
          const libraries: Array<{
            name: string;
            context7Id: string;
            reason: string;
            searchQuery: string;
          }> = [];
          const files: string[] = [];

          // Merge Context7 MCP tools with custom research tools
          const allTools = {
            ...(mcpTools as ToolSet),
          };

          const result = streamText({
            model,
            tools: allTools,
            system: `You are an expert developer.\nYou have access to Context7 MCP tools for documentation research.\nFetch documentation relevant to the task in the project context and create a document giving that knowledge to the AI assistant that will implement the task.`,
            messages: [{ role: "user", content: prompt }],
            maxRetries: 0,
            stopWhen: stepCountIs(8), // Allow more steps for comprehensive analysis
            onError: ({ error }) => {
              // Call user's error callback if provided
              streamingOptions?.onError?.(error);
              // Re-throw errors to maintain existing error handling behavior
              throw error;
            },
            onChunk: streamingOptions?.onChunk
              ? ({ chunk }) => {
                  if (chunk.type === "text-delta") {
                    streamingOptions.onChunk!(chunk.text);
                  } else if (chunk.type === "tool-result") {
                    // Save Context7 documentation if this is a library docs result
                    if (chunk.toolName === "get-library-docs" && chunk.output) {
                      (async () => {
                        try {
                          // Extract library from the tool input
                          const input = chunk.input as {
                            context7CompatibleLibraryID: string;
                            tokens?: number;
                            topic?: string;
                          };
                          const libraryId = input.context7CompatibleLibraryID;
                          // Generate unique filename using library ID and timestamp
                          const libraryName =
                            libraryId.split("/").pop() || "unknown";
                          const timestamp = Date.now();
                          const filename =
                            input.topic ?? `${libraryName}-${timestamp}`;

                          // Extract content from tool result object
                          let content = "";
                          if (
                            chunk.output &&
                            typeof chunk.output === "object"
                          ) {
                            if ("content" in chunk.output) {
                              const contentArray = chunk.output
                                .content as Array<{
                                type: string;
                                text: string;
                              }>;
                              if (Array.isArray(contentArray)) {
                                content = contentArray
                                  .map((item) => item.text || "")
                                  .join("\n");
                              } else {
                                content = String(contentArray);
                              }
                            } else if ("text" in chunk.output) {
                              content = chunk.output.text as string;
                            }
                          } else if (typeof chunk.output === "string") {
                            content = chunk.output;
                          }

                          if (content) {
                            // Save documentation and get the file path
                            const docFile =
                              await this.context7Client.saveContext7Documentation(
                                libraryName,
                                filename,
                                content,
                              );

                            // BUILD THE LIBRARIES ARRAY WITH ACTUAL DATA
                            libraries.push({
                              name: libraryName,
                              context7Id: libraryId,
                              reason:
                                "Documentation fetched for task implementation",
                              searchQuery: filename,
                            });

                            // TRACK THE ACTUAL FILE PATH
                            files.push(docFile);
                          }
                        } catch (error) {
                          console.error(
                            "Failed to save Context7 documentation:",
                            error,
                          );
                        }
                      })();
                    }
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

          // Process the stream properly to ensure tool calls execute
          let fullText = "";
          for await (const textPart of result.textStream) {
            fullText += textPart;
          }

          // Get tool results for processing
          const toolResults = await result.toolResults;
          const toolCalls = await result.toolCalls;

          // Save the generated documentation to a task-specific file
          if (fullText.trim()) {
            try {
              const storage = getStorage();
              const taskDocFile = await storage.saveTaskDocumentation(
                taskId,
                fullText,
              );
              files.push(taskDocFile);
            } catch (error) {
              console.error("Failed to save task documentation:", error);
            }
          }

          return {
            libraries,
            confidence: libraries.length > 0 ? 0.8 : 0.3,
            toolResults: toolResults.map((tr) => ({
              toolName: tr.toolName,
              output: tr.output,
            })),
            files, // Return actual files saved
          };
        },
        retryConfig,
        "Documentation needs analysis",
      )
      .finally(async () => {
        await this.context7Client.closeMCPConnection();
      });
  }

  async generateDocumentationRecap(
    libraries: Array<{ name: string; context7Id: string; reason: string }>,
    documentContents: Array<{ library: string; content: string }>,
    streamingOptions?: StreamingOptions,
    retryConfig?: Partial<RetryConfig>,
  ): Promise<string> {
    const prompt = `Create a concise recap of the documentation fetched for these libraries:

Libraries:
${libraries.map((lib) => `- ${lib.name} (${lib.context7Id}): ${lib.reason}`).join("\n")}

Documentation Contents:
${documentContents.map((doc) => `## ${doc.library}\n${doc.content.substring(0, 500)}...`).join("\n\n")}

Please provide a 2-3 sentence summary of what documentation is available and how it relates to the task.`;

    return this.retryHandler.executeWithRetry(
      async () => {
        return this.streamText(
          prompt,
          undefined,
          "You are a technical writer who creates concise summaries of documentation collections.",
          undefined,
          streamingOptions,
          { maxAttempts: 1 }, // Disable retries here since we're handling them at the outer level
        );
      },
      retryConfig,
      "Documentation recap generation",
    );
  }

  async planTask(
    taskContext: string,
    taskDetails: string,
    config?: Partial<AIConfig>,
    promptOverride?: string,
    userMessage?: string,
    streamingOptions?: StreamingOptions,
    retryConfig?: Partial<RetryConfig>,
  ): Promise<any> {
    return this.retryHandler.executeWithRetry(
      async () => {
        // Use PromptBuilder if no prompt override provided
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
              `Failed to build task planning prompt: ${promptResult.error}`,
            );
          }

          prompt = promptResult.prompt!;
        }

        const model = this.modelProvider.getModel({ ...this.modelProvider.getAIConfig(), ...config });
        
        // Get MCP tools and merge with filesystem tools
        const mcpTools = await this.context7Client.getMCPTools();
        const allTools = {
          ...(mcpTools as ToolSet),
          ...filesystemTools,
        };

        const result = streamText({
          model,
          tools: allTools, // Context7 MCP tools + filesystem tools
          system: TASK_PLANNING_SYSTEM_PROMPT + `

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

        // Return the plan text directly - no JSON parsing needed
        return (await result).text;
      },
      retryConfig,
      "Task planning",
    );
  }
}
