# TECHNICAL BULLETIN NO. 001
## CITIZEN'S TECHNICAL READINESS GUIDE - task-o-matic SURVIVAL SYSTEM

**DOCUMENT ID:** `task-o-matic-introduction-v1`
**CLEARANCE:** `All Personnel`
**MANDATORY COMPLIANCE:** `Yes`
**EFFECTIVE DATE:** `Pre-Crisis Era - Designated Safe Reference`
**CLASSIFICATION:** `PUBLIC - SURVIVAL CRITICAL`

---

### ⚠️ CRITICAL SURVIVAL NOTICE
Failure to master the task-o-matic system will result in certain project termination when the Great Complexity Event arrives. Your survival depends on these instructions.

---

## MANDATORY ORIENTATION BRIEFING

ATTENTION, CITIZEN!

Welcome to your **Citizen's Technical Readiness Guide** for the task-o-matic survival system. In these uncertain times, when the digital wasteland threatens to consume all productive endeavors, you have been selected to receive this critical training.

The Pre-Crisis Engineers who built this system understood one fundamental truth: **organization is the only defense against chaos**. When servers go dark and deadlines loom like storm fronts on the horizon, only those with proper task discipline will survive.

### YOUR SURVIVAL KIT COMPONENTS

This manual contains everything you need to transform your development bunker into an impenetrable fortress of productivity:

- **Task Management Protocols** - Your primary defense against scope creep
- **AI Enhancement Systems** - Augment your human capabilities with machine intelligence
- **Documentation Containment** - Prevent knowledge leakage in the post-deadline wasteland
- **Workflow Bunkers** - Structured procedures for catastrophic project scenarios
- **Storage Shelters** - Local data protection when external services fail

### THE COMING STORM

Citizen, understand this: **the Event is inevitable**. Projects will spiral. Requirements will shift like radioactive fallout. Deadlines will approach with the speed of incoming weather systems.

But you will be prepared.

The task-o-matic system is your personal fallout shelter for software development. When others are lost in the chaos of unmanaged tasks and undocumented code, you will thrive in your organized bunker of structured productivity.

---

## SURVIVAL SYSTEM ARCHITECTURE

The task-o-matic survival system is organized into two primary facilities:

### **Primary Facility: Core Library** (`task-o-matic-core`)
The infrastructure foundation for building custom interfaces.
- Framework-agnostic API for TUI, web apps, and custom tools
- Complete access to all system services
- Streaming support for real-time AI operations
- Full TypeScript type definitions

### **Command Facility: CLI Interface** (`task-o-matic`)
The terminal command center for daily operations.
- Direct command-line access to all system features
- Interactive workflow automation
- Multi-project management capabilities
- Built-in benchmarking and comparison tools

Both facilities operate from the same codebase, sharing identical capabilities and the same Bun-powered machinery.

---

## MANDATORY READING SEQUENCE

**CRITICAL:** Proceed through these technical bulletins in the exact order specified. Deviation may result in system failure and reduced survival probability.

### SECTION I: FOUNDATIONAL SURVIVAL SYSTEMS

| Bulletin | Title | Document | Priority |
|----------|-------|----------|----------|
| 001 | **Citizen's Technical Readiness Guide** | `README.md` | ⚠️ **CRITICAL** |
| 002 | **TaskService - Central Command** | `services/tasks-service.md` | ⚠️ **CRITICAL** |
| 003 | **Storage System - Data Bunker** | `lib/file-system-storage.md` | ⚠️ **CRITICAL** |
| 004 | **AI Operations - Machine Intelligence** | `lib/ai-operations.md` | ⚠️ **CRITICAL** |

### SECTION II: COORDINATION & PROCESSING

| Bulletin | Title | Document | Priority |
|----------|-------|----------|----------|
| 005 | **Workflow System - Project Bunker** | `services/workflow-service.md` | 🔶 **HIGH** |
| 006 | **PRD Service - Requirements Containment** | `services/prd-service.md` | 🔶 **HIGH** |
| 007 | **Benchmark Service - Performance Monitoring** | `benchmark/overview.md` | 🔶 **HIGH** |

### SECTION III: FIELD OPERATIONS & INTERFACES

