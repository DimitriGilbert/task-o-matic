# Vault-Tec Utilities & Helpers Workbench

> **Welcome, Vault Dweller!**  
> This is your comprehensive guide to the Task-O-Matic Utilities & Helpers system - the essential workbench tools that keep your Vault-Tec task management system running smoothly in the post-apocalyptic wasteland of modern development.

---

## 🛠️ OVERVIEW: THE UTILITY WORKBENCH

The Utilities & Helpers system is the backbone of Task-O-Matic operations, providing essential tools for AI operations, error handling, file management, and user interaction. Think of it as your trusted Pip-Boy's utility apps - each designed to make your survival in the development wasteland more manageable.

**⚠️ VAULT-TEC SAFETY WARNING:** Proper utility usage is essential for maintaining system integrity. Misuse may lead to unexpected mutations in your task ecosystem!

---

## 🤖 AI OPERATIONS UTILITY

### AIOperationUtility Class

The **AIOperationUtility** is your RobCo terminal for interacting with AI systems. It provides standardized metrics, error handling, and retry logic for all AI operations.

```typescript
// Initialize your AI terminal
import { AIOperationUtility } from './utils/ai-operation-utility';

const aiTerminal = new AIOperationUtility();

// Execute operation with Vault-Tec approved safety protocols
const result = await aiTerminal.executeAIOperation(
  "Task breakdown", // Operation name for logging
  async () => performBreakdown(task), // Your operation
  {
    maxRetries: 3, // Retry attempts before radiation poisoning
    streamingOptions: { onChunk: console.log } // Real-time monitoring
  }
);

console.log(`Operation completed in ${result.metrics.duration}ms`);
```

#### Key Features:
- **Automatic Retry Logic**: Attempts operations multiple times before declaring system failure
- **Metrics Collection**: Tracks duration, token usage, and time-to-first-token
- **Error Handling**: Wraps errors in TaskOMaticError with helpful suggestions
- **Streaming Support**: Real-time feedback during long operations

#### Stream Text with Tools:

```typescript
const response = await aiTerminal.streamTextWithTools(
  "You are a helpful Vault-Tec assistant", // System prompt
  "Explain the S.P.E.C.I.A.L. system", // User message
  aiConfig, // AI configuration
  streamingOptions, // Streaming callbacks
  tools // Available tools
);
```

---

## ⚙️ AI CONFIGURATION BUILDER

### buildAIConfig Function

Constructs AI configuration objects from CLI options - like programming your RobCo terminal with the right frequencies.

```typescript
import { buildAIConfig } from './utils/ai-config-builder';

const config = buildAIConfig({
  aiProvider: "anthropic", // Your AI provider
  aiModel: "claude-sonnet-4.5", // Model selection
  aiKey: "your-api-key", // Access credentials
  aiProviderUrl: "https://api.anthropic.com", // Custom endpoint
  aiReasoning: "4096" // Reasoning token limit
});

// Returns properly formatted AI configuration
```

---

## 🏭 AI SERVICE FACTORY

### Service Management System

The **AIServiceFactory** manages your AI service instances like a well-organized Vault inventory system.

```typescript
import { 
  initializeServices, 
  getAIOperations, 
  getStorage, 
  getContextBuilder 
} from './utils/ai-service-factory';

// Initialize your Vault systems
await initializeServices({
  workingDirectory: "/vault/13/projects",
  storageCallbacks: customStorageCallbacks,
  contextCallbacks: customContextCallbacks
});

// Access your services
const aiOps = getAIOperations();
const storage = getStorage();
const contextBuilder = getContextBuilder();
```

---

## 📦 BULK OPERATIONS

### executeBulkOperation Function

Process multiple tasks efficiently - like sorting through a crate of supplies systematically.

```typescript
import { executeBulkOperation } from './utils/bulk-operations';

const result = await executeBulkOperation(
  (taskId) => taskService.enhanceTask(taskId), // Operation to perform
  {
    operationName: "Enhancing", // Display name
    operationEmoji: "🤖", // Visual indicator
    filters: { status: "todo", tag: "bug" }, // Target selection
    successMessage: (id, result) => `✓ Enhanced task ${id}`, // Custom success
    errorMessage: (id, error) => `❌ Failed ${id}: ${error.message}` // Custom error
  }
);

console.log(`✅ ${result.succeeded.length} tasks enhanced`);
console.log(`❌ ${result.failed.length} tasks failed`);
```

