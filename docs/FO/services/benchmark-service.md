## TECHNICAL BULLETIN NO. 006
### BENCHMARK SERVICE - PERFORMANCE MEASUREMENT SURVIVAL SYSTEM

**DOCUMENT ID:** `task-o-matic-benchmark-v1`  
**CLEARANCE:** `All Personnel`  
**MANDATORY COMPLIANCE:** `Yes`

### ⚠️ CRITICAL SURVIVAL NOTICE
Citizen, BenchmarkService is your performance monitoring system in the post-deadline wasteland. Without proper benchmarking, your AI model performance will be as mysterious as radioactive fog. This service provides standardized performance measurement and comparison capabilities for all task-o-matic operations.

### SYSTEM ARCHITECTURE OVERVIEW

The BenchmarkService serves as the central performance measurement and storage system for task-o-matic operations. It provides a unified interface for running benchmarks, storing results, and analyzing performance across different AI models and configurations.

**Core Dependencies:**
- **BenchmarkRunner**: Core benchmark execution engine
- **BenchmarkStorage**: Persistent result storage and retrieval
- **Benchmark Types**: Standardized benchmark configuration and result interfaces

**Benchmark Capabilities:**
1. **Operation Execution**: Run standardized benchmarks on any operation
2. **Performance Tracking**: Measure timing, token usage, and success rates
3. **Result Storage**: Persistent storage of benchmark results
4. **Historical Analysis**: Compare performance across multiple runs
5. **Progress Monitoring**: Real-time benchmark progress feedback

### COMPLETE API DOCUMENTATION

---

#### runBenchmark

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
  - Examples: "task-enhancement", "prd-generation", "task-splitting", "workflow-execution"
- `input` (any, required): Input data for the operation being benchmarked
  - Varies by operation type (task object, PRD content, etc.)
- `config` (BenchmarkConfig, required): Benchmark configuration
  - `iterations` (number, optional): Number of iterations to run (default: 1)
  - `warmupIterations` (number, optional): Warmup iterations before measurement (default: 0)
  - `timeout` (number, optional): Maximum time per iteration in ms (default: 300000)
  - `metrics` (string[], optional): Specific metrics to collect
  - `compareWith` (string[], optional): Previous benchmark IDs to compare against
- `onProgress` (function, optional): Progress callback for real-time updates

**Returns:** BenchmarkRun containing:
- `id` (string): Unique benchmark run identifier
- `operationId` (string): Operation being benchmarked
- `timestamp` (number): Start timestamp of the benchmark
- `config` (BenchmarkConfig): Configuration used for the benchmark
- `input` (any): Input data provided to the benchmark
- `results` (BenchmarkResult[]): Array of iteration results
  - Each result contains:
    - `iteration` (number): Iteration number (1-based)
    - `success` (boolean): Whether the iteration succeeded
    - `duration` (number): Duration in milliseconds
    - `tokenUsage` (object, optional): Token usage statistics
    - `output` (any): Operation output
    - `error` (string, optional): Error message if failed
- `summary` (object): Aggregated statistics across all iterations
  - `totalIterations` (number): Total iterations run
  - `successfulIterations` (number): Successful iterations
  - `failedIterations` (number): Failed iterations
  - `averageDuration` (number): Average duration across successful iterations
  - `minDuration` (number): Fastest successful iteration
  - `maxDuration` (number): Slowest successful iteration
  - `totalTokens` (number): Total tokens used (if applicable)
  - `averageTokens` (number): Average tokens per iteration (if applicable)
  - `successRate` (number): Success rate (0-1)
- `comparisons` (object[], optional): Comparison with previous benchmarks
  - Each comparison contains:
    - `benchmarkId` (string): Previous benchmark ID
    - `operationId` (string): Previous operation ID
    - `performanceDiff` (number): Performance difference percentage
    - `durationDiff` (number): Duration difference in ms

**Error Conditions:**
- Invalid operation ID
- Configuration validation errors
- Operation execution failures
- Storage errors during result saving

