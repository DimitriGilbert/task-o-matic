# VAULT-TEC BENCHMARKSERVICE MANUAL
## S.P.E.C.I.A.L. ATTRIBUTE: CHARISMA

**WARNING:** This manual contains classified Vault-Tec proprietary information. Distribution is restricted to authorized Vault personnel only. Unauthorized access may result in reassignment to radioactive puppet show duty.

---

## 🎭 CHAPTER 1: CHARISMA - THE ART OF IMPRESSING OVERSEERS

Welcome, Vault Dweller! The **BenchmarkService** class represents the **CHARISMA** attribute in your Vault's S.P.E.C.I.A.L. system - the magnetic personality that allows you to impress Overseers with stunning performance metrics and model comparisons. Just as Charisma helps you negotiate better trades in the wasteland, BenchmarkService helps you negotiate the best AI models for your Vault's operations.

**Did You Know?** A properly executed benchmark can increase your Vault's efficiency rating by up to 47%! Overseers love charts and metrics - they're almost as impressive as a working Pip-Boy!

---

## 🛠️ CHAPTER 2: VAULT-TEC BENCHMARKING LAB SETUP

### 2.1 INITIALIZING YOUR BENCHMARKSERVICE STAGE

```typescript
import { BenchmarkService } from "task-o-matic";

// Standard Vault-Tec issue BenchmarkService
const benchmarkService = new BenchmarkService();

// The singleton instance - preferred for official Vault operations
import { benchmarkService } from "task-o-matic";
```

**VAULT-TEC SAFETY WARNING:** Always ensure your AI API keys are properly configured before benchmarking. Failed benchmarks are as embarrassing as telling a Super Mutant joke - nobody laughs and you might lose a limb!

---

## 📊 CHAPTER 3: CORE BENCHMARKING OPERATIONS - THE PERFORMANCE SHOW

### 3.1 RUN BENCHMARK - THE MAIN EVENT

The `runBenchmark` method is your spotlight moment - where AI models compete for the glory of being the fastest, most accurate, and most cost-effective performer in your Vault.

#### Basic Performance Comparison
```typescript
// Compare different models on PRD parsing
const benchmarkRun = await benchmarkService.runBenchmark(
  "prd-parse", // Operation to test
  {
    file: "vault-expansion-prd.md",
    workingDirectory: "/vault/projects",
    tools: true
  },
  {
    models: [
      { provider: "anthropic", model: "claude-3-5-sonnet" },
      { provider: "openai", model: "gpt-4" },
      { provider: "openrouter", model: "anthropic/claude-3.5-sonnet" }
    ],
    concurrency: 2, // Run 2 models simultaneously
    delay: 1000    // Wait 1 second between starts
  },
  (event) => {
    // Watch the performance in real-time!
    console.log(`Model ${event.modelId}: ${event.type}`);
    if (event.type === "progress") {
      console.log(`  Speed: ${event.currentBps} bytes/sec`);
    }
  }
);

console.log(`Benchmark completed in ${benchmarkRun.results.length} races`);
```

#### Advanced Model Configuration with Reasoning
```typescript
// Test models with different reasoning token levels
const advancedBenchmark = await benchmarkService.runBenchmark(
  "task-create",
  {
    title: "Design fusion reactor cooling system",
    content: "Create advanced cooling system for new fusion reactor"
  },
  {
    models: [
      { provider: "anthropic", model: "claude-3-5-sonnet", reasoningTokens: 0 },
      { provider: "anthropic", model: "claude-3-5-sonnet", reasoningTokens: 1024 },
      { provider: "anthropic", model: "claude-3-5-sonnet", reasoningTokens: 2048 }
    ],
    concurrency: 1, // Sequential to avoid API rate limits
    delay: 2000
  }
);
```

**VAULT-TEC PRO TIP:** Use progress events to create impressive real-time dashboards! Overseers love watching bars fill up and numbers climb - it's almost as entertaining as the pre-war television!

### 3.2 GET RUN - REVIEWING PAST PERFORMANCES

