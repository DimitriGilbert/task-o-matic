
import {
  getAIOperations,
  getModelProvider,
  getStorage,
  getContextBuilder,
} from "../../utils/ai-service-factory";
import { formatStackInfo } from "../../utils/stack-formatter";
import { Task, StreamingOptions, TaskAIMetadata, AIConfig } from "../../types";
import { SplitTaskOptions } from "../../types/options";
import { createTask } from "./create";

export async function splitTask(
  options: SplitTaskOptions,
  streamingOptions?: StreamingOptions,
): Promise<{
  task: Task;
  subtasks: Task[];
  aiMetadata: TaskAIMetadata;
}> {
  const task = await getStorage().getTask(options.taskId);
  if (!task) {
    throw new Error(`Task with ID ${options.taskId} not found`);
  }

  // Check if task already has subtasks
  const existingSubtasks = await getStorage().getSubtasks(options.taskId);
  if (existingSubtasks.length > 0) {
    throw new Error(
      `Task ${task.title} already has ${existingSubtasks.length} subtasks. Use existing subtasks or delete them first.`,
    );
  }

  // Build comprehensive context
  const context = await getContextBuilder().buildContext(options.taskId);
  const stackInfo = formatStackInfo(context.stack);

  // Get full task content
  const fullContent = context.task.fullContent || task.description || "";

  // Build AI config from options
  const breakdownAIConfig: Partial<AIConfig> = {
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

  // Use AI service to break down the task with enhanced context
  const subtaskData = await getAIOperations().breakdownTask(
    task,
    breakdownAIConfig,
    options.prompt,
    options.message,
    streamingOptions,
    undefined,
    fullContent,
    stackInfo,
    existingSubtasks,
  );

  // Create subtasks
  const createdSubtasks = [];
  for (const subtask of subtaskData) {
    const { task: createdSubtask } = await createTask({
      title: subtask.title,
      content: subtask.content,
      effort: subtask.estimatedEffort,
      parentId: options.taskId,
    });
    createdSubtasks.push(createdSubtask);
  }

  // Create AI metadata for tracking using actual AI config
  const aiConfig = getModelProvider().getAIConfig();
  const aiMetadata = {
    taskId: task.id,
    aiGenerated: true,
    aiPrompt:
      options.prompt ||
      "Split task into meaningful subtasks with full context and existing subtask awareness",
    confidence: 0.9,
    aiProvider: aiConfig.provider,
    aiModel: aiConfig.model,
    splitAt: Date.now(),
  };

  await getStorage().saveTaskAIMetadata(aiMetadata);

  return { task, subtasks: createdSubtasks, aiMetadata };
}
