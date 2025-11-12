
import {
  getAIOperations,
  getModelProvider,
  getStorage,
  getContextBuilder,
} from "../../utils/ai-service-factory";
import { formatStackInfo } from "../../utils/stack-formatter";
import { Task, StreamingOptions, TaskAIMetadata, AIConfig } from "../../types";
import { CreateTaskOptions } from "../../types/options";

export async function createTask(
  options: CreateTaskOptions,
  streamingOptions?: StreamingOptions,
): Promise<{ task: Task; aiMetadata?: TaskAIMetadata }> {
  let content = options.content;
  let aiMetadata;

  // Generate task ID if not provided
  const taskId = options.taskId || `task-${Date.now()}`;

  if (options.aiEnhance) {
    const context = await getContextBuilder().buildContextForNewTask(
      options.title,
      options.content,
    );
    const stackInfo = formatStackInfo(context.stack);

    // Build AI config from options
    const enhancementAIConfig: Partial<AIConfig> = {
      ...(options.aiProvider && {
        provider: options.aiProvider as
          | "openrouter"
          | "openai"
          | "anthropic"
          | "custom",
      }),
      ...(options.aiModel && { model: options.aiModel }),
      ...(options.aiKey && { apiKey: options.aiKey }),
      ...(options.aiProviderUrl && { baseURL: options.aiProviderUrl }),
      ...(options.aiReasoning && {
        reasoning: { maxTokens: parseInt(options.aiReasoning, 10) },
      }),
    };

    const taskDescription = options.content ?? "";
    content = await getAIOperations().enhanceTaskWithDocumentation(
      taskId,
      options.title,
      taskDescription,
      stackInfo,
      streamingOptions,
      undefined,
      enhancementAIConfig,
      context.existingResearch,
    );

    // Get AI config for proper metadata
    const aiConfig = getModelProvider().getAIConfig();

    aiMetadata = {
      taskId: "",
      aiGenerated: true,
      aiPrompt: "Enhance task with relevant documentation using Context7 tools",
      confidence: 0.9,
      aiProvider: aiConfig.provider,
      aiModel: aiConfig.model,
      generatedAt: Date.now(),
    };
  }

  const task = await getStorage().createTask(
    {
      title: options.title,
      description: options.content ?? "",
      content,
      parentId: options.parentId,
      estimatedEffort: options.effort as
        | "small"
        | "medium"
        | "large"
        | undefined,
    },
    aiMetadata,
  );

  return { task, aiMetadata };
}
