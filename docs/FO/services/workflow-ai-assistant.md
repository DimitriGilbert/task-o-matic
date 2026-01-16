## TECHNICAL BULLETIN NO. 004
### WORKFLOW AI ASSISTANT - DECISION SUPPORT SURVIVAL SYSTEM

**DOCUMENT ID:** `task-o-matic-workflow-ai-assistant-v2`
**CLEARANCE:** `All Personnel`
**MANDATORY COMPLIANCE:** `Yes`

### ⚠️ CRITICAL SURVIVAL NOTICE

Citizen, WorkflowAIAssistant is your tactical advisor in the post-deadline wasteland. Without AI-powered decision support, your project choices will be as random as radiation storms. This service provides intelligent recommendations for project configuration, PRD improvement, and task management strategies.

### SYSTEM ARCHITECTURE OVERVIEW

The WorkflowAIAssistant serves as specialized AI consultant that provides contextual decision support for workflow operations. It leverages multiple AI models to offer recommendations, improvements, and strategic guidance throughout the project lifecycle.

**Core Dependencies:**
- **AI Operations**: Vercel AI SDK integration for model communication
- **Prompt Builder**: Template-based prompt generation system
- **Prompt Registry**: Centralized prompt template management
- **AI Config Builder**: Flexible AI configuration management

**Assistant Capabilities:**
1. **Project Configuration**: AI-recommended technology stacks based on project description
2. **PRD Creation**: Generate complete PRDs from natural language descriptions
3. **PRD Refinement**: Improve existing PRDs based on user feedback and requirements
4. **Task Prioritization**: Intelligent task ordering and strategic recommendations
5. **Task Splitting**: Custom splitting instructions generation for complex tasks

**Prompt Templates Used:**
- `project-init-suggestion`: Stack recommendation and configuration guidance
- `prd-improvement`: PRD enhancement and refinement
- `task-prioritization`: Task ordering and strategic planning
- `task-splitting-assistance`: Task breakdown methodology

### COMPLETE API DOCUMENTATION

---

#### assistInitConfig

Generate AI-recommended project configuration including technology stack, AI model selection, and project settings based on a natural language description.

```typescript
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
}>
```

**Parameters:**
- `input.userDescription` (string, required): Natural language project description
  - Should include project purpose, requirements, and constraints
  - Can mention specific technologies if desired
  - More detailed descriptions yield better recommendations
- `input.aiOptions` (AIOptions, optional): AI configuration override
  - `aiProvider` (string, optional): Override default AI provider
  - `aiModel` (string, optional): Override default AI model
  - `aiKey` (string, optional): Custom API key for this operation
  - `aiProviderUrl` (string, optional): Custom provider endpoint
- `input.streamingOptions` (StreamingOptions, optional): Real-time response streaming
  - `onChunk` (function, optional): Callback for response chunks
  - `onFinish` (function, optional): Callback when complete
  - `onError` (function, optional): Error handling callback

**Returns:** Configuration recommendation object containing:
- `projectName` (string): Suggested project name
- `aiProvider` (string): Recommended AI provider
- `aiModel` (string): Recommended AI model
- `frontend` (string, optional): Recommended frontend framework
- `backend` (string, optional): Recommended backend framework
- `database` (string, optional): Recommended database system
- `auth` (boolean, optional): Whether to include authentication
- `reasoning` (string): AI's reasoning for recommendations

**Error Conditions:**
- `TaskOMaticError` with code `CONFIGURATION_ERROR`: Prompt building failures
  - Occurs when `project-init-suggestion` template is not found
  - Check prompt registry for available templates
- `TaskOMaticError` with code `AI_OPERATION_FAILED`: JSON parsing failures
  - AI response did not contain valid JSON
  - Try with different model or clearer description
- Returns sensible defaults on AI operation failure:
  - `projectName`: "my-project"
  - `aiProvider`: "openrouter"
  - `aiModel`: "anthropic/claude-3.5-sonnet"
  - `frontend`: "next"
  - `backend`: "hono"
  - `database`: "sqlite"
  - `auth`: true
  - `reasoning`: "Using modern, well-supported defaults"

**Technical Details:**
- Uses `project-init-suggestion` prompt template (user and system variants)
- AI response must contain JSON with recommended configuration
- Falls back to modern default stack if AI response unparseable
- Does not throw on AI failure, returns defaults instead

