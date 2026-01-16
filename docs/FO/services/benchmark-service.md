## TECHNICAL BULLETIN NO. 006
### BENCHMARK SERVICE - PERFORMANCE MEASUREMENT SURVIVAL SYSTEM

**DOCUMENT ID:** `task-o-matic-benchmark-v2`  
**CLEARANCE:** `All Personnel`  
**MANDATORY COMPLIANCE:** `Yes`

### ⚠️ CRITICAL SURVIVAL NOTICE

Citizen, BenchmarkService is your performance monitoring system in the post-deadline wasteland. Without proper benchmarking, your AI model performance will be as mysterious as radioactive fog. This service provides standardized performance measurement and comparison capabilities for all task-o-matic operations.

### SYSTEM ARCHITECTURE OVERVIEW

The BenchmarkService serves as the central performance measurement and storage system for task-o-matic operations. It provides a unified interface for running benchmarks, storing results, and analyzing performance across different AI models and configurations.

**Core Components:**
- **BenchmarkService**: Main benchmark execution service with multiple benchmark types
- **WorkflowBenchmarkService**: Specialized service for complete workflow benchmarks
- **BenchmarkRunner**: Core benchmark execution engine for registered operations
- **BenchmarkStorage**: Persistent result storage and retrieval
- **BenchmarkRegistry**: Operation registration and discovery

**Benchmark Capabilities:**
1. **Operation Benchmarking**: Run standardized benchmarks on any registered operation
2. **Task Execution Benchmarking**: Isolated task execution with git branch isolation
3. **Execute Loop Benchmarking**: Batch task execution with model comparison
4. **Workflow Benchmarking**: Complete project lifecycle benchmarking
5. **Performance Tracking**: Measure timing, token usage, throughput, and latency
6. **Result Storage**: Persistent storage of benchmark results
7. **Historical Analysis**: Compare performance across multiple runs

---

## BENCHMARKSERVICE API

### runBenchmark

Run a benchmark on a registered operation using multiple AI models.

```typescript
async runBenchmark(
  operationId: string,
  input: any,
  config: BenchmarkConfig,
  onProgress?: (event: BenchmarkProgressEvent) => void
): Promise<BenchmarkRun>
```

**Parameters:**
- `operationId` (string, required): Unique identifier for the benchmark operation
  - Available operations: `prd-parse`, `prd-rework`, `prd-create`, `prd-combine`, `prd-question`, `prd-refine`, `task-breakdown`, `task-create`, `task-enhance`, `task-plan`, `task-document`, `workflow-full`
- `input` (any, required): Input data for the operation being benchmarked
  - Varies by operation type (see Operation Registry below)
- `config` (BenchmarkConfig, required): Benchmark configuration
  - `models` (BenchmarkModelConfig[], required): Array of model configurations to benchmark
  - `concurrency` (number, required): Maximum number of models to run in parallel
  - `delay` (number, required): Delay in milliseconds between starting each model
- `onProgress` (function, optional): Progress callback for real-time updates

**Returns:** BenchmarkRun containing:
- `id` (string): Unique benchmark run identifier
- `timestamp` (number): Start timestamp of the benchmark
- `command` (string): Operation ID that was benchmarked
- `input` (any): Input data provided to the benchmark
- `config` (BenchmarkConfig): Configuration used for the benchmark
- `results` (BenchmarkResult[]): Array of model results
  - `modelId` (string): Provider:model[:reasoning] identifier
  - `output` (any): Operation output
  - `duration` (number): Duration in milliseconds
  - `error` (string, optional): Error message if failed
  - `timestamp` (number): Completion timestamp
  - `tokenUsage` (object, optional): Token usage statistics
    - `prompt` (number): Input tokens
    - `completion` (number): Output tokens
    - `total` (number): Total tokens
  - `responseSize` (number, optional): Response size in bytes
  - `bps` (number, optional): Bytes per second
  - `tps` (number, optional): Tokens per second (output)
  - `timeToFirstToken` (number, optional): Time to first token in ms
  - `cost` (number, optional): Estimated cost in USD

