## TECHNICAL BULLETIN NO. 005
### WORKFLOW BENCHMARK SERVICE - PERFORMANCE EVALUATION SURVIVAL SYSTEM

**DOCUMENT ID:** `task-o-matic-workflow-benchmark-v2`
**CLEARANCE:** `All Personnel`
**MANDATORY COMPLIANCE:** `Yes`

### ⚠️ CRITICAL SURVIVAL NOTICE

Citizen, WorkflowBenchmarkService is your performance evaluation system in the post-deadline wasteland. Without proper benchmarking, your AI model choices will be as random as dust storms. This service provides isolated testing environments to compare AI performance across complete workflows, ensuring you select the optimal model for your survival mission.

### SYSTEM ARCHITECTURE OVERVIEW

The WorkflowBenchmarkService executes complete project workflows in isolated environments to provide fair, comparable performance metrics across different AI models and configurations. It ensures clean separation between test runs and provides detailed analytics for model selection.

**Core Dependencies:**
- **WorkflowService**: Complete workflow orchestration and execution
- **File System**: Temporary directory management and cleanup operations
- **Storage Layer**: Task and project data persistence
- **Better-T-Stack CLI**: Project bootstrapping integration
- **Logger**: Progress tracking and error reporting

**Benchmark Capabilities:**
1. **Isolated Execution**: Separate temporary environments for each model to prevent cross-contamination
2. **Complete Workflows**: Full project lifecycle testing from init to task generation
3. **Performance Metrics**: Detailed timing and quality measurements for each workflow stage
4. **Result Application**: Apply selected benchmark results to actual production projects
5. **Cleanup Management**: Automatic temporary resource cleanup to prevent disk bloat

**Execution Isolation:**
- Each benchmark run creates unique temporary directory: `/tmp/task-o-matic-benchmark/benchmark-{projectName}-{provider}-{model}-{timestamp}/`
- No interference between concurrent benchmarks
- Clean separation from user projects
- Automatic cleanup on completion

### COMPLETE API DOCUMENTATION

---

#### executeWorkflow

Execute a complete project workflow for benchmarking purposes in an isolated environment.

```typescript
async executeWorkflow(
  input: WorkflowBenchmarkInput,
  aiOptions: AIOptions,
  streamingOptions?: StreamingOptions
): Promise<WorkflowBenchmarkResult["output"]>
```

**Parameters:**
- `input` (WorkflowBenchmarkInput, required): Benchmark input configuration
  - `collectedResponses` (object, required): User responses for workflow steps
    - `projectName` (string, required): Project name for benchmark
    - `initMethod` ("quick" | "custom" | "ai", required): Initialization method
      - `"quick"`: Pre-configured modern stack
      - `"custom"`: User-specified stack via stackConfig
      - `"ai"`: AI-recommended stack
    - `projectDescription` (string, optional): Project description
    - `stackConfig` (object, optional): Stack configuration for "custom" method
      - `frontend` (string, optional): Frontend framework
      - `backend` (string, optional): Backend framework
      - `database` (string, optional): Database system
      - `auth` (boolean, optional): Include authentication
    - `prdMethod` ("upload" | "manual" | "ai" | "skip", optional): PRD creation method
      - `"upload"`: Load from file (prdFile required)
      - `"manual"`: Manual entry (prdContent required)
      - `"ai"`: Generate from description
      - `"skip"`: Skip PRD step entirely
    - `prdFile` (string, optional): Path to PRD file (for "upload" method)
    - `prdDescription` (string, optional): Description for AI PRD generation
    - `prdContent` (string, optional): Manual PRD content
    - `refinePrd` (boolean, optional): Whether to refine PRD with AI
    - `refineFeedback` (string, optional): Feedback for PRD refinement
    - `generateTasks` (boolean, optional): Whether to generate tasks from PRD
    - `customInstructions` (string, optional): Custom task generation instructions
    - `splitTasks` (boolean, optional): Whether to split tasks into subtasks
    - `tasksToSplit` (string[], optional): Specific task IDs to split
    - `splitInstructions` (string, optional): Custom splitting instructions
  - `tempDirBase` (string, optional): Base directory for temp files (default: "/tmp")

- `aiOptions` (AIOptions, required): AI configuration for this benchmark run
  - `aiProvider` (string, required): AI provider name
  - `aiModel` (string, required): AI model name
  - `aiKey` (string, optional): API key override
  - `aiProviderUrl` (string, optional): Custom provider URL

- `streamingOptions` (StreamingOptions, optional): Streaming callbacks
  - `onChunk` (function, optional): Real-time response chunks
  - `onFinish` (function, optional): Completion callback
  - `onError` (function, optional): Error handling

**Returns:** WorkflowBenchmarkResult["output"] containing:
- `projectDir` (string): Temporary project directory path (deleted after return)
- `prdFile` (string): Generated PRD file path (relative to projectDir)
- `prdContent` (string): Generated PRD content
- `tasks` (Task[]): Array of generated tasks
  - Full task objects with all properties
  - Includes subtasks if split
- `stats` (object): Performance statistics
  - `initDuration` (number): Initialization duration in ms
  - `prdGenerationDuration` (number): PRD generation duration in ms
  - `prdRefinementDuration` (number): PRD refinement duration in ms
  - `taskGenerationDuration` (number): Task generation duration in ms
  - `taskSplittingDuration` (number): Task splitting duration in ms
  - `totalTasks` (number): Total tasks created
  - `tasksWithSubtasks` (number): Tasks that have subtasks
  - `avgTaskComplexity` (number): Average task complexity score (1-3)
  - `prdSize` (number): PRD content length in characters
  - `totalSteps` (number): Total workflow steps executed
  - `successfulSteps` (number): Successfully completed steps