**Example: Basic Configuration Assistance**
```typescript
const recommendation = await workflowAIAssistant.assistInitConfig({
  userDescription: "A real-time collaboration platform for remote development teams with video calls, code sharing, and project management features. Need to handle high concurrency and support multiple file formats.",
  aiOptions: {
    aiProvider: "anthropic",
    aiModel: "claude-3-5-sonnet"
  },
  streamingOptions: {
    onChunk: (chunk) => process.stdout.write(chunk),
    onFinish: () => console.log("\nRecommendation complete!")
  }
});

console.log("Recommended stack:");
console.log(`- Project: ${recommendation.projectName}`);
console.log(`- AI Provider: ${recommendation.aiProvider}`);
console.log(`- AI Model: ${recommendation.aiModel}`);
console.log(`- Frontend: ${recommendation.frontend}`);
console.log(`- Backend: ${recommendation.backend}`);
console.log(`- Database: ${recommendation.database}`);
console.log(`- Auth: ${recommendation.auth}`);
console.log(`\nReasoning: ${recommendation.reasoning}`);
```

**Example: Minimal Configuration Request**
```typescript
const recommendation = await workflowAIAssistant.assistInitConfig({
  userDescription: "Simple blog API with user authentication and CRUD operations"
});

console.log(`AI recommends: ${recommendation.frontend || 'no frontend'} + ${recommendation.backend || 'no backend'}`);
console.log(`Using ${recommendation.aiProvider}/${recommendation.aiModel} for AI operations`);
```

**Example: Custom AI Configuration**
```typescript
const recommendation = await workflowAIAssistant.assistInitConfig({
  userDescription: "Enterprise-grade analytics dashboard with real-time data visualization and predictive analytics",
  aiOptions: {
    aiProvider: "openai",
    aiModel: "gpt-4o",
    aiKey: process.env.OPENAI_API_KEY
  }
});

console.log("Using GPT-4o for enterprise recommendations");
console.log(`Recommended database: ${recommendation.database}`);
```

---

#### assistPRDCreation

Generate a complete Product Requirements Document (PRD) from a natural language project description using AI.

```typescript
async assistPRDCreation(input: {
  userDescription: string;
  aiOptions?: AIOptions;
  streamingOptions?: StreamingOptions;
}): Promise<string>
```

**Parameters:**
- `input.userDescription` (string, required): Project description for PRD generation
  - Should include goals, features, target users, and constraints
  - More detailed descriptions produce more comprehensive PRDs
  - Can include technical requirements or constraints
- `input.aiOptions` (AIOptions, optional): AI configuration override
  - Same structure as other methods
- `input.streamingOptions` (StreamingOptions, optional): Real-time streaming
  - Same structure as other methods

**Returns:** Generated PRD content as string
- Complete markdown-formatted PRD
- Includes sections: Overview, Features, Technical Requirements, etc.
- Ready to save to file or use in workflow

**Error Conditions:**
- `TaskOMaticError` with various codes: AI operation failures
  - Network errors during API communication
  - Invalid AI configuration
  - API key issues
- Returns empty string if generation fails completely
  - Check for empty return value before using result

**Technical Details:**
- Uses `getAIOperations().generatePRD()` method directly
- Does not use prompt templates
- Leverages AI service's built-in PRD generation logic
- Supports streaming for large PRDs

**Example: PRD Generation Assistance**
```typescript
const prdContent = await workflowAIAssistant.assistPRDCreation({
  userDescription: "Mobile fitness tracking app with social features, workout plans, progress tracking, nutrition logging, and integration with wearable devices. Target audience includes fitness enthusiasts and casual users.",
  aiOptions: {
    aiProvider: "anthropic",
    aiModel: "claude-3-5-sonnet"
  },
  streamingOptions: {
    onChunk: (chunk) => process.stdout.write(chunk),
    onFinish: () => console.log("\nPRD generation complete!")
  }
});

console.log(`Generated PRD with ${prdContent.length} characters`);
if (prdContent.length > 0) {
  await fs.writeFile("./generated-prd.md", prdContent);
  console.log("PRD saved to generated-prd.md");
} else {
  console.error("PRD generation failed - empty result");
}
```

