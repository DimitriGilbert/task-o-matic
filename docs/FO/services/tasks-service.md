## TECHNICAL BULLETIN NO. 001
### TASK SERVICE - TASK MANAGEMENT SURVIVAL SYSTEM

**DOCUMENT ID:** `task-o-matic-tasks-v1`  
**CLEARANCE:** `All Personnel`  
**MANDATORY COMPLIANCE:** `Yes`

### ⚠️ CRITICAL SURVIVAL NOTICE
Citizen, ignoring this service documentation will result in certain task management failure in the post-deadline wasteland. The TaskService is your primary weapon against the chaos of untracked work. Without proper understanding, your projects will devolve into unmanageable nightmares faster than a scavenger gang raiding your supplies.

### SYSTEM ARCHITECTURE OVERVIEW

The TaskService operates as the central nervous system of task-o-matic, providing comprehensive task lifecycle management with AI-powered enhancements. It's built with dependency injection for testability and follows a clean separation of concerns pattern.

**Core Dependencies:**
- **Storage Layer**: Local file-based storage in `.task-o-matic/` directory
- **AI Operations**: Vercel AI SDK integration with Context7 documentation
- **Context Builder**: Builds project context for AI operations
- **Model Provider**: AI provider abstraction layer
- **Hooks System**: Event-driven architecture for task lifecycle events

**Data Flow:**
1. Task creation triggers AI enhancement (optional)
2. Context building analyzes project state
3. AI operations enrich tasks with documentation
4. Storage layer persists all data locally
5. Hooks emit events for system integration

### COMPLETE API DOCUMENTATION

---

#### CONSTRUCTOR

```typescript
constructor(dependencies: TaskServiceDependencies = {})
```

**Parameters:**
- `dependencies` (TaskServiceDependencies, optional): Dependency injection object for testing
  - `storage` (Storage, optional): Storage layer instance
  - `aiOperations` (AIOperations, optional): AI service instance  
  - `modelProvider` (ModelProvider, optional): AI model provider
  - `contextBuilder` (ContextBuilder, optional): Context building service
  - `hooks` (Hooks, optional): Event system instance

**Returns:** TaskService instance

**Error Conditions:** None - constructor never throws

**Example: Basic Initialization**
```typescript
import { TaskService } from "task-o-matic";

// Default initialization with all dependencies
const taskService = new TaskService();
```

**Example: Test Configuration**
```typescript
// For testing with mocked dependencies
const mockStorage = createMockStorage();
const mockAI = createMockAI();
const taskService = new TaskService({
  storage: mockStorage,
  aiOperations: mockAI
});
```

---

#### createTask

```typescript
async createTask(input: {
  title: string;
  content?: string;
  parentId?: string;
  effort?: string;
  aiEnhance?: boolean;
  aiOptions?: AIOptions;
  streamingOptions?: StreamingOptions;
}): Promise<CreateTaskResult>
```

**Parameters:**
- `input.title` (string, required): Task title, 1-255 characters
- `input.content` (string, optional): Task description/content
- `input.parentId` (string, optional): Parent task ID for creating subtasks
- `input.effort` (string, optional): Estimated effort - "small" | "medium" | "large"
- `input.aiEnhance` (boolean, optional): Enable AI enhancement with Context7 documentation
- `input.aiOptions` (AIOptions, optional): AI configuration override
- `input.streamingOptions` (StreamingOptions, optional): Real-time streaming callbacks

**Returns:** CreateTaskResult containing:
- `success` (boolean): Operation success status
- `task` (Task): Created task object
- `aiMetadata` (TaskAIMetadata | undefined): AI enhancement metadata

**Error Conditions:**
- `TaskOMaticError`: AI operation failures, storage errors
- `Error`: Input validation failures

**Example: Basic Task Creation**
```typescript
const result = await taskService.createTask({
  title: "Fix authentication bug",
  content: "Users cannot login with valid credentials",
  aiEnhance: false
});
console.log(`Created task: ${result.task.id}`);
```

