# ⛑️ task-o-matic

**Your lifeline in the AI-pocalypse wasteland**

---

## ⚠️ SURVIVAL BULLETIN

_Citizen, the world outside has changed. The AI-pocalypse has transformed development from a chaotic free-for-all into something... darker. But your projects don't have to die in the radioactive dust._

_npx task-o-matic is your task management system for software development. Think of it as your Pip-Boy for code—organizing tasks, parsing documents, and deploying artificial intelligence to help your projects thrive when everything else has collapsed._

_[The preceding message was brought to you by the Department of Project Preservation. Remember: A prepared developer is a surviving developer.]_

---

## 📡 WHAT THIS THING ACTUALLY DOES

In the Before Times, people used sticky notes and spreadsheets. Then came the AI-pocalypse. Now we have **task-o-matic**:

- **🤖 AI-Powered Task Management**: Let the machine spirits enhance your tasks with actual documentation. They may not have souls, but they have access to Context7.
- **📋 PRD Processing**: Parse Product Requirements Documents into structured tasks. Because vague requirements lead to vague outcomes. Vague outcomes lead to... well, you've seen what happens to vague projects.
- **🎯 Complete Workflow Automation**: From project initialization to execution—guided by AI, supervised by you. Mostly.
- **📊 AI Model Benchmarking**: Test multiple models against each other. Let them fight it out. Survival of the fittest, citizen.
- **💾 Local Storage**: Everything lives in `.task-o-matic/`. No cloud. No surveillance. Just you, your code, and the containment directory.
- **🌊 Real-Time Streaming**: Watch AI responses generate live. Like watching the Geiger counter tick, but for code generation.

---

## 📦 ARCHITECTURE: TWO FACILITIES

The npx task-o-matic compound is split into two facilities:

### **task-o-matic-core** (`packages/core/`)

The infrastructure foundation. Library code for TUI, web apps, and custom integrations.

- [Full documentation here](packages/core/README.md)

### **npx task-o-matic** (`packages/cli/`)

The terminal interface. What you actually use.

- [Full documentation here](packages/cli/README.md)

Both facilities share the same air—same codebase, same dependencies, same Bun-powered machinery.

---

## 🚀 QUICK START: FOR THE BUSY SURVIVOR

You have projects. They're disorganized. The burnout levels are rising. Let's fix this.

### Method 1: The Full Treatment (Recommended)

```bash
# Navigate to your project's directory
cd /path/to/your/project

# One command. That's it. The AI will guide you through everything.
npx task-o-matic workflow --stream
```

**What happens next:**

1. **Initialization**: Set up the `.task-o-matic/` containment directory
2. **PRD Creation**: Define what your project actually does (or let AI figure it out)
3. **PRD Refinement**: AI asks clarifying questions. You answer. Or let AI answer itself. We don't judge.
4. **Task Generation**: PRD gets parsed into actionable tasks
5. **Task Splitting**: Large tasks get broken down. Procrastination kills more projects than burnout.

**Estimated time:** 5-10 minutes, depending on how much you want the AI to think.

### Method 2: The Surgical Strike

Already know what you're doing? Good. Survivors who know things live longer.

```bash
# Initialize containment directory
npx task-o-matic init init --ai-provider anthropic --ai-model claude-3-5-sonnet

# Configure your AI provider
npx task-o-matic config set-ai-provider anthropic claude-3-5-sonnet

# Create a task with AI enhancement
npx task-o-matic tasks create --title "Add user authentication" --ai-enhance --stream
```

---

## 🗺️ THE WASTELAND: COMMON WORKFLOWS

### Workflow Alpha: From PRD to Tasks (When You Have a Plan)

You've written a PRD. It's beautiful. Let's turn it into something executable.

```bash
#1. Initialize (if you haven't)
npx task-o-matic init init

#2. Parse PRD with streaming
npx task-o-matic prd parse --file requirements.md --stream

#3. Review task tree
npx task-o-matic tasks tree

#4. Split big ones into manageable chunks
npx task-o-matic tasks split --all --stream

#5. Get your next assignment
npx task-o-matic tasks get-next
```

**Tip:** Use `--stream` on AI operations. Watching text appear character-by-character gives you something to do while waiting for the token machine to settle.