**Error Conditions:**
- File system errors during temporary directory creation:
  - Permission denied creating /tmp/task-o-matic-benchmark/
  - Disk space insufficient
  - Invalid tempDirBase path
- Workflow execution failures from underlying services:
  - Project initialization errors
  - PRD generation/processing errors
  - Task generation errors
- Cleanup errors (non-fatal, logged as warnings):
  - Permission denied removing temp directory
  - Directory already removed by external process
- Returns partial results if early steps fail:
  - Later steps may not execute
  - stats will show failed steps in unsuccessfulSteps

**Technical Details:**
- Always sets `bootstrap: true` for benchmark runs (hardcoded)
- Uses silent callbacks (onProgress/onProgress empty functions)
- Calculates task complexity based on description length:
  - >200 chars = complexity 3 (high)
  - >100 chars = complexity 2 (medium)
  - <=100 chars = complexity 1 (low)
- Defaults to splitting first 3 tasks if tasksToSplit not provided
- Temp directory format: `{tempDirBase}/task-o-matic-benchmark/benchmark-{projectName}-{provider}-{sanitizedModel}-{timestamp}`
- Sanitizes model name by replacing non-alphanumeric chars with hyphens
- Cleanup only removes directories containing "task-o-matic-benchmark" (safety check)

**Example: Basic Benchmark Execution**
```typescript
const benchmarkInput = {
  collectedResponses: {
    projectName: "benchmark-test",
    initMethod: "ai",
    projectDescription: "AI-powered task management application",
    prdMethod: "ai",
    prdDescription: "Task management with AI assistance and collaboration features",
    generateTasks: true,
    splitTasks: true
  },
  tempDirBase: "/tmp"
};

const result = await workflowBenchmarkService.executeWorkflow(
  benchmarkInput,
  {
    aiProvider: "anthropic",
    aiModel: "claude-3-5-sonnet"
  },
  {
    onChunk: (chunk) => console.log(`[BENCHMARK] ${chunk}`)
  }
);

console.log(`\nBenchmark completed:`);
console.log(`- Project: ${result.projectDir}`);
console.log(`- PRD size: ${result.stats.prdSize} chars`);
console.log(`- Tasks created: ${result.stats.totalTasks}`);
console.log(`- Tasks split: ${result.stats.tasksWithSubtasks}`);
console.log(`- Avg complexity: ${result.stats.avgTaskComplexity.toFixed(2)}`);
console.log(`- Success rate: ${result.stats.successfulSteps}/${result.stats.totalSteps}`);

console.log(`\nTimings:`);
console.log(`- Init: ${result.stats.initDuration}ms`);
console.log(`- PRD gen: ${result.stats.prdGenerationDuration}ms`);
console.log(`- Task gen: ${result.stats.taskGenerationDuration}ms`);
console.log(`- Splitting: ${result.stats.taskSplittingDuration}ms`);

console.log(`\nTotal duration: ${
  result.stats.initDuration +
  result.stats.prdGenerationDuration +
  result.stats.taskGenerationDuration +
  result.stats.taskSplittingDuration
}ms`);
```

**Example: Multi-Model Comparison**
```typescript
const models = [
  { aiProvider: "anthropic", aiModel: "claude-3-5-sonnet", name: "Claude 3.5 Sonnet" },
  { aiProvider: "openai", aiModel: "gpt-4o", name: "GPT-4o" },
  { aiProvider: "openrouter", aiModel: "anthropic/claude-3-opus", name: "Claude 3 Opus" }
];

const benchmarkInput = {
  collectedResponses: {
    projectName: "model-comparison",
    initMethod: "quick",
    prdMethod: "ai",
    prdDescription: "Real-time collaboration platform",
    generateTasks: true,
    splitTasks: true
  }
};

console.log("Running multi-model comparison benchmark...");
const results = await Promise.all(
  models.map(model => ({
    model,
    promise: workflowBenchmarkService.executeWorkflow(
      benchmarkInput,
      { aiProvider: model.aiProvider, aiModel: model.aiModel }
    ).then(result => ({ result, model }))
  }))
).then(promises => promises.map(p => p));

console.log("\n=== BENCHMARK RESULTS ===\n");

results.forEach(({ result, model }) => {
  const { stats } = result;
  const totalTime = stats.initDuration + stats.prdGenerationDuration + stats.taskGenerationDuration;

  console.log(`${model.name} (${model.aiProvider}/${model.aiModel}):`);
  console.log(`  Tasks: ${stats.totalTasks}`);
  console.log(`  Tasks Split: ${stats.tasksWithSubtasks}`);
  console.log(`  PRD Size: ${stats.prdSize} chars`);
  console.log(`  Complexity: ${stats.avgTaskComplexity.toFixed(2)}`);
  console.log(`  Duration: ${totalTime}ms`);
  console.log(`  Success: ${stats.successfulSteps}/${stats.totalSteps}`);
  console.log(`  Breakdown:`);
  console.log(`    - Init: ${stats.initDuration}ms`);
  console.log(`    - PRD: ${stats.prdGenerationDuration}ms`);
  console.log(`    - Tasks: ${stats.taskGenerationDuration}ms`);
  console.log(`    - Split: ${stats.taskSplittingDuration}ms`);
  console.log('');
});

// Find best model
const bestResult = results.reduce((best, current) => {
  const bestScore = calculateScore(best.result.stats);
  const currentScore = calculateScore(current.result.stats);
  return currentScore > bestScore ? current : best;
});

console.log(`\n🏆 Best Model: ${bestResult.model.name}`);
console.log(`   Score: ${calculateScore(bestResult.result.stats).toFixed(2)}`);

function calculateScore(stats) {
  const taskScore = stats.totalTasks * 10;
  const speedScore = 10000 / (stats.initDuration + stats.prdGenerationDuration);
  const successRate = stats.successfulSteps / stats.totalSteps;
  return taskScore + speedScore + (successRate * 1000);
}
```

