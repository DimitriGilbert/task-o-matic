import { streamText } from "ai";
import type { ToolSet } from "ai";
import {
  AIConfig,
  Task,
  AIPRDParseResult,
  StreamingOptions,
  RetryConfig,
  ParsedAITask,
  PRDResponse,
  PRDQuestionResponse,
} from "../../types";
import { PromptBuilder } from "../prompt-builder";
import {
  PRD_PARSING_SYSTEM_PROMPT,
  PRD_REWORK_SYSTEM_PROMPT,
  PRD_GENERATION_SYSTEM_PROMPT,
  PRD_COMBINATION_SYSTEM_PROMPT,
} from "../../prompts";
import { JSONParser } from "./json-parser";
import { RetryHandler } from "./retry-handler";
import { ModelProvider } from "./model-provider";
import { filesystemTools } from "./filesystem-tools";
import { BaseOperations } from "./base-operations";

export class PRDOperations extends BaseOperations {
  async parsePRD(
    prdContent: string,
    config?: Partial<AIConfig>,
    promptOverride?: string,
    userMessage?: string,
    streamingOptions?: StreamingOptions,
    retryConfig?: Partial<RetryConfig>,
    workingDirectory?: string,
    enableFilesystemTools?: boolean
  ): Promise<AIPRDParseResult> {
    return this.retryHandler.executeWithRetry(
      async () => {
        let stackInfo = "";
        try {
          stackInfo = await PromptBuilder.detectStackInfo(workingDirectory);
          if (stackInfo === "Not detected") {
            stackInfo = "";
          }
        } catch (error) {
          // Stack info not available
        }

        let enhancedPrompt: string;
        if (promptOverride) {
          enhancedPrompt = promptOverride;
        } else {
          const variables: Record<string, string> = {
            PRD_CONTENT: prdContent,
          };

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
              `Failed to build PRD parsing prompt: ${promptResult.error}`
            );
          }

          enhancedPrompt = promptResult.prompt!;
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
              PRD_PARSING_SYSTEM_PROMPT +
              `

You have access to filesystem tools that allow you to:
- readFile: Read the contents of any file in the project
- listDirectory: List contents of directories

Use these tools to understand the project structure, existing code patterns, and dependencies when parsing the PRD and creating tasks.`,
            messages: [
              { role: "user", content: userMessage || enhancedPrompt },
            ],
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
            PRD_PARSING_SYSTEM_PROMPT,
            userMessage || enhancedPrompt,
            streamingOptions,
            { maxAttempts: 1 }
          );
        }

        const parseResult =
          this.jsonParser.parseJSONFromResponse<PRDResponse>(response);
        if (!parseResult.success) {
          throw new Error(parseResult.error || "Failed to parse PRD response");
        }

        const parsed = parseResult.data;