### Workflow Beta: Project Bootstrapping (When Starting Fresh)

```bash
# Initialize AND bootstrap with Better-T-Stack in one shot
npx task-o-matic init init \
  --project-name my-fallout-shelter-manager \
  --ai-provider openrouter \
  --ai-model anthropic/claude-3.5-sonnet \
  --frontend next \
  --backend hono \
  --database postgres \
  --auth
```

This creates:

- `.task-o-matic/` directory with config
- A full Better-T-Stack project scaffold
- Next.js frontend, Hono backend, Postgres database, authentication

**Result:** A project ready to be built.

### Workflow Gamma: Existing Project Adoption (When the Walls Are Already Up)

Working on something that existed before the AI-pocalypse? Let's attach npx task-o-matic without touching your carefully-curated code.

```bash
# Attach to existing project with automatic stack detection
npx task-o-matic init attach --analyze

# Review what was detected
cat .task-o-matic/stack.json

# Generate PRD from your existing codebase
npx task-o-matic prd generate --stream

# Create tasks for new features
npx task-o-matic tasks create --title "Add rad-resistant UI" --ai-enhance --stream
```

**What gets detected:**

- Language (TypeScript/JavaScript)
- Frameworks (Next.js, Express, Hono, Vue, Svelte, etc.)
- Database (Postgres, MongoDB, SQLite, MySQL)
- ORM (Prisma, Drizzle, TypeORM)
- Auth (Better-Auth, Clerk, NextAuth, Auth0)
- Package Manager & Runtime
- Testing & Build tools

No code is modified. Only observation. We're not raiders, citizen.

### Workflow Delta: AI Model Comparison (When You Need the Best)

Not sure which AI model to use? Let them compete. The strongest model survives.

```bash
# Benchmark PRD parsing across multiple models
task-o-matic benchmark run prd-parse \
  --file requirements.md \
  --models "openai:gpt-4o,anthropic:claude-3-5-sonnet,openrouter:anthropic/claude-3.5-sonnet" \
  --concurrency 2

# Benchmark the ENTIRE workflow
task-o-matic benchmark workflow \
  --models "openai:gpt-4o,anthropic:claude-3-5-sonnet" \
  --project-name "vault-manager-app" \
  --project-description "Comprehensive vault management system" \
  --init-method ai \
  --prd-method ai \
  --auto-accept \
  --split-all
```

**Output:** Comprehensive comparison table showing duration, task count, token usage, and cost. Select the winner. Your project gets the best results.

---

## 🔧 COMMAND REFERENCE: YOUR SURVIVAL KIT

### Initialization (`init`)

```bash
# New project
npx task-o-matic init init --project-name my-shelter-manager

# Attach to existing project
npx task-o-matic init attach --analyze --create-prd

# Bootstrap fresh project
npx task-o-matic init bootstrap vault-app --frontend next --backend hono
```

[Full init documentation](docs/projects.md)

### Task Management (`tasks`)

```bash
# Create task with AI enhancement
npx task-o-matic tasks create --title "Implement geiger counter UI" --ai-enhance --stream

# List tasks by status
npx task-o-matic tasks list --status todo
npx task-o-matic tasks list --status in-progress
npx task-o-matic tasks list --status completed

# View task hierarchy
npx task-o-matic tasks tree

# Get next prioritized task
npx task-o-matic tasks get-next

# Split complex task
npx task-o-matic tasks split --task-id 7 --stream

# Update task status
npx task-o-matic tasks update --id 7 --status in-progress

# Execute task with AI assistance
npx task-o-matic tasks execute --id 7 --tool opencode --plan

# Batch execute with retry logic
npx task-o-matic tasks execute-loop --status todo --max-retries3 --verify "bun test"
```

[Full task documentation](docs/tasks.md)

### PRD Management (`prd`)

```bash
# Create PRD from description
npx task-o-matic prd create "Build a vault management system" --stream

# Parse PRD into tasks
npx task-o-matic prd parse --file requirements.md --stream

# Rework PRD with feedback
npx task-o-matic prd rework --file requirements.md --feedback "Add more security protocols"

# Generate clarifying questions
npx task-o-matic prd question --file requirements.md

# Refine PRD with AI answering
npx task-o-matic prd refine --file requirements.md --question-mode ai --stream
```