**Example: Minimal Benchmark**
```typescript
const minimalResult = await workflowBenchmarkService.executeWorkflow(
  {
    collectedResponses: {
      projectName: "minimal",
      initMethod: "quick",
      prdMethod: "ai",
      prdDescription: "Simple todo app",
      generateTasks: true
    }
  },
  { aiProvider: "anthropic", aiModel: "claude-3-5-sonnet" }
);

console.log(`Created ${minimalResult.stats.totalTasks} tasks`);
console.log(`PRD: ${minimalResult.stats.prdSize} chars`);
```

---

#### applyBenchmarkResult

Apply the results from a selected benchmark to an actual production project directory.

```typescript
async applyBenchmarkResult(
  selectedResult: WorkflowBenchmarkResult,
  targetProjectDir: string,
  originalResponses: WorkflowBenchmarkInput["collectedResponses"]
): Promise<{ success: boolean; message: string }>
```

**Parameters:**
- `selectedResult` (WorkflowBenchmarkResult, required): Benchmark result to apply
  - `modelId` (string, required): Model identifier (e.g., "anthropic:claude-3-5-sonnet")
  - `output` (object, required): Benchmark output data
    - Must contain at least one of: prdContent, tasks
    - All other fields optional
- `targetProjectDir` (string, required): Target project directory path
  - Created if doesn't exist
  - Must be valid absolute or relative path
- `originalResponses` (object, required): Original user responses for workflow
  - Used to reinitialize project with correct settings
  - Must include: projectName, initMethod, projectDescription
  - Can include: stackConfig

**Returns:** Application result containing:
- `success` (boolean): Whether application succeeded
  - `true`: All operations completed successfully
  - `false`: At least one operation failed
- `message` (string): Status message
  - Success: "Successfully applied results from {modelId} to {targetDir}"
  - Failure: "Failed to apply benchmark results: {error details}"

**Error Conditions:**
- File system errors during project creation:
  - Permission denied creating target directory
  - Invalid target directory path
- Project initialization failures:
  - Missing or invalid originalResponses
  - Invalid initMethod or stackConfig
- Task creation/import failures (non-fatal, logged as warnings):
  - Task validation errors
  - Storage layer errors
  - Individual task import failures don't abort overall operation
- Configuration errors:
  - Invalid modelId format (must be "provider:model")
  - Missing required fields in originalResponses

**Technical Details:**
- Extracts provider and model from modelId: `modelId.split(":").slice(0, 2)`
- Creates target directory with `mkdirSync(dir, { recursive: true })` if needed
- Uses actual WorkflowService (not benchmark version) for production
- Always sets `bootstrap: true` for applied results
- Copies PRD to: `{targetDir}/.task-o-matic/prd/prd.md`
- Imports tasks by switching to target directory with `process.chdir(targetDir)`
- Logs progress via logger: progress, success, and error levels
- Continues task import even if some tasks fail (logs warnings)
- Returns success=true even if some task imports fail (only critical errors cause failure)

**Example: Apply Best Benchmark Result**
```typescript
// Assume we have benchmark results from multiple models
const benchmarkResults = [
  {
    modelId: "anthropic:claude-3-5-sonnet",
    output: claudeResult
  },
  {
    modelId: "openai:gpt-4o",
    output: gpt4Result
  },
  {
    modelId: "openrouter:anthropic/claude-3-opus",
    output: opusResult
  }
];

// Select best result based on custom criteria
const bestResult = benchmarkResults.reduce((best, current) => {
  const bestScore = calculateScore(best.output.stats);
  const currentScore = calculateScore(current.output.stats);
  return currentScore > bestScore ? current : best;
});

console.log(`\nSelected best model: ${bestResult.modelId}`);
console.log(`Score: ${calculateScore(bestResult.output.stats).toFixed(2)}`);

// Apply to actual project
const application = await workflowBenchmarkService.applyBenchmarkResult(
  bestResult,
  "./my-real-project",
  {
    projectName: "my-real-project",
    initMethod: "ai",
    projectDescription: "AI-powered development platform with code review and collaboration"
  }
);

if (application.success) {
  console.log(`\n✅ Successfully applied ${bestResult.modelId} results`);
  console.log(application.message);
  console.log(`\nProject initialized at: ./my-real-project`);
  console.log(`PRD: ./.task-o-matic/prd/prd.md`);
  console.log(`Tasks: ${bestResult.output.tasks.length} tasks imported`);
} else {
  console.error(`\n❌ Application failed: ${application.message}`);
}

function calculateScore(stats) {
  const taskScore = stats.totalTasks * 10;
  const speedScore = 10000 / (stats.initDuration + stats.prdGenerationDuration);
  const successRate = stats.successfulSteps / stats.totalSteps;
  return taskScore + speedScore + (successRate * 1000);
}
```