**Example: Quick PRD Generation**
```typescript
const simplePRD = await workflowAIAssistant.assistPRDCreation({
  userDescription: "Todo list application with categories, due dates, priorities, and reminders"
});

if (simplePRD) {
  console.log("Quick PRD generated:", simplePRD.substring(0, 100) + "...");
  console.log(`Total length: ${simplePRD.length} characters`);
} else {
  console.error("Failed to generate PRD");
}
```

---

#### assistPRDRefinement

Improve an existing PRD based on user feedback, adding missing details, clarifying ambiguities, and enhancing quality.

```typescript
async assistPRDRefinement(input: {
  currentPRD: string;
  userFeedback: string;
  aiOptions?: AIOptions;
  streamingOptions?: StreamingOptions;
}): Promise<string>
```

**Parameters:**
- `input.currentPRD` (string, required): Current PRD content to refine
  - Full markdown-formatted PRD content
  - Should include all existing sections
  - AI will analyze and improve based on this
- `input.userFeedback` (string, required): User feedback for improvements
  - Specific areas to improve
  - Missing sections or details to add
  - Quality concerns or gaps
  - Can be multiple requests separated by newlines
- `input.aiOptions` (AIOptions, optional): AI configuration override
- `input.streamingOptions` (StreamingOptions, optional): Real-time streaming

**Returns:** Refined PRD content as string
- Improved and expanded PRD
- Maintains existing structure while adding enhancements
- Incorporates all feedback points

**Error Conditions:**
- `TaskOMaticError` with code `CONFIGURATION_ERROR`: Prompt building failures
  - `prd-improvement` template not found in registry
- `TaskOMaticError` with various codes: AI operation failures
  - Network errors or API issues
  - Invalid configuration
- Returns original PRD if refinement fails
  - Always check if result differs from input

**Technical Details:**
- Uses `prd-improvement` prompt template (user and system variants)
- Template variables: `CURRENT_PRD`, `USER_FEEDBACK`
- AI analyzes existing PRD and applies improvements
- Falls back to original PRD on error

**Example: PRD Refinement Assistance**
```typescript
const refinedPRD = await workflowAIAssistant.assistPRDRefinement({
  currentPRD: existingPRDContent,
  userFeedback: `Add more technical specifications including:
1. API endpoints and data models
2. Security requirements and authentication flow
3. Performance benchmarks and scalability targets
4. Deployment architecture and infrastructure requirements`,
  aiOptions: {
    aiProvider: "anthropic",
    aiModel: "claude-3-5-sonnet"
  },
  streamingOptions: {
    onChunk: (chunk) => process.stdout.write(chunk),
    onFinish: () => console.log("\nRefinement complete!")
  }
});

if (refinedPRD !== existingPRDContent) {
  console.log(`Refined PRD length: ${refinedPRD.length} characters`);
  console.log(`Improvement: ${refinedPRD.length - existingPRDContent.length} characters added`);
  await fs.writeFile("./refined-prd.md", refinedPRD);
} else {
  console.warn("PRD was not refined (may indicate error)");
}
```

**Example: Targeted Refinement**
```typescript
const specificRefinement = await workflowAIAssistant.assistPRDRefinement({
  currentPRD: basicPRD,
  userFeedback: "Focus on mobile responsiveness, offline capabilities using PWA, and accessibility features following WCAG 2.1 AA guidelines"
});

console.log("PRD refined for mobile-first approach");
console.log(`New length: ${specificRefinement.length} characters`);
```

**Example: Multiple Iteration Refinement**
```typescript
let currentPRD = await fs.readFile("./draft-prd.md", "utf-8");
const improvements = [
  "Add security requirements section",
  "Include performance metrics and SLA targets",
  "Add testing and QA requirements",
  "Include deployment and monitoring specifications"
];

for (const improvement of improvements) {
  console.log(`\nApplying: ${improvement}`);
  currentPRD = await workflowAIAssistant.assistPRDRefinement({
    currentPRD: currentPRD,
    userFeedback: improvement,
    aiOptions: { aiProvider: "anthropic", aiModel: "claude-3-5-sonnet" },
    streamingOptions: {
      onChunk: (chunk) => process.stdout.write('.')
    }
  });
  console.log(" Done");
}

await fs.writeFile("./final-prd.md", currentPRD);
console.log("\nFinal PRD ready!");
```