**Example: Basic Task Enhancement Benchmark**
```typescript
const benchmarkResult = await benchmarkService.runBenchmark(
  "task-enhancement",
  {
    taskId: "1",
    aiOptions: { aiProvider: "anthropic", aiModel: "claude-3-5-sonnet" }
  },
  {
    iterations: 3,
    warmupIterations: 1,
    metrics: ["duration", "tokenUsage", "success"],
    timeout: 60000
  },
  (event) => {
    console.log(`[${event.type}] ${event.message}`);
    if (event.type === 'iteration-complete') {
      console.log(`  Iteration ${event.iteration}: ${event.success ? 'SUCCESS' : 'FAILED'} (${event.duration}ms)`);
    }
  }
);

console.log(`Benchmark completed: ${benchmarkResult.id}`);
console.log(`Success rate: ${Math.round(benchmarkResult.summary.successRate * 100)}%`);
console.log(`Average duration: ${benchmarkResult.summary.averageDuration}ms`);
console.log(`Token usage: ${benchmarkResult.summary.totalTokens || 0} tokens`);
```

**Example: Multi-Model PRD Generation Comparison**
```typescript
const models = [
  { aiProvider: "anthropic", aiModel: "claude-3-5-sonnet" },
  { aiProvider: "openai", aiModel: "gpt-4" },
  { aiProvider: "openrouter", aiModel: "anthropic/claude-3-opus" }
];

const benchmarkResults = await Promise.all(
  models.map(async (model, index) => {
    const benchmarkId = `prd-gen-${model.aiProvider}-${model.aiModel}`;
    
    return await benchmarkService.runBenchmark(
      `prd-generation-${index}`,
      {
        description: "AI-powered task management platform",
        aiOptions: model
      },
      {
        iterations: 2,
        metrics: ["duration", "tokenUsage", "outputQuality"],
        compareWith: ["prd-gen-baseline"] // Compare with baseline
      },
      (event) => console.log(`[${model.aiProvider}] ${event.message}`)
    );
  })
);

// Analyze results
benchmarkResults.forEach((result, index) => {
  const model = models[index];
  const { summary } = result;
  
  console.log(`\n${model.aiProvider}/${model.aiModel}:`);
  console.log(`  Success Rate: ${Math.round(summary.successRate * 100)}%`);
  console.log(`  Avg Duration: ${summary.averageDuration}ms`);
  console.log(`  Tokens: ${summary.totalTokens || 0}`);
  console.log(`  Output Quality: ${summary.outputQuality || 'N/A'}`);
  
  if (result.comparisons && result.comparisons.length > 0) {
    result.comparisons.forEach(comp => {
      console.log(`  vs ${comp.benchmarkId}: ${comp.performanceDiff > 0 ? '+' : ''}${comp.performanceDiff}%`);
    });
  }
});
```

**Example: Performance Regression Testing**
```typescript
// Run benchmark to detect performance regressions
const regressionBenchmark = await benchmarkService.runBenchmark(
  "task-splitting-regression",
  {
    taskId: "complex-task-123",
    aiOptions: { aiProvider: "anthropic", aiModel: "claude-3-5-sonnet" }
  },
  {
    iterations: 5,
    warmupIterations: 2,
    metrics: ["duration", "subtaskCount", "success"],
    compareWith: ["task-splitting-baseline", "task-splitting-v1.2"]
  },
  (event) => {
    if (event.type === 'warning') {
      console.warn(`⚠️ ${event.message}`);
    }
  }
);

const { summary, comparisons } = regressionBenchmark;

// Check for regressions
const hasRegression = comparisons.some(comp => comp.performanceDiff < -10); // >10% slower
if (hasRegression) {
  console.error("🚨 Performance regression detected!");
  comparisons.forEach(comp => {
    if (comp.performanceDiff < -10) {
      console.error(`  ${comp.benchmarkId}: ${comp.performanceDiff}% slower`);
    }
  });
} else {
  console.log("✅ No significant performance regressions detected");
}

console.log(`Current performance: ${summary.averageDuration}ms (baseline: 2500ms)`);
```

