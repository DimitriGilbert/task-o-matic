# VAULT-TEC TASK-O-MATIC SYSTEM
## S.P.E.C.I.A.L. Project Management for the Modern Wasteland

> **Welcome, Vault Dweller!**  
> You've discovered the **Vault-Tec Task-O-Matic System** - pre-war technology designed to help you manage projects in even the most challenging post-apocalyptic environments. This advanced system uses artificial intelligence to break down complex projects into manageable tasks, ensuring your vault (or software project) runs at peak efficiency.

---

## ⚠️ VAULT-TEC SAFETY NOTICE

**WARNING:** This system contains advanced pre-war AI technology. While extensively tested in Vault-Tec facilities, user discretion is advised when interfacing with artificial intelligence modules. Always keep your Pip-Boy handy for system status updates.

**TIP:** For optimal performance, ensure your terminal has adequate radiation shielding and stable power connection.

---

## 📋 SYSTEM OVERVIEW

The Task-O-Matic System is built on the revolutionary **S.P.E.C.I.A.L.** framework - each component designed to work in harmony for maximum project productivity:

| Attribute | System Component | Primary Function |
|-----------|------------------|------------------|
| **S**trength | **TaskService** | Core task management and project backbone |
| **P**erception | **PRDService** | Understanding and analyzing project requirements |
| **E**ndurance | **WorkflowService** | Complete project lifecycle management |
| **C**harisma | **BenchmarkService** | Performance comparison and optimization |
| **I**ntelligence | **Storage/FileSystem** | Data persistence and project memory |
| **A**gility | **AI Operations** | Rapid AI model interactions and responses |
| **L**uck | **Configuration** | System setup and optimal performance tuning |

---

## 🚀 QUICK START GUIDE

### Installation (System Setup)

```bash
# Install the Task-O-Matic System globally
npm install -g task-o-matic

# Or use with npx for temporary access
npx task-o-matic init
```

### First Project (Vault Initialization)

```bash
# Navigate to your project directory (your new vault)
cd /path/to/your/project

# Initialize the Task-O-Matic System
task-o-matic init init --project-name "my-vault-project"

# Configure your AI assistant (choose your Robobrain model)
task-o-matic config set-ai-provider anthropic claude-3-5-sonnet
```

### Create Your First Task

```bash
# Create a task with AI enhancement
task-o-matic tasks create --title "Reinforce vault door" --ai-enhance

# Or use the complete workflow system
task-o-matic workflow --stream
```

---

## 📚 SYSTEM DOCUMENTATION

### Core Services (S.P.E.C.I.A.L. Components)

#### **S - Strength: TaskService**
The backbone of your project management system.
- [Task Management Documentation](tasks.md)
- Full CRUD operations with AI enhancement
- Task breakdown and subtask management
- Progress tracking and status management

#### **P - Perception: PRDService** 
Advanced requirements analysis and understanding.
- [PRD Processing Documentation](prd.md)
- Parse Product Requirements Documents
- AI-powered requirement clarification
- Question generation and refinement

#### **E - Endurance: WorkflowService**
Complete project lifecycle management.
- [Workflow Command Documentation](workflow-command.md)
- Interactive guided project setup
- Multi-step project initialization
- End-to-end project automation

#### **C - Charisma: BenchmarkService**
Performance comparison and model selection.
- [Model Benchmarking Documentation](benchmarking.md)
- Compare AI model performance
- Workflow benchmarking across models
- Cost and quality analysis

#### **I - Intelligence: Storage/FileSystem**
Project memory and data persistence.
- [Configuration Documentation](configuration.md)
- Local file-based storage system
- Project-local configuration management
- Data structure and organization

#### **A - Agility: AI Operations**
Rapid AI model interactions and responses.
- [AI Integration Documentation](ai-integration.md)
- Multi-provider AI support
- Streaming real-time responses
- Context7 documentation integration

#### **L - Luck: Configuration**
System setup and optimal performance tuning.
- [Project Initialization Documentation](projects.md)
- System configuration options
- Environment setup and variables
- Provider configuration

### Advanced Features

#### **Streaming Output**
- [Streaming Documentation](streaming.md)
- Real-time AI response monitoring
- Progress tracking and updates
- Interactive development experience

#### **MCP Server Integration**
- Model Context Protocol server
- AI tool integration
- Direct AI model access

---

## 🛠️ LIBRARY USAGE (PROGRAMMATIC ACCESS)