| Bulletin | Title | Document | Priority |
|----------|-------|----------|----------|
| 008 | **CLI Terminal - Field Command Interface** | `cli/main-commands.md` | 🔶 **HIGH** |
| 009 | **Task Commands - Work Order Management** | `cli/tasks-commands.md` | 🔶 **HIGH** |
| 010 | **Advanced CLI Operations** | `cli/` (all command docs) | 🔶 **HIGH** |

### SECTION IV: SUPPORTING SYSTEMS

| Bulletin | Title | Document | Priority |
|----------|-------|----------|----------|
| 011 | **Configuration & Init Commands** | `cli/config-init-prompt-commands.md` | 📡 **STANDARD** |
| 012 | **Plan & Document Commands** | `cli/plan-commands.md`, `cli/document-commands.md` | 📡 **STANDARD** |
| 013 | **Benchmark Commands** | `benchmark/overview.md#field-manual-cli-commands` | 📡 **STANDARD** |
| 014 | **Model Provider System** | `lib/model-provider.md` | 📡 **STANDARD** |
| 015 | **FileSystem Tools** | `lib/filesystem-tools.md` | 📡 **STANDARD** |
| 016 | **MCP Client** | `lib/mcp-client.md` | 📡 **STANDARD** |
| 017 | **Retry Handler** | `lib/retry-handler.md` | 📡 **STANDARD** |
| 018 | **AI Configuration Builder** | `utils/ai-config-builder.md` | 📡 **STANDARD** |

---

## SURVIVAL TERMINOLOGY

**MEMORIZE THESE TERMS, CITIZEN:**

- **Bunker** - Your local development environment and project directory
- **The Event** - Any catastrophic project failure scenario (deadline apocalypse, scope explosion, team loss)
- **Contingency** - A planned response to inevitable disasters
- **Mandatory** - Not optional, regardless of what your manager claims
- **Critical** - Will result in project termination if ignored
- **High** - Strongly recommended for optimal survival
- **Pre-Crisis Era** - The time before project chaos began (reference year for system design)
- **Survival System** - Any feature that prevents total project collapse
- **Machine Intelligence** - AI capabilities integrated into the survival system
- **Command Facility** - The CLI interface for direct system access
- **Core Library** - The foundational API for building custom interfaces

---

## YOUR FIRST SURVIVAL DRILL

Before proceeding to Technical Bulletin No. 002, complete this mandatory initialization protocol:

### Phase 1: Secure Your Perimeter
Ensure your development bunker is properly configured with required dependencies:
```bash
bun install  # Install supplies (dependencies)
```

### Phase 2: Verify System Readiness
Confirm all critical systems are operational:
```bash
bun run check-types  # Structural integrity check
bun run test         # System diagnostics
```

### Phase 3: Test Communications
Confirm AI providers are accessible:
```bash
# Set up API keys (communications channels)
export ANTHROPIC_API_KEY="your_key_here"
export OPENAI_API_KEY="your_key_here"
```

### Phase 4: Establish Your Shelter
Initialize your first task-o-matic project:
```bash
# Navigate to your project's containment zone
cd /path/to/your/project

# One command. The AI will guide you through everything.
npx task-o-matic workflow --stream
```

**What happens next:**
1. **Initialization**: Set up the `.task-o-matic/` containment directory
2. **PRD Creation**: Define what your project actually does
3. **PRD Refinement**: AI asks clarifying questions (or answers them itself)
4. **Task Generation**: PRD gets parsed into actionable tasks
5. **Task Splitting**: Large tasks get broken down into manageable chunks

**Estimated time:** 5-10 minutes, depending on how much you want the AI to think.

---

## SURVIVAL PROTOCOLS

### When The Event Strikes

**Immediate Actions (First 5 Minutes):**
1. **Secure your bunker**: Navigate to project directory
2. **Assess damage**: Run `task-o-matic tasks list --status todo`
3. **Establish command**: Use `task-o-matic tasks get-next` to identify critical tasks
4. **Call reinforcements**: Enable AI enhancement with `task-o-matic tasks enhance --task-id <id>`