---

## ✅ CLI VALIDATORS

### Input Validation Tools

Ensure your command inputs are valid - like checking your Pip-Boy before entering the wasteland.

```typescript
import { 
  validateMutuallyExclusive, 
  validateOneRequired, 
  parseCsvOption 
} from './utils/cli-validators';

// Validate mutually exclusive options
validateMutuallyExclusive(options, "taskId", "all", "task-id", "all");

// Validate one of multiple required options
validateOneRequired(options,
  { name: "taskId", label: "task-id" },
  { name: "all", label: "all" },
  { name: "status", label: "status" }
);

// Parse comma-separated options
const tags = parseCsvOption("bug,feature,urgent"); // ["bug", "feature", "urgent"]
```

---

## 🚨 COMMAND ERROR HANDLER

### handleCommandError & wrapCommandHandler

Consistent error handling for CLI commands - your emergency broadcast system when things go wrong.

```typescript
import { 
  handleCommandError, 
  wrapCommandHandler 
} from './utils/command-error-handler';

// Manual error handling
try {
  await dangerousOperation();
} catch (error) {
  handleCommandError("Task enhancement", error); // Exits with code 1
}

// Automatic error wrapping
.command("enhance")
.action(wrapCommandHandler("Task enhancement", async (options) => {
  await taskService.enhanceTask(options.taskId);
}));
```

---

## 🤔 CONFIRMATION UTILITIES

### confirmBulkOperation Function

Get user confirmation before destructive operations - like asking "Are you sure?" before opening that mysterious vault door.

```typescript
import { confirmBulkOperation } from './utils/confirmation';

const confirmed = await confirmBulkOperation(
  "delete", // Operation type
  10, // Number of affected items
  options.force // Skip confirmation if true
);

if (!confirmed) {
  console.log("Operation cancelled by user");
  return;
}
```

---

## 📺 DISPLAY HELPERS

### Visual Output Utilities

Format console output with consistent styling - like your Pip-Boy's interface.

```typescript
import { 
  displayOperationStart,
  displayOperationSuccess,
  displayOperationError,
  displayBulkProgress,
  displaySectionHeader
} from './utils/display-helpers';

// Operation lifecycle
displayOperationStart("Enhancing", "task-123");
displayOperationSuccess("Enhancement", "with Context7");
displayOperationError("Enhancement", new Error("API failed"));

// Bulk operations
displayBulkProgress(3, 10, "Enhancing task ABC");

// Section headers
displaySectionHeader("Execution Summary");
```

---

## ⚠️ ERROR UTILITIES

### Comprehensive Error Management

Handle errors like a seasoned wasteland survivor - with context, suggestions, and proper logging.

```typescript
import { 
  getErrorMessage, 
  formatError, 
  createContextError,
  isError,
  toError
} from './utils/error-utils';

// Extract error messages
const message = getErrorMessage(error); // Handles all error types

// Add context to errors
const formatted = formatError(error, "Failed to fetch data");

// Create context-aware errors
throw createContextError(error, "Operation failed");

// Type checking
if (isError(error)) {
  console.log("This is an Error instance");
}

// Convert any value to Error
const standardError = toError(unknownValue);
```

---

## 📁 FILE UTILITIES

### File System Operations

Manage files like organizing your inventory - with validation and proper directory structure.

```typescript
import { 
  validateFileExists,
  validateFileExistsAsync,
  fileExists,
  fileExistsAsync,
  savePRDFile
} from './utils/file-utils';

// Validate file existence (throws if not found)
validateFileExists("./config.json", "Configuration file not found");

// Check file existence (returns boolean)
if (fileExists("./data.json")) {
  console.log("Data file exists");
}

// Save PRD files with automatic directory creation
const path = savePRDFile(
  "# My PRD\nContent here...", // Content
  "custom-prd.md", // Filename
  "./docs" // Optional directory
);
```

---

## 🆔 ID GENERATOR

### TaskIDGenerator Class

Generate unique task identifiers - like assigning Vault numbers to new dwellers.