**🔥 Multi-AI Generation (READY NOW!)**

When creating PRDs or parsing them into tasks, you can use multiple AI models in parallel and combine the best results:

```bash
# Multi-model PRD creation
npx task-o-matic prd create "Build a vault manager" \
  --ai "anthropic:claude-3.5-sonnet,openai:gpt-4o,openrouter:qwen-2.5" \
  --combine-ai anthropic:claude-3.5-sonnet \
  --stream

# Multi-model PRD parsing
npx task-o-matic prd parse --file requirements.md \
  --ai "anthropic:claude-3.5-sonnet,openai:gpt-4o,openrouter:qwen-2.5" \
  --combine-ai anthropic:claude-3.5-sonnet \
  --stream

# Multi-model task splitting
npx task-o-matic tasks split --task-id 7 \
  --ai "anthropic:claude-3.5-sonnet,openai:gpt-4o" \
  --stream
```

**Why this matters:** Competition among AI models produces superior PRDs and task breakdowns. Let multiple models work, then combine their strengths into one definitive result.

[Full PRD documentation](docs/prd.md)

### Configuration (`config`)

### Configuration (`config`)

```bash
# Set AI provider
npx task-o-matic config set-ai-provider anthropic claude-3-5-sonnet

# View current configuration
npx task-o-matic config info
```

[Full configuration documentation](docs/configuration.md)

---

## 🤖 AI PROVIDERS: CHOOSE YOUR MACHINE SPIRITS

The AI-pocalypse brought us many survivors. Choose wisely.

| Provider       | Strengths                                 | Recommended For                                |
| -------------- | ----------------------------------------- | ---------------------------------------------- |
| **anthropic**  | Strong reasoning, great with complexity   | PRD parsing, task breakdown                    |
| **openai**     | Balanced, fast                            | Task enhancement, code generation              |
| **openrouter** | Access to many models, supports reasoning | Multi-model testing, finding optimal performer |
| **custom**     | Any OpenAI-compatible endpoint            | Proprietary or local models                    |

### Model Recommendations

