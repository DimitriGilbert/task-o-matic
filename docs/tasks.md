# Task Management

Comprehensive task management with AI enhancement, breakdown, and tracking capabilities for single projects.

## Commands Overview

```bash
task-o-matic tasks [options] [command]

Manage tasks

Options:
  -h, --help  display help for command

Commands:
  list        List tasks
  create      Create a new task
  split       Split a task into subtasks using AI
  update      Update a task
  delete      Delete a task
  show        Show task details
  enhance     Enhance an existing task with AI using Context7 documentation
  document    Analyze and fetch documentation for a task using AI with Context7
```

## List Tasks

Display tasks with filtering and formatting options.

```bash
task-o-matic tasks list [options]
```

**Options:**

- `--status <status>` - Filter by status (`todo`, `in-progress`, `completed`)
- `--raw` - Output raw JSON instead of formatted text

**Examples:**

```bash
# List all tasks
task-o-matic tasks list

# List only completed tasks
task-o-matic tasks list --status completed

# List tasks in progress
task-o-matic tasks list --status in-progress

# Output as JSON for scripting
task-o-matic tasks list --raw

# Filter by status
task-o-matic tasks list --status todo
```

**Example Output:**

```
Found 3 task(s):
[todo] Set up project structure
  Initialize Next.js project with TypeScript and Tailwind
  🤖 AI-generated

[in-progress] Implement authentication
  Add user login and registration with JWT tokens
  🤖 AI-generated

[todo] Design database schema
  Create tables for users, posts, and comments
  🤖 AI-generated
```

## Create Task

Create a new task with optional AI enhancement.

```bash
task-o-matic tasks create [options]
```

**Required Options:**

- `--title <title>` - Task title

**Optional Options:**

- `--description <description>` - Task description
- `--effort <effort>` - Estimated effort (`small`, `medium`, `large`)
- `--ai-enhance` - Enhance task with AI
- `--stream` - Enable real-time streaming output for AI operations

**Examples:**

```bash
# Create basic task
task-o-matic tasks create --title "Fix login bug"

# Create with description
task-o-matic tasks create \
  --title "Implement user profile" \
  --description "Add user profile page with avatar and bio"

# Create with effort
task-o-matic tasks create \
  --title "Database migration" \
  --effort large \
  --description "Migrate from SQLite to PostgreSQL"

# Create with AI enhancement
task-o-matic tasks create \
  --title "Add payment system" \
  --ai-enhance

# Create comprehensive task
task-o-matic tasks create \
  --title "Real-time notifications" \
  --description "Basic idea for notifications" \
  --effort medium \
  --ai-enhance

# Create with AI enhancement and streaming
task-o-matic tasks create \
  --title "Implement user authentication" \
  --description "Add login and registration" \
  --ai-enhance \
  --stream
```

**Example Output:**

```
🤖 Enhancing task with AI...
✓ Task enhanced with AI
✓ Task created: Add payment system
  ID: kxmp9a2lp
```

## Split Task

Break down a complex task into smaller, manageable subtasks using AI.

```bash
task-o-matic tasks split [options]
```

**Required Options:**

- `--task-id <id>` - Task ID to split

**Examples:**

```bash
# Split a complex task
task-o-matic tasks split --task-id kxmp9a2lp

# Split task found from list
task-o-matic tasks list --raw | jq '.[0].id' | xargs task-o-matic tasks split --task-id
```

**Example Output:**

```
🤖 Breaking down task: Implement user authentication
✓ Task split into 4 subtasks
  1. Set up authentication database schema
  2. Implement JWT token service
  3. Create login and registration API endpoints
  4. Build authentication UI components
```

## Update Task

Modify existing task properties.

```bash
task-o-matic tasks update [options]
```

**Required Options:**

- `--task-id <id>` - Task ID

**Optional Options:**

- `--title <title>` - New task title
- `--description <description>` - New task description
- `--status <status>` - New task status (`todo`, `in-progress`, `completed`)

**Examples:**

```bash
# Update task status
task-o-matic tasks update --task-id kxmp9a2lp --status in-progress

# Update title and description
task-o-matic tasks update \
  --task-id kxmp9a2lp \
  --title "Implement OAuth authentication" \
  --description "Add Google and GitHub OAuth login"

# Mark task as completed
task-o-matic tasks update --task-id kxmp9a2lp --status completed

# Update multiple properties
task-o-matic tasks update \
  --task-id kxmp9a2lp \
  --title "Payment integration with Stripe" \
  --description "Integrate Stripe for payment processing" \
  --status in-progress
```

**Example Output:**

```
✓ Task updated: Implement OAuth authentication
```

## Delete Task

Remove a task from the system.

```bash
task-o-matic tasks delete [options]
```

**Required Options:**

- `--task-id <id>` - Task ID to delete

**Examples:**

```bash
# Delete specific task
task-o-matic tasks delete --task-id kxmp9a2lp

# Delete task found from list
task-o-matic tasks list --raw | jq '.[0].id' | xargs task-o-matic tasks delete --task-id
```

