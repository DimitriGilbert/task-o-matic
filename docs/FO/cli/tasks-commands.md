## TECHNICAL BULLETIN NO. 002
### TASKS COMMANDS - TASK MANAGEMENT FIELD OPERATIONS

**DOCUMENT ID:** `task-o-matic-cli-tasks-commands-v1`
**CLEARANCE:** `All Personnel`
**MANDATORY COMPLIANCE:** `Yes`

### ⚠️ CRITICAL SURVIVAL NOTICE

Citizen, the tasks commands are your lifeline in the AI-pocalypse wasteland. Without proper task management, you're just wandering aimlessly through radioactive ruins. These commands provide structure, AI enhancement, and execution capabilities that separate survivors from the lost. Master them or watch your projects decay into chaos.

### COMMAND ARCHITECTURE OVERVIEW

The tasks command group represents the core operational hub for task lifecycle management. Built on a hierarchical architecture, it supports parent-child relationships, AI-enhanced descriptions, implementation planning, and automated execution. Each subcommand specializes in specific aspects of task management while maintaining consistent interfaces and error handling.

**Core Design Principles:**
- **Hierarchical Structure**: Tasks can have parent-child relationships forming trees
- **AI Integration**: All task operations support AI enhancement and analysis
- **Execution Pipeline**: Direct integration with external coding assistants
- **Progressive Enhancement**: Tasks can be enhanced, split, and refined iteratively
- **Documentation Integration**: Automatic fetching and analysis of relevant documentation

---

## CREATE COMMAND

**Command:** `task-o-matic tasks create`

### COMMAND SIGNATURE
```bash
task-o-matic tasks create --title <title> [options]
```

### REQUIRED OPTIONS
```bash
--title <title>              # Task title (required)
```

### OPTIONAL OPTIONS
```bash
--content <content>           # Task content (supports markdown)
--effort <effort>            # Estimated effort (small/medium/large)
--parent-id <id>             # Parent task ID (creates subtask)
--ai-enhance                 # Enhance task with AI using Context7 documentation
--stream                     # Show streaming AI output during enhancement
--ai-provider <provider>       # AI provider override
--ai-model <model>           # AI model override
--ai-key <key>               # AI API key override
--ai-provider-url <url>       # AI provider URL override
--reasoning <tokens>          # Enable reasoning for OpenRouter models (max reasoning tokens)
```

### CREATE COMMAND EXAMPLES

#### Basic Task Creation
```bash
# Simple task creation
task-o-matic tasks create --title "Build radiation detector"

# Task with content and effort
task-o-matic tasks create \
  --title "Create water purification system" \
  --content "Design and implement a water purification system using reverse osmosis" \
  --effort large

# Create subtask
task-o-matic tasks create \
  --title "Research filtration methods" \
  --parent-id task-parent-123 \
  --content "Investigate various water filtration methods for radioactive contamination"
```

#### AI-Enhanced Task Creation
```bash
# Enhanced task with streaming
task-o-matic tasks create \
  --title "Implement emergency communication system" \
  --content "Build a resilient communication network for emergency situations" \
  --ai-enhance \
  --stream

# Enhanced task with custom AI model
task-o-matic tasks create \
  --title "Design shelter ventilation" \
  --ai-enhance \
  --ai-provider anthropic \
  --ai-model claude-3.5-sonnet \
  --reasoning 2048

# Enhanced subtask with Context7 documentation
task-o-matic tasks create \
  --title "Install air filtration units" \
  --parent-id task-ventilation-123 \
  --ai-enhance \
  --ai-provider openrouter \
  --ai-model anthropic/claude-3.5-sonnet
```

### RETURN VALUES AND EXIT CODES
- **Success (0)**: Task created successfully, returns task object with ID
- **Validation Error (2)**: Invalid input parameters or missing required fields
- **AI Error (3)**: AI enhancement failed
- **Storage Error (4)**: Failed to save task to storage

### ERROR CONDITIONS AND EXCEPTIONS
```bash
# Missing required title
Error: Missing required argument: title
Solution: Provide --title with descriptive task name

# Invalid parent ID
Error: Parent task not found: invalid-parent-id
Solution: Verify parent task exists or omit --parent-id

# AI enhancement failure
Error: Failed to enhance task with AI
Solution: Check AI provider configuration and network connectivity

# Storage permission error
Error: EACCES: permission denied, '.task-o-matic/tasks/task-123.json'
Solution: Check directory permissions and disk space
```

---

## LIST COMMAND

**Command:** `task-o-matic tasks list`

### COMMAND SIGNATURE
```bash
task-o-matic tasks list [options]
```

### OPTIONAL OPTIONS
```bash
-s, --status <status>        # Filter by status (todo/in-progress/completed)
-t, --tag <tag>             # Filter by tag
```

### LIST COMMAND EXAMPLES

#### Basic Listing
```bash
# List all tasks
task-o-matic tasks list

# Filter by status
task-o-matic tasks list --status todo
task-o-matic tasks list --status in-progress
task-o-matic tasks list --status completed

# Filter by tag
task-o-matic tasks list --tag urgent
task-o-matic tasks list --tag infrastructure
task-o-matic tasks list --tag security

# Combined filters
task-o-matic tasks list --status todo --tag critical
```

#### Advanced Filtering Examples
```bash
# List all completed infrastructure tasks
task-o-matic tasks list --status completed --tag infrastructure

# List all urgent todo items
task-o-matic tasks list --status todo --tag urgent

# List all in-progress security tasks
task-o-matic tasks list --status in-progress --tag security
```

### OUTPUT FORMAT
The list command displays tasks in a structured format:
- Task ID and title
- Current status
- Tags and effort estimates
- Subtask count
- Creation and modification dates

### RETURN VALUES
- **Success (0)**: Tasks listed successfully
- **Filter Error (2)**: Invalid status or tag filter
- **Storage Error (4)**: Failed to read tasks from storage

---

## SHOW COMMAND

**Command:** `task-o-matic tasks show`

### COMMAND SIGNATURE
```bash
task-o-matic tasks show --id <id>
```

### REQUIRED OPTIONS
```bash
--id <id>                   # Task ID to display (required)
```

### SHOW COMMAND EXAMPLES

#### Basic Task Display
```bash
# Show task details
task-o-matic tasks show --id task-123

# Show subtask details
task-o-matic tasks show --id task-123-456

# Show task with full context
task-o-matic tasks show --id task-ventilation-system
```

### DISPLAYED INFORMATION
- **Basic Details**: Title, description, status, effort estimate
- **Metadata**: Creation date, modification date, tags
- **Hierarchy**: Parent task and subtasks
- **Planning**: Implementation plan if available
- **Documentation**: Relevant documentation if fetched
- **AI Metadata**: Enhancement information and sources

### ERROR CONDITIONS
```bash
# Task not found
Error: Task not found: invalid-task-id
Solution: Verify task ID with 'task-o-matic tasks list'

# Invalid task ID format
Error: Invalid task ID format
Solution: Use correct task ID format from list output
```

---

## UPDATE COMMAND