**Example: Selective Application (PRD Only)**
```typescript
// Apply only PRD from benchmark, skip initialization
const selectiveApplication = await workflowBenchmarkService.applyBenchmarkResult(
  {
    modelId: "anthropic:claude-3-5-sonnet",
    output: {
      projectDir: "/tmp/benchmark-123",
      prdContent: "# My Project\n\nThis is the PRD...",
      tasks: [], // Empty tasks array
      stats: { /* stats */ }
    }
  },
  "./existing-project",
  {
    projectName: "existing-project",
    initMethod: "skip", // Skip initialization
    prdMethod: "ai",
    generateTasks: false
  }
);

console.log(selectiveApplication.message);
```

**Example: Apply with Existing Project**
```typescript
// Apply benchmark results to existing project directory
const application = await workflowBenchmarkService.applyBenchmarkResult(
  {
    modelId: "openai:gpt-4o",
    output: {
      prdContent: "# Enhanced PRD\n\nGenerated by GPT-4o...",
      tasks: [
        { id: "1", title: "Setup project", description: "Initial setup", parentId: null },
        { id: "2", title: "Implement API", description: "REST API", parentId: null }
      ],
      stats: { totalTasks: 2, /* other stats */ }
    }
  },
  "/path/to/existing/project",
  {
    projectName: "existing-project",
    initMethod: "quick",
    projectDescription: "Existing project getting PRD and tasks"
  }
);

if (application.success) {
  console.log("Applied benchmark to existing project");
  console.log("- PRD updated");
  console.log("- Tasks imported");
} else {
  console.error("Failed to apply to existing project:", application.message);
}
```

---

#### validateInput

Validate that input matches the expected WorkflowBenchmarkInput structure.

```typescript
validateInput(input: any): input is WorkflowBenchmarkInput
```

**Parameters:**
- `input` (any, required): Input to validate
  - Can be any value, typically from user input or JSON parse

**Returns:** Boolean indicating if input is valid WorkflowBenchmarkInput
- `true`: Input has required fields with correct types
- `false`: Input is invalid or missing required fields

**Validation Criteria:**
- `input` must be truthy (not null/undefined)
- `input.collectedResponses` must exist and be truthy
- `input.collectedResponses.projectName` must be:
  - Type: string
  - Length: > 0 characters
- `input.collectedResponses.initMethod` must be:
  - Type: string
  - Value: one of "quick", "custom", "ai"

**Does NOT Validate:**
- Optional fields (all others in collectedResponses)
- Field values beyond basic type checking
- Nested object structure in stackConfig
- tempDirBase field

**Error Conditions:** None - validation only returns boolean, never throws

**Technical Details:**
- TypeScript type guard function
- Enables type narrowing in TypeScript code
- Performs minimal validation for basic safety
- Designed to be fast and lenient
- Does not throw exceptions even on invalid input

**Example: Input Validation**
```typescript
import { workflowBenchmarkService } from '@task-o-matic/core';

// Parse user input from CLI or file
const userInput = JSON.parse(process.argv[2] || "{}");

if (workflowBenchmarkService.validateInput(userInput)) {
  console.log("✅ Valid benchmark input");
  console.log(`Project: ${userInput.collectedResponses.projectName}`);
  console.log(`Method: ${userInput.collectedResponses.initMethod}`);

  // TypeScript now knows userInput is WorkflowBenchmarkInput
  const result = await workflowBenchmarkService.executeWorkflow(
    userInput,
    { aiProvider: "anthropic", aiModel: "claude-3-5-sonnet" }
  );
} else {
  console.error("❌ Invalid benchmark input format");
  console.error("Required fields:");
  console.error("- collectedResponses.projectName (string, non-empty)");
  console.error("- collectedResponses.initMethod ('quick' | 'custom' | 'ai')");
  process.exit(1);
}
```

**Example: Validation Examples**
```typescript
// Valid inputs
console.log(workflowBenchmarkService.validateInput({
  collectedResponses: {
    projectName: "test-project",
    initMethod: "ai",
    projectDescription: "Test project"
  }
})); // true

console.log(workflowBenchmarkService.validateInput({
  collectedResponses: {
    projectName: "my-app",
    initMethod: "custom",
    stackConfig: { frontend: "react", backend: "express" }
  }
})); // true

// Invalid inputs
console.log(workflowBenchmarkService.validateInput(null)); // false
console.log(workflowBenchmarkService.validateInput({})); // false
console.log(workflowBenchmarkService.validateInput({
  collectedResponses: {}
})); // false
console.log(workflowBenchmarkService.validateInput({
  collectedResponses: {
    projectName: "", // Empty
    initMethod: "ai"
  }
})); // false
console.log(workflowBenchmarkService.validateInput({
  collectedResponses: {
    projectName: "test",
    initMethod: "invalid" // Not one of quick/custom/ai
  }
})); // false
```

---

### INTEGRATION PROTOCOLS

**Temporary Directory Structure:**

Each benchmark run creates an isolated environment:

```
/tmp/task-o-matic-benchmark/
└── benchmark-{projectName}-{provider}-{sanitizedModel}-{timestamp}/
    ├── .task-o-matic/
    │   ├── config.json              # AI configuration
    │   ├── tasks/                  # Task storage
    │   ├── prd/
    │   │   └── prd.md             # Generated PRD
    │   └── logs/                   # Execution logs
    ├── package.json                # Bootstrapped project
    ├── src/                       # Bootstrapped project source
    ├── [additional bootstrapped files]
    └── [generated PRD and tasks]
```

**Workflow Execution Steps:**

1. **Create Temporary Environment**
   - Generate unique directory name
   - Create directory with `mkdirSync({ recursive: true })`
   - Record start time

2. **Initialize Project**
   - Call `workflowService.initializeProject()`
   - Always with `bootstrap: true`
   - Use provided AI configuration
   - Measure initDuration
   - Track success/failure

3. **Define PRD** (if prdMethod !== "skip")
   - Call `workflowService.definePRD()`
   - Support upload/manual/ai methods
   - Measure prdGenerationDuration
   - Record PRD size in stats

4. **Refine PRD** (if refinePrd && refineFeedback)
   - Call `workflowService.refinePRD()`
   - Use AI method
   - Measure prdRefinementDuration
   - Update PRD content and size

5. **Generate Tasks** (if generateTasks && prdFile exists)
   - Call `workflowService.generateTasks()`
   - Use custom instructions or standard method
   - Measure taskGenerationDuration
   - Record task count

6. **Split Tasks** (if splitTasks && tasks exist)
   - Use first 3 tasks or specified tasksToSplit
   - Call `workflowService.splitTasks()`
   - Measure taskSplittingDuration
   - Count tasks with subtasks

7. **Calculate Complexity Metrics**
   - Analyze task description lengths
   - Assign complexity scores (1-3)
   - Calculate average complexity

8. **Cleanup**
   - Remove temporary directory
   - Log warnings if cleanup fails
   - Return results

**Performance Metrics Collection:**

```typescript
interface BenchmarkStats {
  // Timing metrics (all in milliseconds)
  initDuration: number;           // Project setup time
  prdGenerationDuration: number;  // PRD creation time
  prdRefinementDuration: number; // PRD improvement time (0 if skipped)
  taskGenerationDuration: number; // Task extraction time
  taskSplittingDuration: number; // Task breakdown time (0 if skipped)

  // Quality metrics
  totalTasks: number;           // Tasks created
  tasksWithSubtasks: number;    // Tasks split further
  avgTaskComplexity: number;   // Complexity score (1-3)
  prdSize: number;             // PRD character count

  // Success metrics
  totalSteps: number;           // Workflow steps attempted
  successfulSteps: number;      // Steps completed successfully
}
```

**Complexity Scoring:**

```typescript
// Calculated from task description length
const complexity = taskDescription.length > 200 ? 3
  : taskDescription.length > 100 ? 2
  : 1;

// Average across all tasks
stats.avgTaskComplexity = totalComplexity / tasks.length;
```

**Result Application Process:**

1. **Parse Model Configuration**
   - Extract provider and model from modelId
   - Format: `provider:model[:reasoning]` → takes first 2 parts
   - Example: "anthropic:claude-3-5-sonnet" → provider="anthropic", model="claude-3-5-sonnet"

2. **Initialize Target Project**
   - Create target directory if needed
   - Call `workflowService.initializeProject()` with:
     - extracted AI config
     - `bootstrap: true`
     - original project settings
   - Provide progress callbacks for logging

3. **Copy PRD Content**
   - Check if prdContent exists in benchmark result
   - Create `.task-o-matic/prd/` directory
   - Write PRD to `.task-o-matic/prd/prd.md`
   - Log success message

4. **Import Tasks**
   - Switch working directory to target project
   - Iterate through all tasks in benchmark result
   - Call `storage.createTask()` for each task
   - Import: title, description, parentId, estimatedEffort
   - Log warnings for individual failures (continue on error)
   - Log final success count

5. **Return Status**
   - `success: true` if critical operations succeeded
   - `message` with summary of what was applied
   - Include modelId and targetDir in message

---

### SURVIVAL SCENARIOS

**Scenario 1: Model Performance Comparison**