**Example: AI-Enhanced Task with Streaming**
```typescript
try {
  const result = await taskService.createTask({
    title: "Design authentication system",
    content: "Implement OAuth2 + JWT authentication",
    aiEnhance: true,
    streamingOptions: {
      onChunk: (chunk) => console.log("AI:", chunk),
      onFinish: (result) => console.log("Complete!")
    }
  });
  console.log("Enhanced content:", result.task.content);
} catch (error) {
  if (error instanceof TaskOMaticError) {
    console.error("AI enhancement failed:", error.getDetails());
  }
}
```

**Example: Creating Subtasks**
```typescript
const subtask = await taskService.createTask({
  title: "Implement OAuth2 flow",
  parentId: "1",
  effort: "medium"
});
console.log(`Created subtask ${subtask.task.id} under parent ${subtask.task.parentId}`);
```

---

#### listTasks

```typescript
async listTasks(filters: { status?: string; tag?: string }): Promise<Task[]>
```

**Parameters:**
- `filters.status` (string, optional): Filter by task status - "todo" | "in-progress" | "completed"
- `filters.tag` (string, optional): Filter by task tag

**Returns:** Array of Task objects matching filters

**Error Conditions:** Storage layer errors

**Example: List All Tasks**
```typescript
const allTasks = await taskService.listTasks({});
console.log(`Found ${allTasks.length} tasks`);
```

**Example: Filter by Status**
```typescript
const completedTasks = await taskService.listTasks({ status: "completed" });
completedTasks.forEach(task => console.log(`✓ ${task.title}`));
```

**Example: Filter by Tag**
```typescript
const frontendTasks = await taskService.listTasks({ tag: "frontend" });
frontendTasks.forEach(task => console.log(`🎨 ${task.title}`));
```

---

#### getTask

```typescript
async getTask(id: string): Promise<Task | null>
```

**Parameters:**
- `id` (string, required): Task ID to retrieve

**Returns:** Task object or null if not found

**Error Conditions:** Storage layer errors

**Example: Retrieve Specific Task**
```typescript
const task = await taskService.getTask("1");
if (task) {
  console.log(`Task: ${task.title}`);
  console.log(`Status: ${task.status}`);
} else {
  console.log("Task not found");
}
```

---

#### getTaskContent

```typescript
async getTaskContent(id: string): Promise<string | null>
```

**Parameters:**
- `id` (string, required): Task ID

**Returns:** Task content string or null

**Error Conditions:** Storage layer errors

**Example: Get Task Content**
```typescript
const content = await taskService.getTaskContent("1");
if (content) {
  console.log("Task content:", content);
}
```

---

#### getTaskAIMetadata

```typescript
async getTaskAIMetadata(id: string): Promise<TaskAIMetadata | null>
```

**Parameters:**
- `id` (string, required): Task ID

**Returns:** AI metadata object or null

**Error Conditions:** Storage layer errors

**Example: Check AI Enhancement**
```typescript
const metadata = await taskService.getTaskAIMetadata("1");
if (metadata?.aiGenerated) {
  console.log(`Enhanced by ${metadata.aiProvider}/${metadata.aiModel}`);
  console.log(`Confidence: ${metadata.confidence}`);
}
```

---

#### getSubtasks

```typescript
async getSubtasks(id: string): Promise<Task[]>
```

**Parameters:**
- `id` (string, required): Parent task ID

**Returns:** Array of subtask objects

**Error Conditions:** Storage layer errors

**Example: List Subtasks**
```typescript
const subtasks = await taskService.getSubtasks("1");
console.log(`Task 1 has ${subtasks.length} subtasks`);
subtasks.forEach(subtask => {
  console.log(`  - ${subtask.title} (${subtask.status})`);
});
```

---

#### updateTask

```typescript
async updateTask(
  id: string,
  updates: {
    title?: string;
    description?: string;
    status?: string;
    effort?: string;
    tags?: string | string[];
  }
): Promise<Task>
```

**Parameters:**
- `id` (string, required): Task ID to update
- `updates.title` (string, optional): New task title
- `updates.description` (string, optional): New task description
- `updates.status` (string, optional): New status - "todo" | "in-progress" | "completed"
- `updates.effort` (string, optional): New effort - "small" | "medium" | "large"
- `updates.tags` (string | string[], optional): Tags to add (comma-separated string or array)