**Command:** `task-o-matic tasks update`

### COMMAND SIGNATURE
```bash
task-o-matic tasks update --id <id> [options]
```

### REQUIRED OPTIONS
```bash
--id <id>                   # Task ID to update (required)
```

### OPTIONAL OPTIONS
```bash
--title <title>              # New task title
--description <description>    # New task description
--status <status>            # New status (todo/in-progress/completed)
--effort <effort>           # New estimated effort (small/medium/large)
--tags <tags>                # New tags (comma-separated)
```

### UPDATE COMMAND EXAMPLES

#### Basic Updates
```bash
# Update task title
task-o-matic tasks update --id task-123 --title "Updated radiation detector design"

# Update task status
task-o-matic tasks update --id task-123 --status in-progress
task-o-matic tasks update --id task-123 --status completed

# Update multiple fields
task-o-matic tasks update \
  --id task-123 \
  --title "Enhanced water purification system" \
  --description "Updated design with reverse osmosis and UV treatment" \
  --effort large \
  --tags "infrastructure,critical,water"

# Update tags only
task-o-matic tasks update --id task-123 --tags "urgent,infrastructure,health"
```

#### Status Transition Examples
```bash
# Start working on task
task-o-matic tasks update --id task-123 --status in-progress

# Mark task as completed
task-o-matic tasks update --id task-123 --status completed

# Reopen completed task
task-o-matic tasks update --id task-123 --status todo
```

### VALIDATION RULES
- **At least one field** must be specified for update
- **Status values** must be one of: todo, in-progress, completed
- **Effort values** must be one of: small, medium, large
- **Tags** are comma-separated and will replace existing tags

### ERROR CONDITIONS
```bash
# No update fields provided
Error: At least one field must be specified for update
Solution: Provide at least one of --title, --description, --status, --effort, --tags

# Invalid status
Error: Invalid status: invalid-status
Solution: Use valid status: todo, in-progress, completed

# Task not found
Error: Task not found: invalid-task-id
Solution: Verify task ID exists before updating
```

---

## DELETE COMMAND

**Command:** `task-o-matic tasks delete`

### COMMAND SIGNATURE
```bash
task-o-matic tasks delete --id <id> [options]
```

### REQUIRED OPTIONS
```bash
--id <id>                   # Task ID to delete (required)
```

### OPTIONAL OPTIONS
```bash
--force                      # Skip confirmation and delete anyway
--cascade                    # Delete all subtasks as well
```

### DELETE COMMAND EXAMPLES

#### Safe Deletion
```bash
# Interactive deletion (shows confirmation)
task-o-matic tasks delete --id task-123

# Delete with subtasks
task-o-matic tasks delete --id task-123 --cascade

# Force deletion (no confirmation)
task-o-matic tasks delete --id task-123 --force

# Force delete with cascade
task-o-matic tasks delete --id task-123 --force --cascade
```

#### Deletion Scenarios
```bash
# Delete simple task (no subtasks)
task-o-matic tasks delete --id task-simple-123

# Delete parent task with subtasks
task-o-matic tasks delete --id task-parent-456 --cascade

# Batch deletion (requires confirmation for each)
task-o-matic tasks delete --id task-123 --force
task-o-matic tasks delete --id task-456 --force
task-o-matic tasks delete --id task-789 --force
```

### SAFETY MECHANISMS
- **Confirmation Required**: Without --force, shows task details and requires confirmation
- **Cascade Protection**: Without --cascade, refuses to delete tasks with subtasks
- **Irreversible Action**: Deleted tasks cannot be recovered
- **Orphan Handling**: Cascade deletion properly handles nested subtasks

### ERROR CONDITIONS
```bash
# Task has subtasks without cascade
Error: Cannot delete task with subtasks without --cascade
Solution: Use --cascade to delete task and all subtasks

# Task not found
Error: Task not found: invalid-task-id
Solution: Verify task ID with 'task-o-matic tasks list'

# Confirmation required
Error: Use --force to confirm deletion
Solution: Add --force flag or run without --force for interactive confirmation
```

---

## STATUS COMMAND

**Command:** `task-o-matic tasks status`

### COMMAND SIGNATURE
```bash
task-o-matic tasks status --id <id> --status <status>
```

### REQUIRED OPTIONS
```bash
-i, --id <id>               # Task ID (required)
-s, --status <status>         # New status (required)
```

### STATUS COMMAND EXAMPLES

#### Status Changes
```bash
# Start task
task-o-matic tasks status --id task-123 --status in-progress

# Complete task
task-o-matic tasks status --id task-123 --status completed

# Reopen task
task-o-matic tasks status --id task-123 --status todo

# Mark multiple tasks as in-progress
task-o-matic tasks status --id task-123 --status in-progress
task-o-matic tasks status --id task-456 --status in-progress
task-o-matic tasks status --id task-789 --status in-progress
```

#### Workflow Integration
```bash
# Start work on next task
NEXT_TASK=$(task-o-matic tasks get-next --status todo | grep "ID:" | cut -d' ' -f2)
task-o-matic tasks status --id $NEXT_TASK --status in-progress

# Complete current task
task-o-matic tasks status --id task-current --status completed

# Move to next task
task-o-matic tasks get-next
```

### STATUS VALUES AND MEANINGS
- **todo**: Task is ready to start work
- **in-progress**: Currently being worked on
- **completed**: Task is finished and verified

### STATUS TRANSITION RULES
- Any status can transition to any other status
- No restrictions on status changes
- Automatic timestamp updates on status change
- Subtask status independent of parent status

### ERROR CONDITIONS
```bash
# Missing required options
Error: Missing required arguments: id, status
Solution: Provide both --id and --status

# Invalid status value
Error: Invalid status: invalid-status
Solution: Use valid status: todo, in-progress, completed

# Task not found
Error: Task not found: invalid-task-id
Solution: Verify task ID exists
```

---

## TAGS COMMANDS

**Commands:** `task-o-matic tasks add-tags`, `task-o-matic tasks remove-tags`

### ADD-TAGS COMMAND SIGNATURE
```bash
task-o-matic tasks add-tags --id <id> --tags <tags>
```

### REMOVE-TAGS COMMAND SIGNATURE
```bash
task-o-matic tasks remove-tags --id <id> --tags <tags>
```

### REQUIRED OPTIONS
```bash
--id <id>                   # Task ID (required)
--tags <tags>                # Tags to add/remove (comma-separated, required)
```

### TAGS COMMAND EXAMPLES

#### Adding Tags
```bash
# Add single tag
task-o-matic tasks add-tags --id task-123 --tags urgent

# Add multiple tags
task-o-matic tasks add-tags --id task-123 --tags "infrastructure,critical,water"

# Add tags to subtask
task-o-matic tasks add-tags --id task-123-456 --tags "research,filtration"

# Add priority tags
task-o-matic tasks add-tags --id task-123 --tags "high-priority,security,compliance"
```