```typescript
const models = [
  {
    aiProvider: "anthropic",
    aiModel: "claude-3-5-sonnet",
    name: "Claude 3.5 Sonnet",
    cost: 3.0,
    speed: "fast"
  },
  {
    aiProvider: "openai",
    aiModel: "gpt-4o",
    name: "GPT-4o",
    cost: 2.5,
    speed: "very-fast"
  },
  {
    aiProvider: "openrouter",
    aiModel: "anthropic/claude-3-opus",
    name: "Claude 3 Opus",
    cost: 5.0,
    speed: "medium"
  }
];

const benchmarkInput = {
  collectedResponses: {
    projectName: "model-comparison",
    initMethod: "ai",
    projectDescription: "AI-powered code review and collaboration platform with real-time editing, automated analysis, and team management",
    prdMethod: "ai",
    prdDescription: "Real-time code review with AI assistance, team collaboration, automated analysis, and integration with Git providers",
    generateTasks: true,
    splitTasks: true
  }
};

console.log("🚀 Running model comparison benchmark...\n");

const results = await Promise.all(
  models.map(async (model) => {
    console.log(`Testing ${model.name}...`);
    const startTime = Date.now();

    const result = await workflowBenchmarkService.executeWorkflow(
      benchmarkInput,
      { aiProvider: model.aiProvider, aiModel: model.aiModel }
    );

    const duration = Date.now() - startTime;
    console.log(`✓ ${model.name} completed in ${duration}ms\n`);

    return {
      model,
      result,
      duration,
      stats: result.stats,
      performanceScore: calculatePerformanceScore(result.stats, model)
    };
  })
);

console.log("\n=== BENCHMARK RESULTS ===\n");

// Display detailed results
results.forEach(({ model, stats, duration, performanceScore }) => {
  const totalTime = stats.initDuration + stats.prdGenerationDuration + stats.taskGenerationDuration;

  console.log(`📊 ${model.name} (${model.aiProvider}/${model.aiModel}):`);
  console.log(`   Tasks: ${stats.totalTasks}`);
  console.log(`   Tasks Split: ${stats.tasksWithSubtasks}`);
  console.log(`   PRD Size: ${stats.prdSize} chars`);
  console.log(`   Complexity: ${stats.avgTaskComplexity.toFixed(2)}`);
  console.log(`   Success Rate: ${stats.successfulSteps}/${stats.totalSteps} (${Math.round(stats.successfulSteps/stats.totalSteps*100)}%)`);
  console.log(`   Timings:`);
  console.log(`     - Init: ${stats.initDuration}ms`);
  console.log(`     - PRD: ${stats.prdGenerationDuration}ms`);
  console.log(`     - Tasks: ${stats.taskGenerationDuration}ms`);
  console.log(`     - Split: ${stats.taskSplittingDuration}ms`);
  console.log(`     - Total: ${totalTime}ms`);
  console.log(`   Cost: $${model.cost}/1M tokens`);
  console.log(`   Speed: ${model.speed}`);
  console.log(`   Performance Score: ${performanceScore.toFixed(2)}\n`);
});

// Select best model
const bestModel = results.reduce((best, current) =>
  current.performanceScore > best.performanceScore ? current : best
);

console.log(`🏆 Best Model: ${bestModel.model.name}`);
console.log(`   Score: ${bestModel.performanceScore.toFixed(2)}`);
console.log(`   Details: ${bestModel.model.aiProvider}/${bestModel.model.aiModel}`);
console.log(`   Cost: $${bestModel.model.cost}/1M tokens\n`);

// Apply best results to production project
console.log("Applying best model results to production project...");
const application = await workflowBenchmarkService.applyBenchmarkResult(
  {
    modelId: `${bestModel.model.aiProvider}:${bestModel.model.aiModel}`,
    output: bestModel.result
  },
  "./production-project",
  benchmarkInput.collectedResponses
);

console.log(application.message);

function calculatePerformanceScore(stats, model) {
  const taskScore = stats.totalTasks * 20;                    // More tasks = better
  const qualityScore = stats.avgTaskComplexity * 10;           // Higher complexity = better analysis
  const speedScore = 100000 / (stats.initDuration + stats.prdGenerationDuration + stats.taskGenerationDuration);
  const successRate = stats.successfulSteps / stats.totalSteps;
  const speedBonus = model.speed === "very-fast" ? 500 : model.speed === "fast" ? 300 : 100;
  const costPenalty = model.cost * 50; // Lower cost is better

  return taskScore + qualityScore + speedScore + (successRate * 5000) + speedBonus - costPenalty;
}
```

**Scenario 2: Iterative Benchmark Testing**

```typescript
const testScenarios = [
  {
    name: "Simple Todo App",
    description: "Basic todo list application with categories and due dates",
    complexity: "low",
    expectedTasks: 5-10
  },
  {
    name: "E-commerce Platform",
    description: "Full-stack e-commerce platform with payment processing, inventory management, user accounts, and admin dashboard",
    complexity: "high",
    expectedTasks: 20-30
  },
  {
    name: "RESTful API Service",
    description: "RESTful API service with authentication, documentation, rate limiting, and comprehensive testing",
    complexity: "medium",
    expectedTasks: 10-15
  }
];

const model = { aiProvider: "anthropic", aiModel: "claude-3-5-sonnet", name: "Claude 3.5 Sonnet" };
const allResults = [];

console.log("🧪 Running scenario-based benchmark testing...\n");

for (const scenario of testScenarios) {
  console.log(`\n=== Testing: ${scenario.name} (${scenario.complexity} complexity) ===`);

  const benchmarkInput = {
    collectedResponses: {
      projectName: `test-${scenario.name.toLowerCase().replace(/\s+/g, '-')}`,
      initMethod: "ai",
      projectDescription: scenario.description,
      prdMethod: "ai",
      prdDescription: scenario.description,
      generateTasks: true,
      splitTasks: true
    }
  };

  const result = await workflowBenchmarkService.executeWorkflow(
    benchmarkInput,
    { aiProvider: model.aiProvider, aiModel: model.aiModel }
  );

  const { stats } = result;
  const totalTime = stats.initDuration + stats.prdGenerationDuration + stats.taskGenerationDuration;

  console.log(`\nResults for ${scenario.name}:`);
  console.log(`  Tasks Created: ${stats.totalTasks}`);
  console.log(`  Expected: ${scenario.expectedTasks}`);
  console.log(`  Match: ${stats.totalTasks >= scenario.expectedTasks.min && stats.totalTasks <= scenario.expectedTasks.max ? '✓' : '✗'}`);
  console.log(`  PRD Size: ${stats.prdSize} chars`);
  console.log(`  Total Time: ${totalTime}ms`);
  console.log(`  Success Rate: ${Math.round(stats.successfulSteps/stats.totalSteps*100)}%`);
  console.log(`  Avg Complexity: ${stats.avgTaskComplexity.toFixed(2)}`);

  allResults.push({ scenario, model, stats, totalTime, result });

  // Save detailed results
  const filename = `./benchmark-results-${scenario.name.toLowerCase().replace(/\s+/g, '-')}.json`;
  await fs.writeFile(filename, JSON.stringify({
    scenario,
    model: model.name,
    stats,
    result: {
      prdContent: result.prdContent.substring(0, 500) + "...", // Truncate for storage
      tasks: result.tasks.map(t => ({ id: t.id, title: t.title }))
    }
  }, null, 2));
  console.log(`  Results saved: ${filename}`);
}

// Summary report
console.log("\n\n=== SUMMARY REPORT ===\n");
console.log(`Model Tested: ${model.name}`);
console.log(`Total Scenarios: ${testScenarios.length}`);

allResults.forEach(({ scenario, stats, totalTime }) => {
  const score = calculateScenarioScore(stats, totalTime);
  console.log(`\n${scenario.name}:`);
  console.log(`  Tasks: ${stats.totalTasks} (Score: ${stats.totalTasks * 10})`);
  console.log(`  Complexity: ${stats.avgTaskComplexity.toFixed(2)} (Score: ${stats.avgTaskComplexity * 10})`);
  console.log(`  Time: ${totalTime}ms (Score: ${Math.round(10000/totalTime)})`);
  console.log(`  Success: ${Math.round(stats.successfulSteps/stats.totalSteps*100)}%`);
  console.log(`  Total Score: ${score.toFixed(2)}`);
});

function calculateScenarioScore(stats, totalTime) {
  return (stats.totalTasks * 10) +
         (stats.avgTaskComplexity * 10) +
         (10000 / totalTime) +
         ((stats.successfulSteps / stats.totalSteps) * 500);
}
```