**Returns:** Updated Task object

**Error Conditions:**
- `TaskOMaticError`: Task not found, invalid status transition, storage errors
- `Error`: Invalid input

**Example: Update Task Status**
```typescript
const updatedTask = await taskService.updateTask("1", { 
  status: "in-progress" 
});
console.log(`Task ${updatedTask.id} is now ${updatedTask.status}`);
```

**Example: Add Tags**
```typescript
const taskWithTags = await taskService.updateTask("1", { 
  tags: "frontend,urgent,bug" 
});
console.log("Tags:", taskWithTags.tags);
```

**Example: Multiple Updates**
```typescript
const updatedTask = await taskService.updateTask("1", {
  title: "Updated task title",
  description: "New description",
  effort: "large",
  tags: ["backend", "api"]
});
```

---

#### setTaskStatus

```typescript
async setTaskStatus(id: string, status: string): Promise<Task>
```

**Parameters:**
- `id` (string, required): Task ID
- `status` (string, required): New status

**Returns:** Updated Task object

**Error Conditions:** Same as updateTask

**Example: Quick Status Update**
```typescript
const task = await taskService.setTaskStatus("1", "completed");
console.log(`Task ${task.id} marked as completed`);
```

---

#### deleteTask

```typescript
async deleteTask(
  id: string,
  options: { cascade?: boolean; force?: boolean } = {}
): Promise<DeleteTaskResult>
```

**Parameters:**
- `id` (string, required): Task ID to delete
- `options.cascade` (boolean, optional): Delete task and all subtasks recursively
- `options.force` (boolean, optional): Delete task and orphan subtasks (remove parentId)

**Returns:** DeleteTaskResult containing:
- `success` (boolean): Operation success
- `deleted` (Task[]): Array of deleted tasks
- `orphanedSubtasks` (Task[]): Array of orphaned subtasks (if force=true)

**Error Conditions:**
- `TaskOMaticError`: Task not found, task has subtasks without cascade/force
- Storage errors

**Example: Simple Delete**
```typescript
const result = await taskService.deleteTask("1");
console.log(`Deleted ${result.deleted.length} tasks`);
```

**Example: Cascade Delete**
```typescript
const result = await taskService.deleteTask("1", { cascade: true });
console.log(`Deleted task and ${result.deleted.length - 1} subtasks`);
```

**Example: Force Delete (Orphan Subtasks)**
```typescript
const result = await taskService.deleteTask("1", { force: true });
console.log(`Deleted 1 task, orphaned ${result.orphanedSubtasks.length} subtasks`);
```

---

#### addTags

```typescript
async addTags(id: string, tags: string[]): Promise<Task>
```

**Parameters:**
- `id` (string, required): Task ID
- `tags` (string[]): Array of tags to add

**Returns:** Updated Task object

**Error Conditions:**
- `TaskOMaticError`: Task not found, storage errors

**Example: Add Multiple Tags**
```typescript
const updatedTask = await taskService.addTags("1", ["urgent", "bug", "frontend"]);
console.log("New tags:", updatedTask.tags);
```

---

#### removeTags

```typescript
async removeTags(id: string, tags: string[]): Promise<Task>
```

**Parameters:**
- `id` (string, required): Task ID
- `tags` (string[]): Array of tags to remove

**Returns:** Updated Task object

**Error Conditions:**
- `TaskOMaticError`: Task not found, storage errors

**Example: Remove Tags**
```typescript
const updatedTask = await taskService.removeTags("1", ["urgent", "bug"]);
console.log("Remaining tags:", updatedTask.tags);
```

---

#### getNextTask

```typescript
async getNextTask(filters: {
  status?: string;
  tag?: string;
  effort?: string;
  priority?: string;
}): Promise<Task | null>
```

**Parameters:**
- `filters.status` (string, optional): Filter by status
- `filters.tag` (string, optional): Filter by tag
- `filters.effort` (string, optional): Filter by effort
- `filters.priority` (string, optional): Priority strategy - "newest" | "oldest" | "effort" | default (task ID order)