```typescript
import { TaskIDGenerator } from './utils/id-generator';

// Generate unique IDs
const taskId = TaskIDGenerator.generate(); // "task-1733750400000-a1b2c3d4"
const subtaskId = TaskIDGenerator.generate("subtask"); // "subtask-1733750400000-e5f6g7h8"

// Validate ID formats
const isValid = TaskIDGenerator.validate("task-1234-abcd"); // true

// Generate unique IDs avoiding collisions
const uniqueId = TaskIDGenerator.generateUnique(existingIds, "task");

// Generate hierarchical child IDs
const childId = TaskIDGenerator.generateChildId("1.2", 3); // "1.2.3"

// Parse hierarchical IDs
const parsed = TaskIDGenerator.parseHierarchicalId("1.2.3");
// Returns: { parentId: "1.2", childIndex: 3 }
```

---

## 📊 METADATA UTILITIES

### createBaseAIMetadata Function

Create standardized AI metadata - like maintaining proper Vault records.

```typescript
import { createBaseAIMetadata } from './utils/metadata-utils';

const baseMetadata = createBaseAIMetadata(
  "task-123", // Task ID
  { provider: "anthropic", model: "claude-sonnet-4.5" }, // AI config
  undefined, // No prompt override
  "Split task into subtasks", // Default prompt
  0.9 // Confidence score
);

// Extend with operation-specific fields
const subtaskMetadata = {
  ...baseMetadata,
  parentTaskId: "parent-123",
  subtaskIndex: 1
};
```

---

## 🔧 MODEL EXECUTOR PARSER

### parseTryModels Function

Parse model and executor specifications - like configuring your terminal frequencies.

```typescript
import { parseTryModels, validateExecutor } from './utils/model-executor-parser';

// Parse various formats
const models1 = parseTryModels("gpt-4o-mini,gpt-4o"); // Simple models
const models2 = parseTryModels("opencode:gpt-4o,claude:sonnet-4"); // With executors
const models3 = parseTryModels("gpt-4o,claude:sonnet-4,gemini:gemini-2.0"); // Mixed

// Validate executors
if (validateExecutor("opencode")) {
  console.log("Valid executor");
}
```

---

## 📈 PROGRESS TRACKING

### withProgressTracking Function

Monitor operation progress - like watching your radiation meter in real-time.

```typescript
import { withProgressTracking } from './utils/progress-tracking';

const result = await withProgressTracking(async () => {
  // Your operation here - progress events will be displayed
  return await taskService.enhanceTask(taskId);
});
```

---

## 🏗️ STACK FORMATTER

### Technology Stack Display

Format technology stack information - like reading your Vault's technical specifications.

```typescript
import { formatStackInfo, formatStackForContext } from './utils/stack-formatter';

const stack = {
  frontend: ["React", "TypeScript"],
  backend: "Node.js",
  database: "PostgreSQL",
  orm: "Prisma",
  auth: "JWT",
  addons: ["Redis", "Docker"]
};

// Human-readable format
const readable = formatStackInfo(stack);
// "Frontend: React, TypeScript, Backend: Node.js, Database: PostgreSQL, ORM: Prisma, Auth: JWT, Addons: Redis, Docker"

// Context format for AI
const context = formatStackForContext(stack);
// "Technology Stack: React + TypeScript + Node.js + PostgreSQL"
```

---

## 🗄️ STORAGE UTILITIES

### Task Storage Validation

Ensure task data integrity - like checking your Vault's inventory system.

```typescript
import { 
  requireTask, 
  requireTasks, 
  filterNullTasks, 
  validateTaskId 
} from './utils/storage-utils';

// Ensure task exists (throws if null)
const task = requireTask(await storage.getTask(taskId), taskId);

// Ensure multiple tasks exist
const validTasks = requireTasks(tasks, "subtasks");

// Filter null tasks with type narrowing
const nonNullTasks = filterNullTasks(tasks); // Type: Task[]

// Validate task ID format
validateTaskId("task-123"); // Throws if invalid
```

---

## 🌊 STREAMING OPTIONS

### Real-time Output Configuration

Configure streaming output - like monitoring your Pip-Boy's real-time updates.

```typescript
import { 
  createStreamingOptions,
  createStreamingOptionsWithCustomHandlers 
} from './utils/streaming-options';

// Standard streaming options
const options = createStreamingOptions(true, "Enhancement");

// Custom handlers
const customOptions = createStreamingOptionsWithCustomHandlers(
  true,
  {
    onChunk: (chunk) => console.log("Chunk:", chunk),
    onFinish: (result) => console.log("Finished:", result.finishReason),
    onError: (error) => console.error("Error:", error)
  }
);
```