#### Removing Tags
```bash
# Remove single tag
task-o-matic tasks remove-tags --id task-123 --tags urgent

# Remove multiple tags
task-o-matic tasks remove-tags --id task-123 --tags "deprecated,old-priority"

# Remove all priority tags
task-o-matic tasks remove-tags --id task-123 --tags "high-priority,low-priority,medium-priority"

# Clean up temporary tags
task-o-matic tasks remove-tags --id task-123 --tags "temp,review-needed,draft"
```

#### Tag Management Workflows
```bash
# Initial tagging
task-o-matic tasks create --title "Build shelter" --tags "infrastructure,critical"
task-o-matic tasks add-tags --id task-123 --tags "foundation,structure"

# Priority changes
task-o-matic tasks remove-tags --id task-123 --tags "low-priority"
task-o-matic tasks add-tags --id task-123 --tags "high-priority"

# Category organization
task-o-matic tasks add-tags --id task-123 --tags "electrical,plumbing,hvac"
task-o-matic tasks add-tags --id task-456 --tags "security,monitoring,alerts"
```

### TAG FORMATTING RULES
- **Case Insensitive**: Tags are stored and matched case-insensitively
- **Trimmed**: Whitespace is automatically trimmed from tags
- **No Duplicates**: Adding existing tags has no effect
- **Comma Separated**: Multiple tags specified with commas
- **Special Characters**: Most characters allowed, avoid commas in tag names

### ERROR CONDITIONS
```bash
# Missing required options
Error: Missing required arguments: id, tags
Solution: Provide both --id and --tags

# Task not found
Error: Task not found: invalid-task-id
Solution: Verify task ID exists

# Empty tags
Error: No tags specified
Solution: Provide at least one tag
```

---

## ENHANCE COMMAND

**Command:** `task-o-matic tasks enhance`

### COMMAND SIGNATURE
```bash
task-o-matic tasks enhance [options]
```

### FILTERING OPTIONS
```bash
--task-id <id>              # Enhance specific task ID
--all                        # Enhance all existing tasks
--status <status>            # Filter tasks by status (todo/in-progress/completed)
--tag <tag>                 # Filter tasks by tag
```

### OPERATION OPTIONS
```bash
--dry                        # Preview what would be enhanced without making changes
--force                      # Skip confirmation prompt for bulk operations
--stream                     # Show streaming AI output during enhancement
```

### AI CONFIGURATION OPTIONS
```bash
--ai-provider <provider>       # AI provider override
--ai-model <model>           # AI model override
--ai-key <key>               # AI API key override
--ai-provider-url <url>       # AI provider URL override
--reasoning <tokens>          # Enable reasoning for OpenRouter models (max reasoning tokens)
```

### ENHANCE COMMAND EXAMPLES

#### Single Task Enhancement
```bash
# Enhance specific task
task-o-matic tasks enhance --task-id task-123

# Enhanced task with streaming
task-o-matic tasks enhance \
  --task-id task-123 \
  --stream \
  --ai-provider anthropic \
  --ai-model claude-3.5-sonnet

# Enhanced task with reasoning
task-o-matic tasks enhance \
  --task-id task-123 \
  --ai-provider openrouter \
  --ai-model anthropic/claude-3.5-sonnet \
  --reasoning 2048
```

#### Bulk Enhancement
```bash
# Enhance all todo tasks
task-o-matic tasks enhance --status todo

# Enhance all tasks with specific tag
task-o-matic tasks enhance --tag infrastructure

# Enhance all tasks (with confirmation)
task-o-matic tasks enhance --all

# Force enhance without confirmation
task-o-matic tasks enhance --all --force
```

#### Filtered Enhancement
```bash
# Enhance all in-progress critical tasks
task-o-matic tasks enhance --status in-progress --tag critical

# Enhance all small effort tasks
task-o-matic tasks enhance --tag small-effort

# Dry run to preview changes
task-o-matic tasks enhance --status todo --dry

# Enhance with custom AI model
task-o-matic tasks enhance \
  --status todo \
  --ai-provider openai \
  --ai-model gpt-4 \
  --force
```

### ENHANCEMENT PROCESS
1. **Task Selection**: Filter tasks based on criteria
2. **Context Gathering**: Collect project context and existing documentation
3. **AI Analysis**: Use AI to enhance task descriptions with additional details
4. **Documentation Integration**: Fetch relevant documentation via Context7
5. **Content Update**: Update task with enhanced information
6. **Metadata Storage**: Save AI metadata and sources

### ENHANCEMENT OUTPUT
- **Enhanced Content**: Updated task description with additional details
- **AI Metadata**: Provider, model, and confidence information
- **Documentation Sources**: Referenced documentation and libraries
- **Processing Stats**: Duration, tokens used, and cost estimates

### ERROR CONDITIONS
```bash
# No tasks found
Error: No tasks found matching filters
Solution: Adjust filters or create tasks first

# Mutual exclusion violation
Error: Cannot specify both --task-id and --all
Solution: Use either specific task ID or bulk options

# AI enhancement failure
Error: Failed to enhance task with AI
Solution: Check AI configuration and network connectivity

# Confirmation required
Error: Operation cancelled by user
Solution: Use --force or confirm when prompted
```

---

## SPLIT COMMAND

**Command:** `task-o-matic tasks split`

### COMMAND SIGNATURE
```bash
task-o-matic tasks split [options]
```

### FILTERING OPTIONS
```bash
--task-id <id>              # Split specific task ID
--all                        # Split all existing tasks that don't have subtasks
--status <status>            # Filter tasks by status (todo/in-progress/completed)
--tag <tag>                 # Filter tasks by tag
```

### OPERATION OPTIONS
```bash
--dry                        # Preview what would be split without making changes
--force                      # Skip confirmation prompt for bulk operations
--stream                     # Show streaming AI output during breakdown
--tools                      # Enable filesystem tools for project analysis
```

### AI CONFIGURATION OPTIONS
```bash
--ai-provider <provider>       # AI provider override
--ai-model <model>           # AI model override
--ai-key <key>               # AI API key override
--ai-provider-url <url>       # AI provider URL override
--reasoning <tokens>          # Enable reasoning for OpenRouter models (max reasoning tokens)
```

### MULTI-AI OPTIONS
```bash
--ai <models...>             # AI model(s) to use. Format: [provider:]model[;reasoning[=budget]]
--combine-ai <provider:model>  # AI model to combine multiple split results
```

### SPLIT COMMAND EXAMPLES

#### Single Task Splitting
```bash
# Split specific task
task-o-matic tasks split --task-id task-123

# Split with streaming and tools
task-o-matic tasks split \
  --task-id task-123 \
  --stream \
  --tools

# Split with custom AI model
task-o-matic tasks split \
  --task-id task-123 \
  --ai-provider anthropic \
  --ai-model claude-3.5-sonnet \
  --reasoning 2048
```

#### Multi-AI Splitting
```bash
# Split with multiple AI models
task-o-matic tasks split --task-id task-123 \
  --ai "anthropic:claude-3.5-sonnet" \
  --ai "openai:gpt-4o" \
  --ai "openrouter:qwen-2.5" \
  --combine-ai anthropic:claude-3.5-sonnet \
  --stream

# Split with reasoning enabled
task-o-matic tasks split --task-id task-123 \
  --ai "openrouter:claude-3.5-sonnet;reasoning=4096" \
  --stream
```