**Returns:** Highest priority task or null if none found

**Error Conditions:** Storage layer errors

**Example: Get Next Task by Default Priority**
```typescript
const nextTask = await taskService.getNextTask({});
if (nextTask) {
  console.log(`Next task: ${nextTask.title}`);
}
```

**Example: Get Newest Todo Task**
```typescript
const newestTodo = await taskService.getNextTask({
  status: "todo",
  priority: "newest"
});
```

**Example: Get High Effort Backend Task**
```typescript
const highEffortTask = await taskService.getNextTask({
  tag: "backend",
  priority: "effort"
});
```

---

#### getTaskTree

```typescript
async getTaskTree(rootId?: string): Promise<Task[]>
```

**Parameters:**
- `rootId` (string, optional): Root task ID. If omitted, returns all tasks

**Returns:** Array of tasks in tree structure

**Error Conditions:**
- `TaskOMaticError`: Root task not found (if specified)
- Storage errors

**Example: Get Complete Task Tree**
```typescript
const allTasks = await taskService.getTaskTree();
console.log(`Total tasks in tree: ${allTasks.length}`);
```

**Example: Get Subtree**
```typescript
const subtree = await taskService.getTaskTree("1");
console.log(`Task 1 subtree has ${subtree.length} tasks`);
```

---

#### enhanceTask

```typescript
async enhanceTask(
  taskId: string,
  aiOptions?: AIOptions,
  streamingOptions?: StreamingOptions
): Promise<EnhanceTaskResult>
```

**Parameters:**
- `taskId` (string, required): Task ID to enhance
- `aiOptions` (AIOptions, optional): AI configuration override
- `streamingOptions` (StreamingOptions, optional): Streaming callbacks

**Returns:** EnhanceTaskResult containing:
- `success` (boolean): Operation success
- `task` (Task): Enhanced task object
- `enhancedContent` (string): AI-enhanced content
- `stats` (object): Enhancement statistics
  - `originalLength` (number): Original content length
  - `enhancedLength` (number): Enhanced content length
  - `duration` (number): Enhancement duration in ms
  - `tokenUsage` (object): Token usage statistics
  - `timeToFirstToken` (number): Time to first token in ms
  - `cost` (number | undefined): Cost calculation
- `metadata` (object): AI metadata

**Error Conditions:**
- `Error`: Task not found
- `TaskOMaticError`: AI enhancement failures

**Example: Basic Enhancement**
```typescript
const result = await taskService.enhanceTask("1");
console.log("Enhanced content:", result.enhancedContent);
console.log("Took:", result.stats.duration, "ms");
```

**Example: Enhancement with Streaming**
```typescript
try {
  const result = await taskService.enhanceTask("1", undefined, {
    onChunk: (chunk) => process.stdout.write(chunk),
    onFinish: () => console.log("\nEnhancement complete!")
  });
  console.log(`Enhanced from ${result.stats.originalLength} to ${result.stats.enhancedLength} characters`);
} catch (error) {
  if (error instanceof TaskOMaticError) {
    console.error("Enhancement failed:", error.getDetails());
  }
}
```

---

#### splitTask

```typescript
async splitTask(
  taskId: string,
  aiOptions?: AIOptions,
  promptOverride?: string,
  messageOverride?: string,
  streamingOptions?: StreamingOptions,
  enableFilesystemTools?: boolean
): Promise<SplitTaskResult>
```

**Parameters:**
- `taskId` (string, required): Task ID to split
- `aiOptions` (AIOptions, optional): AI configuration override
- `promptOverride` (string, optional): Custom prompt for splitting
- `messageOverride` (string, optional): Custom message
- `streamingOptions` (StreamingOptions, optional): Streaming callbacks
- `enableFilesystemTools` (boolean, optional): Enable filesystem analysis

