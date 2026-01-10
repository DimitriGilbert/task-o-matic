# TECHNICAL BULLETIN NO. 001
### UNDERGROUND REPOPULATION CONFINEMENT AND REPRODUCTION UNIT (URCRU) - DEVELOPMENT SURVIVAL GUIDE

**DOCUMENT ID:** `urcru-dev-manual-v1`
**CLEARANCE:** `All Personnel`
**MANDATORY COMPLIANCE:** `Yes`
**DATE:** [REDACTED]

---

## ⚠️ CRITICAL SURVIVAL NOTICE

*Citizen, failure to complete this tutorial properly may result in suboptimal bunker management simulation experiences. In the event of an actual underground containment scenario, you will be GLAD you practiced with pixels first.*

---

## FOREWORD: WELCOME TO YOUR NEW ASSIGNMENT

Congratulations, citizen! You have been selected [this selection was mandatory, but we prefer to focus on the positive] to develop an **Underground Repopulation Confinement and Reproduction Unit** management simulator.

**What is an URCRU?** Excellent question, citizen! An URCRU is:

- A sophisticated underground facility designed to preserve humanity's future [or at least a tiny subset of it]
- A place where citizens live, work, and hopefully reproduce [the math was very specific about the numbers needed]
- A complex management challenge that YOU will simulate [with code! Much cleaner than the real thing]