---

#### assistTaskPrioritization

Analyze and prioritize tasks based on user guidance, providing strategic ordering and recommendations for execution.

```typescript
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
}>
```

**Parameters:**
- `input.tasks` (array, required): Array of tasks to prioritize
  - `id` (string, required): Task identifier
  - `title` (string, required): Task title/name
  - `description` (string, optional): Task description for context
- `input.userGuidance` (string, required): User's prioritization criteria
  - Strategic goals (e.g., "user impact first", "dependencies first")
  - Risk considerations
  - Resource constraints
  - Timeline requirements
- `input.aiOptions` (AIOptions, optional): AI configuration override
- `input.streamingOptions` (StreamingOptions, optional): Real-time streaming

**Returns:** Prioritization result containing:
- `prioritizedTasks` (array): Tasks with priority assignments
  - `id` (string): Task ID from input
  - `priority` (number): Priority ranking (1 = highest priority)
  - `reasoning` (string): AI's reasoning for this priority assignment
- `recommendations` (string): Overall prioritization recommendations
  - Strategic guidance
  - Risk warnings
  - Execution suggestions

**Error Conditions:**
- `TaskOMaticError` with code `CONFIGURATION_ERROR`: Prompt building failures
  - `task-prioritization` template not found
- `TaskOMaticError` with code `AI_OPERATION_FAILED`: JSON parsing failures
  - AI response did not contain valid JSON
- Falls back to original order if AI response parsing fails
  - All tasks get priorities in order (1, 2, 3, ...)
  - reasoning: "Default ordering"
  - recommendations: "Review and adjust priorities as needed"

**Technical Details:**
- Uses `task-prioritization` prompt template (user and system variants)
- Template variables: `TASKS_DESCRIPTION`, `USER_GUIDANCE`
- Creates numbered list of tasks for AI to analyze
- Returns prioritized list with reasoning

**Example: Task Prioritization Assistance**
```typescript
const tasks = [
  { id: "1", title: "Implement user authentication", description: "OAuth2 integration with JWT tokens and refresh logic" },
  { id: "2", title: "Design database schema", description: "User data, posts, relationships, and indexing strategy" },
  { id: "3", title: "Create responsive UI", description: "Mobile-first design with CSS Grid and responsive images" },
  { id: "4", title: "Setup CI/CD pipeline", description: "GitHub Actions with automated testing, linting, and deployment" },
  { id: "5", title: "Implement search functionality", description: "Full-text search with Elasticsearch integration" }
];

const prioritization = await workflowAIAssistant.assistTaskPrioritization({
  tasks: tasks,
  userGuidance: "Prioritize based on dependencies and user-facing impact. Authentication should be first, then core functionality. Infrastructure can be parallelized. Consider technical complexity and risk.",
  aiOptions: {
    aiProvider: "anthropic",
    aiModel: "claude-3-5-sonnet"
  },
  streamingOptions: {
    onChunk: (chunk) => process.stdout.write(chunk)
  }
});

console.log("Prioritized tasks:");
prioritization.prioritizedTasks
  .sort((a, b) => a.priority - b.priority)
  .forEach(task => {
    const taskDetails = tasks.find(t => t.id === task.id);
    console.log(`${task.priority}. [${task.id}] ${taskDetails?.title}`);
    console.log(`   Reasoning: ${task.reasoning}`);
  });

console.log(`\nStrategic Recommendations:\n${prioritization.recommendations}`);
```

**Example: Effort-Based Prioritization**
```typescript
const effortPrioritization = await workflowAIAssistant.assistTaskPrioritization({
  tasks: developmentTasks,
  userGuidance: "Prioritize high-effort, high-impact tasks first. Consider dependencies and technical risk. Frontend and backend should progress in parallel where possible."
});

// Sort by priority for execution order
const sortedTasks = effortPrioritization.prioritizedTasks
  .sort((a, b) => a.priority - b.priority)
  .map(pt => developmentTasks.find(t => t.id === pt.id));

console.log("Execution order:", sortedTasks.map(t => t?.title).join(" -> "));

// Apply priorities to actual tasks
for (const prioritized of effortPrioritization.prioritizedTasks) {
  await taskService.updateTask(prioritized.id, {
    metadata: { priority: prioritized.priority }
  });
}
```