---

#### getRun

```typescript
getRun(id: string): BenchmarkRun | null
```

**Parameters:**
- `id` (string, required): Benchmark run identifier

**Returns:** BenchmarkRun object or null if not found

**Error Conditions:** Storage access errors

**Example: Retrieve Specific Benchmark**
```typescript
const benchmarkRun = benchmarkService.getRun("prd-gen-2024-01-15-claude-3-5-sonnet");

if (benchmarkRun) {
  console.log(`Found benchmark: ${benchmarkRun.id}`);
  console.log(`Operation: ${benchmarkRun.operationId}`);
  console.log(`Date: ${new Date(benchmarkRun.timestamp).toISOString()}`);
  console.log(`Iterations: ${benchmarkRun.results.length}`);
  
  const { summary } = benchmarkRun;
  console.log(`Success Rate: ${Math.round(summary.successRate * 100)}%`);
  console.log(`Average Duration: ${summary.averageDuration}ms`);
} else {
  console.log("Benchmark run not found");
}
```

**Example: Performance Analysis**
```typescript
function analyzeBenchmarkPerformance(benchmarkId: string) {
  const run = benchmarkService.getRun(benchmarkId);
  if (!run) return null;
  
  const { results, summary } = run;
  
  // Calculate performance stability
  const durations = results
    .filter(r => r.success)
    .map(r => r.duration);
  
  if (durations.length === 0) return null;
  
  const mean = durations.reduce((a, b) => a + b, 0) / durations.length;
  const variance = durations.reduce((sum, d) => sum + Math.pow(d - mean, 2), 0) / durations.length;
  const standardDeviation = Math.sqrt(variance);
  const coefficientOfVariation = (standardDeviation / mean) * 100;
  
  return {
    benchmarkId,
    mean,
    standardDeviation,
    coefficientOfVariation,
    isStable: coefficientOfVariation < 10, // CV < 10% is stable
    summary: summary.successRate
  };
}

const analysis = analyzeBenchmarkPerformance("task-enhancement-2024-01-15");
if (analysis) {
  console.log(`Performance Analysis for ${analysis.benchmarkId}:`);
  console.log(`  Mean Duration: ${analysis.mean}ms`);
  console.log(`  Std Deviation: ${analysis.standardDeviation}ms`);
  console.log(`  Coefficient of Variation: ${analysis.coefficientOfVariation.toFixed(2)}%`);
  console.log(`  Stability: ${analysis.isStable ? 'STABLE' : 'VARIABLE'}`);
  console.log(`  Success Rate: ${Math.round(analysis.summary * 100)}%`);
}
```

---

#### listRuns

```typescript
listRuns(): Array<{
  id: string;
  timestamp: number;
  command: string;
}>
```

**Returns:** Array of benchmark run metadata

**Error Conditions:** Storage access errors

**Example: List All Benchmarks**
```typescript
const runs = benchmarkService.listRuns();

console.log(`Found ${runs.length} benchmark runs:`);

runs.forEach(run => {
  const date = new Date(run.timestamp);
  console.log(`${run.id}: ${run.command} (${date.toLocaleDateString()})`);
});

// Filter by operation type
const prdBenchmarks = runs.filter(run => run.command.includes("prd"));
console.log(`\nPRD benchmarks: ${prdBenchmarks.length}`);

// Filter by date range
const recentRuns = runs.filter(run => {
  const runDate = new Date(run.timestamp);
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  return runDate > weekAgo;
});

console.log(`\nRecent benchmarks (last 7 days): ${recentRuns.length}`);
```