```typescript
// Get detailed results from a previous benchmark
const runId = "run-1699876543210";
const pastRun = benchmarkService.getRun(runId);

if (pastRun) {
  console.log(`Benchmark from ${new Date(pastRun.timestamp).toLocaleDateString()}`);
  console.log(`Operation: ${pastRun.command}`);
  
  // Find the winner!
  const winner = pastRun.results.reduce((best, current) => 
    current.duration < best.duration ? current : best
  );
  
  console.log(`🏆 Fastest model: ${winner.modelId} (${winner.duration}ms)`);
  
  // Analyze cost efficiency
  const costEfficient = pastRun.results
    .filter(r => r.cost)
    .reduce((best, current) => current.cost! < best.cost! ? current : best);
    
  console.log(`💰 Most cost-effective: ${costEfficient.modelId} ($${costEfficient.cost})`);
}
```

### 3.3 LIST RUNS - THE HALL OF FAME

```typescript
// Get all benchmark performances - sorted by recency
const allRuns = benchmarkService.listRuns();

console.log("=== VAULT BENCHMARK HALL OF FAME ===");
allRuns.forEach(run => {
  const date = new Date(run.timestamp).toLocaleDateString();
  console.log(`${date}: ${run.command} (${run.id})`);
});

// Find recent PRD benchmarks
const recentPRDBenchmarks = allRuns
  .filter(run => run.command.includes("prd"))
  .slice(0, 5); // Last 5 PRD benchmarks
```

---

## 🎯 CHAPTER 4: AVAILABLE BENCHMARK OPERATIONS

The BenchmarkService supports various operations to test different aspects of your AI models. Each operation is like a different event in the Vault Olympics!

### 4.1 PRD OPERATIONS - DOCUMENTATION ATHLETICS

| Operation ID | Name | Description | Test Input |
|--------------|------|-------------|------------|
| `prd-parse` | PRD Parsing | Parse PRD files into tasks | `{ file, workingDirectory, tools }` |
| `prd-rework` | PRD Rework | Improve PRDs based on feedback | `{ file, feedback, workingDirectory }` |
| `prd-create` | PRD Creation | Generate PRDs from descriptions | `{ description, outputDir, filename }` |
| `prd-combine` | PRD Combination | Merge multiple PRDs | `{ prds, originalDescription }` |
| `prd-question` | PRD Questions | Generate clarifying questions | `{ file, workingDirectory }` |
| `prd-refine` | PRD Refinement | Q&A-based PRD improvement | `{ file, questionMode, answers }` |

### 4.2 TASK OPERATIONS - WORKOUT CHALLENGES

| Operation ID | Name | Description | Test Input |
|--------------|------|-------------|------------|
| `task-create` | Task Creation | Create AI-enhanced tasks | `{ title, content, parentId }` |
| `task-enhance` | Task Enhancement | Improve existing tasks | `{ taskId }` |
| `task-breakdown` | Task Breakdown | Split tasks into subtasks | `{ taskId }` |
| `task-plan` | Task Planning | Generate implementation plans | `{ taskId }` |
| `task-document` | Task Documentation | Research and document tasks | `{ taskId, force }` |

### 4.3 WORKFLOW OPERATIONS - DECATHLON EVENTS

| Operation ID | Name | Description | Test Input |
|--------------|------|-------------|------------|
| `workflow-full` | Complete Workflow | Full project lifecycle | `WorkflowBenchmarkInput` |

---

## 📈 CHAPTER 5: PERFORMANCE METRICS ANALYSIS

### 5.1 UNDERSTANDING BENCHMARK RESULTS

Each benchmark result provides comprehensive metrics to help you make informed decisions:

```typescript
// Analyze a single benchmark result
const analyzeResult = (result: BenchmarkResult) => {
  console.log(`=== MODEL PERFORMANCE REPORT ===`);
  console.log(`Model: ${result.modelId}`);
  console.log(`Duration: ${result.duration}ms`);
  
  if (result.tokenUsage) {
    console.log(`Tokens: ${result.tokenUsage.total} (${result.tokenUsage.prompt} prompt + ${result.tokenUsage.completion} completion)`);
  }
  
  if (result.responseSize) {
    console.log(`Response size: ${result.responseSize} bytes`);
    console.log(`Speed: ${result.bps} bytes/sec`);
  }
  
  if (result.tps) {
    console.log(`Token speed: ${result.tps} tokens/sec`);
  }
  
  if (result.timeToFirstToken) {
    console.log(`Time to first token: ${result.timeToFirstToken}ms`);
  }
  
  if (result.cost) {
    console.log(`Estimated cost: $${result.cost.toFixed(6)}`);
  }
  
  if (result.error) {
    console.log(`❌ ERROR: ${result.error}`);
  }
};
```

