import { AIConfig, StreamingOptions } from "../types";
import { getAIOperations } from "../utils/ai-service-factory";
import { buildAIConfig, AIOptions } from "../utils/ai-config-builder";
import { configManager } from "../lib/config";

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

    const prompt = `You are helping a developer configure their project initialization and tech stack.

Available Options:
- AI Providers: openrouter, anthropic, openai, custom
- Frontend Frameworks: next, tanstack-router, react-router, vite-react, remix
- Backend Frameworks: hono, express, elysia, fastify
- Databases: sqlite, postgres, mysql, mongodb, turso, neon
- Authentication: better-auth (recommended), clerk, auth0, custom

User's Description:
"${input.userDescription}"

Based on the user's description, recommend a complete configuration. Consider:
1. Project complexity and scale
2. Developer experience level (infer from description)
3. Modern best practices for 2025
4. Compatibility between chosen technologies

Respond in JSON format:
{
  "projectName": "suggested-project-name",
  "aiProvider": "recommended-provider",
  "aiModel": "recommended-model",
  "frontend": "recommended-frontend",
  "backend": "recommended-backend",
  "database": "recommended-database",
  "auth": true/false,
  "reasoning": "Brief explanation of your choices"
}`;

    const result = await getAIOperations().streamText(
      prompt,
      aiConfig,
      undefined, // system prompt
      undefined, // user message (prompt is used)
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

    const prompt = `You are a product manager reviewing and improving a PRD.

Current PRD:
${input.currentPRD}

User's Feedback:
"${input.userFeedback}"

Improve the PRD based on the feedback. Consider:
1. Clarity and specificity
2. Completeness of requirements
3. Feasibility and scope
4. Technical details
5. Success criteria

Return the improved PRD in the same format, incorporating the user's feedback.`;

    const result = await getAIOperations().streamText(
      prompt,
      aiConfig,
      undefined, // system prompt
      undefined, // user message (prompt is used)
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

    const prompt = `You are a project manager helping to prioritize tasks.

Tasks:
${tasksDescription}

User's Guidance:
"${input.userGuidance}"

Prioritize these tasks (1 = highest priority) based on:
1. Dependencies (what needs to be done first)
2. User's guidance
3. MVP vs. nice-to-have
4. Risk and complexity

Respond in JSON format:
{
  "prioritizedTasks": [
    {"id": "task-id", "priority": 1, "reasoning": "why this priority"},
    ...
  ],
  "recommendations": "Overall recommendations for task execution"
}`;

    const result = await getAIOperations().streamText(
      prompt,
      aiConfig,
      undefined, // system prompt
      undefined, // user message (prompt is used)
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

    const prompt = `You are a technical lead helping to break down a complex task.

Task: ${input.taskTitle}
${input.taskContent ? `Description: ${input.taskContent}` : ""}

User's Guidance:
"${input.userGuidance}"

Generate specific instructions for how to split this task into subtasks. Consider:
1. Logical breakdown points
2. Size constraints (e.g., 2-4 hour chunks)
3. Dependencies between subtasks
4. Testing and validation steps

Provide clear, actionable instructions for the AI that will perform the split.`;

    const result = await getAIOperations().streamText(
      prompt,
      aiConfig,
      undefined, // system prompt
      undefined, // user message (prompt is used)
      input.streamingOptions
    );

    return result;
  }
}

// Export singleton instance
export const workflowAIAssistant = new WorkflowAIAssistant();