**Example: Risk-Based Prioritization**
```typescript
const riskPrioritization = await workflowAIAssistant.assistTaskPrioritization({
  tasks: criticalPathTasks,
  userGuidance: "Prioritize by risk - address the riskiest technical challenges first. Consider areas where we have the least experience or most uncertainty. These tasks should get our best developers."
});

console.log("Risk-based execution plan:");
riskPrioritization.prioritizedTasks
  .sort((a, b) => a.priority - b.priority)
  .slice(0, 5)
  .forEach(pt => {
    const task = criticalPathTasks.find(t => t.id === pt.id);
    console.log(`${pt.priority}. ${task?.title} - HIGH RISK: ${pt.reasoning}`);
  });
```

---

#### assistTaskSplitting

Generate custom instructions for splitting a complex task into smaller, manageable subtasks based on user guidance.

```typescript
async assistTaskSplitting(input: {
  taskTitle: string;
  taskContent?: string;
  userGuidance: string;
  aiOptions?: AIOptions;
  streamingOptions?: StreamingOptions;
}): Promise<string>
```

**Parameters:**
- `input.taskTitle` (string, required): Title of task to split
  - Should clearly indicate what the task accomplishes
- `input.taskContent` (string, optional): Task description/content
  - Provides additional context for better splitting
  - If not provided, AI splits based on title only
- `input.userGuidance` (string, required): User's splitting instructions
  - Splitting criteria (by feature, by layer, by component, etc.)
  - Size constraints for subtasks
  - Specific areas to focus on
  - Dependencies or constraints
- `input.aiOptions` (AIOptions, optional): AI configuration override
- `input.streamingOptions` (StreamingOptions, optional): Real-time streaming

**Returns:** Generated splitting instructions as string
- Detailed breakdown approach
- Specific subtask suggestions
- Dependencies and ordering
- Ready to use with `taskService.splitTask`

**Error Conditions:**
- `TaskOMaticError` with code `CONFIGURATION_ERROR`: Prompt building failures
  - `task-splitting-assistance` template not found
- `TaskOMaticError` with various codes: AI operation failures
  - Network errors or API issues
- Returns empty string if generation fails
  - Check return value before using

**Technical Details:**
- Uses `task-splitting-assistance` prompt template (user and system variants)
- Template variables: `TASK_TITLE`, `TASK_CONTENT`, `USER_GUIDANCE`
- `TASK_CONTENT` is set to "Description: {content}" if provided, else ""
- Returns natural language instructions for splitting

**Example: Task Splitting Assistance**
```typescript
const splittingInstructions = await workflowAIAssistant.assistTaskSplitting({
  taskTitle: "Implement e-commerce platform",
  taskContent: "Build a full-stack e-commerce solution with payment processing via Stripe, inventory management with Redis cache, user accounts with JWT authentication, product catalog with search, order management, and admin dashboard.",
  userGuidance: "Split into frontend, backend, and database components. Include testing and deployment tasks. Focus on API development first, then frontend integration. Each subtask should be completable in 1-2 days.",
  aiOptions: {
    aiProvider: "anthropic",
    aiModel: "claude-3-5-sonnet"
  },
  streamingOptions: {
    onChunk: (chunk) => process.stdout.write(chunk),
    onFinish: () => console.log("\nSplitting instructions generated!")
  }
});

console.log("AI-generated splitting instructions:");
console.log(splittingInstructions);

// Use instructions with taskService.splitTask
if (splittingInstructions) {
  const splitResult = await taskService.splitTask(
    "task-id",
    undefined,
    splittingInstructions
  );
  console.log(`Split into ${splitResult.subtasks.length} subtasks`);
}
```

**Example: Feature-Based Splitting**
```typescript
const featureSplitting = await workflowAIAssistant.assistTaskSplitting({
  taskTitle: "Add social features",
  userGuidance: "Split into user profiles, social connections (follow/friend), activity feeds, notifications, and messaging. Include both frontend and backend tasks for each feature. Database schema changes should be separate."
});

console.log("Feature-based splitting instructions:");
console.log(featureSplitting);
console.log(`Instructions length: ${featureSplitting.length} characters`);
```