**Error Conditions:**
- Invalid operation ID (operation not registered)
- Invalid input for operation
- Configuration validation errors
- Storage errors during result saving

**Example: PRD Parsing Benchmark**
```typescript
const benchmarkResult = await benchmarkService.runBenchmark(
  "prd-parse",
  {
    file: "./requirements.md",
    workingDirectory: "/path/to/project"
  },
  {
    models: [
      { provider: "anthropic", model: "claude-3-5-sonnet" },
      { provider: "openai", model: "gpt-4o" },
      { provider: "openrouter", model: "anthropic/claude-3-opus" }
    ],
    concurrency: 2,
    delay: 1000
  },
  (event) => {
    console.log(`[${event.type}] ${event.modelId}`);
    if (event.type === 'progress') {
      console.log(`  Progress: ${event.currentSize} bytes @ ${event.currentBps} bps`);
    } else if (event.type === 'complete') {
      console.log(`  Completed in ${event.duration}ms`);
    } else if (event.type === 'error') {
      console.error(`  Error: ${event.error}`);
    }
  }
);

console.log(`Benchmark completed: ${benchmarkResult.id}`);
benchmarkResult.results.forEach(result => {
  console.log(`\n${result.modelId}:`);
  console.log(`  Duration: ${result.duration}ms`);
  console.log(`  Tokens: ${result.tokenUsage?.total || 'N/A'}`);
  console.log(`  Throughput: ${result.tps || 'N/A'} tps`);
  console.log(`  First Token: ${result.timeToFirstToken || 'N/A'}ms`);
  console.log(`  Status: ${result.error ? 'FAILED' : 'SUCCESS'}`);
});
```

---

### runExecutionBenchmark

Benchmark task execution with isolated git branches for each model.

```typescript
async runExecutionBenchmark(
  options: ExecutionBenchmarkOptions,
  config: BenchmarkConfig,
  onProgress?: (event: BenchmarkProgressEvent) => void
): Promise<BenchmarkRun>
```

**Parameters:**
- `options` (ExecutionBenchmarkOptions, required): Execution benchmark options
  - `taskId` (string, required): Task ID to execute
  - `verificationCommands` (string[], optional): Commands to verify successful execution
  - `maxRetries` (number, optional): Maximum retry attempts (default: 3)
  - `keepBranches` (boolean, optional): Keep git branches after benchmark (default: true)
- `config` (BenchmarkConfig, required): Benchmark configuration
- `onProgress` (function, optional): Progress callback

**Safety Requirements:**
- Working directory must be clean (no uncommitted changes)
- Git repository must be initialized

**Behavior:**
- Creates isolated git branch for each model: `bench/{taskId}/{model}-{timestamp}`
- Switches to model-specific branch
- Executes task with verification
- Captures results including branch name
- Returns to base branch after each model

**Example: Task Execution Benchmark**
```typescript
const benchmarkResult = await benchmarkService.runExecutionBenchmark(
  {
    taskId: "42",
    verificationCommands: ["bun test", "bun run build"],
    maxRetries: 3,
    keepBranches: true
  },
  {
    models: [
      { provider: "anthropic", model: "claude-3-5-sonnet" },
      { provider: "openai", model: "gpt-4o" }
    ],
    concurrency: 1, // Sequential execution recommended for task benchmarks
    delay: 0
  },
  (event) => {
    console.log(`[${event.type}] ${event.modelId}`);
    if (event.type === 'start') {
      console.log(`  Starting execution...`);
    } else if (event.type === 'complete') {
      console.log(`  Execution complete: ${event.duration}ms`);
    } else if (event.type === 'error') {
      console.error(`  Execution failed: ${event.error}`);
    }
  }
);

console.log(`\nBenchmark Results:`);
benchmarkResult.results.forEach(result => {
  const { modelId, output, duration, error } = result;
  console.log(`\n${modelId}:`);
  console.log(`  Status: ${error ? 'FAILED' : output?.status}`);
  console.log(`  Duration: ${duration}ms`);
  console.log(`  Branch: ${output?.branch}`);
  if (error) console.log(`  Error: ${error}`);
});
```

