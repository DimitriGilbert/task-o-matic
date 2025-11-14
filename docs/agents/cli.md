# Task-O-Matic CLI Agent Guide

You are an AI agent with access to the Task-O-Matic CLI tool for managing development tasks. This guide provides comprehensive usage patterns and command reference for autonomous development workflows.

## Core Commands Reference

### Task Management
```bash
# Get next task to work on (prioritizes subtasks over parent tasks)
task-o-matic tasks get-next [--status todo] [--tag <tag>] [--effort <small|medium|large>]

# Show detailed task information  
task-o-matic tasks show --id <task-id>

# Update task status
task-o-matic tasks status --id <task-id> --status <todo|in-progress|completed>

# List all tasks with optional filtering
task-o-matic tasks list [--status <status>] [--tag <tag>]

# Create new tasks
task-o-matic tasks create --title "Task Title" [--content "Description"] [--effort <small|medium|large>] [--parent-id <id>] [--ai-enhance] [--stream]

# Split tasks into subtasks using AI
task-o-matic tasks split --task-id <id> [--tools] [--stream] [--ai-provider <provider>]

# Update task details
task-o-matic tasks update --id <task-id> [--title "New Title"] [--description "New Description"] [--status <status>] [--effort <effort>]

# Delete tasks
task-o-matic tasks delete --id <task-id> --force [--cascade]
```

### Planning & Documentation
```bash
# Generate AI implementation plans for tasks
task-o-matic tasks plan --id <task-id> [--stream] [--ai-provider <provider>]

# View existing implementation plans
task-o-matic tasks get-plan --id <task-id>

# Set manual implementation plan
task-o-matic tasks set-plan --id <task-id> --plan "Plan text" [or --plan-file <path>]

# Generate AI task documentation with project context
task-o-matic tasks document --task-id <task-id> [--force] [--stream] [--ai-provider <provider>]

# Get existing task documentation
task-o-matic tasks get-documentation --id <task-id>

# Add documentation from external file
task-o-matic tasks add-documentation --id <task-id> --doc-file <path> [--overwrite]
```

### PRD Management
```bash
# Parse PRD into structured tasks
task-o-matic prd parse --file <prd-file> [--tools] [--stream] [--ai-provider <provider>]

# Improve PRD based on feedback
task-o-matic prd rework --file <prd-file> --feedback "Feedback text" [--tools] [--output <output-file>] [--stream]
```

### Project Initialization
```bash
# Initialize task-o-matic in current directory
task-o-matic init init

# Configure AI providers
task-o-matic config set --provider <openai|anthropic|openrouter> --model <model-name> [--api-key <key>]
```

## Autonomous Development Workflow

### Primary Work Loop
```bash
# 1. Get next available task (subtasks have priority)
TASK_ID=$(task-o-matic tasks get-next --status todo | grep -oE '[a-f0-9-]{36}')

# 2. Show task details and mark as in-progress
task-o-matic tasks show --id $TASK_ID
task-o-matic tasks status --id $TASK_ID --status in-progress

# 3. Generate implementation plan with project context
task-o-matic tasks plan --id $TASK_ID --stream

# 4. Check for existing documentation or create it
task-o-matic tasks get-documentation --id $TASK_ID || \
task-o-matic tasks document --task-id $TASK_ID --stream

# 5. Execute implementation (use your development tools)
# - Read project files using filesystem access
# - Implement code changes
# - Add tests if needed

# 6. Validate implementation
npm run check-types    # Fix any type errors
npm run build         # Fix any build errors  
npm test             # Fix any test failures

# 7. Commit changes with descriptive message
git add .
git commit -m "$(task-o-matic tasks show --id $TASK_ID | grep Title | cut -d: -f2-) - completed"

# 8. Mark task as completed
task-o-matic tasks status --id $TASK_ID --status completed

# 9. Repeat - get next task
task-o-matic tasks get-next
```

## Advanced Features

### AI-Enhanced Operations
Use `--tools` flag to enable filesystem tools for AI operations:
```bash
# Parse PRD with project context awareness
task-o-matic prd parse --file prd.md --tools --stream

# Split tasks with understanding of current codebase
task-o-matic tasks split --task-id <id> --tools --stream

# Rework PRD considering current implementation
task-o-matic prd rework --file prd.md --feedback "Add auth" --tools --stream
```

### Getting Help
```bash
# Get help for main commands
task-o-matic --help

# Get help for specific command groups
task-o-matic tasks --help
task-o-matic prd --help
task-o-matic config --help

# Get help for specific commands
task-o-matic tasks create --help
task-o-matic tasks split --help
```

### AI Provider Configuration
```bash
# Configure different AI providers
task-o-matic config set --provider openai --model gpt-4 --api-key <your-key>
task-o-matic config set --provider anthropic --model claude-3-sonnet-20240229 --api-key <your-key>
task-o-matic config set --provider openrouter --model anthropic/claude-3.5-sonnet --api-key <your-key>

# Use different providers per command
task-o-matic tasks plan --id <task-id> --ai-provider anthropic --ai-model claude-3-sonnet-20240229
```

## Best Practices for AI Agents

### Task Prioritization
1. **Always work on subtasks first** - `get-next` automatically prioritizes them
2. **Mark parent tasks as in-progress** when starting their subtasks
3. **Complete subtasks before marking parent as complete**

### Quality Assurance
1. **Always validate before completion**: type-check → build → test → commit
2. **Use streaming output** (`--stream`) to monitor AI operations in real-time
3. **Enable filesystem tools** (`--tools`) when context awareness is beneficial

### Error Recovery
- **Type errors**: Fix immediately, re-run `npm run check-types`
- **Build errors**: Fix immediately, re-run `npm run build`  
- **Test failures**: Fix immediately, re-run `npm test`
- **Task confusion**: Use `task-o-matic tasks show --id <id>` for clarification

### Continuous Development
- **Never stop the loop**: Immediately get next task after completing current one
- **Maintain clean git history**: One commit per completed task
- **Use descriptive commit messages**: Include task title and completion status
- **Leverage AI enhancements**: Use `--ai-enhance`, `--tools`, and `--stream` flags appropriately

## Command Discovery
When you need to discover available commands or options:
```bash
# Explore available commands
task-o-matic --help

# Explore command groups  
task-o-matic tasks --help
task-o-matic prd --help

# Get detailed help for specific commands
task-o-matic tasks [command] --help
```

This comprehensive reference enables autonomous AI agents to effectively use Task-O-Matic CLI for continuous development workflows with proper task management, planning, documentation, and quality assurance.
