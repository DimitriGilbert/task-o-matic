# 🔬 The Proving Grounds: Benchmark System

**Status:** Operational  
**Clearance:** All Personnel

---

## ⚠️ SURVIVAL BULLETIN: KNOW YOUR TOOLS

_Citizen, in the wasteland, a rusty rifle gets you killed. A well-oiled machine keeps you alive. The same applies to your AI models. Do not trust the machine spirits blindly—test them._

_The Task-O-Matic Benchmark System is your proving ground. It pits AI against AI in isolated containment zones to see who survives and who hallucinates._

---

## 🏗️ CORE ARCHITECTURE: PARALLEL CONTAINMENT

In the old world, we ran tests one by one. We died of old age waiting for results. Now, we use **Git Worktrees** to create parallel dimensions.

### 1. True Parallelism
We spin up isolated reality bubbles (worktrees) for each model. 
- **Simultaneous Execution**: All models run at once. Speed is survival.
- **Total Isolation**: Each model works in its own directory. No cross-contamination of code radiation.
- **Forensic Persistence**: Worktrees are preserved. You can walk into the containment zone and inspect the wreckage yourself.

### 2. The Gauntlet (Benchmark Types)

Choose your test, citizen:

- **Execution (`execution`)**: A duel. One task, multiple models. Who writes the better code?
- **Endurance Run (`execute-loop`)**: A batch of tasks. Can the model survive a prolonged campaign without crashing?
- **Operations (`operation`)**: Internal diagnostics. Test PRD parsing, task breakdown, and other core functions.
- **Full Simulation (`workflow`)**: The ultimate test. From initialization to deployment.

### 3. Vital Signs (Metrics)

We track everything. The machine spirits cannot lie to the metrics collector.
- **⏱️ Chronometer**: Duration and time-to-first-token.
- **🪙 Token Rationing**: Cost efficiency.
- **🧬 Genetic Drift**: Code metrics (Lines added/removed, files changed).
- **🛡️ Integrity Check**: Do the tests pass? Does it build? Or is it just radioactive slag?

---

## 🔧 FIELD MANUAL: CLI COMMANDS

### Initiating the Gauntlet

```bash
# Compare models on a single task
npx task-o-matic bench run execution \
  --task <task-id> \
  --models openai:gpt-4o anthropic:claude-3-5-sonnet \
  --verify "bun test"

# Test internal operations (e.g., PRD parsing)
npx task-o-matic bench run operation \
  --operation prd-parse \
  --file requirements.md \
  --models openai:gpt-4o anthropic:claude-3-5-sonnet
```

### Reviewing the Aftermath

```bash
# List past simulations
npx task-o-matic bench list

# Inspect specific carnage
npx task-o-matic bench show <run-id>
```

### Decontamination

```bash
# View active containment zones
npx task-o-matic bench worktrees list

# Incinerate used worktrees
npx task-o-matic bench worktrees cleanup <run-id>
```

---

## 🗄️ THE ARCHIVES (STORAGE)

All data is stored in the `.task-o-matic/benchmarks/` bunker.
- `runs/`: Detailed flight recordings (JSON).
- `index.json`: The master index.

_Trust no one. Benchmark everything._
