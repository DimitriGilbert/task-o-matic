## TECHNICAL BULLETIN NO. 005
### BENCHMARK COMMANDS - PERFORMANCE ANALYSIS FIELD OPERATIONS

**DOCUMENT ID:** `task-o-matic-cli-benchmark-commands-v2`
**CLEARANCE:** `All Personnel`
**MANDATORY COMPLIANCE:** `Yes`

### ⚠️ CRITICAL SURVIVAL NOTICE
Citizen, benchmark commands are your intelligence gathering tools in the post-deadline wasteland. Without proper performance analysis, you're flying blind into AI provider selection storms. These commands provide the data needed to make informed decisions about which AI models and tools will keep your projects alive.

The benchmark system has been upgraded with Git Branch Isolation capabilities. This means you can now test different AI models in isolation—each model gets its own temporary branch. No cross-contamination. No overwritten work. Pure, comparative analysis in the safety of your own bunker.

### COMMAND ARCHITECTURE OVERVIEW
The benchmark command group represents the performance analysis and optimization layer of Task-O-Matic. It provides comprehensive testing capabilities across multiple AI providers, models, and workflows. The architecture supports concurrent testing, progressive model escalation, and detailed performance metrics collection.

**Performance Analysis Components:**
- **Multi-Provider Testing**: Compare performance across OpenRouter, Anthropic, OpenAI, and custom endpoints
- **Model Benchmarking**: Detailed performance metrics for individual AI models
- **Workflow Analysis**: End-to-end workflow performance across complete project lifecycles
- **Execution Benchmarking**: Git Branch Isolation for safe, concurrent model testing
- **Loop Benchmarking**: Batch task execution with progressive model escalation
- **Comprehensive Metrics**: Latency, throughput, cost, and quality measurements

### COMPLETE BENCHMARK COMMAND DOCUMENTATION

## RUN COMMAND
**Command:** `task-o-matic benchmark run`

### COMMAND SIGNATURE
```bash
task-o-matic benchmark run <operation> --models <list> [options]
```

### REQUIRED ARGUMENTS
```bash
<operation>                  # Operation to benchmark (prd-parse, task-breakdown, task-create, prd-create, etc.)
<models>                    # Comma-separated list of models (required)
```

### REQUIRED OPTIONS
```bash
--models <list>              # Comma-separated list of models (provider:model[:reasoning=<tokens>])
```

### GENERAL OPTIONS
```bash
--file <path>                # Input file path (for PRD ops)
--task-id <id>               # Task ID (for Task ops)
--concurrency <number>        # Max concurrent requests (default: 5)
--delay <number>               # Delay between requests in ms (default: 250)
--prompt <prompt>             # Override prompt
--message <message>           # User message
--tools                      # Enable filesystem tools
--feedback <feedback>         # Feedback (for prd-rework)
```

### TASK CREATION OPTIONS
```bash
--title <title>              # Task title (for task-create)
--content <content>           # Task content (for task-create)
--parent-id <id>             # Parent task ID (for task-create)
--effort <effort>            # Effort estimate: small, medium, large (for task-create)
--force                      # Force operation (for task-document)
```

### PRD CREATION OPTIONS
```bash
--description <desc>          # Project/PRD description (for prd-create, prd-combine)
--output-dir <dir>           # Output directory (for prd-create, prd-combine)
--filename <name>            # Output filename (for prd-create, prd-combine)
```

### PRD PROCESSING OPTIONS
```bash
--prds <list>                # Comma-separated list of PRD file paths (for prd-combine)
```

### PRD REFINEMENT OPTIONS
```bash
--question-mode <mode>        # Question mode: user or ai (for prd-refine)
--answers <json>              # JSON string of answers (for prd-refine user mode)
```

### BENCHMARK RUN EXAMPLES

#### Basic Benchmarking
```bash
# Simple PRD parsing benchmark
task-o-matic benchmark run prd-parse \
  --models "anthropic:claude-3.5-sonnet,openai:gpt-4"

# Task creation benchmark
task-o-matic benchmark run task-create \
  --models "openrouter:anthropic/claude-3.5-sonnet,openrouter:openai/gpt-4o" \
  --title "Build radiation detector" \
  --content "Implement Geiger counter integration" \
  --effort medium

# PRD creation benchmark
task-o-matic benchmark run prd-create \
  --models "anthropic:claude-3.5-sonnet,openai:gpt-4,google:gemini-pro" \
  --description "Emergency shelter management system"
```

#### Advanced Benchmarking with Reasoning
```bash
# Benchmark with reasoning tokens
task-o-matic benchmark run task-breakdown \
  --models "openrouter:anthropic/claude-3.5-sonnet:reasoning=2048,openrouter:openai/o1-preview:reasoning=8192" \
  --task-id task-complex-123 \
  --tools

# Multi-model PRD generation with reasoning
task-o-matic benchmark run prd-create \
  --models "anthropic:claude-opus-2024:reasoning=4096,openrouter:anthropic/claude-3.5-sonnet:reasoning=2048" \
  --description "AI-powered emergency response system"

# Task enhancement with reasoning
task-o-matic benchmark run task-enhance \
  --models "openrouter:anthropic/claude-3.5-sonnet:reasoning=1024" \
  --task-id task-123 \
  --tools
```