---

### runExecuteLoopBenchmark

Benchmark batch task execution with model comparison.

```typescript
async runExecuteLoopBenchmark(
  options: {
    loopOptions: ExecuteLoopOptions;
    keepBranches?: boolean;
  },
  config: BenchmarkConfig,
  onProgress?: (event: BenchmarkProgressEvent) => void
): Promise<BenchmarkRun>
```

**Parameters:**
- `options` (object, required):
  - `loopOptions` (ExecuteLoopOptions, required): Loop execution options
  - `keepBranches` (boolean, optional): Keep git branches after benchmark (default: true)
- `config` (BenchmarkConfig, required): Benchmark configuration
- `onProgress` (function, optional): Progress callback

**Safety Requirements:**
- Working directory must be clean
- Git repository must be initialized

**Behavior:**
- Creates isolated git branch for each model: `bench/loop/{model}-{timestamp}`
- Executes complete task loop for each model
- Captures overall loop results including failed task count
- Returns to base branch after each model

**Example: Execute Loop Benchmark**
```typescript
const benchmarkResult = await benchmarkService.runExecuteLoopBenchmark(
  {
    loopOptions: {
      status: "todo",
      maxRetries: 3,
      tool: "opencode",
      config: {
        maxRetries: 3,
        autoCommit: true
      },
      filters: {},
      dry: false
    },
    keepBranches: false
  },
  {
    models: [
      { provider: "anthropic", model: "claude-3-5-sonnet" },
      { provider: "openai", model: "gpt-4o" }
    ],
    concurrency: 1,
    delay: 5000
  },
  (event) => {
    console.log(`[${event.type}] ${event.modelId}`);
    if (event.type === 'complete') {
      console.log(`  Loop complete in ${event.duration}ms`);
    } else if (event.type === 'error') {
      console.error(`  Loop failed: ${event.error}`);
    }
  }
);

console.log(`\nLoop Benchmark Results:`);
benchmarkResult.results.forEach(result => {
  const { modelId, output, duration, error } = result;
  console.log(`\n${modelId}:`);
  console.log(`  Status: ${error ? 'FAILED' : output?.status}`);
  console.log(`  Duration: ${duration}ms`);
  console.log(`  Branch: ${output?.branch}`);
  console.log(`  Failed Tasks: ${output?.failedTasks || 0}`);
});
```

---

### runWorkflowBenchmark

Benchmark complete project workflow from initialization through task splitting.

```typescript
async runWorkflowBenchmark(
  input: WorkflowBenchmarkInput,
  config: BenchmarkConfig,
  onProgress?: (event: BenchmarkProgressEvent) => void
): Promise<BenchmarkRun>
```

**Parameters:**
- `input` (WorkflowBenchmarkInput, required): Workflow benchmark input
  - `collectedResponses` (object, required): User responses for consistent execution
    - `projectName` (string): Project name
    - `initMethod` ("quick" | "custom" | "ai"): Initialization method
    - `projectDescription` (string, optional): Project description
    - `stackConfig` (object, optional): Technology stack configuration
      - `frontend` (string, optional): Frontend framework
      - `backend` (string, optional): Backend framework
      - `database` (string, optional): Database type
      - `auth` (boolean, optional): Include authentication
    - `prdMethod` ("upload" | "manual" | "ai" | "skip"): PRD creation method
    - `prdContent` (string, optional): PRD content
    - `prdDescription` (string, optional): PRD description
    - `prdFile` (string, optional): Path to PRD file
    - `refinePrd` (boolean, optional): Whether to refine PRD
    - `refineFeedback` (string, optional): Feedback for PRD refinement
    - `generateTasks` (boolean, optional): Whether to generate tasks
    - `customInstructions` (string, optional): Custom instructions for task generation
    - `splitTasks` (boolean, optional): Whether to split tasks
    - `tasksToSplit` (string[], optional): Specific task IDs to split
    - `splitInstructions` (string, optional): Instructions for task splitting
  - `workflowOptions` (WorkflowAutomationOptions, required): Workflow automation options
  - `projectDir` (string, optional): Target project directory
  - `tempDirBase` (string, optional): Base directory for temporary projects (default: `./benchmarks`)
