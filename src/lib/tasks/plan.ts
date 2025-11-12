import { getAIOperations, getStorage } from "../../utils/ai-service-factory";
import { Task, StreamingOptions, AIConfig } from "../../types";
import { PlanTaskOptions } from "../../types/options";

export async function planTask(
  options: PlanTaskOptions,
  streamingOptions?: StreamingOptions,
): Promise<{ task: Task; planText: string }> {
  const task = await getStorage().getTask(options.id);
  if (!task) {
    throw new Error(`Task with ID ${options.id} not found`);
  }

  const aiService = getAIOperations();

  // Build AI config from options
  const planAIConfig: Partial<AIConfig> = {
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

  // Build task context and details
  let taskContext = `Task ID: ${task.id}\nTitle: ${task.title}\n`;
  let taskDetails = `Description: ${task.description || "No description"}\n`;

  // If this is a subtask, include parent task context
  if (task.parentId) {
    const parentTask = await getStorage().getTask(task.parentId);
    if (parentTask) {
      taskContext += `Parent Task ID: ${parentTask.id}\nParent Task Title: ${parentTask.title}\n`;
      taskDetails += `Parent Task Description: ${parentTask.description || "No description"}\n`;
    }
  }

  // If this is a task with subtasks, get subtask details
  const subtasks = await getStorage().getSubtasks(options.id);
  if (subtasks.length > 0) {
    taskDetails += `\nSubtasks:\n`;
    subtasks.forEach((subtask, index) => {
      taskDetails += `${index + 1}. ${subtask.title} (${subtask.id})\n`;
      taskDetails += `   ${subtask.description || "No description"}\n\n`;
    });
  }

  const plan = await aiService.planTask(
    taskContext,
    taskDetails,
    planAIConfig,
    undefined,
    undefined,
    streamingOptions,
  );

  // Save the plan to storage
  await getStorage().savePlan(options.id, plan);

  return { task, planText: plan };
}

export async function getTaskPlan(
  taskId: string,
): Promise<{ plan: string; createdAt: number; updatedAt: number } | null> {
  return getStorage().getPlan(taskId);
}

export async function listTaskPlans(): Promise<
  Array<{
    taskId: string;
    plan: string;
    createdAt: number;
    updatedAt: number;
  }>
> {
  return getStorage().listPlans();
}

export async function deleteTaskPlan(taskId: string): Promise<boolean> {
  return getStorage().deletePlan(taskId);
}