### MODEL FORMAT SPECIFICATIONS

#### Basic Model Format
```bash
provider:model
```

#### Model Format Examples
```bash
# Anthropic models
anthropic:claude-3.5-sonnet
anthropic:claude-opus-2024

# OpenAI models
openai:gpt-4
openai:gpt-4-turbo
openai:o1-preview

# OpenRouter models
openrouter:anthropic/claude-3.5-sonnet
openrouter:openai/gpt-4o
openrouter:google/gemini-2.0-flash-exp

# Custom endpoints
custom:http://localhost:8080/v1/custom-model
```

#### Advanced Model Format with Reasoning
```bash
provider:model:reasoning=<tokens>
```

#### Reasoning Examples
```bash
# OpenRouter with reasoning
openrouter:anthropic/claude-3.5-sonnet:reasoning=2048
openrouter:openai/o1-preview:reasoning=8192
openrouter:google/gemini-2.0-flash-exp:reasoning=4096

# OpenAI with reasoning (if supported)
openai:o1-preview:reasoning=4096
```

### BENCHMARK RUN OUTPUT FORMAT

#### Real-time Progress Display
```
Benchmark Progress:
- anthropic:claude-3.5-sonnet: Starting...
- openai:gpt-4: Running... Size: 2048 B, Speed: 15.2 B/s
- anthropic:claude-3.5-sonnet: Completed (2340ms)
- openai:gpt-4: Completed (3120ms)
```

#### Final Results Table
```
Model                                     | Duration | TTFT    | Tokens   | TPS     | BPS     | Size     | Cost
-------------------------------------------|----------|----------|----------|---------|---------|----------|----------
anthropic:claude-3.5-sonnet                | 2340ms   | 120ms    | 1250     | 0.53    | 89      | 208      | $0.004250
openai:gpt-4                              | 3120ms   | 180ms    | 980      | 0.31    | 67      | 195      | $0.039200
openrouter:anthropic/claude-3.5-sonnet     | 2450ms   | 135ms    | 1180     | 0.48    | 85      | 202      | $0.004720
```

### PERFORMANCE METRICS

#### Measured Metrics
- **Duration**: Total execution time in milliseconds
- **TTFT (Time to First Token)**: Response latency measurement
- **Tokens**: Total token usage (prompt + completion)
- **TPS (Tokens Per Second)**: Processing speed measurement
- **BPS (Bytes Per Second)**: Data transfer rate
- **Response Size**: Output size in bytes
- **Cost**: Estimated API cost in USD

#### Metric Calculations
```bash
# TPS Calculation
TPS = Total Tokens / (Duration / 1000)

# BPS Calculation
BPS = Response Size / (Duration / 1000)

# Cost Estimation
Cost = (Prompt Tokens * Prompt Rate) + (Completion Tokens * Completion Rate)
```

### ERROR CONDITIONS
```bash
# Invalid model format
Error: Invalid model format: invalid-model. Expected provider:model[:reasoning=<tokens>]
Solution: Use format "provider:model" or "provider:model:reasoning=tokens"

# Operation not found
Error: Benchmark operation 'invalid-op' not found
Solution: Use 'benchmark operations' to see available operations

# Concurrency limit exceeded
Error: Too many concurrent requests
Solution: Reduce --concurrency value or increase --delay

# Rate limiting
Error: Rate limit exceeded for provider
Solution: Increase --delay between requests
```

## LIST COMMAND
**Command:** `task-o-matic benchmark list`

### COMMAND SIGNATURE
```bash
task-o-matic benchmark list
```

### LIST COMMAND EXAMPLES

#### Basic Listing
```bash
# List all benchmark runs
task-o-matic benchmark list
```

### LIST OUTPUT FORMAT

#### Standard Output
```
Benchmark Runs:
- 2024-01-15_14-30-22_prd-parse (2024-01-15 2:30:22 PM) - prd-parse
- 2024-01-15_13-45-10_task-create (2024-01-15 1:45:10 PM) - task-create
- 2024-01-14_16-20-45_workflow-full (2024-01-14 4:20:45 PM) - workflow-full
```

### BENCHMARK HISTORY ANALYSIS

#### Performance Trends
- **Model Comparison**: Compare performance across different runs
- **Temporal Analysis**: Identify performance changes over time
- **Cost Tracking**: Monitor API usage costs
- **Success Rates**: Track reliability and consistency

