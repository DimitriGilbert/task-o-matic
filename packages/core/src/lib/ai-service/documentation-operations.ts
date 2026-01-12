import { streamText, stepCountIs } from "ai";
import type { ToolSet } from "ai";
import {
  AIConfig,
  DocumentationDetection,
  StreamingOptions,
  RetryConfig,
  TaskDocumentation,
} from "../../types";
import { PromptBuilder } from "../prompt-builder";
import { TASK_ENHANCEMENT_SYSTEM_PROMPT } from "../../prompts";
import { getContextBuilder, getStorage } from "../../utils/ai-service-factory";
import { filesystemTools } from "./filesystem-tools";
import { BaseOperations } from "./base-operations";
import { logger } from "../logger";

export class DocumentationOperations extends BaseOperations {
  async enhanceTaskWithDocumentation(
    taskId: string,
    taskTitle: string,
    taskDescription: string,
    stackInfo?: string,
    streamingOptions?: StreamingOptions,
    retryConfig?: Partial<RetryConfig>,
    config?: Partial<AIConfig>,
    existingResearch?: Record<string, Array<{ query: string; doc: string }>>,
    enableFilesystemTools?: boolean
  ): Promise<string> {
    return this.retryHandler
      .executeWithRetry(
        async () => {
          const mcpTools = await this.context7Client.getMCPTools();
          const defaultAIConfig = this.modelProvider.getAIConfig();
          const aiConfig = config
            ? { ...defaultAIConfig, ...config }
            : defaultAIConfig;
          const model = this.modelProvider.getModel(aiConfig);

          const contextBuilder = getContextBuilder();
          const builtContext = await contextBuilder.buildContext("1.1");

          const existingResearchContext = existingResearch
            ? Object.entries(existingResearch)
                .map(
                  ([lib, entries]) =>
                    `### ${lib}\n${entries
                      .map((e) => `- Query: "${e.query}"`)
                      .join("\n")}`
                )
                .join("\n\n")
            : "No existing research available.";

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
              `Failed to build task enhancement prompt: ${promptResult.error}`
            );
          }

          const prompt = promptResult.prompt!;

          const allTools = {
            ...(mcpTools as ToolSet),
            ...(enableFilesystemTools ? filesystemTools : {}),
          };

          const result = await streamText({
            model,
            tools: allTools,
            system:
              TASK_ENHANCEMENT_SYSTEM_PROMPT +
              `

You have access to Context7 documentation tools${
                enableFilesystemTools ? " and filesystem tools" : ""
              }.

## Available Tools:
- Context7 MCP tools (context7_resolve_library_id, context7_get_library_docs) for library documentation
${
  enableFilesystemTools
    ? `- readFile: Read the contents of any file in the project
- listDirectory: List contents of directories`
    : ""
}

## Research Strategy:
1. Use Context7 MCP tools for library documentation research
${
  enableFilesystemTools
    ? `2. Use filesystem tools to understand project structure, existing code, and dependencies`
    : ""
}
${
  enableFilesystemTools ? "3" : "2"
}. Synthesize information from all sources to enhance the task

Technology stack context: ${stackInfo || "Not specified"}

## Available Cached Research:
${existingResearchContext}`,
            messages: [
              {
                role: "user",
                content: prompt,
              },
            ],
            maxRetries: 0,
            stopWhen: stepCountIs(8),
            onError: ({ error }) => {
              streamingOptions?.onError?.(error);
              throw error;
            },
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

          const toolCalls = await result.toolCalls;
          const toolResults = await result.toolResults;

          if (toolCalls.length > 0) {
            logger.info(
              `AI made tool calls: ${JSON.stringify(toolCalls.map((tc) => ({ tool: tc?.toolName, input: tc?.input })))}`
            );
          }

          if (toolResults.length > 0) {
            logger.info(
              `Tool results received: ${JSON.stringify(toolResults.map((tr) => ({
                tool: tr?.toolName,
                output: tr?.output,
              })))}`
            );
          }

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
        "Task enhancement with documentation"
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
    enableFilesystemTools?: boolean
  ): Promise<DocumentationDetection> {
    // @ts-expect-error tool result type discrepency i cant be bothered with (that will probably bite me later...)
    return this.retryHandler
      .executeWithRetry(
        async () => {
          const mcpTools = await this.context7Client.getMCPTools();
          const defaultAIConfig = this.modelProvider.getAIConfig();
          const aiConfig = config
            ? { ...defaultAIConfig, ...config }
            : defaultAIConfig;
          const model = this.modelProvider.getModel(aiConfig);

          const existingResearchContext = existingResearch
            ? "## Existing research\n" +
              existingResearch
                .map(
                  (rs) =>
                    rs &&
                    `${rs.recap}\n#### librairies\n${rs.libraries.join(
                      `- \n`
                    )}\n\n#### files:\n${rs.libraries.join(`- \n`)}`
                )
                .join("\n\n")
            : "No existing research available.";

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
              `Failed to build documentation detection prompt: ${promptResult.error}`
            );
          }

          const prompt = promptResult.prompt!;

          const libraries: Array<{
            name: string;
            context7Id: string;
            reason: string;
            searchQuery: string;
          }> = [];
          const files: string[] = [];

          const allTools = {
            ...(mcpTools as ToolSet),
            ...(enableFilesystemTools ? filesystemTools : {}),
          };

          const result = await streamText({
            model,
            tools: allTools,
            system: `You are an expert developer.\nYou have access to Context7 MCP tools for documentation research.\nFetch documentation relevant to the task in the project context and create a document giving that knowledge to the AI assistant that will implement the task.`,
            messages: [{ role: "user", content: prompt }],
            maxRetries: 0,
            stopWhen: stepCountIs(8),
            onError: ({ error }) => {
              streamingOptions?.onError?.(error);
              throw error;
            },
            onChunk: streamingOptions?.onChunk
              ? ({ chunk }) => {
                  if (chunk.type === "text-delta") {
                    streamingOptions.onChunk!(chunk.text);
                  } else if (chunk.type === "reasoning-delta") {
                    streamingOptions.onReasoning?.(chunk.text);
                  } else if (chunk.type === "tool-result") {
                    if (chunk.toolName === "get-library-docs" && chunk.output) {
                      (async () => {
                        try {
                          const input = chunk.input as {
                            context7CompatibleLibraryID: string;
                            tokens?: number;
                            topic?: string;
                          };
                          const libraryId = input.context7CompatibleLibraryID;
                          const libraryName =
                            libraryId.split("/").pop() || "unknown";
                          const timestamp = Date.now();
                          const filename =
                            input.topic ?? `${libraryName}-${timestamp}`;

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
                            const docFile =
                              await this.context7Client.saveContext7Documentation(
                                libraryName,
                                filename,
                                content
                              );

                            libraries.push({
                              name: libraryName,
                              context7Id: libraryId,
                              reason:
                                "Documentation fetched for task implementation",
                              searchQuery: filename,
                            });

                            files.push(docFile);
                          }
                        } catch (error) {
                          logger.error(
                            `Failed to save Context7 documentation: ${error}`
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

          let fullText = "";
          for await (const textPart of result.textStream) {
            fullText += textPart;
          }

          const toolResults = await result.toolResults;
          const toolCalls = await result.toolCalls;

          if (fullText.trim()) {
            try {
              const storage = getStorage();
              const taskDocFile = await storage.saveTaskDocumentation(
                taskId,
                fullText
              );
              files.push(taskDocFile);
            } catch (error) {
              logger.error(`Failed to save task documentation: ${error}`);
            }
          }

          return {
            libraries,
            confidence: libraries.length > 0 ? 0.8 : 0.3,
            toolResults: toolResults.map((tr) => ({
              toolName: tr?.toolName,
              output: tr?.output,
            })),
            files,
          };
        },
        retryConfig,
        "Documentation needs analysis"
      )
      .finally(async () => {
        await this.context7Client.closeMCPConnection();
      });
  }

  async generateDocumentationRecap(
    libraries: Array<{ name: string; context7Id: string; reason: string }>,
    documentContents: Array<{ library: string; content: string }>,
    streamingOptions?: StreamingOptions,
    retryConfig?: Partial<RetryConfig>
  ): Promise<string> {
    // Build variables for PromptBuilder
    const librariesList = libraries
      .map((lib) => `- ${lib.name} (${lib.context7Id}): ${lib.reason}`)
      .join("\n");

    const documentationContents = documentContents
      .map((doc) => `## ${doc.library}\n${doc.content.substring(0, 500)}...`)
      .join("\n\n");

    const promptResult = PromptBuilder.buildPrompt({
      name: "documentation-recap",
      type: "user",
      variables: {
        LIBRARIES_LIST: librariesList,
        DOCUMENTATION_CONTENTS: documentationContents,
      },
    });

    if (!promptResult.success) {
      throw new Error(
        `Failed to build documentation recap prompt: ${promptResult.error}`
      );
    }

    const systemPromptResult = PromptBuilder.buildPrompt({
      name: "documentation-recap",
      type: "system",
      variables: {},
    });

    return this.retryHandler.executeWithRetry(
      async () => {
        return this.streamText(
          promptResult.prompt!,
          undefined,
          systemPromptResult.prompt!,
          undefined,
          streamingOptions,
          { maxAttempts: 1 }
        );
      },
      retryConfig,
      "Documentation recap generation"
    );
  }
}
