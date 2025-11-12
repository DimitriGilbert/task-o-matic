import {
  getAIOperations,
  getModelProvider,
  getStorage,
  getContextBuilder,
} from "../../utils/ai-service-factory";
import { formatStackInfo } from "../../utils/stack-formatter";
import { Task, StreamingOptions, TaskAIMetadata, AIConfig } from "../../types";
import { EnhanceTaskOptions } from "../../types/options";

export async function enhanceTask(
  options: EnhanceTaskOptions,
  streamingOptions?: StreamingOptions,
): Promise<{
  task: Task;
  enhancedContent: string;
  aiMetadata: TaskAIMetadata;
}> {
  const task = await getStorage().getTask(options.taskId);
  if (!task) {
    throw new Error(`Task with ID ${options.taskId} not found`);
  }

  const context = await getContextBuilder().buildContext(options.taskId);
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

  const enhancedContent = await getAIOperations().enhanceTaskWithDocumentation(
    task.id,
    task.title,
    task.description ?? "",
    stackInfo,
    streamingOptions,
    undefined,
    enhancementAIConfig,
    context.existingResearch,
  );

  if (enhancedContent.length > 200) {
    const contentFile = await getStorage().saveEnhancedTaskContent(
      task.id,
      enhancedContent,
    );
    await getStorage().updateTask(task.id, {
      contentFile,
      description:
        task.description +
        "\n\n🤖 AI-enhanced with Context7 documentation available.",
    });
  } else {
    await getStorage().updateTask(task.id, { description: enhancedContent });
  }

  const aiConfig = getModelProvider().getAIConfig();

  const aiMetadata = {
    taskId: task.id,
    aiGenerated: true,
    aiPrompt: "Enhance task with Context7 documentation using MCP tools",
    confidence: 0.9,
    aiProvider: aiConfig.provider,
    aiModel: aiConfig.model,
    enhancedAt: Date.now(),
  };

  await getStorage().saveTaskAIMetadata(aiMetadata);

  return { task, enhancedContent, aiMetadata };
}