**Example: Performance Trend Analysis**
```typescript
const runs = benchmarkService.listRuns();

// Group by operation type for trend analysis
const operationGroups = runs.reduce((groups, run) => {
  const operation = run.command.split('-')[0]; // Extract operation type
  if (!groups[operation]) {
    groups[operation] = [];
  }
  groups[operation].push(run);
  return groups;
}, {});

Object.entries(operationGroups).forEach(([operation, operationRuns]) => {
  if (operationRuns.length < 2) return; // Need at least 2 for trend
  
  // Sort by date
  operationRuns.sort((a, b) => a.timestamp - b.timestamp);
  
  // Calculate performance trend
  const recentPerformance = operationRuns.slice(-3); // Last 3 runs
  const avgRecentPerformance = recentPerformance.reduce((sum, run) => {
    // Get summary from stored run
    const storedRun = benchmarkService.getRun(run.id);
    return sum + (storedRun?.summary.averageDuration || 0);
  }, 0) / recentPerformance.length;
  
  console.log(`\n${operation} Performance Trend:`);
  console.log(`  Runs Analyzed: ${recentPerformance.length}`);
  console.log(`  Recent Average: ${avgRecentPerformance.toFixed(0)}ms`);
  
  // Determine trend
  if (recentPerformance.length >= 3) {
    const first = recentPerformance[0];
    const firstPerf = benchmarkService.getRun(first.id)?.summary.averageDuration || 0;
    const trend = avgRecentPerformance > firstPerf ? 'IMPROVING' : 'DECLINING';
    const changePercent = Math.abs((avgRecentPerformance - firstPerf) / firstPerf * 100);
    
    console.log(`  Trend: ${trend} (${changePercent.toFixed(1)}% change)`);
  }
});
```

### INTEGRATION PROTOCOLS

**Benchmark Configuration Interface:**
```typescript
interface BenchmarkConfig {
  iterations?: number;          // Number of test iterations (default: 1)
  warmupIterations?: number;   // Warmup runs before measurement (default: 0)
  timeout?: number;            // Max time per iteration in ms (default: 300000)
  metrics?: string[];         // Specific metrics to collect
  compareWith?: string[];      // Previous benchmark IDs for comparison
}
```

**Progress Event Types:**
```typescript
type BenchmarkProgressEvent = 
  | { type: "started"; message: string }
  | { type: "iteration-start"; iteration: number; message: string }
  | { type: "iteration-complete"; iteration: number; success: boolean; duration: number; message: string }
  | { type: "completed"; message: string; summary: any }
  | { type: "error"; message: string; error: Error }
  | { type: "warning"; message: string }
  | { type: "progress"; progress: number; message: string };
```

**Result Storage Structure:**
```typescript
interface BenchmarkRun {
  id: string;                    // Unique identifier
  operationId: string;             // Operation being benchmarked
  timestamp: number;               // Start timestamp
  config: BenchmarkConfig;          // Configuration used
  input: any;                    // Input data
  results: BenchmarkResult[];      // Individual iteration results
  summary: {                     // Aggregated statistics
    totalIterations: number;
    successfulIterations: number;
    failedIterations: number;
    averageDuration: number;
    minDuration: number;
    maxDuration: number;
    totalTokens?: number;
    averageTokens?: number;
    successRate: number;
  };
  comparisons?: Array<{           // Comparison data
    benchmarkId: string;
    operationId: string;
    performanceDiff: number;
    durationDiff: number;
  }>;
}
```

**Metric Collection System:**
- Automatic timing measurement for all operations
- Token usage tracking for AI operations
- Success/failure rate calculation
- Performance comparison with historical data
- Statistical analysis (mean, variance, trends)

### SURVIVAL SCENARIOS

