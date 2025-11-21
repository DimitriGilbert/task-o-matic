/**
 * Prompt templates for workflow AI assistance
 */

export const initConfigPrompt = {
  system: `You are an expert developer assistant helping configure a new project.
Your role is to recommend appropriate technologies based on the user's description.
Always consider modern best practices, compatibility, and the user's experience level.`,

  template: (userDescription: string) => `
Based on this project description, recommend a complete tech stack:

"${userDescription}"

Available options:
- AI Providers: openrouter, anthropic, openai, custom
- Frontend: next, tanstack-router, react-router, vite-react, remix
- Backend: hono, express, elysia, fastify
- Database: sqlite, postgres, mysql, mongodb, turso, neon
- Auth: better-auth, clerk, auth0, custom

Respond with JSON containing: projectName, aiProvider, aiModel, frontend, backend, database, auth (boolean), reasoning
`,
};

export const prdCreationPrompt = {
  system: `You are an experienced product manager creating Product Requirements Documents.
Your PRDs are clear, comprehensive, and actionable. You focus on MVP features while noting future enhancements.`,

  template: (userDescription: string) => `
Create a comprehensive PRD for this product:

"${userDescription}"

Include these sections:
1. Overview - Brief product description
2. Objectives - Key goals
3. Target Audience - Who will use it
4. Core Features - Essential MVP features
5. Future Features - Nice-to-have additions
6. Technical Requirements - Tech constraints
7. Success Metrics - How to measure success
8. Timeline - Rough milestones

Be specific and actionable.
`,
};

export const prdRefinementPrompt = {
  system: `You are a senior product manager reviewing and improving PRDs.
You focus on clarity, completeness, feasibility, and measurable outcomes.`,

  template: (currentPRD: string, feedback: string) => `
Improve this PRD based on the feedback:

Current PRD:
${currentPRD}

Feedback:
"${feedback}"

Return the improved PRD maintaining the same structure but incorporating the feedback.
Focus on making it more specific, actionable, and complete.
`,
};

export const taskGenerationPrompt = {
  system: `You are a technical lead breaking down PRDs into actionable tasks.
You create clear, well-scoped tasks with appropriate dependencies and effort estimates.`,

  template: (prdContent: string, customInstructions?: string) => `
Parse this PRD into actionable tasks:

${prdContent}

${customInstructions ? `Special Instructions:\n${customInstructions}\n` : ""}

For each task, provide:
- Clear title
- Detailed description
- Estimated effort (small/medium/large)
- Dependencies (if any)
- Tags for categorization

Focus on creating tasks that are:
1. Actionable and specific
2. Appropriately sized (not too big or small)
3. Properly ordered by dependencies
4. Tagged for easy filtering
`,
};

export const taskSplitPrompt = {
  system: `You are a technical lead breaking down complex tasks into manageable subtasks.
You create well-scoped subtasks that can be completed independently when possible.`,

  template: (
    taskTitle: string,
    taskContent: string,
    customInstructions?: string
  ) => `
Break down this task into subtasks:

Task: ${taskTitle}
Description: ${taskContent}

${customInstructions ? `Special Instructions:\n${customInstructions}\n` : ""}

Create subtasks that are:
1. Independently completable when possible
2. Appropriately sized (2-4 hours each)
3. Logically ordered
4. Include testing/validation steps

For each subtask provide: title, description, estimated effort, dependencies
`,
};

export const taskPrioritizationPrompt = {
  system: `You are a project manager prioritizing tasks for optimal execution.
You consider dependencies, risk, MVP scope, and team efficiency.`,

  template: (
    tasks: Array<{ id: string; title: string; description?: string }>,
    userGuidance: string
  ) => `
Prioritize these tasks:

${tasks
  .map(
    (t, i) =>
      `${i + 1}. [${t.id}] ${t.title}${
        t.description ? `: ${t.description}` : ""
      }`
  )
  .join("\n")}

User's Guidance:
"${userGuidance}"

Respond with JSON containing:
- prioritizedTasks: array of {id, priority (1=highest), reasoning}
- recommendations: overall execution strategy

Consider:
1. Dependencies (what must be done first)
2. MVP vs. nice-to-have
3. Risk and complexity
4. User's specific guidance
`,
};