#### Bulk Splitting
```bash
# Split all todo tasks
task-o-matic tasks split --status todo

# Split all tasks without subtasks
task-o-matic tasks split --all

# Split tasks by category
task-o-matic tasks split --tag infrastructure
task-o-matic tasks split --tag complex

# Force split without confirmation
task-o-matic tasks split --all --force
```

#### Advanced Splitting Scenarios
```bash
# Dry run to preview splits
task-o-matic tasks split --status todo --dry

# Split with project analysis
task-o-matic tasks split \
  --status in-progress \
  --tools \
  --stream

# Split specific complex tasks
task-o-matic tasks split \
  --tag "large-effort" \
  --ai-provider openrouter \
  --ai-model anthropic/claude-3.5-sonnet

# Split with multi-AI collaboration
task-o-matic tasks split \
  --task-id task-complex-123 \
  --ai "anthropic:claude-3.5-sonnet;reasoning=5000" \
  --ai "openai:gpt-4o" \
  --combine-ai anthropic:claude-3.5-sonnet \
  --stream
```

### SPLITTING PROCESS
1. **Task Analysis**: Analyze task complexity and scope
2. **Context Gathering**: Collect project structure and related tasks
3. **AI Breakdown**: Use AI to identify logical subtask components
4. **Dependency Analysis**: Determine subtask dependencies and order
5. **Subtask Creation**: Create subtasks with appropriate details
6. **Hierarchy Update**: Update parent-child relationships
7. **Validation**: Verify split quality and completeness

### SPLITTING CRITERIA
- **Task Complexity**: Large or complex tasks are prioritized
- **Effort Estimates**: Tasks marked as large effort
- **Manual Selection**: Specific task ID targeting
- **Tag-Based**: Tasks tagged as complex or large
- **Status Filtering**: Focus on todo or in-progress tasks

### SPLITTING OUTPUT
- **Subtasks Created**: Number and details of new subtasks
- **Parent Update**: Original task updated with subtask references
- **Dependency Graph**: Logical ordering and dependencies
- **AI Confidence**: Split quality and confidence scores
- **Processing Metadata**: AI model, tokens, and duration

### ERROR CONDITIONS
```bash
# Task already has subtasks
Error: Task already has subtasks
Solution: Choose a task without existing subtasks or manage existing subtasks

# No tasks found for splitting
Error: No tasks found matching filters
Solution: Adjust filters or create tasks that need splitting

# AI splitting failure
Error: Failed to split task with AI
Solution: Check AI configuration and task complexity

# Mutual exclusion error
Error: Cannot specify both --task-id and bulk filters
Solution: Use either specific task or filtering options
```

---

## EXECUTE COMMAND

**Command:** `task-o-matic tasks execute`

### COMMAND SIGNATURE
```bash
task-o-matic tasks execute --id <id> [options]
```

### REQUIRED OPTIONS
```bash
--id <id>                   # Task ID to execute (required)
```

### EXECUTOR OPTIONS
```bash
--tool <tool>                # External tool to use (opencode/claude/gemini/codex, default: opencode)
-m, --model <model>           # Model to use with the executor
--message <message>           # Custom message to send to tool (uses task plan if not provided)
```

### EXECUTION CONTROL OPTIONS
```bash
--continue-session            # Continue last session (for error feedback, default: false)
--dry                        # Show what would be executed without running it
--auto-commit                # Automatically commit changes after execution (default: false)
```

### PLANNING OPTIONS
```bash
--plan                       # Generate an implementation plan before execution (default: false)
--plan-model <model>         # Model/executor to use for planning (e.g., 'opencode:gpt-4o' or 'gpt-4o')
--plan-tool <tool>           # Tool/Executor to use for planning (defaults to --tool)
--review-plan                # Pause for human review of plan (default: false)
```

### REVIEW OPTIONS
```bash
--review                     # Run AI review after execution (default: false)
--review-model <model>        # Model/executor to use for review (e.g., 'opencode:gpt-4o' or 'gpt-4o')
```

### VALIDATION OPTIONS
```bash
--validate <command>          # Validation/verification command to run after execution (can be used multiple times)
--verify <command>            # Alias for --validate (verification command, can be used multiple times)
```

### RETRY OPTIONS
```bash
--max-retries <number>       # Maximum number of retries (opt-in, enables retry logic)
--try-models <models>        # Progressive model/executor configs for retries (e.g., 'gpt-4o-mini,claude:sonnet-4')
```

### INCLUSION OPTIONS
```bash
--include-prd                # Include PRD content in execution context (default: false)
```

### EXECUTE COMMAND EXAMPLES

#### Basic Execution
```bash
# Execute task with default tool
task-o-matic tasks execute --id task-123

# Execute with specific tool and model
task-o-matic tasks execute \
  --id task-123 \
  --tool claude \
  --model claude-3.5-sonnet

# Execute with custom message
task-o-matic tasks execute \
  --id task-123 \
  --message "Implement radiation detection system using Geiger counter integration"
```

#### Planning and Review
```bash
# Execute with planning and review
task-o-matic tasks execute \
  --id task-123 \
  --plan \
  --review-plan \
  --review

# Execute with custom planning model
task-o-matic tasks execute \
  --id task-123 \
  --plan \
  --plan-model "opencode:gpt-4o" \
  --review-plan

# Execute with AI review
task-o-matic tasks execute \
  --id task-123 \
  --review \
  --review-model anthropic:claude-3.5-sonnet
```

#### Validation and Verification
```bash
# Execute with validation commands
task-o-matic tasks execute \
  --id task-123 \
  --validate "npm test" \
  --validate "npm run lint" \
  --verify "npm run build"

# Execute with comprehensive validation
task-o-matic tasks execute \
  --id task-123 \
  --validate "pytest tests/" \
  --validate "black --check ." \
  --validate "mypy ."
```

#### Retry and Error Handling
```bash
# Execute with retry logic
task-o-matic tasks execute \
  --id task-123 \
  --max-retries 3 \
  --try-models "gpt-4o-mini,gpt-4o,claude:sonnet-4"

# Execute with progressive model escalation
task-o-matic tasks execute \
  --id task-123 \
  --max-retries 5 \
  --try-models "openrouter:gpt-4o-mini,openrouter:gpt-4o,openrouter:claude-3.5-sonnet"

# Continue failed session
task-o-matic tasks execute \
  --id task-123 \
  --continue-session \
  --max-retries 2
```

#### Advanced Execution Scenarios
```bash
# Full execution pipeline
task-o-matic tasks execute \
  --id task-123 \
  --plan \
  --plan-model "opencode:gpt-4o" \
  --review-plan \
  --tool claude \
  --model claude-3.5-sonnet \
  --validate "npm test" \
  --validate "npm run build" \
  --review \
  --review-model "opencode:gpt-4o" \
  --auto-commit \
  --include-prd

# Dry run execution
task-o-matic tasks execute \
  --id task-123 \
  --dry \
  --plan \
  --validate "npm test"

# Execute with session continuation
task-o-matic tasks execute \
  --id task-123 \
  --continue-session \
  --max-retries 3 \
  --try-models "gpt-4o-mini,claude:sonnet-4"
```