#### Run Filtering
```bash
# Filter by operation type
task-o-matic benchmark list | grep prd-parse

# Filter by date range
task-o-matic benchmark list | grep "2024-01-1"

# Filter by model
task-o-matic benchmark list | grep "claude-3.5-sonnet"
```

## OPERATIONS COMMAND
**Command:** `task-o-matic benchmark operations`

### COMMAND SIGNATURE
```bash
task-o-matic benchmark operations
```

### OPERATIONS COMMAND EXAMPLES

#### Basic Operations Listing
```bash
# List all available operations
task-o-matic benchmark operations
```

### OPERATIONS OUTPUT FORMAT

#### Categorized Operations List
```
📊 Available Benchmark Operations

Task Operations:
  task-create          - Create a new task with AI enhancement
  task-enhance        - Enhance an existing task with AI
  task-breakdown      - Break task into subtasks using AI
  task-document       - Fetch and analyze documentation for task

PRD Operations:
  prd-create          - Generate PRD from product description
  prd-parse           - Parse PRD into structured tasks
  prd-rework          - Rework PRD based on feedback
  prd-combine         - Combine multiple PRDs into master PRD
  prd-question        - Generate clarifying questions for PRD
  prd-refine          - Refine PRD by answering questions

Workflow Operations:
  workflow-full       - Complete workflow execution

Total operations: 11
```

#### Example usage:
```
task-o-matic benchmark run task-create --models anthropic:claude-3.5-sonnet --title "Example task"
task-o-matic benchmark run prd-parse --models openai:gpt-4 --file ./prd.md
```

### OPERATION CATEGORIES

#### Task Operations
- **Creation**: AI-powered task generation and enhancement
- **Enhancement**: Task description improvement with Context7
- **Breakdown**: Intelligent task decomposition into subtasks
- **Documentation**: Automatic documentation research and integration

#### PRD Operations
- **Generation**: AI-powered PRD creation from descriptions
- **Parsing**: Structured task extraction from PRD documents
- **Refinement**: PRD improvement through feedback and Q&A
- **Combination**: Multiple PRD synthesis into master documents

#### Workflow Operations
- **End-to-End**: Complete project lifecycle benchmarking
- **Integration**: Cross-component performance measurement

## SHOW COMMAND
**Command:** `task-o-matic benchmark show`

### COMMAND SIGNATURE
```bash
task-o-matic benchmark show <id>
```

### REQUIRED ARGUMENTS
```bash
<id>                        # Run ID to display details for (required)
```

### SHOW COMMAND EXAMPLES

#### Basic Run Display
```bash
# Show benchmark run details
task-o-matic benchmark show 2024-01-15_14-30-22_prd-parse

# Show workflow benchmark details
task-o-matic benchmark show 2024-01-14_16-20-45_workflow-full
```

### SHOW OUTPUT FORMAT

#### Standard Run Display
```
Run: 2024-01-15_14-30-22_prd-parse
Date: 2024-01-15 2:30:22 PM
Command: prd-parse
Input: {"file":"./requirements.md","prompt":"Default PRD parsing prompt","message":"Parse PRD into structured tasks"}
Configuration:
  Concurrency: 5
  Delay: 250ms

Results:

[anthropic:claude-3.5-sonnet]
Duration: 2340ms
TTFT: 120ms
Tokens: 1250 (Prompt: 800, Completion: 450)
Throughput: 89 B/s
Size: 208 bytes
Estimated Cost: $0.004250
Output: {"tasks":[...]}

[openai:gpt-4]
Duration: 3120ms
TTFT: 180ms
Tokens: 980 (Prompt: 750, Completion: 230)
Throughput: 67 B/s
Size: 195 bytes
Estimated Cost: $0.039200
Output: {"tasks":[...]}
```

## COMPARE COMMAND
**Command:** `task-o-matic benchmark compare`

### COMMAND SIGNATURE
```bash
task-o-matic benchmark compare <id>
```

### REQUIRED ARGUMENTS
```bash
<id>                        # Run ID to compare results for (required)
```

### COMPARE COMMAND EXAMPLES

#### Basic Comparison
```bash
# Compare benchmark run results
task-o-matic benchmark compare 2024-01-15_14-30-22_prd-parse

# Compare workflow benchmark
task-o-matic benchmark compare 2024-01-14_16-20-45_workflow-full
```

### COMPARE OUTPUT FORMAT

#### Comparison Table
```
┌─────────────────────────────────────────────┬──────────┬──────────┬────────┬─────────┬────────┐
│ Model                                      │ Status   │ Duration │ Tokens │ BPS     │ Size   │
├─────────────────────────────────────────────┼──────────┼──────────┼────────┼─────────┼────────┤
│ anthropic:claude-3.5-sonnet                │ SUCCESS  │ 2340ms   │ 1250   │ 89      │ 208    │
│ openai:gpt-4                              │ SUCCESS  │ 3120ms   │ 980    │ 67      │ 195    │
└─────────────────────────────────────────────┴──────────┴──────────┴────────┴─────────┴────────┘
```