For developers who want to integrate the Task-O-Matic System into their own applications (TUI, web apps, or custom tools):

```typescript
import {
  WorkflowService,
  TaskService,
  PRDService,
  BenchmarkService,
  type Task,
  type AIConfig,
} from "task-o-matic";

// Complete workflow setup (recommended for new projects)
const workflowService = new WorkflowService();

const result = await workflowService.initializeProject({
  projectName: "vault-77",
  initMethod: "quick",
  bootstrap: true,
  aiOptions: {
    aiProvider: "anthropic",
    aiModel: "claude-3-5-sonnet",
    aiKey: process.env.ANTHROPIC_API_KEY,
  },
  callbacks: {
    onProgress: (event) => {
      console.log(`Vault Status: ${event.message}`);
    },
  },
});

// Direct task management
const taskService = new TaskService();

const taskResult = await taskService.createTask({
  title: "Install water purification system",
  content: "Set up water chip and purification controls",
  aiEnhance: true,
  aiOptions: {
    aiProvider: "anthropic",
    aiModel: "claude-3-5-sonnet",
    aiKey: process.env.ANTHROPIC_API_KEY,
  },
});

console.log("Task created:", taskResult.task);
```

---

## 🎯 COMMON WORKFLOWS (VAULT OPERATIONS)

### Workflow 1: Complete Project Setup
**For new vaults starting from scratch**

```bash
# One command to initialize everything
task-o-matic workflow --stream

# The system will guide you through:
# 1. Project initialization (Vault setup)
# 2. PRD creation (Blueprint design)
# 3. Task generation (Construction planning)
# 4. Task breakdown (Detailed work orders)
```

### Workflow 2: AI Model Comparison
**Find the best AI assistant for your vault**

```bash
# Test multiple AI models on your project
task-o-matic benchmark workflow \
  --models "openai:gpt-4o,anthropic:claude-3-5-sonnet,openrouter:qwen/qwen-2.5-72b-instruct" \
  --project-description "Underground water management system"
```

### Workflow 3: Task Enhancement
**Improve existing work orders**

```bash
# Create basic task
task-o-matic tasks create --title "Fix power generator"

# Enhance with AI for detailed requirements
task-o-matic tasks create --title "Upgrade power generator" --ai-enhance

# Break down into specific steps
task-o-matic tasks split --task-id <generator-task-id>
```

---

## 🔧 ENVIRONMENT CONFIGURATION

Set up your system environment variables for optimal performance:

```bash
# AI Provider API Keys (Robobrain access codes)
export OPENAI_API_KEY="your_openai_key"
export ANTHROPIC_API_KEY="your_anthropic_key"
export OPENROUTER_API_KEY="your_openrouter_key"

# Default AI Configuration
export AI_PROVIDER="anthropic"
export AI_MODEL="claude-3-5-sonnet"
export AI_MAX_TOKENS="4000"
export AI_TEMPERATURE="0.7"
```

---

## 📁 PROJECT STRUCTURE (VAULT ORGANIZATION)

Your project data is stored locally in the `.task-o-matic/` directory:

```
your-vault/
├── .task-o-matic/
│   ├── config.json          # AI configuration (Robobrain settings)
│   ├── bts-config.json      # Better-T-Stack configuration
│   ├── tasks/              # Task files (Work orders)
│   │   ├── {task-id}.json
│   │   └── ...
│   ├── prd/                # PRD versions (Blueprints)
│   │   ├── parsed-prd.json
│   │   └── ...
│   └── logs/               # Operation logs (Vault records)
│       └── ...
└── your-project-files...
```

---

## 🤖 AI PROVIDERS (ROBObRAIN MODELS)

### Supported Models

| Provider | Models | Best For |
|----------|--------|----------|
| **OpenAI** | GPT-4, GPT-3.5 | General purpose, fast responses |
| **Anthropic** | Claude 3.5 Sonnet, Claude 3 Haiku | Complex reasoning, detailed analysis |
| **OpenRouter** | Multiple models | Cost optimization, model variety |
| **Custom** | OpenAI-compatible | Self-hosted or specialized models |

### Model Recommendations

- **PRD Analysis**: `claude-3.5-sonnet` - Best for understanding complex requirements
- **Task Enhancement**: `claude-3-haiku` - Fast and efficient for task improvement
- **Task Breakdown**: `claude-3.5-sonnet` - Superior for complex task decomposition
- **Workflow Testing**: Use benchmarking to find your optimal model