### EXECUTION PIPELINE
1. **Plan Generation** (optional): Create implementation plan using AI
2. **Plan Review** (optional): Human review of generated plan
3. **Task Execution**: Send task and plan to external coding tool
4. **Result Monitoring**: Track execution progress and output
5. **Validation** (optional): Run verification commands
6. **AI Review** (optional): AI analysis of implementation quality
7. **Commit** (optional): Automatic git commit of changes

### SUPPORTED EXECUTORS
- **opencode**: OpenCode AI assistant (default)
- **claude**: Anthropic Claude directly
- **gemini**: Google Gemini directly
- **codex**: GitHub Copilot/Codex

### VALIDATION INTEGRATION
- **Build Verification**: Compile and build process validation
- **Test Execution**: Unit and integration test validation
- **Code Quality**: Linting and static analysis validation
- **Functional Testing**: End-to-end functionality validation

### ERROR CONDITIONS
```bash
# Invalid executor tool
Error: Invalid tool: invalid-tool. Must be one of: opencode, claude, gemini, codex
Solution: Use valid executor tool

# Task not found
Error: Task not found: invalid-task-id
Solution: Verify task ID exists

# Execution failure
Error: Task execution failed
Solution: Check external tool availability and network connectivity

# Validation failure
Error: Validation commands failed
Solution: Fix validation errors and retry execution
```

---

## EXECUTE-LOOP COMMAND

**Command:** `task-o-matic tasks execute-loop`

### COMMAND SIGNATURE
```bash
task-o-matic tasks execute-loop [options]
```

### FILTERING OPTIONS
```bash
--status <status>            # Filter tasks by status (todo/in-progress/completed)
--tag <tag>                 # Filter tasks by tag
--ids <ids>                  # Comma-separated list of task IDs to execute
```

### EXECUTOR CONFIGURATION
```bash
--tool <tool>                # External tool to use (opencode/claude/gemini/codex, default: opencode)
--max-retries <number>       # Maximum number of retries per task (default: 3)
--try-models <models>        # Progressive model/executor configs for each retry
```

### EXECUTION OPTIONS
```bash
--message <message>           # Custom message to send to tool (overrides task plan)
--continue-session            # Continue last session (for error feedback, default: false)
--auto-commit                # Automatically commit changes after each task (default: false)
--dry                        # Show what would be executed without running it (default: false)
```

### PLANNING OPTIONS
```bash
--plan                       # Generate an implementation plan before execution (default: false)
--plan-model <model>         # Model/executor to use for planning
--plan-tool <tool>           # Tool/Executor to use for planning (defaults to --tool)
--review-plan                # Pause for human review of plan (default: false)
```

### REVIEW OPTIONS
```bash
--review                     # Run AI review after execution (default: false)
--review-model <model>        # Model/executor to use for review
```

### VALIDATION OPTIONS
```bash
--verify <command>            # Verification command to run after each task (can be used multiple times)
--validate <command>          # Alias for --verify (validation command, can be used multiple times)
```

### INCLUSION OPTIONS
```bash
--include-completed            # Include already-completed tasks in execution (default: false)
--include-prd                # Include PRD content in execution context (default: false)
```

### NOTIFICATION OPTIONS
```bash
--notify <target>            # Notify on completion via URL or command (can be used multiple times)
```

### EXECUTE-LOOP COMMAND EXAMPLES

#### Basic Loop Execution
```bash
# Execute all todo tasks
task-o-matic tasks execute-loop --status todo

# Execute tasks by tag
task-o-matic tasks execute-loop --tag infrastructure

# Execute specific task list
task-o-matic tasks execute-loop --ids "task-123,task-456,task-789"

# Execute with custom tool
task-o-matic tasks execute-loop \
  --status todo \
  --tool claude \
  --model claude-3.5-sonnet
```

#### Advanced Loop Configuration
```bash
# Execute with retry logic and validation
task-o-matic tasks execute-loop \
  --status todo \
  --max-retries 5 \
  --try-models "gpt-4o-mini,gpt-4o,claude:sonnet-4" \
  --validate "npm test" \
  --validate "npm run lint"

# Execute with planning and review
task-o-matic tasks execute-loop \
  --ids "task-123,task-456" \
  --plan \
  --review-plan \
  --review \
  --auto-commit

# Execute with session continuation
task-o-matic tasks execute-loop \
  --status in-progress \
  --continue-session \
  --max-retries 3
```

#### Progressive Model Escalation
```bash
# Execute with model escalation
task-o-matic tasks execute-loop \
  --status todo \
  --try-models "openrouter:gpt-4o-mini,openrouter:gpt-4o,openrouter:claude-3.5-sonnet,openrouter:claude-opus-2024"

# Execute with provider escalation
task-o-matic tasks execute-loop \
  --tag critical \
  --try-models "openai:gpt-4o-mini,anthropic:claude-3.5-sonnet,openrouter:anthropic/claude-opus-2024"

# Execute with custom escalation
task-o-matic tasks execute-loop \
  --ids "task-123,task-456" \
  --try-models "gpt-4o-mini:opencode,gpt-4o:claude,claude-3.5-sonnet:gemini"
```

#### Comprehensive Loop Execution
```bash
# Full-featured loop execution
task-o-matic tasks execute-loop \
  --status todo \
  --tool opencode \
  --max-retries 3 \
  --try-models "openrouter:gpt-4o-mini,openrouter:gpt-4o" \
  --plan \
  --plan-model "opencode:gpt-4o" \
  --review-plan \
  --review \
  --review-model "opencode:gpt-4o" \
  --validate "npm test" \
  --validate "npm run build" \
  --auto-commit \
  --include-prd

# Dry run to preview execution
task-o-matic tasks execute-loop \
  --status todo \
  --dry \
  --plan \
  --validate "npm test"
```

#### Notification Integration
```bash
# Execute with notifications
task-o-matic tasks execute-loop \
  --status todo \
  --notify "https://hooks.slack.com/services/xxx" \
  --notify "email:team@example.com" \
  --notify "notify-send 'Tasks completed'"

# Include completed tasks
task-o-matic tasks execute-loop \
  --status todo \
  --include-completed \
  --notify "https://webhook.example.com"
```

### EXECUTION LOOP PROCESS
1. **Task Filtering**: Select tasks based on status, tags, or IDs
2. **Loop Initialization**: Set up retry counters and model escalation
3. **Task Execution**: For each task:
   - Generate plan (if requested)
   - Execute with current model/executor
   - Validate results (if requested)
   - Review implementation (if requested)
   - Commit changes (if requested)
   - Retry with next model on failure
4. **Progress Tracking**: Monitor success/failure rates
5. **Result Summary**: Report overall execution statistics