Based on extensive field testing (read: we tried a lot of things so you don't have to):

- **PRD Parsing**: `anthropic:claude-3.5-sonnet` or `openai:gpt-4o`
- **Task Enhancement**: `openai:gpt-4o-mini` or `anthropic:claude-3-haiku`
- **Task Breakdown**: `anthropic:claude-3.5-sonnet`
- **Workflow Testing**: Use benchmarking. Let the data decide.

### Reasoning Support

OpenRouter models support extended reasoning for complex problems:

```bash
task-o-matic tasks create --title "Solve the energy crisis" \
  --ai-provider openrouter \
  --ai-model anthropic/claude-3.5-sonnet \
  --ai-reasoning 5000 \
  --stream
```

The AI will spend more time thinking before answering. Like a survivor contemplating the wasteland before making a move.

[Full AI integration documentation](docs/ai-integration.md)

---

## 📁 STORAGE STRUCTURE: YOUR PROJECT LAYOUT

Everything lives in `.task-o-matic/`. Know your project.

```
your-project/
├── .task-o-matic/
│   ├── config.json              # AI configuration
│   ├── stack.json              # Detected technology stack (cached for AI context)
│   ├── bts-config.json         # Better-T-Stack configuration (if bootstrapped)
│   ├── mcp.json               # Context7/MCP configuration
│   ├── tasks.json             # Main tasks database
│   ├── ai-metadata.json       # AI metadata for all tasks
│   │
│   ├── tasks/                # Task content files (>200 chars)
│   │   ├── {task-id}.md
│   │   └── enhanced/
│   │       └── {task-id}.md
│   │
│   ├── plans/                # Implementation plans
│   │   └── {task-id}.json
│   │
│   ├── docs/                 # Documentation
│   │   ├── tasks/           # Task-specific documentation
│   │   └── {library-name}/  # Context7 library docs
│   │
│   ├── prd/                 # PRD versions and logs
│   │   ├── versions/        # PRD versioning history
│   │   ├── parsed-prd.json
│   │   └── (user prd files)
│   │
│   └── logs/                # Operation logs
└── your-project-files...
```

**Key notes:**

- Tasks with content >200 characters are stored as separate files
- AI metadata tracks who enhanced what, when, and with which model
- PRD versioning lets you track evolution over time
- Documentation fetched from Context7 is cached to avoid repeated API calls

---

## 🌊 STREAMING: WATCH THE AI WORK

The wasteland is boring. Watch the AI instead.

```bash
# Enable streaming on any AI operation
npx task-o-matic tasks create --title "Fix the air filtration" --ai-enhance --stream

# Reasoning tokens appear in magenta
npx task-o-matic prd parse --file requirements.md --stream
# Standard text appears normally
# Reasoning appears: [magenta text indicating deep thought]
```

Streaming callbacks are available in the core library for TUI integration:

```typescript
import { TaskService } from "task-o-matic-core";

const taskService = new TaskService();

await taskService.createTask({
  title: "Repair water chip",
  aiEnhance: true,
  streamingOptions: {
    onChunk: (chunk) => {
      tuiTextArea.append(chunk); // Update your TUI in real-time
    },
    onReasoning: (text) => {
      tuiStatusBar.update(`Thinking: ${text}`);
    },
    onFinish: ({ text }) => {
      tuiStatusBar.success("Task enhanced!");
    },
  },
});
```

[Full streaming documentation](docs/streaming.md)

---

## 🎯 ADVANCED SURVIVAL TACTICS

### Tip 1: PRD Question/Refine Mode

Let AI ask questions about your PRD to identify gaps before generating tasks.

```bash
# User answers questions
npx task-o-matic workflow --prd-question-refine --prd-answer-mode user

# AI answers questions using PRD + stack context
npx task-o-matic workflow --prd-question-refine --prd-answer-mode ai --prd-answer-ai-reasoning
```

**Why this matters:** An unclear plan is worse than no plan. At least with no plan, you know you're doomed.

### Tip 2: Task Splitting Before Execution

Large tasks lead to procrastination. Break them down.

```bash
# Split all tasks at once
npx task-o-matic tasks split --all --stream

# Split specific task
npx task-o-matic tasks split --task-id 7 --stream
```

**Rule of thumb:** If a task can't be finished in one sitting, it's too large. Procrastination kills more projects than burnout.

### Tip 3: Multi-AI PRD Creation & Task Splitting (READY NOW!)

Let multiple AI models compete and produce the best results together.

**For PRD Creation:**

```bash
npx task-o-matic prd create "Build a vault manager" \
  --ai "anthropic:claude-3.5-sonnet,openai:gpt-4o,openrouter:qwen-2.5" \
  --combine-ai anthropic:claude-3.5-sonnet \
  --stream
```

**For PRD Parsing:**

```bash
npx task-o-matic prd parse --file requirements.md \
  --ai "anthropic:claude-3.5-sonnet,openai:gpt-4o,openrouter:qwen-2.5" \
  --combine-ai anthropic:claude-3.5-sonnet \
  --stream
```

**For Task Splitting:**

```bash
npx task-o-matic tasks split --task-id 7 \
  --ai "anthropic:claude-3.5-sonnet,openai:gpt-4o" \
  --stream
```

**Why this works better:** Multiple models approach the same problem from different angles. A smarter model excels at complexity, while a faster model handles straightforward cases. The combination model synthesizes the best of all worlds into one superior result.

Competition among AI models produces superior results. Much like competition among dwellers produces... well, we're getting ahead of ourselves.

### Tip 4: Context7 Documentation Integration

npx task-o-matic integrates with Context7 to fetch current library documentation automatically.

```bash
# Enable Context7 during init
npx task-o-matic init init --context7-api-key your-key

# Or set environment variable
export CONTEXT7_API_KEY="your-key"

# Task enhancement will now fetch relevant docs
npx task-o-matic tasks enhance --task-id 7 --stream
```

The AI will pull up-to-date documentation for libraries/frameworks in your stack. No outdated tutorials.

### Tip 5: Execution with Verification

Run verification commands after task execution to catch failures early.

```bash
npx task-o-matic tasks execute --id 7 \
  --tool opencode \
  --plan \
  --verify "bun test" \
  --verify "bun run build" \
  --max-retries3 \
  --try-models "gpt-4o-mini,gpt-4o,claude:sonnet-4"
```

If a task fails, it will retry with progressively stronger models. Survival of the fittest code generation.

### Tip 6: Continue Working on Existing Projects

Jump back into a project and let npx task-o-matic tell you where you left off.

```bash
# Check project status
npx task-o-matic continue --status

# Update PRD with progress
npx task-o-matic continue --update-prd

# Generate tasks for unimplemented features
npx task-o-matic continue --generate-tasks

# Generate implementation plan for remaining work
npx task-o-matic continue --generate-plan
```

---

## 📚 LIBRARY INTEGRATION: USING npx task-o-matic IN YOUR CODE

Need to integrate task management into a TUI, web app, or custom tooling? Use `task-o-matic-core`.

```typescript
import {
  WorkflowService,
  TaskService,
  PRDService,
  type Task,
  type AIConfig,
} from "task-o-matic-core";

// Initialize project
const workflowService = new WorkflowService();
const initResult = await workflowService.initializeProject({
  projectName: "vault-manager",
  initMethod: "quick",
  bootstrap: true,
  aiOptions: {
    aiProvider: "anthropic",
    aiModel: "claude-3-5-sonnet",
    aiKey: process.env.ANTHROPIC_API_KEY,
  },
  callbacks: {
    onProgress: (event) => {
      console.log(`Progress: ${event.message}`);
    },
  },
});

// Create task with AI enhancement
const taskService = new TaskService();
const taskResult = await taskService.createTask({
  title: "Implement Pip-Boy interface",
  content: "Create wearable device interface for vault management",
  aiEnhance: true,
  aiOptions: {
    aiProvider: "anthropic",
    aiModel: "claude-3-5-sonnet",
    aiKey: process.env.ANTHROPIC_API_KEY,
  },
  streamingOptions: {
    enabled: true,
    onChunk: (chunk) => {
      console.log(chunk);
    },
  },
  callbacks: {
    onProgress: (event) => {
      console.log(event.message);
    },
  },
});

// Parse PRD
const prdService = new PRDService();
const parseResult = await prdService.parsePRD({
  file: "./requirements.md",
  aiOptions: {
    aiProvider: "anthropic",
    aiModel: "claude-3-5-sonnet",
    aiKey: process.env.ANTHROPIC_API_KEY,
  },
  callbacks: {
    onProgress: (event) => {
      console.log(event.message);
    },
  },
});
```

[Full library documentation](packages/core/README.md)

---

## 🛠️ DEVELOPMENT: BUILDING YOUR OWN PROJECT TOOLS

Want to contribute or extend task-o-matic? Here's the blueprint.

```bash
# Clone the facility
git clone https://github.com/DimitriGilbert/task-o-matic.git
cd task-o-matic

# Install supplies
bun install

# Build all facilities
bun run build

# Type checking (run this before committing)
bun run check-types

# Run all tests
bun run test
```

### Running Specific Tests

```bash
# From project root - run core package tests
cd packages/core
npx mocha -r tsx/cjs src/test/test-setup.ts src/test/path/to/your.test.ts

# Run CLI tests
cd packages/cli
npx mocha -r tsx/cjs src/test/commands.test.ts
```

### Monorepo Structure

```
task-o-matic/
├── packages/
│   ├── core/           # Core library (task-o-matic-core)
│   │   ├── src/
│   │   │   ├── lib/           # Storage, Config, AI, etc.
│   │   │   ├── services/      # WorkflowService, PRDService, TaskService
│   │   │   ├── prompts/       # AI prompt templates
│   │   │   ├── types/         # TypeScript type definitions
│   │   │   └── utils/         # Shared utilities
│   │   └── dist/              # Compiled output
│   └── cli/            # CLI interface (task-o-matic)
│       ├── src/
│       │   ├── cli/           # CLI-specific logic
│       │   ├── commands/      # Commander.js command implementations
│       │   └── types/         # CLI type definitions
│       └── dist/              # Compiled output
└── docs/              # Documentation
```

---

## ⚙️ ENVIRONMENT VARIABLES

```bash
# AI Provider API Keys
export OPENAI_API_KEY="your_openai_key"
export ANTHROPIC_API_KEY="your_anthropic_key"
export OPENROUTER_API_KEY="your_openrouter_key"
export CUSTOM_API_KEY="your_custom_key"
export CUSTOM_API_URL="https://api.custom.com/v1"
export CONTEXT7_API_KEY="your_context7_key"

# Default AI Configuration
export AI_PROVIDER="anthropic"
export AI_MODEL="claude-3-5-sonnet"
export AI_MAX_TOKENS="4000"
export AI_TEMPERATURE="0.5"
```

---

## ❓ FREQUENTLY ASKED QUESTIONS FROM THE FIELD

**Q: Can I skip the PRD phase and just start coding?**

A: Technically, yes. But also, citizen, have you SEEN the results of "just starting coding"? We have. It's not pretty. [The '53 incident taught us many things about the dangers of unguided development.]

