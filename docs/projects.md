# Project Initialization & Bootstrapping

Initialize task-o-matic for your project and bootstrap with Better-T-Stack framework integration.

## Commands Overview

```bash
task-o-matic init [options] [command]

Initialize task-o-matic project and bootstrap Better-T-Stack

Options:
  -h, --help  display help for command

Commands:
  init                        Initialize a new task-o-matic project in the current directory
  bootstrap [options] <name>  Bootstrap a new project using Better-T-Stack
```

## Initialize TaskOMatic

Set up task-o-matic in your current project directory. This creates the `.task-o-matic/` directory structure and default configuration.

```bash
# Basic initialization (no bootstrap)
task-o-matic init init

# Initialize + bootstrap by default
task-o-matic init init --project-name my-app

# Initialize with AI configuration + bootstrap
task-o-matic init init --project-name my-app --ai-provider openrouter --ai-key your-key

# Initialize but skip bootstrap
task-o-matic init init --project-name my-app --no-bootstrap
```

### Init Options

- `--ai-provider <provider>` - AI provider (openrouter/anthropic/openai) (default: openrouter)
- `--ai-model <model>` - AI model (default: anthropic/claude-3.5-sonnet)
- `--ai-key <key>` - AI API key
- `--ai-provider-url <url>` - AI provider URL
- `--max-tokens <tokens>` - Max tokens for AI (default: 4000)
- `--temperature <temp>` - AI temperature (default: 0.7)
- `--no-bootstrap` - Skip bootstrap after initialization
- `--project-name <name>` - Project name for bootstrap
- `--frontend <frontend>` - Frontend framework for bootstrap (default: nextjs)
- `--backend <backend>` - Backend framework for bootstrap (default: convex)
- `--database <database>` - Database for bootstrap (default: sqlite)
- `--auth <auth>` - Authentication for bootstrap (default: better-auth)

**What it creates:**

```
your-project/
├── .task-o-matic/
│   ├── config.json          # AI configuration
│   ├── tasks/              # Task JSON files
│   ├── prd/                # PRD versions and logs
│   └── logs/               # Operation logs
└── your-project-files...
```

**Example Output (Basic Init):**

```
🚀 Initializing task-o-matic project...
  ✓ Created /path/to/project/.task-o-matic/tasks
  ✓ Created /path/to/project/.task-o-matic/prd
  ✓ Created /path/to/project/.task-o-matic/logs
  ✓ Created /path/to/project/.task-o-matic/config.json

✅ TaskOMatic project initialized successfully!

Next steps:
  1. Configure AI provider: task-o-matic config set-ai-provider <provider> <model>
  2. Bootstrap your project: task-o-matic init bootstrap <project-name>
  3. Create your first task: task-o-matic tasks create --title "Your first task"
```

**Example Output (With Bootstrap):**

```
🚀 Initializing task-o-matic project...
  ✓ Created /path/to/project/.task-o-matic/tasks
  ✓ Created /path/to/project/.task-o-matic/prd
  ✓ Created /path/to/project/.task-o-matic/logs
  ✓ Created /path/to/project/.task-o-matic/config.json

✅ TaskOMatic project initialized successfully!

🚀 Running bootstrap...
  ✓ Created .task-o-matic/bts-config.json
  📦 Running Better-T-Stack CLI...
  [Better-T-Stack CLI output here]
✅ Better-T-Stack project "my-app" created successfully!
```

## Bootstrap Project

Create a new project using Better-T-Stack framework integration. This saves your BTS configuration and prepares the project structure.

```bash
task-o-matic init bootstrap <name> [options]
```

**Arguments:**

- `<name>` - Project name

**Options:**

- `--frontend <frontend>` - Frontend framework (default: nextjs)
- `--backend <backend>` - Backend framework (default: convex)
- `--database <database>` - Database (default: sqlite)
- `--auth <auth>` - Authentication (default: better-auth)