## EXECUTION COMMAND ⚡ NEW
**Command:** `task-o-matic benchmark execution`

### COMMAND SIGNATURE
```bash
task-o-matic benchmark execution --task-id <id> --models <list> [options]
```

### ⚠️ CRITICAL SURVIVAL FEATURE
Citizen, this is where the Git Branch Isolation system shines. Each AI model gets its own isolated git branch. No cross-contamination. No overwriting your work. Each model operates in a quarantine environment, executing the task independently. When complete, you have multiple branches—one per model—showing how each would have solved the problem. Pick the best. Discard the rest. Survive with optimal code.

### REQUIRED OPTIONS
```bash
--task-id <id>               # Task ID to benchmark (required)
--models <list>              # Comma-separated list of models (provider:model) (required)
```

### EXECUTION OPTIONS
```bash
--verify <command>           # Verification command (can be used multiple times)
--max-retries <number>       # Maximum retries per model (default: 3)
--no-keep-branches          # Delete benchmark branches after run (default: keep)
```

### EXECUTION COMMAND EXAMPLES

#### Basic Execution Benchmark
```bash
# Execute task across multiple models with Git Branch Isolation
task-o-matic benchmark execution \
  --task-id task-123 \
  --models "anthropic:claude-3.5-sonnet,openai:gpt-4,openrouter:google/gemini-2.0-flash-exp"

# Execute with verification commands
task-o-matic benchmark execution \
  --task-id task-123 \
  --models "openrouter:anthropic/claude-3.5-sonnet,openrouter:openai/gpt-4o" \
  --verify "bun test" \
  --verify "bun run build"

# Execute with custom retry settings
task-o-matic benchmark execution \
  --task-id task-complex-456 \
  --models "anthropic:claude-3.5-sonnet:reasoning=4096" \
  --max-retries 5 \
  --no-keep-branches
```

#### Verification Scenarios
```bash
# Test execution with multiple verification checks
task-o-matic benchmark execution \
  --task-id task-auth-789 \
  --models "anthropic:claude-3.5-sonnet,openai:gpt-4" \
  --verify "bun test --coverage" \
  --verify "bun run type-check" \
  --verify "bun run lint"

# Quick execution benchmark (cleanup after)
task-o-matic benchmark execution \
  --task-id task-simple-001 \
  --models "openrouter:google/gemini-2.0-flash-exp" \
  --verify "bun test" \
  --no-keep-branches
```

### EXECUTION OUTPUT FORMAT

#### Real-time Progress Display
```
🚀 Starting Execution Benchmark for Task task-123
Models: 3

- anthropic:claude-3.5-sonnet: Waiting...
- openai:gpt-4: Waiting...
- openrouter:google/gemini-2.0-flash-exp: Waiting...

anthropic:claude-3.5-sonnet: Running...
anthropic:claude-3.5-sonnet: PASS (5432ms)

openai:gpt-4: Running...
openai:gpt-4: PASS (6789ms)

openrouter:google/gemini-2.0-flash-exp: Running...
openrouter:google/gemini-2.0-flash-exp: PASS (4521ms)
```

#### Final Results Summary
```
✓ Execution Benchmark Completed!

Summary:
Model                              | Status       | Branch                                          | Duration
-----------------------------------|--------------|-------------------------------------------------|----------
anthropic:claude-3.5-sonnet        | PASS         | benchmark-execution-task123-claude-3.5-sonnet    | 5432ms
openai:gpt-4                       | PASS         | benchmark-execution-task123-gpt-4               | 6789ms
openrouter:google/gemini-2.0-flash-exp | PASS   | benchmark-execution-task123-gemini-2.0-flash    | 4521ms

Run ID: 2024-01-15_14-30-22_execution-task123
To switch to a branch: git checkout <branch_name>
```

### GIT BRANCH ISOLATION EXPLAINED

#### How It Works
1. **Branch Creation**: Each model gets its own git branch named `benchmark-execution-<taskId>-<modelName>`
2. **Isolation**: All AI execution happens on isolated branches—no impact on your working branch
3. **Verification**: Commands run on each branch independently, validating each solution
4. **Result Comparison**: Switch between branches to compare implementations
5. **Cleanup**: Use `--no-keep-branches` to auto-delete after comparison

#### Branch Switching and Comparison
```bash
# After benchmark completes, switch to any branch to review
git checkout benchmark-execution-task123-claude-3.5-sonnet

# View the changes
git diff main

# Test the solution
bun test

# Switch to another branch to compare
git checkout benchmark-execution-task123-gpt-4

# Merge the best solution to main
git checkout main
git merge benchmark-execution-task123-claude-3.5-sonnet

# Clean up all benchmark branches (if not auto-deleted)
git branch | grep benchmark-execution | xargs git branch -D
```

### EXECUTION PERFORMANCE METRICS