        const tasks: Task[] = (parsed?.tasks || []).map(
          (task: ParsedAITask, index: number) => {
            const taskId = (task.id as string) || (index + 1).toString();

            const {
              title,
              description,
              content,
              effort,
              dependencies,
              ...extraData
            } = task;

            let fullContent = "";
            if (description || content) {
              fullContent = description || content || "";
            }

            if (Object.keys(extraData).length > 0) {
              fullContent += "\n\n## Additional AI-Generated Information\n";
              for (const [key, value] of Object.entries(extraData)) {
                fullContent += `\n**${key}:** ${JSON.stringify(
                  value,
                  null,
                  2
                )}`;
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
          }
        );

        return {
          tasks,
          summary: parsed?.summary || "PRD parsed successfully",
          estimatedDuration: parsed?.estimatedDuration || "Unknown",
          confidence: parsed?.confidence || 0.7,
        };
      },
      retryConfig,
      "PRD parsing"
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
    workingDirectory?: string,
    enableFilesystemTools?: boolean
  ): Promise<string> {
    return this.retryHandler.executeWithRetry(
      async () => {
        let stackInfo = "";
        try {
          stackInfo = await PromptBuilder.detectStackInfo(workingDirectory);
          if (stackInfo === "Not detected") {
            stackInfo = "";
          }
        } catch (error) {
          // Stack info not available
        }

        let prompt: string;
        if (promptOverride) {
          prompt = promptOverride;
        } else {
          const variables: Record<string, string> = {
            PRD_CONTENT: prdContent,
            USER_FEEDBACK: feedback,
          };

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
              `Failed to build PRD rework prompt: ${promptResult.error}`
            );
          }

          prompt = promptResult.prompt!;
        }

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
              PRD_REWORK_SYSTEM_PROMPT +
              `

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

          return await result.text;
        } else {
          return this.streamText(
            "",
            config,
            PRD_REWORK_SYSTEM_PROMPT,
            userMessage || prompt,
            streamingOptions,
            { maxAttempts: 1 }
          );
        }
      },
      retryConfig,
      "PRD rework"
    );
  }

  async generatePRDQuestions(
    prdContent: string,
    config?: Partial<AIConfig>,
    promptOverride?: string,
    userMessage?: string,
    streamingOptions?: StreamingOptions,
    retryConfig?: Partial<RetryConfig>,
    workingDirectory?: string,
    enableFilesystemTools?: boolean
  ): Promise<string[]> {
    return this.retryHandler.executeWithRetry(
      async () => {
        let stackInfo = "";
        try {
          stackInfo = await PromptBuilder.detectStackInfo(workingDirectory);
          if (stackInfo === "Not detected") {
            stackInfo = "";
          }
        } catch (error) {
          // Stack info not available
        }

        let prompt: string;
        if (promptOverride) {
          prompt = promptOverride;
        } else {
          const variables: Record<string, string> = {
            PRD_CONTENT: prdContent,
          };
          if (stackInfo) {
            variables.STACK_INFO = stackInfo;
          }

          const promptResult = PromptBuilder.buildPrompt({
            name: "prd-question",
            type: "user",
            variables,
          });

          if (!promptResult.success) {
            throw new Error(
              `Failed to build PRD question prompt: ${promptResult.error}`
            );
          }

          prompt = promptResult.prompt!;
        }

        const { PRD_QUESTION_SYSTEM_PROMPT } = await import("../../prompts");

        let response: string;

        if (enableFilesystemTools) {
          const model = this.modelProvider.getModel({
            ...this.modelProvider.getAIConfig(),
            ...config,
          });

          const allTools = { ...filesystemTools };

          const result = await streamText({
            model,
            tools: allTools,
            system:
              PRD_QUESTION_SYSTEM_PROMPT +
              `\n\nYou have access to filesystem tools to check existing code/structure if needed.`,
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
            PRD_QUESTION_SYSTEM_PROMPT,
            userMessage || prompt,
            streamingOptions,
            { maxAttempts: 1 }
          );
        }

        const parseResult =
          this.jsonParser.parseJSONFromResponse<PRDQuestionResponse>(response);
        if (!parseResult.success) {
          throw new Error(parseResult.error || "Failed to parse PRD questions");
        }

        return parseResult.data?.questions || [];
      },
      retryConfig,
      "PRD questioning"
    );
  }

  async answerPRDQuestions(
    prdContent: string,
    questions: string[],
    config?: Partial<AIConfig>,
    contextInfo?: {
      stackInfo?: string;
      projectDescription?: string;
    },
    streamingOptions?: StreamingOptions,
    retryConfig?: Partial<RetryConfig>
  ): Promise<Record<string, string>> {
    return this.retryHandler.executeWithRetry(
      async () => {
        const questionsText = questions
          .map((q, i) => `${i + 1}. ${q}`)
          .join("\n");

        const contextText = contextInfo
          ? `\n\nProject Context:\n${
              contextInfo.stackInfo
                ? `Technology Stack: ${contextInfo.stackInfo}\n`
                : ""
            }${
              contextInfo.projectDescription
                ? `Project Description: ${contextInfo.projectDescription}\n`
                : ""
            }`
          : "";

        const promptResult = PromptBuilder.buildPrompt({
          name: "prd-question-answer",
          type: "user",
          variables: {
            PRD_CONTENT: prdContent,
            QUESTIONS_TEXT: questionsText,
            CONTEXT_TEXT: contextText,
          },
        });

        if (!promptResult.success) {
          throw new Error(
            `Failed to build PRD question answer prompt: ${promptResult.error}`
          );
        }

        const systemPromptResult = PromptBuilder.buildPrompt({
          name: "prd-question-answer",
          type: "system",
          variables: {},
        });

        const response = await this.streamText(
          "",
          config,
          systemPromptResult.prompt!,
          promptResult.prompt!,
          streamingOptions,
          { maxAttempts: 1 }
        );

        const parseResult = this.jsonParser.parseJSONFromResponse<{
          answers: Record<string, string>;
        }>(response);

        if (!parseResult.success) {
          throw new Error(
            parseResult.error || "Failed to parse PRD answers response"
          );
        }

        const answers: Record<string, string> = {};
        const numberedAnswers = parseResult.data?.answers || {};

        questions.forEach((question, index) => {
          const key = String(index + 1);
          if (numberedAnswers[key]) {
            answers[question] = numberedAnswers[key];
          }
        });

        return answers;
      },
      retryConfig,
      "PRD question answering"
    );
  }

  async generatePRD(
    description: string,
    config?: Partial<AIConfig>,
    promptOverride?: string,
    userMessage?: string,
    streamingOptions?: StreamingOptions,
    retryConfig?: Partial<RetryConfig>
  ): Promise<string> {
    return this.retryHandler.executeWithRetry(
      async () => {
        const systemPrompt = PRD_GENERATION_SYSTEM_PROMPT;
        const userContent =
          userMessage || `Product Description:\n${description}`;

        return this.streamText(
          "",
          config,
          systemPrompt,
          userContent,
          streamingOptions,
          { maxAttempts: 1 }
        );
      },
      retryConfig,
      "PRD generation"
    );
  }

  async combinePRDs(
    prds: string[],
    originalDescription: string,
    config?: Partial<AIConfig>,
    promptOverride?: string,
    userMessage?: string,
    streamingOptions?: StreamingOptions,
    retryConfig?: Partial<RetryConfig>
  ): Promise<string> {
    return this.retryHandler.executeWithRetry(
      async () => {
        const systemPrompt = PRD_COMBINATION_SYSTEM_PROMPT;

        let userContent = userMessage;
        if (!userContent) {
          userContent = `Original Description:\n${originalDescription}\n\n`;
          prds.forEach((prd, index) => {
            userContent += `--- PRD ${index + 1} ---\n${prd}\n\n`;
          });
        }

        return this.streamText(
          "",
          config,
          systemPrompt,
          userContent,
          streamingOptions,
          { maxAttempts: 1 }
        );
      },
      retryConfig,
      "PRD combination"
    );
  }
}
