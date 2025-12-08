import { AIConfig, StreamingOptions } from "../types";
import { getAIOperations } from "../utils/ai-service-factory";
import { buildAIConfig, AIOptions } from "../utils/ai-config-builder";
import { configManager } from "../lib/config";
import { PromptBuilder } from "../lib/prompt-builder";

/**
 * WorkflowAIAssistant - AI-powered decision making for workflow steps
 * Helps users make configuration choices using natural language
 */
export class WorkflowAIAssistant {
  /**
   * Assist with initialization and bootstrap configuration
   */
  async assistInitConfig(input: {
    userDescription: string;
    aiOptions?: AIOptions;
    streamingOptions?: StreamingOptions;
  }): Promise<{
    projectName: string;
    aiProvider: string;
    aiModel: string;
    frontend?: string;
    backend?: string;
    database?: string;
    auth?: boolean;
    reasoning: string;
  }> {
    const aiConfig = buildAIConfig(input.aiOptions);

    const promptResult = PromptBuilder.buildPrompt({
      name: "project-init-suggestion",
      type: "user",
      variables: {
        USER_DESCRIPTION: input.userDescription,
      },
    });

    if (!promptResult.success) {
      throw new Error(
        `Failed to build project init prompt: ${promptResult.error}`
      );
    }

    const systemPromptResult = PromptBuilder.buildPrompt({
      name: "project-init-suggestion",
      type: "system",
      variables: {},
    });

    const result = await getAIOperations().streamText(
      promptResult.prompt!,
      aiConfig,
      systemPromptResult.prompt,
      undefined,
      input.streamingOptions
    );

    // Parse AI response
    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in AI response");
      }
      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      // Fallback to sensible defaults
      return {
        projectName: "my-project",
        aiProvider: "openrouter",
        aiModel: "anthropic/claude-3.5-sonnet",
        frontend: "next",
        backend: "hono",
        database: "sqlite",
        auth: true,
        reasoning: "Using modern, well-supported defaults",
      };
    }
  }

  /**
   * Generate a PRD from user's product description
   */
  async assistPRDCreation(input: {
    userDescription: string;
    aiOptions?: AIOptions;
    streamingOptions?: StreamingOptions;
  }): Promise<string> {
    const aiConfig = buildAIConfig(input.aiOptions);

    return getAIOperations().generatePRD(
      input.userDescription,
      aiConfig,
      undefined,
      undefined,
      input.streamingOptions
    );
  }

  /**
   * Suggest improvements to an existing PRD
   */
  async assistPRDRefinement(input: {
    currentPRD: string;
    userFeedback: string;
    aiOptions?: AIOptions;
    streamingOptions?: StreamingOptions;
  }): Promise<string> {
    const aiConfig = buildAIConfig(input.aiOptions);

    const promptResult = PromptBuilder.buildPrompt({
      name: "prd-improvement",
      type: "user",
      variables: {
        CURRENT_PRD: input.currentPRD,
        USER_FEEDBACK: input.userFeedback,
      },
    });

    if (!promptResult.success) {
      throw new Error(
        `Failed to build PRD improvement prompt: ${promptResult.error}`
      );
    }

    const systemPromptResult = PromptBuilder.buildPrompt({
      name: "prd-improvement",
      type: "system",
      variables: {},
    });

    const result = await getAIOperations().streamText(
      promptResult.prompt!,
      aiConfig,
      systemPromptResult.prompt,
      undefined,
      input.streamingOptions
    );

    return result;
  }

  /**
   * Help prioritize and organize tasks
   */
  async assistTaskPrioritization(input: {
    tasks: Array<{ id: string; title: string; description?: string }>;
    userGuidance: string;
    aiOptions?: AIOptions;
    streamingOptions?: StreamingOptions;
  }): Promise<{
    prioritizedTasks: Array<{
      id: string;
      priority: number;
      reasoning: string;
    }>;
    recommendations: string;
  }> {
    const aiConfig = buildAIConfig(input.aiOptions);

    const tasksDescription = input.tasks
      .map(
        (t, i) =>
          `${i + 1}. [${t.id}] ${t.title}${
            t.description ? `: ${t.description}` : ""
          }`
      )
      .join("\n");

    const promptResult = PromptBuilder.buildPrompt({
      name: "task-prioritization",
      type: "user",
      variables: {
        TASKS_DESCRIPTION: tasksDescription,
        USER_GUIDANCE: input.userGuidance,
      },
    });

    if (!promptResult.success) {
      throw new Error(
        `Failed to build task prioritization prompt: ${promptResult.error}`
      );
    }

    const systemPromptResult = PromptBuilder.buildPrompt({
      name: "task-prioritization",
      type: "system",
      variables: {},
    });

    const result = await getAIOperations().streamText(
      promptResult.prompt!,
      aiConfig,
      systemPromptResult.prompt,
      undefined,
      input.streamingOptions
    );

    // Parse AI response
    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in AI response");
      }
      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      // Fallback: return tasks in original order
      return {
        prioritizedTasks: input.tasks.map((t, i) => ({
          id: t.id,
          priority: i + 1,
          reasoning: "Default ordering",
        })),
        recommendations: "Review and adjust priorities as needed",
      };
    }
  }

  /**
   * Generate custom instructions for task splitting
   */
  async assistTaskSplitting(input: {
    taskTitle: string;
    taskContent?: string;
    userGuidance: string;
    aiOptions?: AIOptions;
    streamingOptions?: StreamingOptions;
  }): Promise<string> {
    const aiConfig = buildAIConfig(input.aiOptions);

    const taskContentText = input.taskContent
      ? `Description: ${input.taskContent}`
      : "";

    const promptResult = PromptBuilder.buildPrompt({
      name: "task-splitting-assistance",
      type: "user",
      variables: {
        TASK_TITLE: input.taskTitle,
        TASK_CONTENT: taskContentText,
        USER_GUIDANCE: input.userGuidance,
      },
    });

    if (!promptResult.success) {
      throw new Error(
        `Failed to build task splitting prompt: ${promptResult.error}`
      );
    }

    const systemPromptResult = PromptBuilder.buildPrompt({
      name: "task-splitting-assistance",
      type: "system",
      variables: {},
    });

    const result = await getAIOperations().streamText(
      promptResult.prompt!,
      aiConfig,
      systemPromptResult.prompt,
      undefined,
      input.streamingOptions
    );

    return result;
  }
}

// Export singleton instance
export const workflowAIAssistant = new WorkflowAIAssistant();