- `config` (BenchmarkConfig, required): Benchmark configuration
- `onProgress` (function, optional): Progress callback

**Behavior:**
- Creates isolated project directory for each model: `{projectName}-{model}-{timestamp}`
- Executes complete workflow: init → PRD → tasks → splitting
- Captures detailed timing for each step
- Stores results in temporary directories

**Example: Complete Workflow Benchmark**
```typescript
const benchmarkResult = await benchmarkService.runWorkflowBenchmark(
  {
    collectedResponses: {
      projectName: "vault-manager",
      initMethod: "quick",
      projectDescription: "A system for managing underground bunkers",
      stackConfig: {
        frontend: "next",
        backend: "hono",
        database: "postgres",
        auth: true
      },
      prdMethod: "ai",
      prdDescription: "Build a comprehensive vault management system",
      generateTasks: true,
      splitTasks: true
    },
    workflowOptions: {
      executeTasks: false // Don't execute tasks during benchmark
    },
    tempDirBase: "/tmp/benchmarks"
  },
  {
    models: [
      { provider: "anthropic", model: "claude-3-5-sonnet" },
      { provider: "openai", model: "gpt-4o" },
      { provider: "openrouter", model: "anthropic/claude-3-opus" }
    ],
    concurrency: 1, // Sequential for workflow benchmarks
    delay: 0
  },
  (event) => {
    console.log(`[${event.type}] ${event.modelId}`);
    if (event.type === 'start') {
      console.log(`  Starting workflow...`);
    } else if (event.type === 'complete') {
      console.log(`  Workflow complete in ${event.duration}ms`);
    } else if (event.type === 'error') {
      console.error(`  Workflow error: ${event.error}`);
    }
  }
);

console.log(`\nWorkflow Benchmark Results:`);
benchmarkResult.results.forEach(result => {
  const { modelId, output, duration, error } = result;
  console.log(`\n${modelId}:`);
  console.log(`  Status: ${error ? 'FAILED' : 'SUCCESS'}`);
  console.log(`  Duration: ${duration}ms`);
  console.log(`  Project Dir: ${output?.projectDir}`);
  console.log(`  Total Tasks: ${output?.stats?.totalTasks || 0}`);
  console.log(`  Steps: ${output?.stats?.successfulSteps}/${output?.stats?.totalSteps}`);
});
```

---

### getRun

Retrieve a previously saved benchmark run.

```typescript
getRun(id: string): BenchmarkRun | null
```

**Parameters:**
- `id` (string, required): Benchmark run identifier

**Returns:** BenchmarkRun object or null if not found

**Error Conditions:** Storage access errors

**Example: Retrieve Specific Benchmark**
```typescript
const benchmarkRun = benchmarkService.getRun("run-1736990400000");

if (benchmarkRun) {
  console.log(`Found benchmark: ${benchmarkRun.id}`);
  console.log(`Operation: ${benchmarkRun.command}`);
  console.log(`Date: ${new Date(benchmarkRun.timestamp).toISOString()}`);
  console.log(`Models: ${benchmarkRun.results.length}`);
  
  benchmarkRun.results.forEach(result => {
    console.log(`\n${result.modelId}:`);
    console.log(`  Duration: ${result.duration}ms`);
    console.log(`  Tokens: ${result.tokenUsage?.total || 'N/A'}`);
    console.log(`  Status: ${result.error ? 'FAILED' : 'SUCCESS'}`);
  });
} else {
  console.log("Benchmark run not found");
}
```