**Available Options:**

- **Frontend:** `react`, `nextjs`, `vue`, `none`
- **Backend:** `convex`, `hono`, `express`, `none`
- **Database:** `sqlite`, `postgresql`, `mysql`
- **Auth:** `better-auth`, `clerk`, `none`

**Examples:**

```bash
# Bootstrap Next.js + Convex project
task-o-matic init bootstrap my-app \
  --frontend nextjs \
  --backend convex \
  --database sqlite \
  --auth better-auth

# Bootstrap React + Express project
task-o-matic init bootstrap api-project \
  --frontend react \
  --backend express \
  --database postgresql \
  --auth clerk

# Minimal frontend-only project
task-o-matic init bootstrap static-site \
  --frontend nextjs \
  --backend none \
  --database none \
  --auth none

# Vue.js project with Hono backend
task-o-matic init bootstrap vue-api \
  --frontend vue \
  --backend hono \
  --database mysql \
  --auth none
```

**Example Output:**

```
🚀 Bootstrapping project: my-app
Configuration:
  Frontend: next
  Backend: hono
  Database: sqlite
  ORM: drizzle
  Auth: enabled
  Package Manager: npm
  Runtime: node

  ✓ Created .task-o-matic/bts-config.json
  📦 Running Better-T-Stack CLI...
  [Better-T-Stack CLI output here]
✅ Better-T-Stack project "my-app" created successfully!
  BTS configuration saved to .task-o-matic/bts-config.json
```

## Project Workflows

### Workflow 1: New Web Application (Recommended)

```bash
# 1. Navigate to your project directory
cd my-new-app

# 2. One-step setup with AI + bootstrap
task-o-matic init init \
  --project-name my-app \
  --ai-provider openrouter \
  --ai-model anthropic/claude-3.5-sonnet \
  --ai-key your-key \
  --frontend next \
  --backend hono \
  --database postgres

# 3. Create initial tasks
task-o-matic tasks create --title "Set up development environment" --ai-enhance
task-o-matic tasks create --title "Implement authentication system"
task-o-matic tasks create --title "Design database schema"

# 4. Parse PRD if available
task-o-matic prd parse --file requirements.md
```

### Workflow 2: Two-Step Setup

```bash
# 1. Initialize task-o-matic first
task-o-matic init init --ai-provider anthropic --ai-model claude-3.5-sonnet

# 2. Bootstrap separately
task-o-matic init bootstrap my-app \
  --frontend next \
  --backend hono \
  --database postgres \
  --addons pwa biome

# 3. Create tasks
task-o-matic tasks create --title "Set up project structure" --ai-enhance
```

### Workflow 3: Frontend-Only Project

```bash
# 1. Initialize + bootstrap frontend-only
task-o-matic init init \
  --project-name portfolio-site \
  --frontend next \
  --backend none \
  --database none \
  --no-auth

# 2. Create frontend tasks
task-o-matic tasks create --title "Design homepage layout" --ai-enhance
task-o-matic tasks create --title "Implement responsive navigation"
task-o-matic tasks create --title "Add portfolio gallery"
```

### Workflow 4: API-First Project

```bash
# 1. Initialize + bootstrap API project
task-o-matic init init \
  --project-name user-service-api \
  --frontend none \
  --backend express \
  --database postgres \
  --auth

# 2. Create API tasks
task-o-matic tasks create --title "Design REST API endpoints" --ai-enhance
task-o-matic tasks create --title "Implement user authentication"
task-o-matic tasks create --title "Set up database models"
```

## Configuration Files

### AI Configuration (.task-o-matic/config.json)

```json
{
  "ai": {
    "provider": "anthropic",
    "model": "claude-3.5-sonnet",
    "maxTokens": 4000,
    "temperature": 0.7
  }
}
```

### Better-T-Stack Configuration (.task-o-matic/bts-config.json)