### 5.2 COMPARING MODELS - THE POPULARITY CONTEST

```typescript
// Compare models across multiple metrics
const compareModels = (results: BenchmarkResult[]) => {
  const validResults = results.filter(r => !r.error);
  
  if (validResults.length === 0) {
    console.log("All models failed - check your API keys!");
    return;
  }
  
  // Speed comparison
  const fastest = validResults.reduce((best, current) => 
    current.duration < best.duration ? current : best
  );
  
  // Cost efficiency (if cost data available)
  const costResults = validResults.filter(r => r.cost);
  const mostEfficient = costResults.length > 0 
    ? costResults.reduce((best, current) => current.cost! < best.cost! ? current : best)
    : null;
  
  // Token efficiency (if token data available)
  const tokenResults = validResults.filter(r => r.tokenUsage);
  const tokenEfficient = tokenResults.length > 0
    ? tokenResults.reduce((best, current) => {
        const bestTokensPerDollar = best.tokenUsage!.total / (best.cost || 0.001);
        const currentTokensPerDollar = current.tokenUsage!.total / (current.cost || 0.001);
        return currentTokensPerDollar > bestTokensPerDollar ? current : best;
      })
    : null;
  
  console.log("🏆 MODEL COMPARISON RESULTS:");
  console.log(`Fastest: ${fastest.modelId} (${fastest.duration}ms)`);
  
  if (mostEfficient) {
    console.log(`Most Cost-Effective: ${mostEfficient.modelId} ($${mostEfficient.cost?.toFixed(6)})`);
  }
  
  if (tokenEfficient) {
    const tokensPerDollar = tokenEfficient.tokenUsage!.total / (tokenEfficient.cost || 0.001);
    console.log(`Most Token-Efficient: ${tokenEfficient.modelId} (${tokensPerDollar.toFixed(0)} tokens/$)`);
  }
};
```

---

## 🎪 CHAPTER 6: ADVANCED BENCHMARKING TECHNIQUES

### 6.1 CUSTOM BENCHMARK WORKFLOWS

```typescript
// Create a comprehensive model evaluation suite
const comprehensiveEvaluation = async () => {
  const testModels = [
    { provider: "anthropic", model: "claude-3-5-sonnet" },
    { provider: "openai", model: "gpt-4" },
    { provider: "openrouter", model: "anthropic/claude-3.5-sonnet" }
  ];
  
  const config = {
    models: testModels,
    concurrency: 1,
    delay: 2000
  };
  
  // Test different operations
  const operations = [
    {
      id: "task-create",
      input: { title: "Fix water purifier", content: "Main purifier is leaking" }
    },
    {
      id: "prd-parse", 
      input: { file: "sample-prd.md", workingDirectory: "/vault/test" }
    },
    {
      id: "task-enhance",
      input: { taskId: "1" } // Assumes task exists
    }
  ];
  
  const results = [];
  
  for (const operation of operations) {
    console.log(`Testing ${operation.id}...`);
    try {
      const run = await benchmarkService.runBenchmark(
        operation.id,
        operation.input,
        config
      );
      results.push(run);
      
      // Brief analysis
      const validResults = run.results.filter(r => !r.error);
      if (validResults.length > 0) {
        const avgDuration = validResults.reduce((sum, r) => sum + r.duration, 0) / validResults.length;
        console.log(`  Average duration: ${avgDuration.toFixed(0)}ms`);
        console.log(`  Success rate: ${(validResults.length / run.results.length * 100).toFixed(0)}%`);
      }
    } catch (error) {
      console.error(`  Failed: ${error.message}`);
    }
  }
  
  return results;
};
```

### 6.2 PERFORMANCE TREND ANALYSIS