---

### listRuns

List all saved benchmark runs.

```typescript
listRuns(): Array<{
  id: string;
  timestamp: number;
  command: string;
}>
```

**Returns:** Array of benchmark run metadata, sorted by timestamp (newest first)

**Error Conditions:** Storage access errors

**Example: List All Benchmarks**
```typescript
const runs = benchmarkService.listRuns();

console.log(`Found ${runs.length} benchmark runs:\n`);

runs.forEach(run => {
  const date = new Date(run.timestamp);
  console.log(`${run.id}: ${run.command} (${date.toLocaleDateString()})`);
});

// Filter by operation type
const prdBenchmarks = runs.filter(run => run.command.startsWith("prd"));
console.log(`\nPRD benchmarks: ${prdBenchmarks.length}`);

// Filter by date range
const recentRuns = runs.filter(run => {
  const runDate = new Date(run.timestamp);
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  return runDate > weekAgo;
});

console.log(`\nRecent benchmarks (last 7 days): ${recentRuns.length}`);
```

---

## WORKFLOWBENCHMARKSERVICE API

### executeWorkflow

Execute a complete workflow for benchmarking purposes. Used internally by `runWorkflowBenchmark`.

```typescript
async executeWorkflow(
  input: WorkflowBenchmarkInput,
  aiOptions: AIOptions,
  streamingOptions?: StreamingOptions
): Promise<WorkflowBenchmarkResult["output"]>
```

**Parameters:**
- `input` (WorkflowBenchmarkInput, required): Workflow benchmark input
- `aiOptions` (AIOptions, required): AI configuration
- `streamingOptions` (StreamingOptions, optional): Streaming configuration

**Returns:** Workflow output with detailed statistics

**Note:** This method creates temporary project directories and cleans them up automatically. Use `applyBenchmarkResult` to apply results to an actual project.

---

### applyBenchmarkResult

Apply the results from a selected benchmark to an actual project.

```typescript
async applyBenchmarkResult(
  selectedResult: WorkflowBenchmarkResult,
  targetProjectDir: string,
  originalResponses: WorkflowBenchmarkInput["collectedResponses"]
): Promise<{ success: boolean; message: string }>
```

**Parameters:**
- `selectedResult` (WorkflowBenchmarkResult, required): Selected benchmark result
- `targetProjectDir` (string, required): Target project directory
- `originalResponses` (object, required): Original user responses

**Returns:** Success status and message

**Behavior:**
- Initializes actual project with selected model
- Copies PRD content if available
- Imports tasks from benchmark result

**Example: Apply Benchmark Results**
```typescript
const success = await workflowBenchmarkService.applyBenchmarkResult(
  selectedBenchmarkResult,
  "/path/to/actual/project",
  originalUserResponses
);

if (success.success) {
  console.log(`✅ ${success.message}`);
} else {
  console.error(`❌ ${success.message}`);
}
```

---

### validateInput

Validate workflow benchmark input.

```typescript
validateInput(input: any): input is WorkflowBenchmarkInput
```

**Parameters:**
- `input` (any): Input to validate

**Returns:** Type guard indicating if input is valid WorkflowBenchmarkInput

---

## TYPE DEFINITIONS

### BenchmarkConfig

```typescript
interface BenchmarkConfig {
  models: BenchmarkModelConfig[];
  concurrency: number;
  delay: number;
}
```

### BenchmarkModelConfig

```typescript
interface BenchmarkModelConfig {
  provider: string;
  model: string;
  reasoningTokens?: number;
}
```

### BenchmarkProgressEvent