### LOOP EXECUTION FEATURES
- **Sequential Processing**: Tasks executed one at a time with retry logic
- **Retry Logic**: Automatic retry with model escalation
- **Progressive Enhancement**: Each retry can use better models
- **Error Recovery**: Continue after individual task failures
- **Comprehensive Logging**: Detailed execution logs and metrics
- **Notification Support**: Multiple notification targets for completion alerts

### ERROR HANDLING IN LOOPS
- **Individual Task Failures**: Continue with next task
- **Model Escalation**: Automatic retry with better models
- **Validation Failures**: Log and continue with next task
- **Network Issues**: Retry with exponential backoff
- **Partial Success**: Report both successful and failed tasks

### ERROR CONDITIONS
```bash
# No tasks found
Error: No tasks found matching filters
Solution: Adjust filters or create tasks first

# Invalid model escalation
Error: Failed to parse --try-models
Solution: Use correct format: "model1,model2,model3"

# All tasks failed
Error: All 5 task(s) failed
Solution: Check configuration and retry with better models

# Executor validation failure
Error: Invalid tool: invalid-tool
Solution: Use valid executor: opencode, claude, gemini, codex
```

---

## TASK PLAN COMMANDS

### PLAN COMMAND

**Command:** `task-o-matic tasks plan`

### COMMAND SIGNATURE
```bash
task-o-matic tasks plan --id <id> [options]
```

### REQUIRED OPTIONS
```bash
--id <id>                   # Task or subtask ID to plan (required)
```

### OPTIONAL OPTIONS
```bash
--stream                     # Show streaming AI output during planning
--ai-provider <provider>       # AI provider override
--ai-model <model>           # AI model override
--ai-key <key>               # AI API key override
--ai-provider-url <url>       # AI provider URL override
--reasoning <tokens>          # Enable reasoning for OpenRouter models (max reasoning tokens)
```

### PLAN COMMAND EXAMPLES
```bash
# Create plan for task
task-o-matic tasks plan --id task-123 --stream

# Plan with custom AI model
task-o-matic tasks plan \
  --id task-123 \
  --ai-provider anthropic \
  --ai-model claude-3.5-sonnet \
  --stream

# Plan with reasoning
task-o-matic tasks plan \
  --id task-123 \
  --reasoning 4096 \
  --stream
```

### LIST-PLAN COMMAND

**Command:** `task-o-matic tasks list-plan`

### COMMAND SIGNATURE
```bash
task-o-matic tasks list-plan
```

### LIST-PLAN COMMAND EXAMPLES
```bash
# List all implementation plans
task-o-matic tasks list-plan
```

### GET-PLAN COMMAND

**Command:** `task-o-matic tasks get-plan`

### COMMAND SIGNATURE
```bash
task-o-matic tasks get-plan --id <id>
```

### REQUIRED OPTIONS
```bash
--id <id>                   # Task or subtask ID (required)
```

### GET-PLAN COMMAND EXAMPLES
```bash
# View existing plan
task-o-matic tasks get-plan --id task-123
```

### SET-PLAN COMMAND

**Command:** `task-o-matic tasks set-plan`

### COMMAND SIGNATURE
```bash
task-o-matic tasks set-plan --id <id> [options]
```

### REQUIRED OPTIONS
```bash
--id <id>                   # Task ID (required)
```

### OPTIONS (MUTUALLY EXCLUSIVE)
```bash
--plan <text>                # Plan content (use quotes for multi-line)
--plan-file <path>           # Path to file containing plan
```

### SET-PLAN COMMAND EXAMPLES
```bash
# Set plan from text
task-o-matic tasks set-plan \
  --id task-123 \
  --plan "Step 1: Setup\nStep 2: Implement\nStep 3: Test"

# Set plan from file
task-o-matic tasks set-plan \
  --id task-123 \
  --plan-file ./plans/implementation.md

# Set plan for multi-line content
task-o-matic tasks set-plan \
  --id task-123 \
  --plan '1. Analyze requirements
2. Design architecture
3. Implement core features
4. Add tests
5. Document changes'
```

### DELETE-PLAN COMMAND

**Command:** `task-o-matic tasks delete-plan`

### COMMAND SIGNATURE
```bash
task-o-matic tasks delete-plan --id <id>
```

### REQUIRED OPTIONS
```bash
--id <id>                   # Task ID (required)
```

### DELETE-PLAN COMMAND EXAMPLES
```bash
# Delete implementation plan
task-o-matic tasks delete-plan --id task-123
```

---

## TASK DOCUMENTATION COMMANDS

### DOCUMENT COMMAND

**Command:** `task-o-matic tasks document`

### COMMAND SIGNATURE
```bash
task-o-matic tasks document [options]
```

### REQUIRED OPTIONS
```bash
--task-id <id>              # Task ID to document (required)
```

### OPTIONAL OPTIONS
```bash
--force                      # Force refresh documentation even if recent
--stream                     # Show streaming AI output during analysis
--ai-provider <provider>       # AI provider override
--ai-model <model>           # AI model override
--ai-key <key>               # AI API key override
--ai-provider-url <url>       # AI provider URL override
--reasoning <tokens>          # Enable reasoning for OpenRouter models (max reasoning tokens)
```

### DOCUMENT COMMAND EXAMPLES
```bash
# Document task
task-o-matic tasks document --task-id task-123

# Document with streaming
task-o-matic tasks document \
  --task-id task-123 \
  --stream

# Force refresh documentation
task-o-matic tasks document \
  --task-id task-123 \
  --force \
  --stream

# Document with custom AI model
task-o-matic tasks document \
  --task-id task-123 \
  --ai-provider anthropic \
  --ai-model claude-3.5-sonnet \
  --reasoning 2048
```

### GET-DOCUMENTATION COMMAND

**Command:** `task-o-matic tasks get-documentation`

### COMMAND SIGNATURE
```bash
task-o-matic tasks get-documentation --id <id>
```

### REQUIRED OPTIONS
```bash
--id <id>                   # Task ID (required)
```

### GET-DOCUMENTATION COMMAND EXAMPLES
```bash
# View existing documentation
task-o-matic tasks get-documentation --id task-123
```

### ADD-DOCUMENTATION COMMAND

**Command:** `task-o-matic tasks add-documentation`

### COMMAND SIGNATURE
```bash
task-o-matic tasks add-documentation --id <id> --doc-file <path> [options]
```

### REQUIRED OPTIONS
```bash
-i, --id <id>               # Task ID (required)
-f, --doc-file <path>       # Path to documentation file (required)
```

### OPTIONAL OPTIONS
```bash
-o, --overwrite              # Overwrite existing documentation
```

### ADD-DOCUMENTATION COMMAND EXAMPLES
```bash
# Add documentation from file
task-o-matic tasks add-documentation \
  --id task-123 \
  --doc-file ./docs/api-reference.md

# Add and overwrite existing documentation
task-o-matic tasks add-documentation \
  --id task-123 \
  --doc-file ./docs/implementation-guide.md \
  --overwrite
```

---

## SUBTASKS COMMAND

**Command:** `task-o-matic tasks subtasks`

