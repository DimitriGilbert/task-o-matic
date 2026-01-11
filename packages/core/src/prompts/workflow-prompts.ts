// Project Initialization Suggestion
export const PROJECT_INIT_SUGGESTION_PROMPT = `You are helping a developer configure their project initialization and tech stack.

Available Options:
- AI Providers: openrouter, anthropic, openai, custom
- Frontend Frameworks: next, tanstack-router, react-router, vite-react, remix
- Backend Frameworks: hono, express, elysia, fastify
- Databases: sqlite, postgres, mysql, mongodb, turso, neon
- Authentication: better-auth (recommended), clerk, auth0, custom

User's Description:
"{USER_DESCRIPTION}"

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

export const PROJECT_INIT_SUGGESTION_SYSTEM_PROMPT = `You are an expert full-stack developer helping to configure modern web projects.`;

// PRD Improvement
export const PRD_IMPROVEMENT_PROMPT = `You are a product manager reviewing and improving a PRD.

Current PRD:
{CURRENT_PRD}

User's Feedback:
"{USER_FEEDBACK}"

Improve the PRD based on the feedback. Consider:
1. Clarity and specificity
2. Completeness of requirements
3. Feasibility and scope
4. Technical details
5. Success criteria

Return the improved PRD in the same format, incorporating the user's feedback.`;

export const PRD_IMPROVEMENT_SYSTEM_PROMPT = `You are an experienced product manager specializing in writing clear, actionable PRDs.`;

// Task Prioritization
export const TASK_PRIORITIZATION_PROMPT = `You are a project manager helping to prioritize tasks.

Tasks:
{TASKS_DESCRIPTION}

User's Guidance:
"{USER_GUIDANCE}"

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

export const TASK_PRIORITIZATION_SYSTEM_PROMPT = `You are an experienced project manager with expertise in agile methodologies and task prioritization.`;

// Task Splitting Assistance
export const TASK_SPLITTING_ASSISTANCE_PROMPT = `You are a technical lead helping to break down a complex task.

Task: {TASK_TITLE}
{TASK_CONTENT}

User's Guidance:
"{USER_GUIDANCE}"

Generate specific instructions for how to split this task into subtasks. Consider:
1. Logical breakdown points
2. Size constraints (e.g., 2-4 hour chunks)
3. Dependencies between subtasks
4. Testing and validation steps

Provide clear, actionable instructions for the AI that will perform the split.`;

export const TASK_SPLITTING_ASSISTANCE_SYSTEM_PROMPT = `You are a technical lead with deep expertise in breaking down complex software development tasks into manageable pieces.`;