**Scenario 3: Production Model Selection**

```typescript
// Comprehensive benchmark before production deployment
const productionCandidates = [
  {
    aiProvider: "anthropic",
    aiModel: "claude-3-5-sonnet",
    name: "Claude 3.5 Sonnet",
    cost: 3.0,
    speed: "fast",
    reliability: "high"
  },
  {
    aiProvider: "openai",
    aiModel: "gpt-4o",
    name: "GPT-4o",
    cost: 2.5,
    speed: "very-fast",
    reliability: "high"
  },
  {
    aiProvider: "openrouter",
    aiModel: "anthropic/claude-3-haiku",
    name: "Claude 3 Haiku",
    cost: 0.25,
    speed: "very-fast",
    reliability: "medium"
  }
];

const productionScenario = {
  collectedResponses: {
    projectName: "production-app",
    initMethod: "ai",
    projectDescription: "Customer support chatbot with knowledge base integration, multi-channel support, and natural language processing",
    prdMethod: "ai",
    prdDescription: "AI-powered customer support with NLP, knowledge base search, live chat, email support, and analytics dashboard",
    generateTasks: true,
    splitTasks: true
  }
};

console.log("🏭 Running production model selection benchmark...\n");

const benchmarkResults = await Promise.all(
  productionCandidates.map(async (candidate) => {
    console.log(`Testing ${candidate.name} ($${candidate.cost}/1M tokens)...`);

    const result = await workflowBenchmarkService.executeWorkflow(
      productionScenario,
      { aiProvider: candidate.aiProvider, aiModel: candidate.aiModel }
    );

    const performanceScore = calculateProductionScore(result.stats, candidate);

    console.log(`✓ Completed - Score: ${performanceScore.toFixed(2)}\n`);

    return {
      ...candidate,
      result,
      stats: result.stats,
      performanceScore
    };
  })
);

// Production-optimized selection
const productionChoice = benchmarkResults.reduce((best, current) =>
  current.performanceScore > best.performanceScore ? current : best
);

console.log("\n=== PRODUCTION SELECTION ===");
console.log(`\n🎯 Selected Model: ${productionChoice.name}`);
console.log(`   Provider: ${productionChoice.aiProvider}`);
console.log(`   Model: ${productionChoice.aiModel}`);
console.log(`   Performance Score: ${productionChoice.performanceScore.toFixed(2)}`);
console.log(`   Cost: $${productionChoice.cost}/1M tokens`);
console.log(`   Speed: ${productionChoice.speed}`);
console.log(`   Reliability: ${productionChoice.reliability}`);

// Score breakdown
console.log(`\n📊 Score Breakdown:`);
console.log(`   Reliability: ${((productionChoice.stats.successfulSteps / productionChoice.stats.totalSteps) * 1000).toFixed(2)}`);
console.log(`   Productivity: ${(productionChoice.stats.totalTasks * 25).toFixed(2)}`);
console.log(`   Quality: ${(productionChoice.stats.avgTaskComplexity * 15).toFixed(2)}`);
console.log(`   Speed: ${(productionChoice.speed === "very-fast" ? 500 : productionChoice.speed === "fast" ? 300 : 100).toFixed(2)}`);
console.log(`   Cost Penalty: ${(productionChoice.cost * 100).toFixed(2)}`);

console.log("\n🚀 Applying to production project...\n");

const productionApplication = await workflowBenchmarkService.applyBenchmarkResult(
  {
    modelId: `${productionChoice.aiProvider}:${productionChoice.aiModel}`,
    output: productionChoice.result
  },
  "./production-customer-support",
  productionScenario.collectedResponses
);

if (productionApplication.success) {
  console.log("✅ Production project setup complete");
  console.log(productionApplication.message);
  console.log(`\nNext steps:`);
  console.log(`1. Review PRD at ./production-customer-support/.task-o-matic/prd/prd.md`);
  console.log(`2. Check task list: \`bun run task list\``);
  console.log(`3. Start development: \`bun run task execute\``);
} else {
  console.error("❌ Production setup failed:", productionApplication.message);
}