**Scenario 1: AI Model Performance Evaluation**
```typescript
const evaluationScenario = {
  operationId: "comprehensive-task-operations",
  testOperations: [
    { name: "task-creation", input: { title: "Test task", content: "Test description" } },
    { name: "task-enhancement", input: { taskId: "test-123" } },
    { name: "task-splitting", input: { taskId: "complex-task-456" } },
    { name: "task-planning", input: { taskId: "test-789" } }
  ],
  models: [
    { name: "Claude 3.5 Sonnet", provider: "anthropic", model: "claude-3-5-sonnet" },
    { name: "GPT-4", provider: "openai", model: "gpt-4" },
    { name: "Claude 3 Opus", provider: "openrouter", model: "anthropic/claude-3-opus" }
  ]
};

console.log("Starting comprehensive AI model evaluation...");

const evaluationResults = await Promise.all(
  evaluationScenario.models.map(async (model) => {
    const modelResults = await Promise.all(
      evaluationScenario.testOperations.map(async (operation, index) => {
        const benchmarkId = `${model.name.toLowerCase().replace(/\s+/g, '-')}-${operation.name}-${index}`;
        
        return await benchmarkService.runBenchmark(
          benchmarkId,
          { ...operation.input, aiOptions: { aiProvider: model.provider, aiModel: model.model } },
          {
            iterations: 3,
            warmupIterations: 1,
            metrics: ["duration", "tokenUsage", "success", "outputQuality"],
            compareWith: [`${operation.name}-baseline`] // Compare with baseline if available
          },
          (event) => console.log(`[${model.name}] [${operation.name}] ${event.message}`)
        );
      })
    );
    
    // Calculate model summary
    const allResults = modelResults.flatMap(r => r.results);
    const successfulResults = allResults.filter(r => r.success);
    const avgDuration = successfulResults.reduce((sum, r) => sum + r.duration, 0) / successfulResults.length;
    const totalTokens = allResults.reduce((sum, r) => sum + (r.tokenUsage?.total || 0), 0);
    const overallSuccessRate = successfulResults.length / allResults.length;
    
    return {
      model: model.name,
      provider: model.provider,
      modelId: model.model,
      operations: modelResults,
      summary: {
        totalBenchmarks: modelResults.length,
        avgDuration,
        totalTokens,
        successRate: overallSuccessRate,
        qualityScore: calculateQualityScore(modelResults)
      }
    };
  })
);

// Generate comparison report
console.log("\n=== AI MODEL EVALUATION RESULTS ===");
evaluationResults.forEach(result => {
  console.log(`\n${result.model} (${result.provider}/${result.modelId}):`);
  console.log(`  Success Rate: ${Math.round(result.summary.successRate * 100)}%`);
  console.log(`  Average Duration: ${result.summary.avgDuration.toFixed(0)}ms`);
  console.log(`  Total Tokens: ${result.summary.totalTokens}`);
  console.log(`  Quality Score: ${result.summary.qualityScore.toFixed(1)}`);
  
  result.operations.forEach(op => {
    const { summary } = op;
    console.log(`    ${op.operationId}: ${summary.success ? '✓' : '✗'} (${summary.duration}ms)`);
  });
});

// Select best model
const bestModel = evaluationResults.reduce((best, current) => 
  current.summary.successRate > best.summary.successRate ? current : best
);

console.log(`\n🏆 RECOMMENDED MODEL: ${bestModel.model}`);
console.log(`Reason: Highest success rate (${Math.round(bestModel.summary.successRate * 100)}%) with good performance`);

function calculateQualityScore(results) {
  // Simple quality scoring based on consistency and success
  const successRate = results.filter(r => r.results.some(res => res.success)).length / results.length;
  const durationConsistency = calculateConsistency(results.map(r => r.results.filter(res => res.success).map(res => res.duration)));
  return (successRate * 50) + (durationConsistency * 50);
}

function calculateConsistency(values) {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  return 1 / (1 + (Math.sqrt(variance) / mean)); // Lower variance = higher consistency
}
```