**Survival Commands (Memorize These):**
```bash
# Situation assessment
task-o-matic tasks list --status todo
task-o-matic tasks tree

# Critical task management
task-o-matic tasks create "Emergency response" --ai-enhance
task-o-matic tasks split <task-id> --stream
task-o-matic tasks plan <task-id>

# Intelligence gathering
task-o-matic prd parse --file requirements.md --stream
task-o-matic tasks document <task-id> --force
```

---

## SYSTEM INTEGRATION GUIDES

### For Command Facility Users (CLI)

If you prefer direct command-line interface for your daily operations:

**Recommended Reading Sequence:**
1. Bulletin 001 (Introduction) - **MANDATORY** - *This document*
2. Bulletin 008 (CLI Terminal) - Interface overview
3. Bulletin 009 (Task Commands) - Daily operations
4. Bulletin 011-013 (Advanced Commands) - Specialized operations

**Quick Start:**
```bash
# Navigate to your project's containment zone
cd /path/to/your/project

# One command. The AI guides you through everything.
npx task-o-matic workflow --stream
```

### For Core Library Users (TUI, Web Apps, Custom Tools)

If you need to integrate task management into your own applications:

**Recommended Reading Sequence:**
1. Bulletin 001 (Introduction) - **MANDATORY** - *This document*
2. Bulletin 002-004 (Core Services) - Foundation understanding
3. Bulletin 005-007 (Coordination) - Advanced operations
4. Bulletin 014-018 (Supporting Systems) - Technical details

**Quick Start:**
```typescript
import {
  WorkflowService,
  TaskService,
  PRDService,
} from "task-o-matic-core";

// Complete workflow setup
const workflowService = new WorkflowService();
const result = await workflowService.initializeProject({
  projectName: "my-bunker-manager",
  initMethod: "quick",
  bootstrap: true,
  aiOptions: {
    aiProvider: "anthropic",
    aiModel: "claude-3-5-sonnet",
    aiKey: process.env.ANTHROPIC_API_KEY,
  },
});

// Direct task management
const taskService = new TaskService();
const task = await taskService.createTask({
  title: "Install water filtration system",
  content: "Implement water purification for bunker section B",
  aiEnhance: true,
  aiOptions: {
    aiProvider: "anthropic",
    aiModel: "claude-3-5-sonnet",
    aiKey: process.env.ANTHROPIC_API_KEY,
  },
});
```

---

## FURTHER SURVIVAL READING

For detailed information on specific system components and general operations:

### General Documentation (Non-FO)
- [Main Project README](../../README.md) - Complete system overview
- [Core Library API](../../packages/core/README.md) - Complete library documentation
- [CLI Command Reference](../../packages/cli/README.md) - Complete command documentation
- [Configuration Guide](../../docs/configuration.md) - AI providers and settings
- [Task Management Guide](../../docs/tasks.md) - Full task lifecycle
- [PRD Processing Guide](../../docs/prd.md) - Parse and refine requirements
- [Workflow Command Guide](../../docs/workflow-command.md) - Complete workflow reference
- [AI Integration Guide](../../docs/ai-integration.md) - AI providers and prompts
- [Project Initialization Guide](../../docs/projects.md) - Project setup and bootstrapping
- [Streaming Output Guide](../../docs/streaming.md) - Real-time AI streaming
- [Model Benchmarking Guide](../../docs/FO/benchmark/overview.md) - Performance comparison

---

## CRITICAL REMINDERS

**REMEMBER, CITIZEN:**

1. **In the wasteland of failed projects, the organized developer not only survives—they thrive.**
2. The disorganized become cautionary tales told around digital campfires.
3. A well-planned project is like a well-stocked bunker—both give you peace of mind when the world outside gets chaotic.
4. **The Event is inevitable.** The question is not IF chaos will strike, but WHEN. And when it does, will you be prepared?

**You now hold the key to survival. Use it wisely.**

**PROCEED TO TECHNICAL BULLETIN NO. 002 IMMEDIATELY. YOUR SURVIVAL DEPENDS ON IT.**

---

*This manual has been approved by the Ministry of Technical Preparedness. Unauthorized modification is punishable by immediate project assignment to documentation duty.*

---

**DOCUMENT CONTROL:**
- **Version:** 1.0
- **Clearance:** All Personnel
- **Classification:** For Citizens' Eyes Only
- **Effective Date:** Pre-Crisis Era - Designated Safe Reference