**Q: Do I really need to split ALL tasks?**

A: No, you can pick and choose. But remember: a task too large to finish in one sitting is a task that won't BE finished. [Procrastination kills more projects than burnout.]

**Q: What AI provider should I use?**

A: We recommend OpenRouter with `claude-4.5-sonnet`/`anthropic/claude-4.5-opus` for quality, or `z-ai/glm-4.7` for cheap. [The AI doesn't care about your political affiliation. It just wants to help organize your project.]

**Q: Can I add tasks manually?**

A: Absolutely:

```bash
npx task-o-matic tasks create \
  --title "Add deathclaw... er, CREATURE encounters" \
  --content "Random creature attacks on facility" \
  --ai-enhance
```

**Q: What if my project changes direction midway?**

A: Common occurrence, citizen. Use `prd rework` to update your PRD, then regenerate tasks from the updated document. [Flexibility is a survival trait.]

**Q: How does npx task-o-matic handle dependencies?**

A: Tasks can specify dependencies. The system tracks relationships and prevents circular dependencies. [A project where everything depends on everything is a project that never completes. We learned this the hard way.]

**Q: Is there an MCP server?**

A: Not yet, citizen. We're working on it. For now, you don't need an MCP server - we provide Skills for your agent to learn about task-o-matic. [The future promised features don't always arrive on schedule. We're still waiting for those jetpacks, too.]

---

## 📖 FURTHER READING: SURVIVAL MANUALS

For detailed information on specific facilities:

- [Configuration Guide](docs/configuration.md) - AI providers and settings
- [Task Management Guide](docs/tasks.md) - Full task lifecycle with AI features
- [PRD Processing Guide](docs/prd.md) - Parse and rework Product Requirements Documents
- [Workflow Command Guide](docs/workflow-command.md) - Complete workflow command reference
- [AI Integration Guide](docs/ai-integration.md) - AI providers and prompt engineering
- [Project Initialization Guide](docs/projects.md) - Project setup and bootstrapping
- [Streaming Output Guide](docs/streaming.md) - Real-time AI streaming capabilities
- [Core Library API](packages/core/README.md) - Framework-agnostic library API
- [CLI Command Reference](packages/cli/README.md) - Complete command documentation

---

## 🔬 BENCHMARKING (COMING SOON)

**Status:** Under Development

The benchmarking system lets AI models compete against each other to find the optimal performer for your specific workflow. It's not quite prime time yet, but we're working on it.

**What will be available:**

- Multi-model PRD parsing comparison
- Task breakdown quality assessment
- Workflow-level benchmarking with isolated git branches
- Comprehensive metrics (duration, tokens, cost, quality)

**In the meantime:** Use multi-AI generation features (see above) - they're production-ready and give you excellent results by letting multiple models collaborate.

Check back soon for benchmarking updates, citizen.

---

## 🏁 FINAL REMINDER

**Remember:** A well-planned project is like a well-stocked bunker—both give you peace of mind when the world outside gets chaotic. [And in software development, as in underground containment, chaos is ALWAYS just one merge conflict away.]

You now have everything you need to manage your projects in the AI-pocalypse. Go forth, citizen. Your code is counting on you.

[Literally. It needs you to organize it. Don't disappoint it. Or us. We're watching.]

---

**END OF SURVIVAL BULLETIN**

_This document is classified MANDATORY READING for all developer-citizens. Unauthorized failure to follow these protocols may result in... suboptimal project outcomes._

---

**DOCUMENT CONTROL:**

- **Version:** 1.0
- **Clearance:** All Personnel
- **Classification:** For Citizens' Eyes Only

[Stay organized. Stay safe. Survive.]