---

## 📊 BENCHMARKING (PERFORMANCE TESTING)

Compare different AI models to find the best performer for your specific needs:

```bash
# Benchmark PRD parsing
task-o-matic benchmark run prd-parse \
  --file requirements.md \
  --models "openai:gpt-4o,anthropic:claude-3-5-sonnet" \
  --concurrency 3

# Complete workflow benchmarking
task-o-matic benchmark workflow \
  --models "openai:gpt-4o,anthropic:claude-3-5-sonnet" \
  --project-description "Vault water purification system"
```

**Benchmark Results Include:**
- Performance metrics (speed, tokens, cost)
- Quality assessment (tasks created, completeness)
- Model recommendations for your use case

---

## 🛠️ DEVELOPMENT (SYSTEM MODIFICATION)

For advanced users who want to modify or extend the Task-O-Matic System:

```bash
# Clone and install dependencies
git clone https://github.com/DimitriGilbert/task-o-matic.git
cd task-o-matic
npm install

# Build the system
npm run build

# Run in development mode
npm run dev

# Run tests
npm run test
```

### Package Structure

```
task-o-matic/
├── dist/              # Compiled system files
│   ├── lib/           # Core library exports
│   ├── cli/           # Command interface
│   ├── services/      # Business logic
│   └── mcp/           # MCP server
├── src/
│   ├── lib/           # Core system components
│   ├── services/      # Service implementations
│   ├── cli/           # CLI interface
│   ├── commands/      # Command implementations
│   └── types/         # TypeScript definitions
└── docs/              # System documentation
```

---

## 🔍 TROUBLESHOOTING (VAULT MAINTENANCE)

### Common Issues

**Task Not Found**
```bash
# Search for tasks
task-o-matic tasks list
task-o-matic tasks list --raw | jq '.[] | select(.title | contains("search"))'
```

**AI Configuration Issues**
```bash
# Check AI settings
task-o-matic config show-ai

# Test with simple task
task-o-matic tasks create --title "Test task" --ai-enhance
```

**Storage Problems**
```bash
# Check system files
ls -la .task-o-matic/
ls -la .task-o-matic/tasks/

# Verify permissions
ls -la .task-o-matic/config.json
```

### System Recovery

If the system becomes unresponsive:
1. Check your API keys and network connection
2. Verify the `.task-o-matic/` directory exists and is writable
3. Try reinitializing: `task-o-matic init init --force`
4. Contact Vault-Tec support (create an issue on GitHub)

---

## 📄 LICENSE (VAULT-TEC TERMS)

MIT License - see LICENSE file for details.  
*Vault-Tec is not responsible for radiation exposure, mutant encounters, or system failures during nuclear events.*

---

## 🤝 CONTRIBUTING (VAULT COLLABORATION)

1. Fork the repository (create your vault branch)
2. Create a feature branch (plan your modification)
3. Make your changes (implement carefully)
4. Add tests if applicable (ensure system stability)
5. Submit a pull request (share with the vault community)

---

## 🎖️ VAULT-TEC EXCELLENCE

**Built with pre-war technology and modern TypeScript**  
*Powered by Vercel AI SDK and advanced artificial intelligence*

---

> **Remember, Vault Dweller:** A well-organized project is a successful project!  
> The Task-O-Matic System is here to help you build a better future, one task at a time.

---

## 🔗 QUICK REFERENCE

| Command | Purpose | Example |
|---------|---------|---------|
| `task-o-matic init` | Initialize project | `task-o-matic init init --project-name vault-13` |
| `task-o-matic workflow` | Complete guided setup | `task-o-matic workflow --stream` |
| `task-o-matic tasks create` | Create new task | `task-o-matic tasks create --title "Fix door" --ai-enhance` |
| `task-o-matic tasks list` | Show all tasks | `task-o-matic tasks list --status todo` |
| `task-o-matic prd parse` | Parse requirements | `task-o-matic prd parse --file requirements.md` |
| `task-o-matic benchmark workflow` | Compare AI models | `task-o-matic benchmark workflow --models "openai:gpt-4o,anthropic:claude-3-5-sonnet"` |

**For detailed documentation on any component, see the specific documentation files listed in the table of contents above.**

---

*Task-O-Matic System Version 0.0.15 - Vault-Tec Industries - Est. 2050*