```typescript
// Track model performance over time
const trackPerformanceTrends = () => {
  const runs = benchmarkService.listRuns();
  
  // Group by operation and model
  const trends: Record<string, Record<string, number[]>> = {};
  
  runs.forEach(run => {
    if (!trends[run.command]) {
      trends[run.command] = {};
    }
    
    const fullRun = benchmarkService.getRun(run.id);
    if (fullRun) {
      fullRun.results.forEach(result => {
        if (!result.error) {
          if (!trends[run.command][result.modelId]) {
            trends[run.command][result.modelId] = [];
          }
          trends[run.command][result.modelId].push(result.duration);
        }
      });
    }
  });
  
  // Calculate trends
  Object.entries(trends).forEach(([operation, models]) => {
    console.log(`\n=== ${operation.toUpperCase()} PERFORMANCE TRENDS ===`);
    
    Object.entries(models).forEach(([modelId, durations]) => {
      if (durations.length >= 2) {
        const recent = durations.slice(-3); // Last 3 runs
        const earlier = durations.slice(0, -3); // Earlier runs
        
        const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
        const earlierAvg = earlier.length > 0 
          ? earlier.reduce((a, b) => a + b, 0) / earlier.length 
          : recentAvg;
        
        const change = ((recentAvg - earlierAvg) / earlierAvg * 100).toFixed(1);
        const trend = parseFloat(change) > 0 ? "📈" : "📉";
        
        console.log(`${modelId}: ${trend} ${change}% (${recentAvg.toFixed(0)}ms avg)`);
      }
    });
  });
};
```

---

## ⚠️ CHAPTER 7: TROUBLESHOOTING - BENCHMARK DISASTER RECOVERY

### 7.1 COMMON BENCHMARKING MALFUNCTIONS

#### Operation Not Found Error
```
Error: Operation 'invalid-operation' not found
```

**Solution:** Check the available operations in Chapter 4. Valid operations include: `prd-parse`, `task-create`, `workflow-full`, etc.

#### Invalid Input Error
```
Error: Invalid input for operation prd-parse
```

**Solution:** Verify your input structure matches the operation requirements. Each operation has specific validation rules.

#### API Rate Limiting
```
Error: Too Many Requests - API rate limit exceeded
```

**Solution:** Increase the `delay` parameter in your config and reduce `concurrency`. Remember: even Overseers need to catch their breath!

### 7.2 BENCHMARK RECOVERY PROCEDURES

```typescript
// Safe benchmark execution with error handling
const safeBenchmark = async (operationId: string, input: any, config: BenchmarkConfig) => {
  try {
    const run = await benchmarkService.runBenchmark(operationId, input, config, (event) => {
      if (event.type === "error") {
        console.warn(`Model ${event.modelId} failed: ${event.error}`);
      }
    });
    
    // Analyze success rate
    const successful = run.results.filter(r => !r.error);
    const successRate = (successful.length / run.results.length) * 100;
    
    console.log(`Benchmark completed: ${successRate.toFixed(0)}% success rate`);
    
    if (successRate < 50) {
      console.warn("⚠️ Low success rate - check API configuration");
    }
    
    return run;
    
  } catch (error) {
    console.error("❌ Benchmark failed completely:", error.message);
    
    // Fallback: test with a single model
    console.log("Attempting fallback with single model...");
    const fallbackConfig = { ...config, models: [config.models[0]], concurrency: 1 };
    
    return await benchmarkService.runBenchmark(operationId, input, fallbackConfig);
  }
};
```

---

## 🎯 CHAPTER 8: OPTIMIZATION STRATEGIES - MAXIMIZING CHARISMA

### 8.1 MODEL SELECTION GUIDELINES

| Use Case | Recommended Model | Reasoning |
|----------|-------------------|-----------|
| Fast Task Creation | OpenAI GPT-4 | Lowest latency for simple operations |
| Complex PRD Analysis | Anthropic Claude-3.5-Sonnet | Better understanding of complex documents |
| Cost-Sensitive Operations | OpenRouter Anthropic | Best cost-to-performance ratio |
| High Accuracy Requirements | Claude-3.5-Sonnet with reasoning | Superior analytical capabilities |

### 8.2 BENCHMARKING BEST PRACTICES