**Returns:** SplitTaskResult containing:
- `success` (boolean): Operation success
- `task` (Task): Original task object
- `subtasks` (Task[]): Array of created subtasks
- `stats` (object): Splitting statistics
  - `subtasksCreated` (number): Number of subtasks created
  - `duration` (number): Splitting duration in ms
  - `tokenUsage` (object): Token usage statistics
  - `timeToFirstToken` (number): Time to first token
  - `cost` (number | undefined): Cost calculation
- `metadata` (object): AI metadata

**Error Conditions:**
- `Error`: Task not found, task already has subtasks
- `TaskOMaticError`: AI operation failures

**Example: Basic Task Splitting**
```typescript
const result = await taskService.splitTask("1");
console.log(`Created ${result.subtasks.length} subtasks`);
result.subtasks.forEach(subtask => {
  console.log(`- ${subtask.title} (${subtask.estimatedEffort})`);
});
```

**Example: Splitting with Filesystem Analysis**
```typescript
try {
  const result = await taskService.splitTask(
    "1",
    undefined, // aiOptions
    undefined, // promptOverride
    undefined, // messageOverride
    { onChunk: (chunk) => console.log(chunk) }, // streaming
    true // enable filesystem tools
  );
  console.log("AI analyzed codebase to create subtasks");
  console.log(`Splitting took ${result.stats.duration}ms`);
} catch (error) {
  if (error instanceof TaskOMaticError) {
    console.error("Split failed:", error.suggestions);
  }
}
```

---

#### documentTask

```typescript
async documentTask(
  taskId: string,
  force: boolean = false,
  aiOptions?: AIOptions,
  streamingOptions?: StreamingOptions
): Promise<DocumentTaskResult>
```

**Parameters:**
- `taskId` (string, required): Task ID to document
- `force` (boolean, optional): Force re-fetch even if documentation exists
- `aiOptions` (AIOptions, optional): AI configuration override
- `streamingOptions` (StreamingOptions, optional): Streaming callbacks

**Returns:** DocumentTaskResult containing:
- `success` (boolean): Operation success
- `task` (Task): Task object
- `analysis` (object): Documentation analysis
  - `libraries` (array): Identified libraries
  - `files` (array): Relevant files
- `documentation` (TaskDocumentation | undefined): Fetched documentation
- `stats` (object): Analysis statistics
  - `duration` (number): Analysis duration

**Error Conditions:**
- `Error`: Task not found, empty task content
- `TaskOMaticError`: AI operation failures

**Example: Analyze Documentation Needs**
```typescript
const result = await taskService.documentTask("1");
if (result.documentation) {
  console.log("Documentation fetched:");
  console.log(result.documentation.recap);
  console.log("Libraries:", result.documentation.libraries);
}
```

**Example: Force Refresh Documentation**
```typescript
try {
  const result = await taskService.documentTask("1", true);
  console.log(`Analyzed ${result.analysis.libraries.length} libraries`);
} catch (error) {
  if (error instanceof TaskOMaticError) {
    console.error("Documentation fetch failed:", error.getDetails());
  }
}
```

---

#### planTask

```typescript
async planTask(
  taskId: string,
  aiOptions?: AIOptions,
  streamingOptions?: StreamingOptions
): Promise<PlanTaskResult>
```

**Parameters:**
- `taskId` (string, required): Task ID to plan
- `aiOptions` (AIOptions, optional): AI configuration override
- `streamingOptions` (StreamingOptions, optional): Streaming callbacks

**Returns:** PlanTaskResult containing:
- `success` (boolean): Operation success
- `task` (Task): Task object
- `plan` (string): Generated implementation plan
- `stats` (object): Planning statistics
  - `duration` (number): Planning duration
  - `tokenUsage` (object): Token usage statistics
  - `timeToFirstToken` (number): Time to first token
  - `cost` (number | undefined): Cost calculation
- `metadata` (object): AI metadata

**Error Conditions:**
- `Error`: Task not found
- `TaskOMaticError`: AI operation failures

**Example: Basic Implementation Planning**
```typescript
const result = await taskService.planTask("1");
console.log("Implementation Plan:");
console.log(result.plan);
console.log(`Generated in ${result.stats.duration}ms`);
```