```json
{
  "frontend": "nextjs",
  "backend": "convex",
  "database": "sqlite",
  "auth": "better-auth",
  "addons": []
}
```

## Project Structure Best Practices

### Directory Organization

```
your-project/
├── .task-o-matic/
│   ├── config.json          # AI configuration
│   ├── bts-config.json      # Better-T-Stack configuration
│   ├── tasks/              # Task JSON files
│   │   ├── task-1.json
│   │   ├── task-2.json
│   │   └── ...
│   ├── prd/                # PRD versions and logs
│   │   ├── parsed-prd.json
│   │   └── prd-logs.json
│   └── logs/               # Operation logs
│       └── operations.log
├── src/                    # Your source code
├── docs/                   # Project documentation
└── README.md
```

### Initialization Checklist

**Option 1: One-Step Setup (Recommended)**

- [ ] Run `task-o-matic init init --project-name my-app --ai-provider openrouter --ai-key your-key`
- [ ] Create initial tasks
- [ ] Parse any existing PRDs

**Option 2: Two-Step Setup**

- [ ] Run `task-o-matic init init` to set up project structure
- [ ] Configure AI provider with `task-o-matic config set-ai-provider`
- [ ] Set up API key as environment variable
- [ ] Bootstrap with `task-o-matic init bootstrap my-app`
- [ ] Create initial tasks
- [ ] Parse any existing PRDs

### Team Collaboration

```bash
# For team members joining the project:
git clone <repository>
cd <project>

# Check if .task-o-matic exists
ls -la .task-o-matic

# If not, initialize
task-o-matic init init

# Configure their own AI provider
task-o-matic config set-ai-provider anthropic claude-3.5-sonnet
export ANTHROPIC_API_KEY="their-key"

# Start working with existing tasks
task-o-matic tasks list
```

## Integration with Development Workflow

### Git Integration

```bash
# Add .task-o-matic to .gitignore (optional, depends on preference)
echo ".task-o-matic/" >> .gitignore

# Or share configuration but not tasks
echo ".task-o-matic/tasks/" >> .gitignore
echo ".task-o-matic/logs/" >> .gitignore
```

### CI/CD Integration

```bash
# In CI/CD pipeline:
export ANTHROPIC_API_KEY=$CI_AI_KEY

# Parse PRDs automatically
task-o-matic prd parse --file requirements.md

# Generate task reports
task-o-matic tasks list --status completed --raw > completed-tasks.json
```

### Development Environment Setup

```bash
# Setup script for new developers
#!/bin/bash
echo "Setting up development environment..."

# Initialize task-o-matic
task-o-matic init init

# Configure AI (prompt for API key)
echo "Enter your Anthropic API key:"
read -s ANTHROPIC_API_KEY
export ANTHROPIC_API_KEY

# Set AI provider
task-o-matic config set-ai-provider anthropic claude-3.5-sonnet

# Bootstrap if needed
task-o-matic init bootstrap $(basename $PWD) \
  --frontend nextjs \
  --backend convex \
  --database sqlite \
  --auth better-auth

echo "Setup complete! Run 'task-o-matic tasks list' to see your tasks."
```

## Troubleshooting

### Project Not Initialized

```bash
# Check if .task-o-matic exists
ls -la .task-o-matic

# Initialize if missing
task-o-matic init init
```

### Configuration Issues

```bash
# Check AI configuration
task-o-matic config show-ai

# Reconfigure if needed
task-o-matic config set-ai-provider anthropic claude-3.5-sonnet
```

### Bootstrap Failures

```bash
# Check if task-o-matic is initialized
task-o-matic config show

# Initialize first
task-o-matic init init

# Then bootstrap
task-o-matic init bootstrap my-app
```

### Permission Issues

```bash
# Check .task-o-matic directory permissions
ls -la .task-o-matic/

# Fix permissions if needed
chmod 755 .task-o-matic
chmod 644 .task-o-matic/config.json
```