---

## 📊 STREAMING UTILITIES

### Metrics Tracking for Streaming

Monitor streaming operations with detailed metrics - like tracking resource consumption in real-time.

```typescript
import { createMetricsStreamingOptions } from './utils/streaming-utils';

const aiStartTime = Date.now();
const { options, getMetrics } = createMetricsStreamingOptions(
  userCallbacks, // Base streaming options
  aiStartTime // Start time for measuring first token
);

await generateText({ model, prompt, ...options });

const { tokenUsage, timeToFirstToken } = getMetrics();
console.log(`Used ${tokenUsage.total} tokens in ${timeToFirstToken}ms`);
```

---

## 💀 TASK-O-MATIC ERROR SYSTEM

### Comprehensive Error Management

The **TaskOMaticError** class provides standardized error handling with context, suggestions, and proper categorization.

```typescript
import { 
  TaskOMaticError,
  TaskOMaticErrorCodes,
  createStandardError,
  formatStandardError
} from './utils/task-o-matic-error';

// Create detailed errors
throw new TaskOMaticError("Task not found", {
  code: TaskOMaticErrorCodes.TASK_NOT_FOUND,
  context: "Attempted to retrieve task ID: 123",
  suggestions: [
    "Verify the task ID is correct",
    "Check if the task was deleted"
  ],
  metadata: { taskId: "123", operation: "retrieve" }
});

// Use helper functions
throw createStandardError(
  TaskOMaticErrorCodes.AI_OPERATION_FAILED,
  "AI operation timed out",
  {
    context: "Task enhancement operation",
    suggestions: ["Increase timeout", "Check AI service status"]
  }
);

// Wrap existing errors
throw formatStandardError(
  originalError,
  TaskOMaticErrorCodes.STORAGE_ERROR,
  {
    context: "Failed during task persistence",
    suggestions: ["Check disk space", "Verify write permissions"]
  }
);
```

#### Error Categories:
- **General Errors** (001-003): Unexpected, invalid input, configuration
- **Task Errors** (101-104): Task operations, status transitions
- **Storage Errors** (201-203): File system, integrity issues
- **AI Operation Errors** (301-303): AI service, configuration, rate limits
- **Workflow Errors** (401-402): Workflow validation and execution
- **PRD Errors** (501-503): PRD parsing, generation, validation

---

## 🎯 WORKFLOW PROMPTS

### Interactive User Prompts

Standardized inquirer prompts for user interaction - like your Pip-Boy's interface controls.

```typescript
import {
  confirmPrompt,
  selectPrompt,
  multiSelectPrompt,
  textInputPrompt,
  editorPrompt,
  passwordPrompt
} from './utils/workflow-prompts';

// Confirmation
const confirmed = await confirmPrompt("Proceed with operation?", true);

// Single selection
const choice = await selectPrompt("Choose option:", [
  { name: "Option 1", value: "opt1" },
  { name: "Option 2", value: "opt2" }
]);

// Multiple selection
const choices = await multiSelectPrompt("Select items:", [
  { name: "Item 1", value: "item1", checked: true },
  { name: "Item 2", value: "item2" }
]);

// Text input
const text = await textInputPrompt("Enter value:", "default", (input) => {
  return input.length > 0 || "Input cannot be empty";
});

// Editor input
const content = await editorPrompt("Edit content:", "Default content");

// Password input
const password = await passwordPrompt("Enter password:");
```

---

## 🔧 TROUBLESHOOTING COMMON ISSUES

### Vault-Tec Emergency Procedures

#### Problem: AI Operations Failing
**Symptoms:** Operations timeout or return errors
**Solutions:**
1. Check AI configuration with `buildAIConfig()`
2. Verify API keys and endpoints
3. Use `AIOperationUtility` for proper retry logic
4. Monitor metrics with `createMetricsStreamingOptions()`

#### Problem: File Operations Not Working
**Symptoms:** File not found errors or permission issues
**Solutions:**
1. Use `validateFileExists()` before operations
2. Check working directory configuration
3. Ensure proper permissions with `savePRDFile()`
4. Use async versions for non-blocking operations