**Example: Technical Component Splitting**
```typescript
const technicalSplitting = await workflowAIAssistant.assistTaskSplitting({
  taskTitle: "Build authentication system",
  taskContent: "Implement secure user authentication supporting email/password, OAuth (Google, GitHub), and magic links. Include password reset, email verification, and session management.",
  userGuidance: "Split by technical components: UI/UX pages, API endpoints, database models and migrations, security middleware, email service integration, and unit tests. Each component should be independently testable."
});

console.log("Technical component splitting instructions ready");
console.log(technicalSplitting);
```

---

### INTEGRATION PROTOCOLS

**Prompt Building Integration:**
The assistant uses PromptBuilder for consistent prompt generation. All assistant methods follow this pattern:

```typescript
// Example prompt template usage
const promptResult = PromptBuilder.buildPrompt({
  name: "project-init-suggestion",
  type: "user",
  variables: {
    USER_DESCRIPTION: input.userDescription
  }
});

if (!promptResult.success) {
  throw createStandardError(
    TaskOMaticErrorCodes.CONFIGURATION_ERROR,
    `Failed to build prompt: ${promptResult.error}`
  );
}

const systemPromptResult = PromptBuilder.buildPrompt({
  name: "project-init-suggestion",
  type: "system",
  variables: {}
});
```

**Available Prompt Templates:**
```typescript
// From PromptRegistry
const templates = [
  "project-init-suggestion",      // Stack recommendations
  "project-init-suggestion-system",
  "prd-improvement",              // PRD refinement
  "prd-improvement-system",
  "task-prioritization",          // Task ordering
  "task-prioritization-system",
  "task-splitting-assistance",    // Task breakdown
  "task-splitting-assistance-system"
];
```

**AI Configuration Integration:**
All methods support flexible AI configuration through `AIOptions`:

```typescript
interface AIOptions {
  aiProvider?: string;        // Provider selection (anthropic, openai, openrouter, etc.)
  aiModel?: string;          // Model selection
  aiKey?: string;            // API key override
  aiProviderUrl?: string;   // Custom endpoint URL
}
```

**Streaming Integration:**
Real-time feedback through standardized streaming options:

```typescript
interface StreamingOptions {
  onChunk?: (chunk: string) => void;      // Real-time response chunks
  onFinish?: (result: any) => void;       // Completion callback
  onError?: (error: Error) => void;        // Error handling callback
}
```

**Error Handling Strategy:**

All methods follow consistent error handling patterns:

1. **Prompt Building Errors**: Throw `TaskOMaticError` with `CONFIGURATION_ERROR`
   - Template not found in registry
   - Required variables missing
   - Template compilation errors

2. **AI Operation Errors**: Handle gracefully with fallbacks
   - Network errors: retry or return defaults
   - JSON parsing errors: return sensible defaults
   - API errors: return original input or empty result

3. **User Errors**: Provide helpful error messages with suggestions
   - Invalid input: describe what's expected
   - Configuration issues: suggest fixes
   - Model selection: recommend alternatives

**Response Parsing:**

AI responses are parsed with robust error handling:

```typescript
// JSON parsing with fallback
try {
  const jsonMatch = result.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw createStandardError(
      TaskOMaticErrorCodes.AI_OPERATION_FAILED,
      "No JSON found in AI response",
      {
        context: "The AI did not return a valid JSON object.",
        suggestions: [
          "Try a different model or provider.",
          "Check the prompt for clarity.",
          "Simplify the request."
        ]
      }
    );
  }
  return JSON.parse(jsonMatch[0]);
} catch (error) {
  // Return sensible defaults
  return defaultConfiguration;
}
```

---

### SURVIVAL SCENARIOS

**Scenario 1: Complete Project Setup Assistance**