#### Execution Metrics
- **Branch Creation**: Time to create and switch to isolated environment
- **AI Execution**: Actual AI task completion time
- **Verification Time**: Time to run verification commands
- **Total Duration**: End-to-end execution time including all steps
- **Pass/Fail Status**: Whether verification passed or failed
- **Branch Name**: The isolated branch identifier for the model

#### Quality Assessment
- **Verification Pass Rate**: Number of verification commands that passed
- **Code Quality**: Subjective assessment from manual branch review
- **Execution Success**: Whether the task completed without errors
- **Solution Completeness**: How thoroughly the task was addressed

### ERROR CONDITIONS
```bash
# Task ID not found
Error: Task task-123 not found
Solution: Verify task ID using 'task-o-matic tasks list'

# Branch creation failure
Error: Failed to create branch for model anthropic:claude-3.5-sonnet
Solution: Check git repository state, ensure no uncommitted changes

# Verification command failure
Error: Verification command failed for openai:gpt-4
Solution: Review branch output, adjust verification commands

# Concurrency limitation
Error: Execution benchmarks must be serial due to git constraints
Solution: Models execute sequentially (automatically enforced)
```

## EXECUTE-LOOP COMMAND ⚡ NEW
**Command:** `task-o-matic benchmark execute-loop`

### COMMAND SIGNATURE
```bash
task-o-matic benchmark execute-loop --models <list> [options]
```

### ⚠️ CRITICAL SURVIVAL FEATURE
The execute-loop benchmark lets you batch execute multiple tasks across multiple AI models with progressive model escalation. When a task fails on one model, it automatically retries with progressively stronger models. This is your automated escalation protocol—start cheap, escalate only when necessary. Maximum efficiency, minimum waste of resources.

### REQUIRED OPTIONS
```bash
--models <list>              # Comma-separated list of models (provider:model) (required)
```

### TASK FILTERING OPTIONS
```bash
--status <status>             # Filter tasks by status (todo/in-progress/completed)
--tag <tag>                   # Filter tasks by tag
--ids <ids>                   # Comma-separated list of task IDs to execute
```

### EXECUTE-LOOP OPTIONS
```bash
--verify <command>            # Verification command to run after each task (can be used multiple times)
--max-retries <number>        # Maximum number of retries per task (default: 3)
--try-models <models>         # Progressive model/executor configs for each retry
--no-keep-branches           # Delete benchmark branches after run (default: keep)
```

### EXECUTE-LOOP COMMAND EXAMPLES

#### Basic Loop Benchmark
```bash
# Execute all todo tasks across multiple models
task-o-matic benchmark execute-loop \
  --models "anthropic:claude-3.5-sonnet,openai:gpt-4" \
  --status todo

# Execute specific tasks
task-o-matic benchmark execute-loop \
  --models "openrouter:anthropic/claude-3.5-sonnet" \
  --ids "task-1,task-5,task-9"

# Execute tasks by tag
task-o-matic benchmark execute-loop \
  --models "openai:gpt-4o-mini,openai:gpt-4o" \
  --tag frontend
```

#### Advanced Loop with Escalation
```bash
# Execute with progressive model escalation
task-o-matic benchmark execute-loop \
  --models "openrouter:anthropic/claude-3.5-sonnet" \
  --status todo \
  --max-retries 3 \
  --try-models "gpt-4o-mini,gpt-4o,claude-3.5-sonnet" \
  --verify "bun test"

# Execute with multiple verification checks
task-o-matic benchmark execute-loop \
  --models "anthropic:claude-3.5-sonnet" \
  --status in-progress \
  --verify "bun test" \
  --verify "bun run build" \
  --verify "bun run type-check"

# Quick execution with auto-cleanup
task-o-matic benchmark execute-loop \
  --models "openrouter:google/gemini-2.0-flash-exp" \
  --ids "task-1,task-2,task-3" \
  --verify "bun test" \
  --no-keep-branches
```

### EXECUTE-LOOP OUTPUT FORMAT

#### Real-time Progress Display
```
🚀 Starting Execute Loop Benchmark
Models: 2

- anthropic:claude-3.5-sonnet: Waiting...
- openai:gpt-4: Waiting...

anthropic:claude-3.5-sonnet: Running...
anthropic:claude-3.5-sonnet: PASS (4321ms)

openai:gpt-4: Running...
openai:gpt-4: PASS (5678ms)
```

#### Final Results Summary
```
✓ Execute Loop Benchmark Completed!

Summary:
Model                              | Status       | Branch                                          | Duration
-----------------------------------|--------------|-------------------------------------------------|----------
anthropic:claude-3.5-sonnet        | PASS         | benchmark-execute-loop-claude-3.5-sonnet-001    | 4321ms
openai:gpt-4                       | PASS         | benchmark-execute-loop-gpt-4-002               | 5678ms
```

### PROGRESSIVE MODEL ESCALATION