**Why build a simulator first?** Because building ACTUAL underground bunkers is expensive, citizen. Simulators are cheap. And if your simulation fails, nobody dies. [Unlike the beta test of '53. We don't talk about '53.]

This tutorial will guide you through creating a complete management game using **task-o-matic**, the citizen-developer's best friend for project organization.

---

## TABLE OF CONTENTS (MANDATORY READING - DO NOT SKIP)

1. [Phase 1: Facility Initialization](#phase-1-facility-initialization)
2. [Phase 2: Defining Your Objectives (PRD)](#phase-2-defining-your-objectives-prd)
3. [Phase 3: AI-Assisted Contingency Planning](#phase-3-ai-assisted-contingency-planning)
4. [Phase 4: Resource Allocation (Task Generation)](#phase-4-resource-allocation-task-generation)
5. [Phase 5: Compartmentalization (Task Splitting)](#phase-5-compartmentalization-task-splitting)
6. [Phase 6: Execution Protocols](#phase-6-execution-protocols)

---

## PHASE 1: FACILITY INITIALIZATION

### Mission Objective

Initialize your development environment and bootstrap a functional game project. Think of this as clearing space in the bunker for your workstation. [A messy bunker is a failed bunker, citizen.]

### Step 1.1: Prepare Your Work Area

Open your terminal, citizen. We'll assume you have `task-o-matic` installed. If not, well... that's unfortunate. [Install it. We'll wait.]

```bash
# Create a clean workspace directory
mkdir urcru-simulator
cd urcru-simulator
```

### Step 1.2: Initialize the Project

We'll use `task-o-matic init` to set up our facility:

```bash
task-o-matic workflow
```

**INTERACTIVE PROMPT SEQUENCE:**

When asked about initialization:
- **Confirm:** `Yes` (It IS mandatory, citizen)
- **Project Name:** `urcru-manager`
- **Configuration Method:** `Quick start` (recommended for citizens who value efficiency)
- **Frontend:** `next` (web-based interface for maximum citizen accessibility)
- **Bootstrap:** `Yes` (Better-T-Stack provides excellent scaffolding)

**WHAT THIS DOES:**
- Creates project structure
- Installs dependencies [sit back, think about preparedness]
- Configures AI providers for later phases
- Sets up a modern Next.js application with TypeScript

**Expected Output:**
```
✓ Project initialized
✓ Dependencies installed
✓ Frontend: Next.js configured
✓ Backend: Convex configured
✓ Auth: Better-Auth configured
```

---

## PHASE 2: DEFINING YOUR OBJECTIVES (PRD)

### Mission Objective

Create a Product Requirements Document (PRD) that clearly defines what your URCRU simulator will actually DO. [Vague objectives lead to vague outcomes. Vague outcomes lead to unhappy citizens. Unhappy citizens lead to... well, let's not think about that.]

### Step 2.1: Launch PRD Definition Phase

The workflow will continue to Phase 2 automatically:

**INTERACTIVE PROMPT SEQUENCE:**

When asked about PRD definition:
- **Method:** `AI-assisted creation` (because your AI assistant has excellent ideas about underground facilities)
- **Description:** [See below]

### Step 2.2: Describe Your URCRU Vision

When prompted for a product description, provide the following:

```
An underground facility management game where players act as Overseer of a Repopulation Confinement Unit.

Core Features:
1. RESOURCE MANAGEMENT: Track power, water, food, and oxygen. Run out and... well, let's just say the outcome is suboptimal.

2. DWELLER SYSTEM: Citizens enter your facility (called "Dwellers") with unique stats. Assign them to appropriate rooms based on their skills. Each room requires specific attributes.

3. ROOM CONSTRUCTION: Build various rooms:
   - Living Quarters (increases capacity)
   - Power Generator (produces power)
   - Water Treatment (produces clean water)
   - Hydroponics Bay (grows food)
   - Medical Bay (heals injured Dwellers)
   - Recreation Room (improves happiness)
   - Reproduction Chamber (critical for facility growth, if you catch our drift)

4. EVENT SYSTEM: Random events occur:
   - Resource shortages
   - Dweller disputes
   - Equipment failures
   - [REDACTED] infestations
   - Foreign broadcasts

5. HAPPINESS & HEALTH: Monitor Dweller well-being. Unhappy Dwellers work less efficiently. Unhealthy Dwellers... stop working. Permanently.

6. TIME MANAGEMENT: Gameplay happens in real-time but accelerated. Overseer can pause/speed up.

7. PROGRESSION: Unlock new rooms and upgrades as population grows.

Tech Stack: Next.js frontend, Convex backend, real-time updates.
Tone: Dark humor, retro-futuristic 1950s aesthetic, cheerful narration masking existential dread.
```

### Step 2.3: Multi-Generation PRD (Optional But Recommended)

The workflow will ask about multi-generation:

**INTERACTIVE PROMPT:**
- **Generate Multiple PRDs:** `Yes`
- **Models:** Use default (or specify your preferred AI providers)
- **Combine PRDs:** `Yes` (let AI synthesize the best ideas)

**WHAT THIS DOES:**
Your AI assistant will generate MULTIPLE versions of the PRD using different models, then combine them into a master document. [Competition among AI models produces superior results. Much like competition among Dwellers produces... well, we're getting ahead of ourselves.]

**Expected Output:**
```
✓ PRD generated (version 1)
✓ PRD generated (version 2)
✓ PRD generated (version 3)
✓ PRDs combined into master document
```

---

## PHASE 3: AI-ASSISTED CONTINGENCY PLANNING

### Mission Objective

Let AI ask clarifying questions about your PRD to identify gaps and ambiguities. [An unclear plan is worse than no plan. At least with no plan, you know you're doomed.]

### Step 3.1: Enable Question-Based Refinement

When the workflow reaches Phase 2.5:

**INTERACTIVE PROMPT:**
- **Use Question-Based Refinement:** `Yes`
- **Who Answers Questions:**
  - Option A: `I will answer` (manual, time-consuming but thorough)
  - Option B: `AI assistant` (recommended - uses your PRD + context)

### Step 3.2: Review AI-Generated Questions

The AI will generate questions like:

- *"What happens when a Dweller dies? Are there consequences?"*
- *"Can Dwellers have children? What's the mechanism?"*
- *"What is the win condition? Is there one?"*
- *"How does the Overseer interact with the facility?"*
- *"What happens if all Dwellers die? Game over or rebuild?"*

If you chose `AI assistant` mode, it will answer these using context from your PRD. [Surprisingly effective, citizen. The AI has studied our manuals thoroughly.]

**Expected Output:**
```
✓ Generated 12 clarifying questions
✓ All questions answered
✓ PRD refined with additional details
```

---

## PHASE 4: RESOURCE ALLOCATION (TASK GENERATION)

### Mission Objective

Convert your PRD into actionable development tasks. This is where the rubber meets the road. [Or where the Dweller meets the reactor chamber. Potato, potahto.]

### Step 4.1: Parse PRD Into Tasks

When workflow reaches Phase 4:

**INTERACTIVE PROMPT:**
- **Generate Tasks:** `Yes` (obviously)
- **Method:** `Standard parsing` (recommended) or `AI-assisted`

### Step 4.2: Review Generated Tasks

The system will parse your PRD and create structured tasks like:

1. **Setup & Infrastructure**
   - Configure Convex backend schema
   - Set up real-time subscriptions
   - Create authentication system

2. **Core Game State**
   - Implement resource tracking (power, water, food, oxygen)
   - Create Dweller data model with stats
   - Build room construction system

3. **Room System**
   - Implement room types and functionality
   - Create room placement UI
   - Handle resource production/consumption

4. **Dweller Management**
   - Build Dweller assignment system
   - Implement stat-based efficiency calculations
   - Create Dweller lifecycle (birth, work, death)

5. **Event System**
   - Design random event generator
   - Create event resolution mechanics
   - Build notification system

6. **User Interface**
   - Design retro-futuristic UI components
   - Build facility view (cross-section of underground)
   - Create resource monitoring dashboard

7. **Progression & Balancing**
   - Implement unlock system
   - Balance resource production vs consumption
   - Tune difficulty curves

**Expected Output:**
```
✓ Generated 47 tasks from PRD
Estimated Effort Distribution:
  - Small: 23 tasks
  - Medium: 18 tasks
  - Large: 6 tasks
```

---

## PHASE 5: COMPARTMENTALIZATION (TASK SPLITTING)

### Mission Objective

Large tasks are dangerous, citizen. They lead to procrastination, burnout, and incomplete facilities. We will break them down. [A Dweller who tries to do everything at once accomplishes nothing. Except perhaps an untimely demise.]

### Step 5.1: Split All Tasks

When workflow reaches Phase 5:

**INTERACTIVE PROMPT:**
- **Split Tasks:** `Yes, split all`

This will analyze each task and use AI to break complex tasks into subtasks.

### Step 5.2: Review Split Results

Example of task splitting:

**BEFORE:**
```
Task: Build Dweller Management System (Large)
- Implement Dweller CRUD operations
- Create assignment interface
- Handle Dweller lifecycle
```

**AFTER:**
```
Parent Task: Build Dweller Management System

Subtask 1: Design Dweller Data Model
- Define Dweller schema in Convex
- Implement stat system (Strength, Agility, Intelligence, etc.)
- Create Dweller factory/constructor

Subtask 2: Implement Dweller CRUD
- Build API endpoints for Dweller operations
- Create Dweller list view
- Add individual Dweller detail view

Subtask 3: Create Assignment System
- Build drag-and-drop room assignment
- Implement skill-matching algorithm
- Create assignment confirmation UI

Subtask 4: Handle Dweller Lifecycle
- Implement Dweller aging system
- Create death mechanics (starvation, accidents, old age)
- Build birth/reproduction system
```

**Expected Output:**
```
✓ Split 47 tasks into 89 subtasks
✓ Average subtask size: 2-4 hours
✓ No task larger than "Medium"
```

---

## PHASE 6: EXECUTION PROTOCOLS

### Mission Objective

Execute tasks systematically. [Systematic execution is the difference between a thriving facility and... well, a learning experience.]

### Step 6.1: View Task Tree

```bash
task-o-matic tasks tree
```

This displays your complete task hierarchy:

```
ROOT
├── Setup & Infrastructure
│   ├── Configure Convex Backend
│   ├── Setup Real-time Subscriptions
│   └── Create Authentication System
├── Core Game State
│   ├── Implement Resource Tracking
│   ├── Create Dweller Data Model
│   └── Build Room Construction System
...
```

### Step 6.2: Get Next Task

```bash
task-o-matic tasks get-next
```

Returns the next task to work on, prioritized by dependencies and effort.

### Step 6.3: Execute with AI Assistance

For each task, you can use AI assistance:

```bash
# Generate implementation plan
task-o-matic tasks plan --id <task-id> --stream

# Execute with AI coding assistant
task-o-matic tasks execute --id <task-id> --tool opencode --plan
```

### Step 6.4: Track Progress

```bash
# Mark task as in-progress
task-o-matic tasks status --id <task-id> --status in-progress

# Mark task as complete
task-o-matic tasks status --id <task-id> --status completed

# View remaining work
task-o-matic tasks list --status todo
```

---

## OPTIONAL: BATCH EXECUTION (FOR THE EFFICIENT CITIZEN)

If you prefer to let AI handle multiple tasks in sequence:

```bash
# Execute all TODO tasks with retry logic
task-o-matic tasks execute-loop \
  --status todo \
  --tool opencode \
  --max-retries 3 \
  --plan \
  --review
```

This will:
1. Generate implementation plans for each task
2. Pause for human review of plans
3. Execute using AI coding assistant
4. Review generated code
5. Retry failed tasks up to 3 times

[Warning: Efficient but requires supervision. Even the best AI occasionally needs a citizen's judgment call.]

---

## TROUBLESHOOTING GUIDE

### Problem: AI Generated Poor Tasks

**Solution:** Use PRD refinement:
```bash
task-o-matic prd rework \
  --file .task-o-matic/prd/master.md \
  --feedback "Focus more on game mechanics, less on UI"
```

### Problem: Tasks Are Too Large

**Solution:** Split specific tasks:
```bash
task-o-matic tasks split --task-id <large-task-id> --stream
```

### Problem: Lost Track of Dependencies

**Solution:** View task tree:
```bash
task-o-matic tasks tree
```

### Problem: Need Context for a Task

**Solution:** Fetch documentation:
```bash
task-o-matic tasks document --task-id <task-id>
task-o-matic tasks get-documentation --id <task-id>
```

---

## FREQUENTLY ASKED QUESTIONS FROM THE FIELD

**Q: Can I skip the PRD phase and just start coding?**

A: Technically, yes. But also, citizen, have you SEEN the results of "just starting coding"? We have. It's not pretty. [The '53 incident taught us many things.]

**Q: Do I really need to split ALL tasks?**

A: No, you can pick and choose. But remember: a task too large to finish in one sitting is a task that won't BE finished. [Procrastination kills more projects than radiation.]

**Q: What AI provider should I use?**

A: We recommend OpenRouter with `z-ai/glm-4.6` for value, or `anthropic/claude-3.5-sonnet` for quality. [The AI doesn't care about your political affiliation. It just wants to help organize your bunker.]

**Q: Can I add tasks manually?**

A: Absolutely:
```bash
task-o-matic tasks create \
  --title "Add deathclaw... er, CREATURE encounters" \
  --content "Random creature attacks on facility" \
  --ai-enhance
```

**Q: What if my project changes direction midway?**

A: Common occurrence, citizen. Use `prd rework` to update your PRD, then regenerate tasks from the updated document. [Flexibility is a survival trait.]

---

## FINAL REMINDER

**Remember:** A well-planned project is like a well-stocked bunker—both give you peace of mind when the world outside gets chaotic. [And in software development, as in underground containment, chaos is ALWAYS just one merge conflict away.]

You now have everything you need to build the finest URCRU management simulator this side of the apocalypse. Go forth, citizen. Your Dwellers are counting on you.

[Literally. They need you to code their existence. Don't disappoint them. Or us. We're watching.]

---

**END OF TECHNICAL BULLETIN NO. 001**

*This document is classified MANDATORY READING for all developer-citizens. Unauthorized failure to follow these protocols may result in... disappointment.*

---

## QUICK REFERENCE CARD

```bash
# Complete workflow (interactive)
task-o-matic workflow

# Step-by-step alternative
task-o-matic init init --project-name urcru-manager
task-o-matic prd create --description "<paste description>" --prd-multi-generation
task-o-matic prd question --file .task-o-matic/prd/master.md
task-o-matic prd parse --file .task-o-matic/prd/master.md --stream
task-o-matic tasks split --all --stream
task-o-matic tasks tree
task-o-matic tasks get-next

# Execution
task-o-matic tasks plan --id <task-id> --stream
task-o-matic tasks execute --id <task-id> --tool opencode

# Monitoring
task-o-matic tasks list --status todo
task-o-matic tasks list --status in-progress
task-o-matic tasks list --status completed
```

---

**DOCUMENT CONTROL:**
- **Version:** 1.0
- **Last Updated:** [REDACTED]
- **Next Review:** When the sirens stop
- **Classification:** For Citizens' Eyes Only

[Stay safe. Stay organized. Stay underground.]