```typescript
// Step 1: Get AI recommendations for project setup
const configRecommendation = await workflowAIAssistant.assistInitConfig({
  userDescription: "AI-powered code review platform for development teams with real-time collaboration, automated analysis, and team management features. Needs to support Git integration, code diff visualization, and commenting system.",
  aiOptions: { aiProvider: "anthropic", aiModel: "claude-3-5-sonnet" },
  streamingOptions: {
    onChunk: (chunk) => process.stdout.write('.'),
    onFinish: () => console.log("\n✓ Config recommendations received")
  }
});

console.log("\nAI Recommended Stack:");
console.log(`- Project: ${configRecommendation.projectName}`);
console.log(`- Frontend: ${configRecommendation.frontend}`);
console.log(`- Backend: ${configRecommendation.backend}`);
console.log(`- Database: ${configRecommendation.database}`);
console.log(`- AI: ${configRecommendation.aiProvider}/${configRecommendation.aiModel}`);

// Step 2: Generate initial PRD
console.log("\nGenerating PRD...");
const prdContent = await workflowAIAssistant.assistPRDCreation({
  userDescription: "AI-powered code review platform with real-time collaboration, automated analysis, and team management features",
  aiOptions: { aiProvider: "anthropic", aiModel: "claude-3-5-sonnet" },
  streamingOptions: {
    onChunk: (chunk) => process.stdout.write('.'),
    onFinish: () => console.log("\n✓ PRD generated")
  }
});

// Step 3: Refine PRD based on feedback
console.log("\nRefining PRD with technical details...");
const refinedPRD = await workflowAIAssistant.assistPRDRefinement({
  currentPRD: prdContent,
  userFeedback: "Add more technical details about code analysis algorithms, integration with Git providers (GitHub, GitLab, Bitbucket), performance requirements for large repositories (>100k files), and security considerations for accessing private repositories.",
  aiOptions: { aiProvider: "anthropic", aiModel: "claude-3-5-sonnet" },
  streamingOptions: {
    onChunk: (chunk) => process.stdout.write('.'),
    onFinish: () => console.log("\n✓ PRD refined")
  }
});

console.log(`\nComplete project setup assistance completed`);
console.log(`Final PRD length: ${refinedPRD.length} characters`);
```

**Scenario 2: Task Management Strategy**

```typescript
// Get all todo tasks
const tasks = await taskService.listTasks({ status: "todo" });
const taskDetails = tasks.map(task => ({
  id: task.id,
  title: task.title,
  description: task.description
}));

// Get prioritized task order
console.log("Analyzing task priorities...");
const prioritization = await workflowAIAssistant.assistTaskPrioritization({
  tasks: taskDetails,
  userGuidance: "Prioritize based on user impact, dependencies, and effort. Critical path tasks first. Consider technical risk and team expertise. Balance quick wins with important foundation work.",
  aiOptions: { aiProvider: "anthropic", aiModel: "claude-3-5-sonnet" },
  streamingOptions: {
    onChunk: (chunk) => process.stdout.write('.'),
    onFinish: () => console.log("\n✓ Prioritization complete")
  }
});

console.log("\n=== EXECUTION PLAN ===");
console.log(prioritization.recommendations);
console.log("\nTask Order:");

// Sort tasks by priority and create execution plan
const executionPlan = prioritization.prioritizedTasks
  .sort((a, b) => a.priority - b.priority);

for (const prioritizedTask of executionPlan) {
  const task = tasks.find(t => t.id === prioritizedTask.id);
  if (task) {
    console.log(`\n${prioritizedTask.priority}. ${task.title}`);
    console.log(`   Reason: ${prioritizedTask.reasoning}`);

    // Get splitting instructions for complex tasks
    if (task.estimatedEffort === "large") {
      console.log("   Generating subtask breakdown...");
      const splittingInstructions = await workflowAIAssistant.assistTaskSplitting({
        taskTitle: task.title,
        taskContent: task.description,
        userGuidance: "Split into 2-4 subtasks, each completable in 1-2 days. Include testing and documentation.",
        aiOptions: { aiProvider: "anthropic", aiModel: "claude-3-5-sonnet" }
      });

      // Apply splitting
      await taskService.splitTask(task.id, undefined, splittingInstructions);
      console.log(`   ✓ Split into subtasks`);
    }

    // Update task with priority
    await taskService.updateTask(task.id, {
      metadata: { priority: prioritizedTask.priority }
    });
  }
}

console.log("\n✓ Task execution plan ready");
```

**Scenario 3: Iterative PRD Improvement**