#### Try-Models Format
```bash
--try-models "model1,model2,model3"
```

#### How Escalation Works
1. **Initial Attempt**: Try the cheapest/fastest model first
2. **Verification**: Run verification commands to check quality
3. **Escalate on Failure**: If verification fails, retry with next model
4. **Max Retries**: Stop after max-retries attempts (default: 3)
5. **Branch Isolation**: Each attempt gets its own isolated git branch

#### Escalation Example
```bash
task-o-matic benchmark execute-loop \
  --models "openrouter:anthropic/claude-3.5-sonnet" \
  --status todo \
  --max-retries 3 \
  --try-models "gpt-4o-mini,gpt-4o,claude-3.5-sonnet" \
  --verify "bun test"

# Execution flow:
# Attempt 1: gpt-4o-mini (fast, cheap)
#   - If PASS: Done, cost ~$0.0001
#   - If FAIL: Escalate to gpt-4o

# Attempt 2: gpt-4o (better quality)
#   - If PASS: Done, cost ~$0.0005
#   - If FAIL: Escalate to claude-3.5-sonnet

# Attempt 3: claude-3.5-sonnet (best quality)
#   - If PASS: Done, cost ~$0.003
#   - If FAIL: Mark as failed, review manually
```

### EXECUTE-LOOP PERFORMANCE METRICS

#### Loop Metrics
- **Tasks Processed**: Number of tasks executed
- **Total Attempts**: Sum of all retry attempts across all tasks
- **Pass Rate**: Percentage of tasks that passed verification
- **Average Retries**: Average number of retries per task
- **Cost Efficiency**: Actual cost vs. maximum possible cost (if all tasks used best model)

#### Escalation Analytics
- **First Attempt Success**: Percentage of tasks that passed on first (cheapest) model
- **Escalation Rate**: Percentage of tasks that required model escalation
- **Cost Savings**: Money saved by starting with cheaper models

## WORKFLOW COMMAND
**Command:** `task-o-matic benchmark workflow`

### COMMAND SIGNATURE
```bash
task-o-matic benchmark workflow --models <list> [options]
```

### REQUIRED OPTIONS
```bash
--models <list>              # Comma-separated list of models (provider:model[:reasoning=<tokens>]) (required)
```

### WORKFLOW CONFIGURATION OPTIONS
```bash
--concurrency <number>        # Max concurrent requests (default: 3)
--delay <number>             # Delay between requests in ms (default: 1000)
```

### BENCHMARK SPECIFIC OPTIONS
```bash
--temp-dir <dir>             # Base directory for temporary projects (default: /tmp)
--execute                    # Execute generated tasks in the benchmark
```

### PROJECT INITIALIZATION OPTIONS
```bash
--project-name <name>        # Project name
--init-method <method>       # Initialization method: quick, custom, ai
--project-description <desc> # Project description for AI-assisted init
--frontend <framework>       # Frontend framework
--backend <framework>        # Backend framework
--auth                       # Include authentication
```

### PRD DEFINITION OPTIONS
```bash
--prd-method <method>        # PRD method: upload, manual, ai, skip
--prd-file <path>            # Path to existing PRD file
--prd-description <desc>     # Product description for AI-assisted PRD
```

### TASK GENERATION OPTIONS
```bash
--skip-refine               # Skip PRD refinement
--skip-generate             # Skip task generation
--skip-split                # Skip task splitting
--generate-instructions <instructions> # Custom task generation instructions
--split-instructions <instructions>    # Custom split instructions
```

### WORKFLOW BENCHMARK EXAMPLES

#### Basic Workflow Benchmark
```bash
# Simple workflow benchmark
task-o-matic benchmark workflow \
  --models "anthropic:claude-3.5-sonnet,openai:gpt-4"

# Workflow with custom settings
task-o-matic benchmark workflow \
  --models "openrouter:anthropic/claude-3.5-sonnet,openrouter:openai/gpt-4o" \
  --concurrency 2 \
  --delay 2000
```

#### Advanced Workflow with Execution
```bash
# Multi-model workflow with execution
task-o-matic benchmark workflow \
  --models "anthropic:claude-opus-2024:reasoning=4096,openrouter:anthropic/claude-3.5-sonnet:reasoning=2048" \
  --concurrency 1 \
  --delay 5000 \
  --execute

# Workflow with project specification
task-o-matic benchmark workflow \
  --models "anthropic:claude-3.5-sonnet" \
  --project-name "Wasteland Shelter" \
  --init-method ai \
  --project-description "Emergency shelter management" \
  --skip-refine \
  --skip-split
```

### WORKFLOW BENCHMARK OUTPUT