**Scenario 2: Performance Regression Detection**
```typescript
// Establish performance baseline
const baselineBenchmark = await benchmarkService.runBenchmark(
  "task-enhancement-baseline",
  {
    taskId: "regression-test-task",
    aiOptions: { aiProvider: "anthropic", aiModel: "claude-3-5-sonnet" }
  },
  {
    iterations: 5,
    metrics: ["duration", "tokenUsage", "success"]
  }
);

console.log("Baseline established:", baselineBenchmark.summary.averageDuration);

// Later, test for regressions
const regressionTest = await benchmarkService.runBenchmark(
  "task-enhancement-regression-test",
  {
    taskId: "regression-test-task",
    aiOptions: { aiProvider: "anthropic", aiModel: "claude-3-5-sonnet" }
  },
  {
    iterations: 5,
    metrics: ["duration", "tokenUsage", "success"],
    compareWith: [baselineBenchmark.id] // Compare with baseline
  },
  (event) => {
    if (event.type === 'completed' && event.summary.comparisons) {
      event.summary.comparisons.forEach(comp => {
        if (comp.performanceDiff < -15) { // >15% slower
          console.error(`🚨 REGRESSION: ${comp.performanceDiff}% slower than ${comp.benchmarkId}`);
        }
      });
    }
  }
);

const { summary } = regressionTest;
const performanceChange = ((summary.averageDuration - baselineBenchmark.summary.averageDuration) / baselineBenchmark.summary.averageDuration) * 100;

if (performanceChange > 10) {
  console.error(`🚨 PERFORMANCE REGRESSION: +${performanceChange.toFixed(1)}% slower than baseline`);
} else if (performanceChange < -10) {
  console.log(`✅ PERFORMANCE IMPROVEMENT: ${performanceChange.toFixed(1)}% faster than baseline`);
} else {
  console.log(`✅ PERFORMANCE STABLE: ${performanceChange.toFixed(1)}% change from baseline`);
}
```

**Scenario 3: Continuous Performance Monitoring**
```typescript
// Set up automated performance monitoring
const monitoringConfig = {
  operations: [
    { name: "daily-task-creation", schedule: "0 9 * * *" }, // Daily at 9 AM
    { name: "weekly-prd-generation", schedule: "0 10 * * 1" }, // Weekly Monday 10 AM
    { name: "monthly-comprehensive", schedule: "0 9 1 * *" } // Monthly 1st at 9 AM
  ],
  aiOptions: { aiProvider: "anthropic", aiModel: "claude-3-5-sonnet" },
  iterations: 3,
  alertThresholds: {
    performanceDegradation: 20, // 20% slower than baseline
    failureRate: 10,         // >10% failure rate
    tokenUsage: 1000         // >1000 tokens per operation
  }
};

// Simulate continuous monitoring (in real implementation, this would be scheduled)
console.log("Starting continuous performance monitoring...");

for (const operation of monitoringConfig.operations) {
  console.log(`\nRunning ${operation.name} benchmark...`);
  
  const result = await benchmarkService.runBenchmark(
    operation.name,
    getOperationInput(operation.name),
    {
      iterations: monitoringConfig.iterations,
      metrics: ["duration", "tokenUsage", "success", "outputQuality"],
      compareWith: getBaselineForOperation(operation.name)
    },
    (event) => {
      if (event.type === 'completed') {
        analyzeAndAlert(operation.name, event.summary, monitoringConfig.alertThresholds);
      }
    }
  );
  
  console.log(`Completed ${operation.name}: ${result.summary.successRate * 100}% success rate`);
}

function getOperationInput(operationName) {
  // Return appropriate test input for each operation type
  const inputs = {
    "daily-task-creation": { title: "Daily Test Task", content: "Automated performance test" },
    "weekly-prd-generation": { description: "Weekly performance test PRD" },
    "monthly-comprehensive": { description: "Monthly comprehensive performance evaluation" }
  };
  return inputs[operationName] || {};
}

function getBaselineForOperation(operationName) {
  // Get recent baseline for comparison
  const runs = benchmarkService.listRuns();
  const operationRuns = runs.filter(run => run.command.includes(operationName));
  
  if (operationRuns.length === 0) return [];
  
  // Sort by date and get most recent successful run
  operationRuns.sort((a, b) => b.timestamp - a.timestamp);
  const recentSuccessful = operationRuns.find(run => {
    const stored = benchmarkService.getRun(run.id);
    return stored && stored.summary.successRate > 0.8; // >80% success rate
  });
  
  return recentSuccessful ? [recentSuccessful.id] : [];
}

function analyzeAndAlert(operationName, summary, thresholds) {
  console.log(`\nPerformance Analysis for ${operationName}:`);
  
  // Check performance degradation
  const baselineRuns = benchmarkService.listRuns().filter(run => 
    run.command.includes(operationName) && run.timestamp < (Date.now() - 7 * 24 * 60 * 60 * 1000)
  );
  
  if (baselineRuns.length > 0) {
    const baselineAvg = baselineRuns.reduce((sum, run) => {
      const stored = benchmarkService.getRun(run.id);
      return sum + (stored?.summary.averageDuration || 0);
    }, 0) / baselineRuns.length;
    
    const performanceChange = ((summary.averageDuration - baselineAvg) / baselineAvg) * 100;
    
    if (performanceChange > thresholds.performanceDegradation) {
      console.error(`🚨 ALERT: Performance degraded by ${performanceChange.toFixed(1)}%`);
    } else if (performanceChange < -thresholds.performanceDegradation) {
      console.log(`✅ IMPROVEMENT: Performance improved by ${Math.abs(performanceChange).toFixed(1)}%`);
    }
  }
  
  // Check failure rate
  if (summary.successRate < (1 - thresholds.failureRate / 100)) {
    console.error(`🚨 ALERT: High failure rate: ${Math.round((1 - summary.successRate) * 100)}%`);
  }
  
  // Check token usage
  if (summary.totalTokens && summary.totalTokens > thresholds.tokenUsage) {
    console.error(`🚨 ALERT: High token usage: ${summary.totalTokens} tokens`);
  }
}
```