**Example: Planning with Streaming**
```typescript
try {
  const result = await taskService.planTask("1", undefined, {
    onChunk: (chunk) => {
      // Display plan as it's generated
      process.stdout.write(chunk);
    }
  });
  console.log("\n\nPlan saved to:", `plans/${result.task.id}.md`);
} catch (error) {
  if (error instanceof TaskOMaticError) {
    console.error("Planning failed:", error.getDetails());
  }
}
```

---

#### getTaskDocumentation

```typescript
async getTaskDocumentation(taskId: string): Promise<string | null>
```

**Parameters:**
- `taskId` (string, required): Task ID

**Returns:** Documentation string or null

**Error Conditions:** Storage layer errors

**Example: Retrieve Documentation**
```typescript
const docs = await taskService.getTaskDocumentation("1");
if (docs) {
  console.log("Task documentation:", docs);
}
```

---

#### addTaskDocumentationFromFile

```typescript
async addTaskDocumentationFromFile(
  taskId: string,
  filePath: string
): Promise<{ filePath: string; task: Task }>
```

**Parameters:**
- `taskId` (string, required): Task ID
- `filePath` (string, required): Path to documentation file

**Returns:** Object containing saved file path and updated task

**Error Conditions:**
- `TaskOMaticError`: Task not found, file not found
- Storage errors

**Example: Add Documentation from File**
```typescript
try {
  const result = await taskService.addTaskDocumentationFromFile("1", "./docs/api.md");
  console.log(`Documentation saved to: ${result.filePath}`);
} catch (error) {
  if (error instanceof TaskOMaticError) {
    console.error("Failed to add documentation:", error.getDetails());
  }
}
```

---

#### setTaskPlan

```typescript
async setTaskPlan(
  taskId: string,
  planText?: string,
  planFilePath?: string
): Promise<{ planFile: string; task: Task }>
```

**Parameters:**
- `taskId` (string, required): Task ID
- `planText` (string, optional): Plan content as text
- `planFilePath` (string, optional): Path to plan file

**Returns:** Object containing plan file path and updated task

**Error Conditions:**
- `TaskOMaticError`: Task not found, file not found, neither planText nor planFilePath provided
- Storage errors

**Example: Set Plan from Text**
```typescript
const result = await taskService.setTaskPlan("1", "1. Research\n2. Implement\n3. Test");
console.log(`Plan saved to: ${result.planFile}`);
```

**Example: Set Plan from File**
```typescript
const result = await taskService.setTaskPlan("1", undefined, "./plans/task-1.md");
console.log(`Plan loaded from file and saved to: ${result.planFile}`);
```

---

#### getTaskPlan

```typescript
async getTaskPlan(
  taskId: string
): Promise<{ plan: string; createdAt: number; updatedAt: number } | null>
```

**Parameters:**
- `taskId` (string, required): Task ID

**Returns:** Plan object or null

**Error Conditions:** Storage layer errors

**Example: Retrieve Task Plan**
```typescript
const plan = await taskService.getTaskPlan("1");
if (plan) {
  console.log("Plan created:", new Date(plan.createdAt));
  console.log("Plan updated:", new Date(plan.updatedAt));
  console.log("Plan content:", plan.plan);
}
```

---

#### listTaskPlans

```typescript
async listTaskPlans(): Promise<
  Array<{
    taskId: string;
    plan: string;
    createdAt: number;
    updatedAt: number;
  }>
>
```

**Returns:** Array of plan objects

**Error Conditions:** Storage layer errors

**Example: List All Plans**
```typescript
const plans = await taskService.listTaskPlans();
console.log(`Found ${plans.length} plans`);
plans.forEach(plan => {
  console.log(`Task ${plan.taskId}: ${plan.plan.substring(0, 50)}...`);
});
```

---

#### deleteTaskPlan

```typescript
async deleteTaskPlan(taskId: string): Promise<boolean>
```

**Parameters:**
- `taskId` (string, required): Task ID

**Returns:** True if deleted, false if not found

**Error Conditions:** Storage layer errors