```typescript
type BenchmarkProgressEvent = 
  | { type: "start"; modelId: string }
  | { type: "progress"; modelId: string; currentSize: number; currentBps: number; chunk?: string; duration: number }
  | { type: "complete"; modelId: string; duration: number }
  | { type: "error"; modelId: string; error: string };
```

### BenchmarkResult

```typescript
interface BenchmarkResult {
  modelId: string;
  output: any;
  duration: number;
  error?: string;
  timestamp: number;
  tokenUsage?: {
    prompt: number;
    completion: number;
    total: number;
  };
  responseSize?: number;
  bps?: number;
  tps?: number;
  timeToFirstToken?: number;
  cost?: number;
}
```

### BenchmarkRun

```typescript
interface BenchmarkRun {
  id: string;
  timestamp: number;
  command: string;
  input: any;
  config: BenchmarkConfig;
  results: BenchmarkResult[];
}
```

### ExecutionBenchmarkOptions

```typescript
interface ExecutionBenchmarkOptions {
  taskId: string;
  verificationCommands?: string[];
  maxRetries?: number;
  keepBranches?: boolean;
}
```

### WorkflowBenchmarkInput

```typescript
interface WorkflowBenchmarkInput {
  collectedResponses: {
    projectName: string;
    initMethod: "quick" | "custom" | "ai";
    projectDescription?: string;
    stackConfig?: {
      frontend?: string;
      backend?: string;
      database?: string;
      auth?: boolean;
    };
    prdMethod: "upload" | "manual" | "ai" | "skip";
    prdContent?: string;
    prdDescription?: string;
    prdFile?: string;
    refinePrd?: boolean;
    refineFeedback?: string;
    generateTasks?: boolean;
    customInstructions?: string;
    splitTasks?: boolean;
    tasksToSplit?: string[];
    splitInstructions?: string;
  };
  workflowOptions: WorkflowAutomationOptions;
  projectDir?: string;
  tempDirBase?: string;
}
```

---

## OPERATION REGISTRY

The following operations are registered for benchmarking via `runBenchmark()`:

| Operation ID | Name | Description | Required Input Fields |
|-------------|------|-------------|----------------------|
| `prd-parse` | PRD Parsing | Parse a PRD file into tasks | `file` |
| `prd-rework` | PRD Rework | Rework a PRD based on feedback | `file`, `feedback` |
| `prd-create` | PRD Creation | Generate PRD from description | `description` |
| `prd-combine` | PRD Combination | Combine multiple PRD files | `prds`, `originalDescription` |
| `prd-question` | PRD Question Generation | Generate clarifying questions | `file` |
| `prd-refine` | PRD Refinement | Refine PRD with questions | `file`, `questionMode`, `answers?` |
| `task-breakdown` | Task Breakdown | Break down task into subtasks | `taskId` |
| `task-create` | Task Creation | Create task with AI enhancement | `title` |
| `task-enhance` | Task Enhancement | Enhance existing task | `taskId` |
| `task-plan` | Task Planning | Create implementation plan | `taskId` |
| `task-document` | Task Documentation | Generate task documentation | `taskId` |
| `workflow-full` | Complete Workflow | Execute full project workflow | Full WorkflowBenchmarkInput |

---

## STORAGE FORMAT

Benchmark results are stored in `.task-o-matic/benchmarks/{runId}/` with the following structure:

```
.task-o-matic/benchmarks/
└── run-{timestamp}/
    ├── metadata.json          # Run metadata
    ├── input.json             # Input data
    └── results/               # Individual model results
        ├── {modelId}.json
        ├── {modelId}.json
        └── ...
```

**metadata.json:**
```json
{
  "id": "run-1736990400000",
  "timestamp": 1736990400000,
  "command": "prd-parse",
  "config": {
    "models": [
      { "provider": "anthropic", "model": "claude-3-5-sonnet" },
      { "provider": "openai", "model": "gpt-4o" }
    ],
    "concurrency": 2,
    "delay": 1000
  }
}
```