function calculateProductionScore(stats, candidate) {
  // Production-optimized scoring
  const reliabilityScore = (stats.successfulSteps / stats.totalSteps) * 1000;
  const productivityScore = stats.totalTasks * 25;
  const qualityScore = stats.avgTaskComplexity * 15;
  const speedScore = candidate.speed === "very-fast" ? 500 : candidate.speed === "fast" ? 300 : 100;
  const costPenalty = candidate.cost * 100; // Lower cost is better

  return reliabilityScore + productivityScore + qualityScore + speedScore - costPenalty;
}
```

---

### TECHNICAL SPECIFICATIONS

**Benchmark Isolation Strategy:**

```typescript
// Temp directory creation
private createTempProjectDir(tempBase: string, projectName: string, provider: string, model: string): string {
  const sanitizedModel = model.replace(/[^a-zA-Z0-9-]/g, "-");
  const dirName = `benchmark-${projectName}-${provider}-${sanitizedModel}-${Date.now()}`;
  const tempDir = join(tempBase, "task-o-matic-benchmark", dirName);

  if (!existsSync(tempDir)) {
    mkdirSync(tempDir, { recursive: true });
  }

  return tempDir;
}
```

- Unique directories for each run (timestamp-based)
- Clean separation from user projects
- No interference between concurrent benchmarks
- Automatic cleanup to prevent disk space issues

**Performance Measurement:**

```typescript
// High-resolution timing with Date.now()
const stepStart = Date.now();
await workflowService.someOperation();
stats.duration = Date.now() - stepStart;

// Step-by-step duration tracking
stats.initDuration = Date.now() - stepStart;
stats.prdGenerationDuration = Date.now() - prdStart;
stats.taskGenerationDuration = Date.now() - tasksStart;
```

- Millisecond precision timing
- Step-by-step duration tracking
- Success/failure rate calculation
- Quality metrics (task count, complexity, PRD size)

**Task Complexity Calculation:**

```typescript
// Calculate complexity based on description length
if (tasks.length > 0) {
  const totalComplexity = tasks.reduce((sum, task) => {
    const contentLength = (task.description || "").length;
    return sum + (contentLength > 200 ? 3 : contentLength > 100 ? 2 : 1);
  }, 0);
  stats.avgTaskComplexity = totalComplexity / tasks.length;
}
```

- Simple but effective metric
- Based on description detail level
- 1 = low complexity (<100 chars)
- 2 = medium complexity (100-200 chars)
- 3 = high complexity (>200 chars)

**Error Handling:**

```typescript
// Non-fatal error handling during cleanup
private cleanupTempProjectDir(projectDir: string): void {
  try {
    if (existsSync(projectDir) && projectDir.includes("task-o-matic-benchmark")) {
      rmSync(projectDir, { recursive: true, force: true });
    }
  } catch (error) {
    logger.warn(`Warning: Could not clean up temp directory ${projectDir}`);
  }
}
```

- Non-fatal error handling during cleanup
- Detailed error logging without interrupting benchmarks
- Graceful degradation when steps fail
- Comprehensive error reporting

**Resource Management:**

```typescript
// Safe temp directory cleanup
// Only removes directories containing "task-o-matic-benchmark"
if (projectDir.includes("task-o-matic-benchmark")) {
  rmSync(projectDir, { recursive: true, force: true });
}
```

- Memory-efficient temporary file handling
- Disk space monitoring and cleanup
- Process isolation for concurrent benchmarks
- Automatic resource release on completion

**Model ID Parsing:**

```typescript
// Extract provider and model from modelId
const [provider, model] = selectedResult.modelId.split(":").slice(0, 2);
// Example: "anthropic:claude-3-5-sonnet:extended"
//   provider = "anthropic"
//   model = "claude-3-5-sonnet"
```

- Splits on first colon
- Takes only first 2 parts
- Handles models with additional parameters
- Graceful with unexpected formats

**Task Import with Error Recovery:**

```typescript
// Continue importing even if some tasks fail
for (const task of selectedResult.output.tasks) {
  try {
    await getStorage().createTask({ /* task data */ });
  } catch (error) {
    logger.warn(`Warning: Could not import task "${task.title}"`);
    // Continue with next task
  }
}
```

- Individual task failures don't abort
- Logs warnings for each failure
- Imports as many tasks as possible
- Returns success if critical operations succeed

**Remember:** Citizen, WorkflowBenchmarkService is your testing ground in the wasteland of AI model selection. Use it to evaluate performance before committing to production, but remember that benchmarks are controlled conditions. Real-world performance may vary based on your specific use cases, data, and constraints. Test thoroughly, choose wisely, and your projects will stand strong against the challenges of the post-deadline world. The difference between a thriving project and a failed mission often comes down to choosing the right tool for the job.