1. **Start Small**: Test with simple operations before complex workflows
2. **Monitor Costs**: Set budgets and track usage during benchmarks
3. **Use Progress Events**: Create real-time dashboards for impressive presentations
4. **Cache Results**: Store successful benchmarks to avoid repeated testing
5. **Test Consistency**: Run each test multiple times to account for API variability

```typescript
// Optimal benchmark configuration for different scenarios
const getOptimalConfig = (scenario: "speed" | "cost" | "quality") => {
  const baseModels = [
    { provider: "anthropic", model: "claude-3-5-sonnet" },
    { provider: "openai", model: "gpt-4" },
    { provider: "openrouter", model: "anthropic/claude-3.5-sonnet" }
  ];
  
  switch (scenario) {
    case "speed":
      return {
        models: baseModels,
        concurrency: 3, // Maximum parallel execution
        delay: 500      // Minimal delay
      };
      
    case "cost":
      return {
        models: [
          { provider: "openrouter", model: "anthropic/claude-3.5-sonnet" },
          { provider: "openrouter", model: "openai/gpt-4" }
        ],
        concurrency: 1,
        delay: 1000
      };
      
    case "quality":
      return {
        models: [
          { provider: "anthropic", model: "claude-3-5-sonnet", reasoningTokens: 2048 },
          { provider: "anthropic", model: "claude-3-5-sonnet", reasoningTokens: 1024 },
          { provider: "anthropic", model: "claude-3-5-sonnet", reasoningTokens: 0 }
        ],
        concurrency: 1,
        delay: 2000
      };
      
    default:
      return { models: baseModels, concurrency: 2, delay: 1000 };
  }
};
```

---

## 📋 CHAPTER 9: QUICK REFERENCE - VAULT TECHNICIAN'S CHEAT SHEET

### Essential BenchmarkService Methods

```typescript
// Core Operations
await benchmarkService.runBenchmark(operationId, input, config, onProgress);
benchmarkService.getRun(runId);
benchmarkService.listRuns();

// Benchmark Configuration
const config: BenchmarkConfig = {
  models: [
    { provider: "anthropic", model: "claude-3-5-sonnet", reasoningTokens?: number }
  ],
  concurrency: number, // Parallel executions
  delay: number        // Delay between starts (ms)
};

// Progress Event Types
type BenchmarkProgressEvent = {
  type: "start" | "progress" | "complete" | "error";
  modelId: string;
  duration?: number;
  error?: string;
  currentSize?: number;
  currentBps?: number;
  chunk?: string;
};
```

### Available Operations

```typescript
// PRD Operations
"prd-parse"      // Parse PRD files
"prd-rework"     // Improve PRDs with feedback
"prd-create"     // Generate new PRDs
"prd-combine"    // Merge multiple PRDs
"prd-question"   // Generate clarifying questions
"prd-refine"     // Q&A-based refinement

// Task Operations  
"task-create"    // Create AI-enhanced tasks
"task-enhance"   // Improve existing tasks
"task-breakdown" // Split into subtasks
"task-plan"      // Generate plans
"task-document"  // Research documentation

// Workflow Operations
"workflow-full"  // Complete project lifecycle
```

---

## 🚨 CHAPTER 10: EMERGENCY PROTOCOLS

### RED ALERT PROCEDURES

1. **API Key Compromise**: Immediately rotate all API keys and clear benchmark cache
2. **Cost Overrun**: Implement spending limits and switch to cost-optimized configurations
3. **Performance Degradation**: Switch to sequential execution and increase delays
4. **Complete Service Failure**: Fall back to manual model selection without benchmarking

### VAULT-TEC FINAL WORDS

Remember, Vault Dweller: The BenchmarkService is your Charisma in the competitive world of AI model selection. Use it to impress your Overseers, optimize your Vault's efficiency, and always choose the right tool for the job.

**Impressive metrics lead to promotions!**

---

*Vault-Tec is not responsible for model inferiority complexes, API provider bankruptcies, or vault failures resulting from poor benchmarking decisions. Please consult your Vault Overseer before making critical model selections.*

**Document Classification:** TOP SECRET // VAULT-TEC PROPRIETARY  
**Manual Version:** 1.0.0  
**Last Updated:** Pre-War Era  
**Next Review:** After the next AI model war