#### Real-time Progress
```
🚀 Task-O-Matic Workflow Benchmark

Models: 2, Concurrency: 2, Delay: 2000ms

- anthropic:claude-3.5-sonnet: Waiting...
- openai:gpt-4: Waiting...

⚡ Phase 2: Executing Workflows

Running workflow on 2 models...

- anthropic:claude-3.5-sonnet: Starting...
- openai:gpt-4: Starting...

anthropic:claude-3.5-sonnet: Completed (15432ms)
openai:gpt-4: Completed (18921ms)
```

#### Final Results Summary
```
✅ Workflow benchmark completed! Run ID: 2024-01-15_14-30-22_workflow-full

📊 Workflow Benchmark Results

Model                               | Duration | Tasks  | Steps          | Execution
-----------------------------------|----------|--------|----------------|--------------------
anthropic:claude-opus-2024         | 15432ms  | 12     | 5/5            | 12 pass, 0 fail
openrouter:anthropic/claude-3.5-sonnet | 18930ms  | 10     | 5/5            | 10 pass, 0 fail
openrouter:openai/gpt-4o           | 22150ms  | 8      | 5/5            | 8 pass, 0 fail
```

### WORKFLOW PERFORMANCE METRICS

#### Workflow Step Analysis
- **Initialization Time**: Project setup and configuration
- **PRD Generation Time**: PRD creation and processing
- **Task Generation Time**: Task extraction from PRD
- **Task Splitting Time**: Task decomposition into subtasks
- **Total Workflow Time**: End-to-end completion time
- **Execution Results**: If --execute is enabled, shows pass/fail for task execution

#### Quality Assessment
- **Step Completion Rate**: Percentage of workflow steps completed successfully
- **Task Quality**: Number and quality of generated tasks
- **PRD Coherence**: Logical consistency and completeness
- **Integration Success**: How well components work together

### FIELD OPERATIONS PROTOCOLS

#### BENCHMARK LIFECYCLE MANAGEMENT
The benchmark commands implement a complete performance testing lifecycle:

1. **Test Planning Phase**
   - Operation selection and parameter configuration
   - Model selection and format validation
   - Concurrency and delay optimization
   - Test data and input preparation

2. **Execution Phase**
   - Concurrent model execution with rate limiting
   - Real-time progress tracking and status updates
   - Error handling and retry logic
   - Performance metrics collection
   - Git Branch Isolation for execution benchmarks

3. **Analysis Phase**
   - Result aggregation and statistical analysis
   - Performance comparison and ranking
   - Cost analysis and optimization recommendations
   - Error pattern identification and reporting
   - Branch comparison for execution benchmarks

4. **Reporting Phase**
   - Detailed result display with multiple format options
   - Historical trend analysis and comparison
   - Export capabilities for external analysis
   - Branch switching instructions for code review

#### PERFORMANCE OPTIMIZATION STRATEGIES
All benchmark operations support performance optimization through:

- **Model Selection**: Data-driven model recommendations based on historical performance
- **Parameter Tuning**: Automatic optimization of concurrency and delay settings
- **Cost Management**: Real-time cost tracking and budget enforcement
- **Quality Balancing**: Trade-off analysis between speed, cost, and quality
- **Resource Efficiency**: Optimal utilization of system resources
- **Progressive Escalation**: Start cheap, escalate only when necessary

#### INTEGRATION PATTERNS
Benchmark operations integrate with other Task-O-Matic components:

- **Service Integration**: Direct calls to TaskService, PRDService, WorkflowService
- **Configuration Management**: Unified configuration system across all operations
- **Storage Integration**: Results storage in .task-o-matic/benchmark/ directory
- **AI Provider Abstraction**: Consistent interface across all supported AI providers
- **Error Handling**: Standardized error reporting and recovery mechanisms
- **Git Integration**: Branch isolation for safe concurrent execution testing

### SURVIVAL SCENARIOS

#### SCENARIO 1: AI Model Selection for Single Task
```bash
# Benchmark single task execution with Git Branch Isolation
task-o-matic benchmark execution \
  --task-id task-auth-module \
  --models "anthropic:claude-3.5-sonnet,openai:gpt-4,openrouter:google/gemini-2.0-flash-exp" \
  --verify "bun test" \
  --verify "bun run type-check"

# Compare results and pick best implementation
git checkout benchmark-execution-task-auth-module-claude-3.5-sonnet
git diff main

# Review and merge best solution
git checkout main
git merge benchmark-execution-task-auth-module-claude-3.5-sonnet
```

#### SCENARIO 2: Batch Task Execution with Escalation
```bash
# Execute all frontend tasks with progressive model escalation
task-o-matic benchmark execute-loop \
  --models "openrouter:anthropic/claude-3.5-sonnet" \
  --status todo \
  --tag frontend \
  --max-retries 3 \
  --try-models "gpt-4o-mini,gpt-4o,claude-3.5-sonnet" \
  --verify "bun test --coverage" \
  --verify "bun run build"

# Analyze cost savings
# - Simple tasks pass on gpt-4o-mini ($0.0001 each)
# - Medium tasks escalate to gpt-4o ($0.0005 each)
# - Complex tasks escalate to claude-3.5-sonnet ($0.003 each)
# - Overall cost: 30-50% lower than using best model for all tasks
```