**Example Output:**

```
✓ Task deleted: Old task title
```

## Show Task Details

Display comprehensive information about a specific task including subtasks.

```bash
task-o-matic tasks show [options]
```

**Required Options:**

- `--task-id <id>` - Task ID

**Examples:**

```bash
# Show task details
task-o-matic tasks show --task-id kxmp9a2lp

# Show first task from list
task-o-matic tasks list --raw | jq '.[0].id' | xargs task-o-matic tasks show --task-id
```

**Example Output:**

```
Task Details:
ID: kxmp9a2lp
Title: Implement user authentication
Status: in-progress
Description: Add user login and registration with JWT tokens, including password reset functionality and email verification.
Estimated Effort: large
🤖 AI-generated
Created: 2024-01-15 10:30:00
Updated: 2024-01-15 11:45:00

Subtasks (4):
  1. [completed] Set up authentication database schema
  2. [in-progress] Implement JWT token service
  3. [todo] Create login and registration API endpoints
  4. [todo] Build authentication UI components
```

## Task Workflows

### Workflow 1: From PRD to Working Tasks

```bash
# 1. Parse PRD into tasks
task-o-matic prd parse --file feature-prd.md

# 2. Review generated tasks
task-o-matic tasks list

# 3. Break down complex tasks
task-o-matic tasks split --task-id <complex-task-id>

# 4. Start working on first task
task-o-matic tasks update --task-id <task-id> --status in-progress

# 5. Complete task
task-o-matic tasks update --task-id <task-id> --status completed
```

### Workflow 2: AI-Enhanced Task Creation

```bash
# 1. Create basic task idea
task-o-matic tasks create \
  --title "Add search functionality" \
  --description "Need search for the app"

# 2. Enhance with AI for better requirements
task-o-matic tasks create \
  --title "Advanced search with filters" \
  --ai-enhance

# 3. Break down into implementation steps
task-o-matic tasks split --task-id <enhanced-task-id>

# 4. Work through subtasks
task-o-matic tasks list --status todo
```

### Workflow 3: Task Progress Tracking

```bash
# 1. See current workload
task-o-matic tasks list --status in-progress

# 2. Start new task
task-o-matic tasks update --task-id <next-task-id> --status in-progress

# 3. Mark completed
task-o-matic tasks update --task-id <current-task-id> --status completed

# 4. Review progress
task-o-matic tasks list --status completed
task-o-matic tasks list --status todo
```

### Workflow 4: Complex Feature Development

```bash
# 1. Create main feature task
task-o-matic tasks create \
  --title "Real-time chat system" \
  --description "Add chat functionality to the app" \
  --effort large \
  --ai-enhance

# 2. Break into components
task-o-matic tasks split --task-id <chat-task-id>

# 3. Review subtasks
task-o-matic tasks show --task-id <chat-task-id>

# 4. Work through systematically
for subtask in $(task-o-matic tasks show --task-id <chat-task-id> | grep "ID:" | awk '{print $3}'); do
  task-o-matic tasks update --task-id $subtask --status in-progress
  # Work on subtask...
  task-o-matic tasks update --task-id $subtask --status completed
done
```

## Task Organization Best Practices

### Task Titles

- Be specific and actionable: "Implement user authentication" vs "Auth"
- Start with verbs: "Create", "Implement", "Fix", "Add", "Update"
- Include scope: "Add payment system with Stripe" vs "Payments"

### Task Descriptions

- Include acceptance criteria
- Specify technical requirements
- Mention dependencies or constraints
- Define what "done" means

### Effort Estimation

- **Small**: 2-4 hours (bug fixes, simple features)
- **Medium**: 1-2 days (moderate features, API integration)
- **Large**: 3-5 days (complex features, multiple components)

### Status Management

- **todo**: Ready to start work
- **in-progress**: Currently being worked on
- **completed**: Finished and tested

## AI Enhancement Features

### Task Enhancement

AI enhancement improves task descriptions by:

- Adding specific acceptance criteria
- Including technical considerations
- Identifying potential edge cases
- Suggesting implementation approaches
- Defining clear "done" criteria

```bash
# Before enhancement
task-o-matic tasks create --title "Add user settings" --description "Settings page"

# After enhancement
task-o-matic tasks create --title "Add user settings" --ai-enhance
# Results in detailed description with:
# - Profile information fields
# - Privacy settings
# - Notification preferences
# - Theme selection
# - Account deletion options
```

### Task Breakdown

AI breakdown creates subtasks that are:

- Specific and measurable
- Completable in 1-2 days maximum
- Logically sequenced
- Independent enough for parallel work

```bash
# Complex task: "Implement e-commerce checkout"
# AI breaks it into:
# 1. Design checkout flow UI
# 2. Implement shopping cart logic
# 3. Integrate payment gateway
# 4. Add order management
# 5. Create email notifications
# 6. Add error handling
```

## Advanced Usage

### Batch Operations