#### Problem: Task ID Conflicts
**Symptoms:** Duplicate IDs or validation failures
**Solutions:**
1. Use `TaskIDGenerator.generateUnique()` with existing IDs
2. Validate IDs with `TaskIDGenerator.validate()`
3. Check hierarchical ID structure with `parseHierarchicalId()`

#### Problem: Bulk Operations Partially Failing
**Symptoms:** Some tasks succeed, others fail
**Solutions:**
1. Use `executeBulkOperation()` for proper error handling
2. Check individual error messages in result.failed
3. Validate task existence before bulk operations
4. Use filters to target specific task subsets

#### Problem: Streaming Not Working
**Symptoms:** No real-time output or metrics
**Solutions:**
1. Enable streaming with `createStreamingOptions(true)`
2. Use proper callback functions
3. Check for errors in `onError` callbacks
4. Monitor metrics with `createMetricsStreamingOptions()`

---

## 📋 BEST PRACTICES

### Vault-Tec Approved Protocols

1. **Always Use Standardized Errors**
   ```typescript
   // Good
   throw createStandardError(TaskOMaticErrorCodes.TASK_NOT_FOUND, "Task not found");
   
   // Bad
   throw new Error("Task not found");
   ```

2. **Validate Input Early**
   ```typescript
   validateTaskId(taskId);
   validateFileExists(filePath);
   ```

3. **Use Bulk Operations for Multiple Items**
   ```typescript
   const result = await executeBulkOperation(operation, config);
   // Better than manual loops
   ```

4. **Track Metrics for AI Operations**
   ```typescript
   const { options, getMetrics } = createMetricsStreamingOptions();
   // Monitor performance and usage
   ```

5. **Handle Errors Gracefully**
   ```typescript
   try {
     await operation();
   } catch (error) {
     if (isTaskOMaticError(error)) {
       console.log(error.getDetails());
     }
   }
   ```

---

## ⚠️ VAULT-TEC SAFETY WARNINGS

1. **Never Ignore Error Messages** - They contain valuable survival information
2. **Always Validate Input** - The wasteland is unforgiving of invalid data
3. **Use Retry Logic** - Network conditions in the wasteland are unpredictable
4. **Monitor Resource Usage** - Track tokens and metrics to avoid overconsumption
5. **Keep Your Tools Updated** - Regular maintenance ensures survival

---

## 📚 REFERENCE QUICK GUIDE

### Essential Imports
```typescript
// AI Operations
import { AIOperationUtility } from './utils/ai-operation-utility';
import { buildAIConfig } from './utils/ai-config-builder';

// Error Handling
import { TaskOMaticError, createStandardError } from './utils/task-o-matic-error';
import { getErrorMessage, formatError } from './utils/error-utils';

// File Operations
import { validateFileExists, savePRDFile } from './utils/file-utils';

// Task Management
import { TaskIDGenerator } from './utils/id-generator';
import { requireTask, validateTaskId } from './utils/storage-utils';

// User Interaction
import { confirmBulkOperation } from './utils/confirmation';
import { displayOperationSuccess } from './utils/display-helpers';

// Bulk Operations
import { executeBulkOperation } from './utils/bulk-operations';
```

### Common Patterns
```typescript
// AI Operation with Error Handling
const aiUtil = new AIOperationUtility();
try {
  const result = await aiUtil.executeAIOperation("Operation", async () => {
    return await yourOperation();
  });
  console.log(`Success in ${result.metrics.duration}ms`);
} catch (error) {
  if (error instanceof TaskOMaticError) {
    console.log(error.getDetails());
  }
}

// File Validation and Processing
validateFileExists(filePath);
const content = await fs.readFile(filePath, 'utf8');
// Process content...

// Bulk Operation
const result = await executeBulkOperation(
  (id) => processItem(id),
  { operationName: "Processing", filters: { status: "todo" } }
);
```

---

## 🎯 CONCLUSION

The Task-O-Matic Utilities & Helpers system is your comprehensive toolkit for surviving and thriving in the development wasteland. With proper usage of these tools, you'll be equipped to handle any challenge the post-apocalyptic coding world throws at you.

**Remember:** A well-prepared Vault Dweller is a surviving Vault Dweller. Keep your utilities sharp, your error handling robust, and your metrics monitored!

---

*This documentation has been approved by Vault-Tec Industries for optimal survival in the modern development ecosystem. For additional support, consult your local Vault-Tec representative or check the emergency broadcast system.*