**results/{modelId}.json:**
```json
{
  "modelId": "anthropic:claude-3-5-sonnet",
  "output": {
    "tasks": [...],
    "success": true
  },
  "duration": 5234,
  "timestamp": 1736990405234,
  "tokenUsage": {
    "prompt": 1500,
    "completion": 800,
    "total": 2300
  },
  "responseSize": 45678,
  "bps": 8725,
  "tps": 153,
  "timeToFirstToken": 234
}
```

---

## SURVIVAL SCENARIOS

### Scenario 1: Model Performance Comparison

Compare AI models on PRD parsing performance:

```typescript
const benchmarkResult = await benchmarkService.runBenchmark(
  "prd-parse",
  {
    file: "./requirements.md",
    workingDirectory: "/path/to/project"
  },
  {
    models: [
      { provider: "anthropic", model: "claude-3-5-sonnet" },
      { provider: "openai", model: "gpt-4o" },
      { provider: "openrouter", model: "qwen-2.5" }
    ],
    concurrency: 3,
    delay: 0
  }
);

// Find best performing model
const successfulResults = benchmarkResult.results.filter(r => !r.error);
const bestModel = successfulResults.reduce((best, current) => 
  current.duration < best.duration ? current : best
);

console.log(`🏆 Best Model: ${bestModel.modelId}`);
console.log(`   Duration: ${bestModel.duration}ms`);
console.log(`   Tokens: ${bestModel.tokenUsage?.total}`);
console.log(`   Throughput: ${bestModel.tps} tps`);

// Calculate cost per task (if pricing data available)
const costs = successfulResults.map(r => ({
  modelId: r.modelId,
  cost: r.cost || (r.tokenUsage?.total || 0) * 0.00001 // Rough estimate
}));

console.log(`\nCost Comparison:`);
costs.forEach(c => {
  console.log(`  ${c.modelId}: $${c.cost.toFixed(4)}`);
});
```

### Scenario 2: Task Execution Regression Testing

Detect performance regressions in task execution:

```typescript
const baseline = await benchmarkService.runExecutionBenchmark(
  { taskId: "42", maxRetries: 3, keepBranches: false },
  { models: [{ provider: "anthropic", model: "claude-3-5-sonnet" }], concurrency: 1, delay: 0 }
);

// After code changes, run regression test
const regressionTest = await benchmarkService.runExecutionBenchmark(
  { taskId: "42", maxRetries: 3, keepBranches: false },
  { models: [{ provider: "anthropic", model: "claude-3-5-sonnet" }], concurrency: 1, delay: 0 }
);

const baselineDuration = baseline.results[0].duration;
const currentDuration = regressionTest.results[0].duration;
const percentChange = ((currentDuration - baselineDuration) / baselineDuration) * 100;

if (percentChange > 20) {
  console.error(`🚨 REGRESSION: Task execution is ${percentChange.toFixed(1)}% slower`);
} else if (percentChange < -10) {
  console.log(`✅ IMPROVEMENT: Task execution is ${Math.abs(percentChange).toFixed(1)}% faster`);
} else {
  console.log(`✅ STABLE: Performance within acceptable range`);
}
```

### Scenario 3: Workflow Optimization

Find optimal model for complete workflow:

```typescript
const benchmarkResult = await benchmarkService.runWorkflowBenchmark(
  {
    collectedResponses: {
      projectName: "bunker-manager",
      initMethod: "quick",
      projectDescription: "Bunker management system",
      prdMethod: "ai",
      prdDescription: "Build bunker management",
      generateTasks: true,
      splitTasks: true
    },
    workflowOptions: { executeTasks: false },
    tempDirBase: "/tmp/benchmarks"
  },
  {
    models: [
      { provider: "anthropic", model: "claude-3-5-sonnet" },
      { provider: "openai", model: "gpt-4o-mini" }
    ],
    concurrency: 1,
    delay: 0
  }
);

// Score models based on multiple factors
const scores = benchmarkResult.results.map(result => {
  const stats = result.output?.stats || {};
  const speedScore = 10000 / (result.duration || 1); // Lower is better
  const taskCountScore = stats.totalTasks || 0;
  const subtasksScore = stats.tasksWithSubtasks || 0;
  
  return {
    modelId: result.modelId,
    totalScore: speedScore + taskCountScore + subtasksScore,
    speedScore,
    taskCountScore,
    subtasksScore,
    duration: result.duration,
    totalTasks: stats.totalTasks
  };
}).sort((a, b) => b.totalScore - a.totalScore);

console.log(`\nWorkflow Model Rankings:`);
scores.forEach((s, i) => {
  console.log(`\n${i + 1}. ${s.modelId}`);
  console.log(`   Total Score: ${s.totalScore.toFixed(0)}`);
  console.log(`   Speed Score: ${s.speedScore.toFixed(0)}`);
  console.log(`   Tasks Generated: ${s.totalTasks}`);
  console.log(`   Duration: ${s.duration}ms`);
});

// Apply best result to actual project
const bestResult = benchmarkResult.results.find(r => r.modelId === scores[0].modelId);
if (bestResult) {
  const applyResult = await workflowBenchmarkService.applyBenchmarkResult(
    bestResult,
    "/path/to/actual/project",
    benchmarkResult.input.collectedResponses
  );
  
  if (applyResult.success) {
    console.log(`\n✅ Applied best result to project`);
  }
}
```

---

## TECHNICAL SPECIFICATIONS

**Performance Metrics:**
- **Duration**: Total execution time in milliseconds
- **Token Usage**: AI token consumption (prompt, completion, total)
- **Response Size**: Output size in bytes
- **bps**: Bytes per second (transfer rate)
- **tps**: Tokens per second (generation rate)
- **Time to First Token**: Latency to first output token
- **Cost**: Estimated cost in USD (if pricing data available)

**Concurrency Model:**
- Benchmarks support parallel execution via `concurrency` parameter
- Models are queued and processed up to concurrency limit
- Delay between starting models to prevent rate limiting
- Progress events emitted for real-time monitoring

**Isolation Strategy:**
- Execution benchmarks use git branches for isolation
- Each model gets dedicated branch: `bench/{taskId}/{model}-{timestamp}`
- Workflow benchmarks use temporary directories
- Automatic cleanup unless `keepBranches: true`

**Error Handling:**
- Per-model error tracking (doesn't fail entire benchmark)
- Detailed error messages stored in results
- Graceful degradation for partial failures
- Critical failures abort benchmark and restore git state

**Storage:**
- JSON-based storage in `.task-o-matic/benchmarks/`
- Separate files for metadata, input, and results
- Efficient retrieval via ID lookup
- Sorted listing by timestamp

---

## OPEN QUESTIONS / TODO

- [ ] Cost calculation: Need model-specific pricing data for accurate cost estimation
- [ ] Comparison feature: Historical comparison across runs (mentioned in original docs but not implemented)
- [ ] Summary statistics: Aggregated metrics across models (min, max, average, std dev)
- [ ] Benchmark templates: Pre-configured benchmark scenarios
- [ ] Result visualization: Charts and graphs for performance analysis
- [ ] Alert thresholds: Automatic alerts for performance regressions
- [ ] CI/CD integration: Automated benchmarking in pipelines

---

**Remember:** Citizen, BenchmarkService is your performance compass in the wasteland of AI operations. Use it to track performance, compare models, detect regressions, and make data-driven decisions about model selection. Regular benchmarking will keep your projects performing optimally even as the technical landscape shifts. Measure everything, trust the data, and your systems will remain efficient and reliable.

---

**END OF TECHNICAL BULLETIN**
