# Task-O-Matic CLI Complete Help Documentation

This document contains comprehensive help documentation for all Task-O-Matic CLI commands and subcommands.

## Table of Contents

- [Main Command](#main-command)
- [Config Commands](#config-commands)
- [Tasks Commands](#tasks-commands)
- [PRD Commands](#prd-commands)
- [Prompt Commands](#prompt-commands)
- [Init Commands](#init-commands)

---

## Main Command

### `task-o-matic`

```
Usage: task-o-matic [options] [command]

AI-powered Task Management CLI for Single Projects

Options:
  -V, --version            output the version number
  -v, --verbose            Enable verbose logging
  -h, --help               display help for command

Commands:
  config                   Manage task-o-matic configuration
  tasks
  prd                      Manage PRDs and generate tasks
  prompt [options] [name]  Build AI service prompts with variable replacement
                           for external tools
  init                     Initialize task-o-matic project and bootstrap
                           Better-T-Stack
```

---

## Config Commands

### `config`

```
Usage: task-o-matic config [options] [command]

Manage task-o-matic configuration

Options:
  -h, --help                          display help for command

Commands:
  get-ai-config                       Get the current AI configuration
  set-ai-provider <provider> [model]  Set the AI provider and model
  info                                Get information about the current
                                      task-o-matic project
  help [command]                      display help for command
```

### `config get-ai-config`

```
Usage: task-o-matic config get-ai-config [options]

Get the current AI configuration

Options:
  -h, --help  display help for command
```

### `config set-ai-provider`

```
Usage: task-o-matic config set-ai-provider [options] <provider> [model]

Set the AI provider and model

Arguments:
  provider    AI provider (e.g., openrouter, openai)
  model       AI model (optional)

Options:
  -h, --help  display help for command
```

### `config info`

```
Usage: task-o-matic config info [options]

Get information about the current task-o-matic project

Options:
  -h, --help  display help for command
```

---

## Tasks Commands

### `tasks`

```
Usage: task-o-matic tasks [options] [command]

Options:
  -h, --help             display help for command

Commands:
  list [options]         List all tasks
  create [options]       Create a new task with AI enhancement using Context7
  show [options]         Show detailed information about a task
  document [options]     Analyze and fetch documentation for a task using AI
                         with Context7
  enhance [options]      Enhance an existing task with AI using Context7
                         documentation
  split [options]        Split a task into smaller subtasks using AI
  plan [options]         Create detailed implementation plan for a task or
                         subtask
  get-plan [options]     View existing implementation plan for a task or
                         subtask
  list-plan              List all available implementation plans
  update [options]       Update an existing task
  delete [options]       Delete a task
  status [options]       Set task status
  add-tags [options]     Add tags to a task
  remove-tags [options]  Remove tags from a task
  delete-plan [options]  Delete implementation plan for a task
  subtasks [options]     List subtasks for a task
  tree [options]         Display hierarchical task tree
  get-next [options]     Get the next task to work on (defaults to oldest todo
                         task)
  execute [options]      Execute a task using an external coding assistant
  help [command]         display help for command
```

### `tasks list`

```
Usage: task-o-matic tasks list [options]

List all tasks

Options:
  --status <status>  Filter by status (todo/in-progress/completed)
  --tag <tag>        Filter by tag
  -h, --help         display help for command
```

### `tasks create`

```
Usage: task-o-matic tasks create [options]

Create a new task with AI enhancement using Context7

Options:
  --title <title>           Task title
  --content <content>       Task content (supports markdown)
  --effort <effort>         Estimated effort (small/medium/large)
  --parent-id <id>          Parent task ID (creates subtask)
  --ai-enhance              Enhance task with AI using Context7 documentation
  --stream                  Show streaming AI output during enhancement
  --ai-provider <provider>  AI provider override
  --ai-model <model>        AI model override
  --ai-key <key>            AI API key override
  --ai-provider-url <url>   AI provider URL override
  --reasoning <tokens>      Enable reasoning for OpenRouter models (max
                            reasoning tokens)
  -h, --help                display help for command
```

### `tasks show`

```
Usage: task-o-matic tasks show [options]

Show detailed information about a task

Options:
  --id <id>   Task ID
  -h, --help  display help for command
```

### `tasks document`

```
Usage: task-o-matic tasks document [options]

Analyze and fetch documentation for a task using AI with Context7

Options:
  --task-id <id>            Task ID
  --force                   Force refresh documentation even if recent
  --stream                  Show streaming AI output during analysis
  --ai-provider <provider>  AI provider override
  --ai-model <model>        AI model override
  --ai-key <key>            AI API key override
  --ai-provider-url <url>   AI provider URL override
  --reasoning <tokens>      Enable reasoning for OpenRouter models (max
                            reasoning tokens)
  -h, --help                display help for command
```

### `tasks enhance`

```
Usage: task-o-matic tasks enhance [options]

Enhance an existing task with AI using Context7 documentation

Options:
  --task-id <id>            Task ID to enhance
  --all                     Enhance all existing tasks
  --stream                  Show streaming AI output during enhancement
  --ai-provider <provider>  AI provider override
  --ai-model <model>        AI model override
  --ai-key <key>            AI API key override
  --ai-provider-url <url>   AI provider URL override
  --reasoning <tokens>      Enable reasoning for OpenRouter models (max
                            reasoning tokens)
  -h, --help                display help for command
```

### `tasks split`

```
Usage: task-o-matic tasks split [options]

Split a task into smaller subtasks using AI

Options:
  --task-id <id>            Task ID to split
  --all                     Split all existing tasks that don't have subtasks
  --stream                  Show streaming AI output during breakdown
  --ai-provider <provider>  AI provider override
  --ai-model <model>        AI model override
  --ai-key <key>            AI API key override
  --ai-provider-url <url>   AI provider URL override
  --reasoning <tokens>      Enable reasoning for OpenRouter models (max
                            reasoning tokens)
  -h, --help                display help for command
```

### `tasks plan`

```
Usage: task-o-matic tasks plan [options]

Create detailed implementation plan for a task or subtask

Options:
  --id <id>                 Task or subtask ID to plan
  --stream                  Show streaming AI output during planning
  --ai-provider <provider>  AI provider override
  --ai-model <model>        AI model override
  --ai-key <key>            AI API key override
  --ai-provider-url <url>   AI provider URL override
  --reasoning <tokens>      Enable reasoning for OpenRouter models (max
                            reasoning tokens)
  -h, --help                display help for command
```

### `tasks get-plan`

```
Usage: task-o-matic tasks get-plan [options]

View existing implementation plan for a task or subtask

Options:
  --id <id>   Task or subtask ID
  -h, --help  display help for command
```

### `tasks list-plan`

```
Usage: task-o-matic tasks list-plan [options]

List all available implementation plans

Options:
  -h, --help  display help for command
```

### `tasks update`

```
Usage: task-o-matic tasks update [options]

Update an existing task

Options:
  --id <id>                    Task ID to update
  --title <title>              New task title
  --description <description>  New task description
  --status <status>            New status (todo/in-progress/completed)
  --effort <effort>            New estimated effort (small/medium/large)
  --tags <tags>                New tags (comma-separated)
  -h, --help                   display help for command
```

### `tasks delete`

```
Usage: task-o-matic tasks delete [options]

Delete a task

Options:
  --id <id>   Task ID to delete
  --force     Skip confirmation and delete anyway
  --cascade   Delete all subtasks as well
  -h, --help  display help for command
```

### `tasks status`

```
Usage: task-o-matic tasks status [options]

Set task status

Options:
  --id <id>          Task ID
  --status <status>  New status (todo/in-progress/completed)
  -h, --help         display help for command
```

### `tasks add-tags`

```
Usage: task-o-matic tasks add-tags [options]

Add tags to a task

Options:
  --id <id>      Task ID
  --tags <tags>  Tags to add (comma-separated)
  -h, --help     display help for command
```

### `tasks remove-tags`

```
Usage: task-o-matic tasks remove-tags [options]

Remove tags from a task

Options:
  --id <id>      Task ID
  --tags <tags>  Tags to remove (comma-separated)
  -h, --help     display help for command
```

### `tasks delete-plan`

```
Usage: task-o-matic tasks delete-plan [options]

Delete implementation plan for a task

Options:
  --id <id>   Task ID
  -h, --help  display help for command
```

### `tasks subtasks`

```
Usage: task-o-matic tasks subtasks [options]

List subtasks for a task

Options:
  --id <id>   Parent task ID
  -h, --help  display help for command
```

### `tasks tree`

```
Usage: task-o-matic tasks tree [options]

Display hierarchical task tree

Options:
  --id <id>   Root task ID (optional - shows full tree if not specified)
  -h, --help  display help for command
```

### `tasks get-next`

```
Usage: task-o-matic tasks get-next [options]

Get the next task to work on (defaults to oldest todo task)

Options:
  --status <status>      Filter by status (todo/in-progress)
  --tag <tag>            Filter by tag
  --effort <effort>      Filter by effort (small/medium/large)
  --priority <priority>  Sort priority (newest/oldest/effort) (default:
                         "oldest")
  -h, --help             display help for command
```

### `tasks execute`

```
Usage: task-o-matic tasks execute [options]

Execute a task using an external coding assistant

Options:
  --id <id>             Task ID to execute
  --tool <tool>         External tool to use (opencode/claude/gemini/codex)
                        (default: "opencode")
  --message <message>   Custom message to send to the tool (uses task plan if
                        not provided)
  --dry                 Show what would be executed without running it
  --validate <command>  Validation command to run after execution (can be used
                        multiple times)
  -h, --help            display help for command
```

---

## PRD Commands

### `prd`

```
Usage: task-o-matic prd [options] [command]

Manage PRDs and generate tasks

Options:
  -h, --help        display help for command

Commands:
  parse [options]   Parse a PRD file into structured tasks
  rework [options]  Rework a PRD based on user feedback
  help [command]    display help for command
```

### `prd parse`

```
Usage: task-o-matic prd parse [options]

Parse a PRD file into structured tasks

Options:
  --file <path>             Path to PRD file
  --prompt <prompt>         Override prompt
  --message <message>       User message
  --ai-provider <provider>  AI provider override
  --ai-model <model>        AI model override
  --ai-key <key>            AI API key override
  --ai-provider-url <url>   AI provider URL override
  --ai-reasoning <tokens>   Enable reasoning for OpenRouter models (max
                            reasoning tokens)
  --stream                  Show streaming AI output during parsing
  -h, --help                display help for command
```

### `prd rework`

```
Usage: task-o-matic prd rework [options]

Rework a PRD based on user feedback

Options:
  --file <path>             Path to PRD file
  --feedback <feedback>     User feedback
  --output <path>           Output file path (default: overwrite original)
  --prompt <prompt>         Override prompt
  --message <message>       User message
  --ai-provider <provider>  AI provider override
  --ai-model <model>        AI model override
  --ai-key <key>            AI API key override
  --ai-provider-url <url>   AI provider URL override
  --ai-reasoning <tokens>   Enable reasoning for OpenRouter models (max
                            reasoning tokens)
  --stream                  Show streaming AI output during rework
  -h, --help                display help for command
```

---

## Prompt Commands

### `prompt`

```
Usage: task-o-matic prompt [options] [name]

Build AI service prompts with variable replacement for external tools

Arguments:
  name                              Prompt name (e.g., prd-parsing,
                                    task-enhancement, task-breakdown,
                                    prd-rework, documentation-detection)

Options:
  -t, --type <type>                 Prompt type: system or user (default: user)
                                    (default: "user")
  -l, --list                        List all available prompts and exit
                                    (default: false)
  -m, --metadata <name>             Show metadata for a specific prompt and
                                    exit
  --prd-content <content>           PRD content (for PRD-related prompts)
  --prd-file <filepath>             Load PRD content from file
  --task-title <title>              Task title (for task-related prompts)
  --task-description <description>  Task description (for task-related prompts)
  --task-file <filepath>            Load task description from file
  --stack-info <info>               Technology stack information (e.g.,
                                    "Frontend: Next.js, Backend: Convex")
  --context-info <info>             Additional context information
  --user-feedback <feedback>        User feedback (for prd-rework prompt)
  --var <key=value>                 Custom variable in format key=value (can be
                                    used multiple times) (default: [])
  -h, --help                        display help for command

Examples:
  # List all available prompts
  $ task-o-matic prompt --list

  # Show metadata for a specific prompt
  $ task-o-matic prompt --metadata prd-parsing
  $ task-o-matic prompt --metadata task-enhancement --type user

  # Build PRD parsing prompt with content from file
  $ task-o-matic prompt prd-parsing --prd-file ./my-prd.md

  # Build task enhancement prompt with task info
  $ task-o-matic prompt task-enhancement --task-title "Add user auth" --task-description "Implement JWT authentication"

  # Build with custom variables
  $ task-o-matic prompt prd-parsing --var PRD_CONTENT="My PRD content" --var STACK_INFO="Next.js, Convex"

  # Build system prompt
  $ task-o-matic prompt prd-parsing --type system
```

---

## Init Commands

### `init`

```
Usage: task-o-matic init [options] [command]

Initialize task-o-matic project and bootstrap Better-T-Stack

Options:
  -h, --help                  display help for command

Commands:
  init [options]              Initialize a new task-o-matic project in the
                              current directory
  bootstrap [options] <name>  Bootstrap a new project using Better-T-Stack
```

### `init init`

```
Usage: task-o-matic init init [options]

Initialize a new task-o-matic project in the current directory

Options:
  --ai-provider <provider>  AI provider (openrouter/anthropic/openai/custom)
                            (default: "openrouter")
  --ai-model <model>        AI model (default: "z-ai/glm-4.6")
  --ai-key <key>            AI API key
  --ai-provider-url <url>   AI provider URL
  --max-tokens <tokens>     Max tokens for AI (min 32768 for 2025) (default:
                            "32768")
  --temperature <temp>      AI temperature (default: "0.5")
  --no-bootstrap            Skip bootstrap after initialization
  --project-name <name>     Project name for bootstrap
  --frontend <frontend>     Frontend framework for bootstrap (default: "next")
  --backend <backend>       Backend framework for bootstrap (default: "convex")
  --database <database>     Database for bootstrap
  --auth <auth>             Authentication for bootstrap (default:
                            "better-auth")
  --context7-api-key <key>  Context7 API key
  --directory <dir>         Working directory for the project
  -h, --help                display help for command
```

### `init bootstrap`

```
Usage: task-o-matic init bootstrap [options] <name>

Bootstrap a new project using Better-T-Stack

Arguments:
  name                       Project name

Options:
  --frontend <frontend>      Frontend framework
                             (next/tanstack-router/react-router/etc) (default:
                             "next")
  --backend <backend>        Backend framework (hono/express/elysia) (default:
                             "hono")
  --database <database>      Database (sqlite/postgres/mysql/mongodb) (default:
                             "sqlite")
  --orm <orm>                ORM (drizzle/prisma/none) (default: "drizzle")
  --no-auth                  Exclude authentication
  --addons <addons... >      Additional addons
                             (pwa/tauri/starlight/biome/husky/turborepo)
  --examples <examples... >  Examples to include (todo/ai)
  --no-git                   Skip git initialization
  --package-manager <pm>     Package manager (npm/pnpm/bun) (default: "npm")
  --no-install               Skip installing dependencies
  --db-setup <setup>         Database setup
                             (turso/neon/prisma-postgres/mongodb-atlas)
  --runtime <runtime>        Runtime (bun/node) (default: "node")
  --api <type>               API type (trpc/orpc)
  -h, --help                 display help for command
```

---

*Generated on: $(date)*
*Task-O-Matic Version: AI-powered Task Management CLI for Single Projects*