```typescript
let currentPRD = await fs.readFile("./draft-prd.md", "utf-8");
const feedbackRounds = [
  "Add security requirements section including authentication, authorization, and data protection",
  "Include performance benchmarks: page load <2s, API response <200ms, support 10k concurrent users",
  "Detail user experience and accessibility requirements following WCAG 2.1 AA",
  "Add integration requirements with existing systems (CRM, analytics, payment gateway)",
  "Include testing strategy covering unit, integration, E2E, and performance testing"
];

console.log(`Starting with PRD of ${currentPRD.length} characters`);
console.log(`Applying ${feedbackRounds.length} rounds of improvements...\n`);

for (let i = 0; i < feedbackRounds.length; i++) {
  console.log(`Round ${i + 1}/${feedbackRounds.length}: ${feedbackRounds[i]}`);

  currentPRD = await workflowAIAssistant.assistPRDRefinement({
    currentPRD: currentPRD,
    userFeedback: feedbackRounds[i],
    aiOptions: { aiProvider: "anthropic", aiModel: "claude-3-5-sonnet" },
    streamingOptions: {
      onChunk: (chunk) => process.stdout.write('.'),
      onFinish: () => console.log(` Done (${currentPRD.length} chars)`)
    }
  });

  // Save intermediate version
  await fs.writeFile(`./prd-refined-v${i + 1}.md`, currentPRD);
}

console.log(`\n✓ Final refined PRD ready: ${currentPRD.length} characters`);
console.log(`Final PRD saved to prd-refined-v${feedbackRounds.length}.md`);
```

---

### TECHNICAL SPECIFICATIONS

**Prompt Template System:**

The assistant uses structured prompt templates for consistency:

```typescript
// Template structure from PromptRegistry
{
  name: "project-init-suggestion",
  description: "Suggest project initialization configuration",
  type: "user",
  requiredVariables: ["USER_DESCRIPTION"],
  optionalVariables: [],
  promptText: PROJECT_INIT_SUGGESTION_PROMPT
}
```

Available templates:
- `project-init-suggestion`: For stack recommendations
- `prd-improvement`: For PRD refinement
- `task-prioritization`: For task ordering
- `task-splitting-assistance`: For task breakdown

Each template has both `user` and `system` variants.

**AI Response Parsing:**

All AI responses are parsed with robust error handling:

```typescript
// JSON extraction with regex
const jsonMatch = result.match(/\{[\s\S]*\}/);
if (!jsonMatch) {
  throw createStandardError(
    TaskOMaticErrorCodes.AI_OPERATION_FAILED,
    "No JSON found in AI response"
  );
}
return JSON.parse(jsonMatch[0]);
```

**Fallback Strategies:**

When AI operations fail, the assistant provides sensible defaults:

| Method | Fallback Behavior |
|--------|------------------|
| `assistInitConfig` | Modern default stack (Next.js + Hono + SQLite) |
| `assistPRDCreation` | Returns empty string |
| `assistPRDRefinement` | Returns original PRD |
| `assistTaskPrioritization` | Returns tasks in original order |
| `assistTaskSplitting` | Returns empty string |

**Error Recovery:**

- Multiple parsing attempts for malformed AI responses
- Graceful degradation of functionality
- Detailed error logging for debugging
- User-friendly error messages with actionable suggestions

**Performance Considerations:**

- Streaming responses for real-time feedback on long operations
- Efficient prompt building with template caching
- Minimal memory footprint for large PRDs
- Single concurrent operation per instance (not thread-safe)

**Integration Points:**

```typescript
// WorkflowService integration
import { workflowAIAssistant } from '@task-o-matic/core';

// TaskService integration
import { taskService } from '@task-o-matic/core';

// PRDService integration
import { prdService } from '@task-o-matic/core';

// Combined workflow
const config = await workflowAIAssistant.assistInitConfig({...});
const prd = await workflowAIAssistant.assistPRDCreation({...});
const tasks = await prdService.parsePRD(prd, {...});
const prioritized = await workflowAIAssistant.assistTaskPrioritization({
  tasks: tasks.map(t => ({ id: t.id, title: t.title })),
  userGuidance: "Critical path first"
});
```

**Remember:** Citizen, WorkflowAIAssistant is your strategic advisor in the wasteland of project decisions. Use its recommendations to navigate the complex terrain of technology choices, but always apply your own judgment. The AI provides guidance based on patterns and best practices, but you make the final decisions based on your specific context, constraints, and requirements. Trust but verify, adapt but don't blindly follow. Your survival depends on good decisions augmented by AI wisdom.