### TECHNICAL SPECIFICATIONS

**Storage Format:**
Benchmark results are stored in JSON format with the following structure:
```json
{
  "id": "benchmark-uuid",
  "operationId": "operation-type",
  "timestamp": 1642230400000,
  "config": {
    "iterations": 3,
    "metrics": ["duration", "tokenUsage", "success"]
  },
  "input": { /* operation-specific input */ },
  "results": [
    {
      "iteration": 1,
      "success": true,
      "duration": 2500,
      "tokenUsage": { "prompt": 1000, "completion": 500, "total": 1500 },
      "output": { /* operation result */ }
    }
  ],
  "summary": {
    "totalIterations": 3,
    "successfulIterations": 3,
    "failedIterations": 0,
    "averageDuration": 2450,
    "minDuration": 2200,
    "maxDuration": 2700,
    "totalTokens": 4500,
    "averageTokens": 1500,
    "successRate": 1.0
  }
}
```

**Performance Metrics:**
- **Duration**: Time taken for operation completion
- **Token Usage**: AI model token consumption
- **Success Rate**: Percentage of successful operations
- **Quality Score**: Consistency and output quality metrics
- **Comparison**: Performance difference from baseline
- **Stability**: Variance and coefficient of variation

**Error Handling:**
- Graceful degradation for partial failures
- Detailed error logging with context
- Automatic retry for transient failures
- Comprehensive error reporting

**Performance Optimization:**
- Minimal overhead measurement
- Efficient result storage and retrieval
- Concurrent benchmark execution support
- Memory-conscious operation handling

**Integration Points:**
- Direct integration with all task-o-matic services
- Compatible with existing storage systems
- Extensible metric collection framework
- Real-time progress reporting

**Security Considerations:**
- Isolated benchmark execution environments
- No access to sensitive production data
- Secure storage of performance metrics
- Sanitized input validation

**Remember:** Citizen, BenchmarkService is your performance compass in the wasteland of AI operations. Use it to track performance, detect regressions, and make data-driven decisions about model selection. Regular benchmarking will keep your projects performing optimally even as the technical landscape shifts. Measure everything, trust the data, and your systems will remain efficient and reliable.