### COMMAND SIGNATURE
```bash
task-o-matic tasks subtasks --id <id>
```

### REQUIRED OPTIONS
```bash
--id <id>                   # Parent task ID (required)
```

### SUBTASKS COMMAND EXAMPLES

#### Basic Subtask Listing
```bash
# List subtasks for task
task-o-matic tasks subtasks --id task-123

# List subtasks for complex task
task-o-matic tasks subtasks --id task-shelter-system

# List subtasks for parent task
task-o-matic tasks subtasks --id task-infrastructure-456
```

#### Subtask Analysis
```bash
# Check subtask structure
task-o-matic tasks subtasks --id task-123

# Verify subtask hierarchy
task-o-matic tasks subtasks --id task-parent-789

# Review subtask details
task-o-matic tasks subtasks --id task-water-system
```

### SUBTASKS OUTPUT FORMAT
- **Parent Information**: Parent task title and ID
- **Subtask List**: All direct subtasks with details
- **Hierarchical Display**: Indented structure showing relationships
- **Status Summary**: Completion status of each subtask
- **Metadata**: Creation dates, effort estimates, tags

### ERROR CONDITIONS
```bash
# Task not found
Error: Task not found: invalid-task-id
Solution: Verify parent task ID exists

# No subtasks found
Warning: No subtasks found for task task-123
Solution: This is normal for tasks without subtasks

# Invalid task ID format
Error: Invalid task ID format
Solution: Use correct task ID format
```

---

## TREE COMMAND

**Command:** `task-o-matic tasks tree`

### COMMAND SIGNATURE
```bash
task-o-matic tasks tree [options]
```

### OPTIONAL OPTIONS
```bash
--id <id>                   # Root task ID (optional - shows full tree if not specified)
```

### TREE COMMAND EXAMPLES

#### Full Tree Display
```bash
# Show complete task tree
task-o-matic tasks tree

# Show tree with statistics
task-o-matic tasks tree --verbose
```

#### Subtree Display
```bash
# Show subtree for specific task
task-o-matic tasks tree --id task-123

# Show infrastructure subtree
task-o-matic tasks tree --id task-infrastructure

# Show project phase subtree
task-o-matic tasks tree --id task-phase-1
```

#### Tree Analysis Examples
```bash
# Analyze project structure
task-o-matic tasks tree

# Review specific component
task-o-matic tasks tree --id task-shelter-construction

# Check task dependencies
task-o-matic tasks tree --id task-electrical-system
```

### TREE DISPLAY FEATURES
- **Hierarchical Structure**: Parent-child relationships clearly shown
- **Status Indicators**: Visual indicators for task status
- **Progress Tracking**: Completion percentages for branches
- **Tag Display**: Relevant tags shown for context
- **Effort Summaries**: Cumulative effort estimates

### TREE FORMATTING
- **ASCII Tree**: Text-based tree structure with connectors
- **Color Coding**: Status-based color highlighting
- **Indentation**: Clear hierarchical level indication
- **Metadata Display**: Task IDs and key information
- **Summary Statistics**: Overall project progress metrics

### ERROR CONDITIONS
```bash
# Root task not found
Error: Root task not found: invalid-task-id
Solution: Verify task ID exists in tree

# Tree structure corruption
Error: Invalid task hierarchy detected
Solution: Check for circular references or missing parents

# No tasks in project
Warning: No tasks found in current project
Solution: Create tasks first with 'task-o-matic tasks create'
```

---

## NEXT COMMAND

**Command:** `task-o-matic tasks get-next`

### COMMAND SIGNATURE
```bash
task-o-matic tasks get-next [options]
```

### OPTIONAL OPTIONS
```bash
-s, --status <status>        # Filter by status (todo/in-progress, default: todo)
-t, --tag <tag>             # Filter by tag
-e, --effort <effort>       # Filter by effort (small/medium/large)
-p, --priority <priority>     # Sort priority (newest/oldest/effort/hierarchical, default: hierarchical)
```

### NEXT COMMAND EXAMPLES

#### Basic Next Task
```bash
# Get next todo task (default)
task-o-matic tasks get-next

# Get next in-progress task
task-o-matic tasks get-next --status in-progress

# Get next task by priority
task-o-matic tasks get-next --priority newest
task-o-matic tasks get-next --priority oldest
```

#### Filtered Next Task
```bash
# Get next urgent task
task-o-matic tasks get-next --tag urgent

# Get next small effort task
task-o-matic tasks get-next --effort small

# Get next infrastructure task
task-o-matic tasks get-next --tag infrastructure

# Combined filters
task-o-matic tasks get-next --status todo --tag critical --effort small
```

#### Priority-Based Selection
```bash
# Get newest task
task-o-matic tasks get-next --priority newest

# Get oldest task
task-o-matic tasks get-next --priority oldest

# Get by effort (smallest first)
task-o-matic tasks get-next --priority effort

# Hierarchical order (default)
task-o-matic tasks get-next --priority hierarchical
```

#### Workflow Integration
```bash
# Start work on next task
NEXT_TASK=$(task-o-matic tasks get-next --status todo | grep "ID:" | cut -d' ' -f2)
task-o-matic tasks status --id $NEXT_TASK --status in-progress

# Get next critical task
NEXT_CRITICAL=$(task-o-matic tasks get-next --tag critical | grep "ID:" | cut -d' ' -f2)
task-o-matic tasks execute --id $NEXT_CRITICAL

# Get next small task for quick win
NEXT_SMALL=$(task-o-matic tasks get-next --effort small | grep "ID:" | cut -d' ' -f2)
task-o-matic tasks execute --id $NEXT_SMALL --max-retries 1
```

### NEXT TASK SELECTION ALGORITHM

#### Hierarchical Priority (Default)
1. **Leaf Tasks First**: Tasks without subtasks prioritized
2. **Depth-First**: Process subtasks before parent tasks
3. **Creation Order**: Within same level, older tasks first
4. **Status Filter**: Only consider specified status

#### Newest Priority
1. **Creation Date**: Most recently created tasks first
2. **Status Filter**: Respect status filter
3. **No Hierarchy**: Ignore parent-child relationships

#### Oldest Priority
1. **Creation Date**: Oldest tasks first
2. **Status Filter**: Respect status filter
3. **No Hierarchy**: Ignore parent-child relationships

#### Effort Priority
1. **Effort Size**: Small effort tasks first
2. **Then Medium**: Medium effort tasks
3. **Then Large**: Large effort tasks last
4. **Within Effort**: Hierarchical ordering

### NEXT TASK OUTPUT
- **Task Details**: Title, description, and metadata
- **Context Information**: Parent task and subtasks
- **Selection Criteria**: Why this task was selected
- **Work Estimates**: Effort and complexity indicators
- **Execution Suggestions**: Recommended execution approach

### ERROR CONDITIONS
```bash
# No tasks found
Warning: No tasks found matching criteria
Solution: Adjust filters or create more tasks

# Invalid status filter
Error: Invalid status: invalid-status
Solution: Use valid status: todo, in-progress, completed

# Invalid effort filter
Error: Invalid effort: invalid-effort
Solution: Use valid effort: small, medium, large

# Invalid priority
Error: Invalid priority: invalid-priority
Solution: Use valid priority: newest, oldest, effort, hierarchical
```

