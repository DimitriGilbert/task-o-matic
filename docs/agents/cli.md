## Task-O-Matic Agent Guide

Concise reference for AI agents using Task-O-Matic in autonomous workflows.

### Core Workflow Commands

#### Task Management

```bash
# List tasks (filter by status or tag)
task-o-matic tasks list [-s <status>] [-t <tag>]

# Get next task to work on (prioritizes subtasks)
task-o-matic tasks get-next [-s <status>] [-t <tag>]

# Update task status
task-o-matic tasks status -i <task-id> -s <todo|in-progress|completed>

# Add documentation from file
task-o-matic tasks add-documentation -i <task-id> --doc-file <path>
```

### Typical Agent Workflow

```bash
# 1. Get next task
TASK=$(task-o-matic tasks get-next -s todo)

# 2. Mark as in-progress
task-o-matic tasks status -i $TASK_ID -s in-progress

# 3. Implement the task
# (use your development tools)

# 4. Validate
npm run check-types && npm run build && npm test

# 5. Mark as completed
task-o-matic tasks status -i $TASK_ID -s completed

# 6. Repeat
```

### Bootstrap Options

#### Web Projects

```bash
task-o-matic init init --project-name my-app --frontend next --backend hono
```

#### Multi-Frontend Monorepo

```bash
# Web + Native + CLI + TUI
task-o-matic init init --project-name my-app --frontend "next native-uniwind cli tui" --backend hono

# Web + Native
task-o-matic init init --project-name my-app --frontend "next native-bare" --backend hono

# Web + CLI
task-o-matic init init --project-name my-app --frontend "next cli" --backend hono
```

#### Single Frontend Projects

```bash
# CLI only
task-o-matic init init --project-name my-cli --frontend cli --cli-deps full

# TUI only
task-o-matic init init --project-name my-tui --frontend tui --tui-framework solid

# Native only
task-o-matic init init --project-name my-mobile --frontend native-uniwind --backend hono
```

#### Frontend Options

- **Web**: next, tanstack-router, react-router, nuxt, svelte, solid
- **Native**: native-bare, native-uniwind, native-unistyles
- **Custom**: cli, tui

#### CLI Dependency Levels

- **minimal**: commander + chalk only
- **standard**: + inquirer + dotenv (default)
- **full**: + mocha + tsx (testing)
- **task-o-matic**: + AI SDK (Vercel AI)

#### TUI Framework Options

- **solid**: Solid.js (default, recommended)
- **vue**: Vue.js
- **react**: React

### Getting Help

All commands support `--help`:

```bash
task-o-matic --help
task-o-matic tasks --help
task-o-matic tasks list --help
```

Full command reference: `docs/task-o-matic_help.md`