**Example: Delete Task Plan**
```typescript
const deleted = await taskService.deleteTaskPlan("1");
if (deleted) {
  console.log("Plan deleted successfully");
} else {
  console.log("Plan not found");
}
```

### INTEGRATION PROTOCOLS

**Event System Integration:**
The TaskService emits hooks for task lifecycle events:
- `task:created`: New task created
- `task:updated`: Task modified
- `task:deleted`: Task removed
- `task:status-changed`: Task status updated
- `task:progress`: Progress updates for AI operations

**Storage Integration:**
All data persists to `.task-o-matic/` directory:
- `tasks/`: Individual task JSON files
- `config.json`: Project configuration
- `plans/`: Implementation plans
- `docs/`: Cached documentation

**AI Integration:**
Context7 MCP integration provides:
- Documentation enhancement
- Task breakdown with context
- Implementation planning
- Documentation analysis

### SURVIVAL SCENARIOS

**Scenario 1: Complex Project Setup**
```typescript
// Initialize project with AI-enhanced tasks
const taskService = new TaskService();

// Create main project task
const projectTask = await taskService.createTask({
  title: "Build E-commerce Platform",
  content: "Full-stack e-commerce solution with payment processing",
  aiEnhance: true
});

// Split into major components
const splitResult = await taskService.splitTask(projectTask.task.id, undefined, undefined, undefined, {
  onChunk: (chunk) => console.log(chunk)
}, true);

// Generate implementation plans for each subtask
for (const subtask of splitResult.subtasks) {
  await taskService.planTask(subtask.id);
  console.log(`Plan created for: ${subtask.title}`);
}
```

**Scenario 2: Task Management Workflow**
```typescript
// Get next task to work on
const nextTask = await taskService.getNextTask({ 
  status: "todo", 
  priority: "effort" 
});

if (nextTask) {
  // Start working on task
  await taskService.setTaskStatus(nextTask.id, "in-progress");
  
  // Get documentation if needed
  const docs = await taskService.documentTask(nextTask.id);
  if (docs.documentation) {
    console.log("Relevant documentation available");
  }
  
  // Complete task
  await taskService.setTaskStatus(nextTask.id, "completed");
}
```

**Scenario 3: AI-Powered Task Enhancement**
```typescript
// Enhance existing task with latest documentation
const enhanceResult = await taskService.enhanceTask("1", {
  aiProvider: "anthropic",
  aiModel: "claude-3-5-sonnet"
}, {
  onChunk: (chunk) => process.stdout.write(chunk),
  onFinish: () => console.log("\nEnhancement complete!")
});

console.log(`Enhanced from ${enhanceResult.stats.originalLength} to ${enhanceResult.stats.enhancedLength} characters`);
```

### TECHNICAL SPECIFICATIONS

**Task Object Structure:**
```typescript
interface Task {
  id: string;
  title: string;
  description: string;
  content?: string;
  status: "todo" | "in-progress" | "completed";
  parentId?: string;
  estimatedEffort?: "small" | "medium" | "large";
  tags?: string[];
  dependencies?: string[];
  createdAt: number;
  updatedAt: number;
  contentFile?: string;
  documentation?: TaskDocumentation;
  prdFile?: string;
}
```

**AI Metadata Structure:**
```typescript
interface TaskAIMetadata {
  taskId: string;
  aiGenerated: boolean;
  aiPrompt: string;
  confidence: number;
  aiProvider?: string;
  aiModel?: string;
  generatedAt?: number;
  enhancedAt?: number;
  splitAt?: number;
  parentTaskId?: string;
  subtaskIndex?: number;
  subtasksCreated?: number;
}
```

**Error Handling:**
All operations use TaskOMaticError with structured error information:
- Error codes for categorization
- Context information
- Suggested resolutions
- Metadata for debugging

**Performance Considerations:**
- Lazy loading of task content
- Streaming for AI operations
- Local file storage for fast access
- Event-driven architecture for scalability

**Remember:** Citizen, in the wasteland of unmanaged projects, the TaskService is your survival kit. Master its API, respect its patterns, and it will keep your tasks organized and your projects alive. Ignore it at your peril.