```bash
# Complete all todo tasks
task-o-matic tasks list --status todo --raw | \
  jq -r '.[].id' | \
  xargs -I {} task-o-matic tasks update --task-id {} --status completed

# Delete all completed tasks
task-o-matic tasks list --status completed --raw | \
  jq -r '.[].id' | \
  xargs -I {} task-o-matic tasks delete --task-id {}
```

### Task Dependencies

```bash
# Create main task
task-o-matic tasks create --title "Build user dashboard" --ai-enhance

# Break it down
task-o-matic tasks split --task-id <dashboard-task-id>

# Work through dependencies
task-o-matic tasks list | grep "dashboard" | grep "todo"
```

### Integration with Git Workflow

```bash
# Create feature branch
git checkout -b feature/user-auth

# Create tasks for feature
task-o-matic tasks create --title "User authentication" --ai-enhance
task-o-matic tasks split --task-id <auth-task-id>

# Work through tasks and commit
for task in $(task-o-matic tasks list --status in-progress --raw | jq -r '.[].id'); do
  # Work on task...
  git add .
  git commit -m "feat: $(task-o-matic tasks show --task-id $task | grep 'Title:' | cut -d' ' -f2-)"
  task-o-matic tasks update --task-id $task --status completed
done
```

## Troubleshooting

### Task Not Found

```bash
# Search for task
task-o-matic tasks list --raw | jq '.[] | select(.title | contains("search"))'

# Check all tasks
task-o-matic tasks list

# Verify task ID format
task-o-matic tasks show --task-id <id>
```

### AI Enhancement Issues

```bash
# Check AI configuration
task-o-matic config show-ai

# Test with simple task
task-o-matic tasks create --title "Test task" --ai-enhance

# Check API key
echo $ANTHROPIC_API_KEY
```

### Subtask Issues

```bash
# Check parent task
task-o-matic tasks show --task-id <parent-id>

# List all subtasks
task-o-matic tasks list | grep "Parent: <parent-id>"

# Verify subtask creation
task-o-matic tasks list --raw | jq '.[] | select(.parentId)'
```

### Storage Issues

```bash
# Check task files
ls -la .task-o-matic/tasks/

# Verify file permissions
ls -la .task-o-matic/tasks/<task-id>.json

# Check if task-o-matic is initialized
ls -la .task-o-matic/
```

## Enhance Task

Enhance an existing task with AI using Context7 documentation to improve clarity, add technical details, and provide better implementation guidance.

```bash
task-o-matic tasks enhance [options]
```

**Required Options:**

- `--task-id <id>` - Task ID to enhance

**Optional Options:**

- `--stream` - Enable real-time streaming output for AI operations

**Examples:**

```bash
# Enhance a specific task
task-o-matic tasks enhance --task-id abc123

# Enhance with streaming output
task-o-matic tasks enhance --task-id abc123 --stream

# Enhance task found from list
task-o-matic tasks list --raw | jq '.[0].id' | xargs task-o-matic tasks enhance --task-id
```

**Example Output:**

```
📚 Using Context7 documentation to enhance task...
🤖 AI Enhancement in progress...
The task "Implement user authentication" can be enhanced by adding specific technical details:
- Authentication method: JWT tokens with refresh token rotation
- Security considerations: Rate limiting, password hashing with bcrypt
- Implementation framework: NextAuth.js with TypeScript support
✓ Task enhanced with Context7 documentation
Enhanced task: abc123
```

## Document Task

Analyze and fetch relevant documentation for a task using AI with Context7 integration. This helps identify the best libraries, frameworks, and documentation needed for implementation.

```bash
task-o-matic tasks document [options]
```

**Required Options:**

- `--task-id <id>` - Task ID to analyze for documentation needs

**Optional Options:**

- `--force` - Force refresh documentation even if recently fetched
- `--stream` - Enable real-time streaming output for AI operations

**Examples:**

```bash
# Analyze documentation needs for a task
task-o-matic tasks document --task-id abc123

# Force refresh documentation
task-o-matic tasks document --task-id abc123 --force

# Analyze with streaming output
task-o-matic tasks document --task-id abc123 --stream

# Document first task from list
task-o-matic tasks list --raw | jq '.[0].id' | xargs task-o-matic tasks document --task-id
```

**Example Output:**

```
📚 Analyzing documentation needs for task: Implement user authentication
🔍 Using AI to analyze documentation needs...
✓ Documentation analysis complete
Analysis: Task requires authentication and security libraries
Libraries: next-auth, bcryptjs, jsonwebtoken
Recap: Authentication system with JWT tokens and secure password handling
Task: abc123
```

### Documentation Caching

The `document` command caches results for 7 days to avoid repeated API calls:

```bash
# First run - fetches from Context7
task-o-matic tasks document --task-id abc123

# Subsequent runs within 7 days - uses cached results
task-o-matic tasks document --task-id abc123

# Force refresh - bypasses cache
task-o-matic tasks document --task-id abc123 --force
```

```

```