---

### FIELD OPERATIONS PROTOCOLS

#### TASK LIFECYCLE MANAGEMENT
The tasks commands implement a complete task lifecycle management system:

1. **Creation Phase**
   - Initial task creation with basic information
   - AI enhancement for detailed descriptions
   - Parent-child relationship establishment
   - Initial tagging and categorization

2. **Planning Phase**
   - Implementation plan generation
   - Documentation research and integration
   - Subtask breakdown and dependency analysis
   - Resource requirement identification

3. **Execution Phase**
   - External tool integration for coding
   - Progress tracking and status updates
   - Validation and verification
   - Error handling and retry logic

4. **Completion Phase**
   - Status finalization and verification
   - Result documentation and review
   - Knowledge capture for future tasks
   - Project progress updates

#### AI INTEGRATION PATTERNS
All task operations support AI integration through standardized patterns:

- **Provider Abstraction**: Unified interface for multiple AI providers
- **Model Selection**: Flexible model configuration per operation
- **Streaming Support**: Real-time AI output for long operations
- **Context Enhancement**: Automatic project context inclusion
- **Documentation Integration**: Context7 MCP tools for documentation retrieval

#### STORAGE INTEGRATION
Tasks are stored using a hierarchical file system approach:

- **Individual Files**: Each task in separate JSON file
- **Metadata Storage**: Rich metadata alongside task data
- **Hierarchy Maintenance**: Parent-child relationships in task data
- **Atomic Operations**: Safe concurrent access to task files
- **Backup Support**: Easy backup and restore capabilities

### SURVIVAL SCENARIOS

#### SCENARIO 1: Project Setup and Task Creation
```bash
# Initialize project
task-o-matic init init --project-name "wasteland-shelter"

# Create main project tasks
task-o-matic tasks create --title "Design shelter foundation" --ai-enhance
task-o-matic tasks create --title "Install radiation shielding" --ai-enhance
task-o-matic tasks create --title "Set up water purification" --ai-enhance

# Create subtasks
task-o-matic tasks create \
  --title "Excavate foundation area" \
  --parent-id task-foundation \
  --ai-enhance

task-o-matic tasks create \
  --title "Install lead lining" \
  --parent-id task-shielding \
  --ai-enhance

# View task tree
task-o-matic tasks tree
```

#### SCENARIO 2: Task Management and Progress Tracking
```bash
# List current tasks
task-o-matic tasks list --status todo

# Get next task to work on
task-o-matic tasks get-next --status todo

# Start working on task
task-o-matic tasks status --id task-123 --status in-progress

# Split complex task into subtasks
task-o-matic tasks split --task-id task-complex-456 --stream

# Update task progress
task-o-matic tasks update --id task-123 --status completed
```

#### SCENARIO 3: AI-Enhanced Task Execution
```bash
# Execute task with full AI support
task-o-matic tasks execute \
  --id task-123 \
  --plan \
  --review-plan \
  --tool claude \
  --validate "npm test" \
  --auto-commit

# Bulk execute todo tasks
task-o-matic tasks execute-loop \
  --status todo \
  --max-retries 3 \
  --try-models "gpt-4o-mini,gpt-4o,claude-3.5-sonnet" \
  --validate "npm test" \
  --auto-commit

# Enhance tasks with latest documentation
task-o-matic tasks enhance --status todo --ai-provider anthropic --stream
```

#### SCENARIO 4: Project Analysis and Reorganization
```bash
# Analyze project structure
task-o-matic tasks tree

# Review task details
task-o-matic tasks show --id task-123

# List tasks by category
task-o-matic tasks list --tag infrastructure
task-o-matic tasks list --tag security
task-o-matic tasks list --tag critical

# Reorganize with tags
task-o-matic tasks add-tags --id task-123 --tags "phase-1,critical"
task-o-matic tasks remove-tags --id task-123 --tags "deprecated,old-priority"
```

#### SCENARIO 5: Error Recovery and Quality Assurance
```bash
# Handle execution failures
task-o-matic tasks execute \
  --id task-123 \
  --max-retries 5 \
  --try-models "gpt-4o-mini,gpt-4o,claude-opus-2024" \
  --continue-session

# Review and enhance failed tasks
task-o-matic tasks enhance --task-id task-123 --stream

# Validate implementation quality
task-o-matic tasks execute \
  --id task-123 \
  --review \
  --review-model claude-opus-2024 \
  --validate "npm test" \
  --validate "npm run lint"
```

### TECHNICAL SPECIFICATIONS

#### TASK DATA MODEL
```typescript
interface Task {
  id: string;                    // Unique task identifier
  title: string;                 // Task title
  description?: string;            // Detailed task description
  status: 'todo' | 'in-progress' | 'completed';
  effort?: 'small' | 'medium' | 'large';
  tags: string[];               // Task tags
  parentId?: string;             // Parent task ID
  subtaskIds?: string[];         // Child task IDs
  createdAt: Date;               // Creation timestamp
  updatedAt: Date;               // Last modification timestamp
  metadata?: {                  // AI enhancement metadata
    enhanced: boolean;
    provider?: string;
    model?: string;
    confidence?: number;
    sources?: string[];
  };
  plan?: {                      // Implementation plan
    id: string;
    taskId: string;
    plan: string;
    createdAt: Date;
    updatedAt: Date;
  };
  documentation?: {               // Related documentation
    path: string;
    lastFetched: Date;
    recap: string;
    libraries: string[];
  };
}
```

#### PERFORMANCE CHARACTERISTICS
- **Task Creation**: 50-200ms (without AI), 2-10s (with AI enhancement)
- **Task Listing**: 10-100ms depending on filter complexity
- **Task Updates**: 20-50ms
- **AI Enhancement**: 5-30s depending on task complexity
- **Task Splitting**: 10-60s per task
- **Task Execution**: Variable depending on external tool

#### STORAGE REQUIREMENTS
- **Task Files**: 1-10KB per task
- **Plan Files**: 5-50KB per plan
- **Documentation Cache**: 10-100MB for project
- **AI Metadata**: 1-5KB per enhanced task
- **Index Overhead**: 50-200KB for task indices

#### CONCURRENCY AND THREAD SAFETY
- **File Locking**: Atomic file operations prevent corruption
- **Concurrent Access**: Safe multiple command execution
- **Cache Coherency**: Consistent state across operations
- **Rollback Support**: Transaction-like operations with rollback

---

**Remember:** Citizen, in the harsh reality of the AI-pocalypse wasteland, these task commands are your survival toolkit. They provide structure, intelligence, and automation that can mean the difference between thriving and perishing. Use them wisely, respect their power, and they will guide your projects to completion even in the most challenging circumstances.

---

**DOCUMENT STATUS:** `Complete`
**NEXT REVIEW:** `After next feature release`
**CONTACT:** `Task-O-Matic Task Management Team`