#### SCENARIO 3: Complete Workflow Comparison
```bash
# Compare end-to-end workflow across multiple models
task-o-matic benchmark workflow \
  --models "anthropic:claude-3.5-sonnet,openai:gpt-4,openrouter:google/gemini-2.0-flash-exp" \
  --project-name "Emergency Shelter Manager" \
  --init-method ai \
  --project-description "Complete shelter management system with resource tracking" \
  --execute

# Analyze results based on:
# - Total workflow duration
# - Number of tasks generated
# - Task execution pass rate
# - Estimated cost
```

#### SCENARIO 4: Cost Optimization for Large Task Sets
```bash
# Execute 50 tasks with optimal cost strategy
task-o-matic benchmark execute-loop \
  --models "openrouter:google/gemini-2.0-flash-exp" \
  --max-retries 4 \
  --try-models "gemini-2.0-flash-exp,gpt-4o-mini,gpt-4o,claude-3.5-sonnet,claude-opus" \
  --verify "bun test" \
  --no-keep-branches

# Expected breakdown:
# - 60% pass on gemini-2.0-flash-exp (fastest, cheapest)
# - 25% escalate to gpt-4o-mini
# - 10% escalate to gpt-4o
# - 4% escalate to claude-3.5-sonnet
# - 1% escalate to claude-opus (most expensive, best quality)

# Cost: ~80% lower than using claude-opus for all tasks
# Time: ~40% faster than using claude-opus for all tasks
```

### TECHNICAL SPECIFICATIONS

#### BENCHMARK DATA MODEL
```typescript
interface BenchmarkRun {
  id: string;                    // Unique run identifier
  timestamp: Date;               // When benchmark was executed
  operation: string;              // Type of operation benchmarked
  command: string;               // Command that was run
  config: {                     // Benchmark configuration
    models: BenchmarkModelConfig[];
    concurrency: number;
    delay: number;
  };
  input: any;                     // Input parameters for benchmark
  results: BenchmarkResult[];    // Results for each model
}

interface BenchmarkResult {
  modelId: string;               // Model identifier (provider:model)
  duration: number;              // Execution time in milliseconds
  timeToFirstToken?: number;    // TTFT in milliseconds
  tokenUsage?: {                // Token usage breakdown
    prompt: number;
    completion: number;
    total: number;
  };
  tps?: number;                 // Tokens per second
  bps?: number;                 // Bytes per second
  responseSize?: number;          // Response size in bytes
  cost?: number;                 // Estimated cost in USD
  output?: any;                 // Operation output
  error?: string;                // Error message if failed
}

interface BenchmarkModelConfig {
  provider: string;              // AI provider name
  model: string;                // Model name
  reasoningTokens?: number;       // Reasoning token limit (if applicable)
}
```

#### PERFORMANCE CHARACTERISTICS
- **Concurrent Execution**: Support for multiple simultaneous model tests (except execution benchmarks)
- **Rate Limiting**: Configurable delays between requests
- **Progress Tracking**: Real-time status updates during execution
- **Error Recovery**: Automatic retry with fallback models
- **Metrics Collection**: Comprehensive performance data gathering
- **Git Branch Isolation**: Safe concurrent execution testing for execution benchmarks

#### STORAGE REQUIREMENTS
- **Run Storage**: 10-50KB per benchmark run
- **Results Storage**: 5-20KB per model result
- **History Storage**: 1-5MB for benchmark history
- **Cache Storage**: 50-200MB for performance optimization cache

#### CONCURRENCY AND SAFETY
- **Atomic Operations**: Safe concurrent benchmark execution
- **Resource Management**: Memory and CPU usage optimization
- **Error Isolation**: Failed model execution doesn't affect others
- **Data Integrity**: Consistent result storage and retrieval
- **Git Safety**: Execution benchmarks enforce serial execution to prevent git conflicts

**Remember:** Citizen, in the resource-constrained wasteland, benchmark commands are your strategic intelligence tools. They provide the data needed to optimize AI usage, control costs, and make informed decisions about which tools will keep your projects running efficiently. The Git Branch Isolation system means you can test fearlessly—no risk to your working code. Use them to measure, analyze, and optimize your AI-powered development workflow.

---

**DOCUMENT STATUS:** `Updated`
**NEXT REVIEW:** `After AI provider updates`
**CONTACT:** `Task-O-Matic Benchmark Team`

---

**OPEN QUESTIONS / TODO:**

- [ ] Add support for custom metric definitions in benchmark runs
- [ ] Implement benchmark result export to CSV/JSON formats
- [ ] Add historical trend visualization
- [ ] Implement cost budget enforcement with alerts
- [ ] Add quality scoring algorithm for comparing model outputs
