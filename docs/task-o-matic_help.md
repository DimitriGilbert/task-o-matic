# Task-O-Matic CLI Help Reference

Auto-generated documentation for all task-o-matic commands.

## Table of Contents

- [Main Command](#main-command)
- [config Commands](#config-commands)
- [tasks Commands](#tasks-commands)
- [prd Commands](#prd-commands)
- [continue Commands](#continue-commands)
- [prompt Commands](#prompt-commands)
- [init Commands](#init-commands)
- [workflow Commands](#workflow-commands)
- [benchmark Commands](#benchmark-commands)
- [install Commands](#install-commands)
- [detect Commands](#detect-commands)

---

## Main Command

```
Usage: task-o-matic [options] [command]

AI-powered Task Management CLI for Single Projects

Options:
  -V, --version               output the version number
  -v, --verbose               Enable verbose logging
  -h, --help                  display help for command

Commands:
  config                      Manage task-o-matic configuration
  tasks
  prd                         Manage PRDs and generate tasks
  continue [options]          Continue working on an existing project
  prompt [options] [name]     Build AI service prompts with variable replacement
                              for external tools
  init                        Initialize task-o-matic project and bootstrap
                              projects (web/native/cli)
  workflow [options]          Interactive workflow for complete project setup
                              and task management
  benchmark                   Run and manage AI benchmarks
  install [options] <target>  Install task-o-matic documentation and agent
                              guides into current project
  detect [options]            Detect technology stack of the current project
```

## Config Commands

### config --help
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

### config get-ai-config --help
```
Usage: task-o-matic config get-ai-config [options]

Get the current AI configuration

Options:
  -h, --help  display help for command
```

### config set-ai-provider --help
```
Usage: task-o-matic config set-ai-provider [options] <provider> [model]

Set the AI provider and model

Arguments:
  provider    AI provider (e.g., openrouter, openai)
  model       AI model (optional)

Options:
  -h, --help  display help for command
```

### config info --help
```
Usage: task-o-matic config info [options]

Get information about the current task-o-matic project

Options:
  -h, --help  display help for command
```

### config help --help
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


## Tasks Commands

### tasks --help
```
Usage: task-o-matic tasks [options] [command]

Options:
  -h, --help                   display help for command

Commands:
  list [options]               List all tasks
  create [options]             Create a new task with AI enhancement using
                               Context7
  show [options]               Show detailed information about a task
  update [options]             Update an existing task
  delete [options]             Delete a task
  status [options]             Set task status
  add-tags [options]           Add tags to a task
  remove-tags [options]        Remove tags from a task
  plan [options]               Create detailed implementation plan for a task or
                               subtask
  get-plan [options]           View existing implementation plan for a task or
                               subtask
  list-plan                    List all available implementation plans
  delete-plan [options]        Delete implementation plan for a task
  set-plan [options]           Set implementation plan for a task
  enhance [options]            Enhance an existing task with AI using Context7
                               documentation
  split [options]              Split a task into smaller subtasks using AI
  document [options]           Analyze and fetch documentation for a task using
                               AI with Context7
  get-documentation [options]  Get existing documentation for a task
  add-documentation [options]  Add documentation to a task from a file
  execute [options]            Execute a task using an external coding assistant
  execute-loop [options]       Execute multiple tasks in a loop with retry logic
                               and verification
  subtasks [options]           List subtasks for a task
  tree [options]               Display hierarchical task tree
  get-next [options]           Get the next task to work on (defaults to
                               hierarchical order)
  help [command]               display help for command
```

### tasks list --help
```
Usage: task-o-matic tasks list [options]

List all tasks

Options:
  -s, --status <status>  Filter by status (todo/in-progress/completed)
  -t, --tag <tag>        Filter by tag
  -h, --help             display help for command
```

### tasks create --help
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

### tasks show --help
```
Usage: task-o-matic tasks show [options]

Show detailed information about a task

Options:
  --id <id>   Task ID
  -h, --help  display help for command
```

### tasks update --help
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

### tasks delete --help
```
Usage: task-o-matic tasks delete [options]

Delete a task

Options:
  --id <id>   Task ID to delete
  --force     Skip confirmation and delete anyway
  --cascade   Delete all subtasks as well
  -h, --help  display help for command
```

### tasks status --help
```
Usage: task-o-matic tasks status [options]

Set task status

Options:
  -i, --id <id>          Task ID
  -s, --status <status>  New status (todo/in-progress/completed)
  -h, --help             display help for command
```

### tasks add-tags --help
```
Usage: task-o-matic tasks add-tags [options]

Add tags to a task

Options:
  --id <id>      Task ID
  --tags <tags>  Tags to add (comma-separated)
  -h, --help     display help for command
```

### tasks remove-tags --help
```
Usage: task-o-matic tasks remove-tags [options]

Remove tags from a task

Options:
  --id <id>      Task ID
  --tags <tags>  Tags to remove (comma-separated)
  -h, --help     display help for command
```

### tasks plan --help
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

### tasks get-plan --help
```
Usage: task-o-matic tasks get-plan [options]

View existing implementation plan for a task or subtask

Options:
  --id <id>   Task or subtask ID
  -h, --help  display help for command
```

### tasks list-plan --help
```
Usage: task-o-matic tasks list-plan [options]

List all available implementation plans

Options:
  -h, --help  display help for command
```

### tasks delete-plan --help
```
Usage: task-o-matic tasks delete-plan [options]

Delete implementation plan for a task

Options:
  --id <id>   Task ID
  -h, --help  display help for command
```

### tasks set-plan --help
```
Usage: task-o-matic tasks set-plan [options]

Set implementation plan for a task

Options:
  --id <id>           Task ID
  --plan <text>       Plan text (use quotes for multi-line)
  --plan-file <path>  Path to file containing the plan
  -h, --help          display help for command
```

### tasks enhance --help
```
Usage: task-o-matic tasks enhance [options]

Enhance an existing task with AI using Context7 documentation

Options:
  --task-id <id>            Task ID to enhance
  --all                     Enhance all existing tasks
  --status <status>         Filter tasks by status (todo/in-progress/completed)
  --tag <tag>               Filter tasks by tag
  --dry                     Preview what would be enhanced without making
                            changes
  --force                   Skip confirmation prompt for bulk operations
  --stream                  Show streaming AI output during enhancement
  --ai-provider <provider>  AI provider override
  --ai-model <model>        AI model override
  --ai-key <key>            AI API key override
  --ai-provider-url <url>   AI provider URL override
  --reasoning <tokens>      Enable reasoning for OpenRouter models (max
                            reasoning tokens)
  -h, --help                display help for command
```

### tasks split --help
```
Usage: task-o-matic tasks split [options]

Split a task into smaller subtasks using AI

Options:
  --task-id <id>                 Task ID to split
  --all                          Split all existing tasks that don't have
                                 subtasks
  --status <status>              Filter tasks by status
                                 (todo/in-progress/completed)
  --tag <tag>                    Filter tasks by tag
  --dry                          Preview what would be split without making
                                 changes
  --force                        Skip confirmation prompt for bulk operations
  --stream                       Show streaming AI output during breakdown
  --ai-provider <provider>       AI provider override
  --ai-key <key>                 AI API key override
  --ai-provider-url <url>        AI provider URL override
  --ai <models...>               AI model(s) to use. Format:
                                 [provider:]model[;reasoning[=budget]]
  --combine-ai <provider:model>  AI model to combine multiple split results
  --reasoning <tokens>           Enable reasoning for OpenRouter models (max
                                 reasoning tokens)
  --tools                        Enable filesystem tools for project analysis
  -h, --help                     display help for command
```

### tasks document --help
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

### tasks get-documentation --help
```
Usage: task-o-matic tasks get-documentation [options]

Get existing documentation for a task

Options:
  --id <id>   Task ID
  -h, --help  display help for command
```

### tasks add-documentation --help
```
Usage: task-o-matic tasks add-documentation [options]

Add documentation to a task from a file

Options:
  -i, --id <id>          Task ID
  -f, --doc-file <path>  Path to documentation file
  -o, --overwrite        Overwrite existing documentation
  -h, --help             display help for command
```

### tasks execute --help
```
Usage: task-o-matic tasks execute [options]

Execute a task using an external coding assistant

Options:
  --id <id>               Task ID to execute
  --tool <tool>           External tool to use (opencode/claude/gemini/codex)
                          (default: "opencode")
  --message <message>     Custom message to send to the tool (uses task plan if
                          not provided)
  -m, --model <model>     Model to use with the executor
  --continue-session      Continue the last session (for error feedback)
                          (default: false)
  --dry                   Show what would be executed without running it
  --validate <command>    Validation/verification command to run after execution
                          (can be used multiple times)
  --verify <command>      Alias for --validate (verification command)
  --max-retries <number>  Maximum number of retries (opt-in, enables retry
                          logic)
  --try-models <models>   Progressive model/executor configs for retries (e.g.,
                          'gpt-4o-mini,claude:sonnet-4')
  --plan                  Generate an implementation plan before execution
                          (default: false)
  --plan-model <model>    Model/executor to use for planning (e.g.,
                          'opencode:gpt-4o' or 'gpt-4o')
  --plan-tool <tool>      Tool/Executor to use for planning (defaults to --tool)
  --review-plan           Pause for human review of the plan (default: false)
  --review                Run AI review after execution (default: false)
  --review-model <model>  Model/executor to use for review (e.g.,
                          'opencode:gpt-4o' or 'gpt-4o')
  --auto-commit           Automatically commit changes after execution (default:
                          false)
  --include-prd           Include PRD content in execution context (default:
                          false)
  -h, --help              display help for command
```

### tasks execute-loop --help
```
Usage: task-o-matic tasks execute-loop [options]

Execute multiple tasks in a loop with retry logic and verification

Options:
  --status <status>       Filter tasks by status (todo/in-progress/completed)
  --tag <tag>             Filter tasks by tag
  --ids <ids>             Comma-separated list of task IDs to execute
  --tool <tool>           External tool to use (opencode/claude/gemini/codex)
                          (default: "opencode")
  --max-retries <number>  Maximum number of retries per task (default: 3)
  --try-models <models>   Progressive model/executor configs for each retry
                          (e.g., 'gpt-4o-mini,gpt-4o,claude:sonnet-4')
  -m, --model <model>     Model to force for execution
  --verify <command>      Verification command to run after each task (can be
                          used multiple times)
  --validate <command>    Alias for --verify (validation command, can be used
                          multiple times)
  --message <message>     Custom message to send to the tool (overrides task
                          plan)
  --continue-session      Continue the last session (for error feedback)
                          (default: false)
  --auto-commit           Automatically commit changes after each task (default:
                          false)
  --plan                  Generate an implementation plan before execution
                          (default: false)
  --plan-model <model>    Model/executor to use for planning (e.g.,
                          'opencode:gpt-4o' or 'gpt-4o')
  --plan-tool <tool>      Tool/Executor to use for planning (defaults to --tool)
  --review-plan           Pause for human review of the plan (default: false)
  --review                Run AI review after execution (default: false)
  --review-model <model>  Model/executor to use for review (e.g.,
                          'opencode:gpt-4o' or 'gpt-4o')
  --include-completed     Include already-completed tasks in execution (default:
                          false)
  --include-prd           Include PRD content in execution context (default:
                          false)
  --notify <target>       Notify on completion via URL or command (can be used
                          multiple times)
  --dry                   Show what would be executed without running it
                          (default: false)
  -h, --help              display help for command
```

### tasks subtasks --help
```
Usage: task-o-matic tasks subtasks [options]

List subtasks for a task

Options:
  --id <id>   Parent task ID
  -h, --help  display help for command
```

### tasks tree --help
```
Usage: task-o-matic tasks tree [options]

Display hierarchical task tree

Options:
  --id <id>   Root task ID (optional - shows full tree if not specified)
  -h, --help  display help for command
```

### tasks get-next --help
```
Usage: task-o-matic tasks get-next [options]

Get the next task to work on (defaults to hierarchical order)

Options:
  -s, --status <status>      Filter by status (todo/in-progress)
  -t, --tag <tag>            Filter by tag
  -e, --effort <effort>      Filter by effort (small/medium/large)
  -p, --priority <priority>  Sort priority (newest/oldest/effort) (default:
                             "hierarchical")
  -h, --help                 display help for command
```

### tasks help --help
```
Usage: task-o-matic tasks [options] [command]

Options:
  -h, --help                   display help for command

Commands:
  list [options]               List all tasks
  create [options]             Create a new task with AI enhancement using
                               Context7
  show [options]               Show detailed information about a task
  update [options]             Update an existing task
  delete [options]             Delete a task
  status [options]             Set task status
  add-tags [options]           Add tags to a task
  remove-tags [options]        Remove tags from a task
  plan [options]               Create detailed implementation plan for a task or
                               subtask
  get-plan [options]           View existing implementation plan for a task or
                               subtask
  list-plan                    List all available implementation plans
  delete-plan [options]        Delete implementation plan for a task
  set-plan [options]           Set implementation plan for a task
  enhance [options]            Enhance an existing task with AI using Context7
                               documentation
  split [options]              Split a task into smaller subtasks using AI
  document [options]           Analyze and fetch documentation for a task using
                               AI with Context7
  get-documentation [options]  Get existing documentation for a task
  add-documentation [options]  Add documentation to a task from a file
  execute [options]            Execute a task using an external coding assistant
  execute-loop [options]       Execute multiple tasks in a loop with retry logic
                               and verification
  subtasks [options]           List subtasks for a task
  tree [options]               Display hierarchical task tree
  get-next [options]           Get the next task to work on (defaults to
                               hierarchical order)
  help [command]               display help for command
```


## Prd Commands

### prd --help
```
Usage: task-o-matic prd [options] [command]

Manage PRDs and generate tasks

Options:
  -h, --help                      display help for command

Commands:
  create [options] <description>  Generate PRD(s) from a product description
  combine [options]               Combine multiple PRD files into a master PRD
  parse [options]                 Parse a PRD file into structured tasks
  rework [options]                Rework a PRD based on user feedback
  question [options]              Generate clarifying questions for a PRD
  refine [options]                Refine PRD by answering clarifying questions
  get-stack [options]             Suggest optimal technology stack based on PRD
                                  analysis
  generate [options]              Generate a PRD from an existing codebase
                                  (reverse-engineering)
  help [command]                  display help for command
```

### prd create --help
```
Usage: task-o-matic prd create [options] <description>

Generate PRD(s) from a product description

Arguments:
  description                    Product description

Options:
  --ai <models...>               AI model(s) to use. Format:
                                 [provider:]model[;reasoning[=budget]]. Example:
                                 openrouter:openai/gpt-5;reasoning=2000
  --combine-ai <provider:model>  AI model to combine multiple PRDs into master
                                 PRD
  --output-dir <path>            Directory to save PRDs (default:
                                 ".task-o-matic/prd")
  --ai-reasoning <tokens>        Enable reasoning for OpenRouter models (max
                                 reasoning tokens)
  --stream                       Enable streaming output (only for single AI)
  -h, --help                     display help for command
```

### prd combine --help
```
Usage: task-o-matic prd combine [options]

Combine multiple PRD files into a master PRD

Options:
  --files <paths...>       PRD files to combine
  --description <text>     Original product description
  --ai <provider:model>    AI model to use for combining
  --output <path>          Output file path (default: "prd-master.md")
  --ai-reasoning <tokens>  Enable reasoning for OpenRouter models (max reasoning
                           tokens)
  --stream                 Enable streaming output
  -h, --help               display help for command
```

### prd parse --help
```
Usage: task-o-matic prd parse [options]

Parse a PRD file into structured tasks

Options:
  --file <path>                  Path to PRD file
  --ai <models...>               AI model(s) to use. Format:
                                 [provider:]model[;reasoning[=budget]]
  --combine-ai <provider:model>  AI model to combine multiple parsed results
  --prompt <prompt>              Override prompt
  --message <message>            User message
  --ai-provider <provider>       AI provider override
  --ai-model <model>             AI model override
  --ai-key <key>                 AI API key override
  --ai-provider-url <url>        AI provider URL override
  --ai-reasoning <tokens>        Enable reasoning for OpenRouter models (max
                                 reasoning tokens)
  --stream                       Show streaming AI output during parsing
  --tools                        Enable filesystem tools for project analysis
  -h, --help                     display help for command
```

### prd rework --help
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
  --tools                   Enable filesystem tools for project analysis
  -h, --help                display help for command
```

### prd question --help
```
Usage: task-o-matic prd question [options]

Generate clarifying questions for a PRD

Options:
  --file <path>             Path to PRD file
  --output <path>           Output JSON file path (default: prd-questions.json)
  --prompt <prompt>         Override prompt
  --message <message>       User message
  --ai-provider <provider>  AI provider override
  --ai-model <model>        AI model override
  --ai-key <key>            AI API key override
  --ai-provider-url <url>   AI provider URL override
  --ai-reasoning <tokens>   Enable reasoning for OpenRouter models (max
                            reasoning tokens)
  --stream                  Show streaming AI output
  --tools                   Enable filesystem tools for project analysis
  -h, --help                display help for command
```

### prd refine --help
```
Usage: task-o-matic prd refine [options]

Refine PRD by answering clarifying questions

Options:
  --file <path>             Path to PRD file
  --questions <path>        Path to questions JSON file (optional, will generate
                            if missing)
  --output <path>           Output file path (default: overwrite original)
  --prompt <prompt>         Override prompt
  --message <message>       User message
  --ai-provider <provider>  AI provider override
  --ai-model <model>        AI model override
  --ai-key <key>            AI API key override
  --ai-provider-url <url>   AI provider URL override
  --ai-reasoning <tokens>   Enable reasoning for OpenRouter models (max
                            reasoning tokens)
  --stream                  Show streaming AI output
  --tools                   Enable filesystem tools for project analysis
  -h, --help                display help for command
```

### prd get-stack --help
```
Usage: task-o-matic prd get-stack [options]

Suggest optimal technology stack based on PRD analysis

Options:
  --file <path>             Path to PRD file
  --content <text>          PRD content as string (mutually exclusive with
                            --file)
  --project-name <name>     Project name (inferred from PRD if not provided)
  --save                    Save suggested stack to .task-o-matic/stack.json
  --output <path>           Custom output path (implies --save)
  --json                    Output result as JSON
  --prompt <prompt>         Override prompt
  --message <message>       User message
  --ai-provider <provider>  AI provider override
  --ai-model <model>        AI model override
  --ai-key <key>            AI API key override
  --ai-provider-url <url>   AI provider URL override
  --ai-reasoning <tokens>   Enable reasoning for OpenRouter models (max
                            reasoning tokens)
  --stream                  Show streaming AI output
  --tools                   Enable filesystem tools for project analysis
  -h, --help                display help for command
```

### prd generate --help
```
Usage: task-o-matic prd generate [options]

Generate a PRD from an existing codebase (reverse-engineering)

Options:
  --from-codebase          Analyze the current project and generate a PRD from
                           it (default behavior)
  --output <filename>      Output filename (default: "current-state.md")
  --ai <provider:model>    AI model to use. Format:
                           [provider:]model[;reasoning[=budget]]
  --ai-reasoning <tokens>  Enable reasoning for OpenRouter models (max reasoning
                           tokens)
  --stream                 Enable streaming output
  --tools                  Enable filesystem tools for deeper analysis
  --json                   Output result as JSON
  -h, --help               display help for command
```

### prd help --help
```
Usage: task-o-matic prd [options] [command]

Manage PRDs and generate tasks

Options:
  -h, --help                      display help for command

Commands:
  create [options] <description>  Generate PRD(s) from a product description
  combine [options]               Combine multiple PRD files into a master PRD
  parse [options]                 Parse a PRD file into structured tasks
  rework [options]                Rework a PRD based on user feedback
  question [options]              Generate clarifying questions for a PRD
  refine [options]                Refine PRD by answering clarifying questions
  get-stack [options]             Suggest optimal technology stack based on PRD
                                  analysis
  generate [options]              Generate a PRD from an existing codebase
                                  (reverse-engineering)
  help [command]                  display help for command
```


## Continue Commands

### continue --help
```
Usage: task-o-matic continue [options]

Continue working on an existing project

Options:
  -s, --status                 Show project status overview
  -a, --add-feature <feature>  Add a new feature to the PRD
  -u, --update-prd             Update PRD with implementation progress
  -g, --generate-tasks         Generate tasks for unimplemented features
  -p, --generate-plan          Generate implementation plan for remaining work
  -h, --help                   display help for command
```


## Prompt Commands

### prompt --help
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
  -m, --metadata <name>             Show metadata for a specific prompt and exit
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
  --full-context                    Include comprehensive project context (file
                                    structure, dependencies, etc.) (default:
                                    false)
  --executor <type>                 Format output for specific executor:
                                    opencode, claude, gemini, codex
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


## Init Commands

### init --help
```
Usage: task-o-matic init [options] [command]

Initialize task-o-matic project and bootstrap projects (web/native/cli)

Options:
  -h, --help                  display help for command

Commands:
  init [options]              Initialize a new task-o-matic project in the
                              current directory
  bootstrap [options] <name>  Bootstrap a new project (web/native/cli)
  attach [options]            Attach task-o-matic to an existing project (detect
                              stack automatically)
```

### init init --help
```
Usage: task-o-matic init init [options]

Initialize a new task-o-matic project in the current directory

Options:
  --ai-provider <provider>   AI provider (openrouter/anthropic/openai/custom)
                             (default: "openrouter")
  --ai-model <model>         AI model (default: "z-ai/glm-4.6")
  --ai-key <key>             AI API key
  --ai-provider-url <url>    AI provider URL
  --max-tokens <tokens>      Max tokens for AI (min 32768 for 2025) (default:
                             "32768")
  --temperature <temp>       AI temperature (default: "0.5")
  --no-bootstrap             Skip bootstrap after initialization
  --project-name <name>      Project name for bootstrap
  --frontend <frontends...>  Frontend framework(s) - space/comma-separated
                             (next, native-bare, cli, etc.) (default: "next")
  --backend <backend>        Backend framework for bootstrap (default: "convex")
  --database <database>      Database for bootstrap
  --auth <auth>              Authentication for bootstrap (default:
                             "better-auth")
  --context7-api-key <key>   Context7 API key
  --directory <dir>          Working directory for the project
  --package-manager <pm>     Package manager (npm/pnpm/bun) (default: "npm")
  --runtime <runtime>        Runtime (bun/node) (default: "node")
  --payment <payment>        Payment provider (none/polar) (default: "none")
  --cli-deps <level>         CLI dependency level
                             (minimal/standard/full/task-o-matic) (default:
                             "standard")
  -h, --help                 display help for command
```

### init bootstrap --help
```
Usage: task-o-matic init bootstrap [options] <name>

Bootstrap a new project (web/native/cli)

Arguments:
  name                       Project name

Options:
  --frontend <frontends...>  Frontend framework(s) - space/comma-separated
                             (next, native-bare, cli, etc.) (default: "next")
  --backend <backend>        Backend framework
                             (hono/express/fastify/elysia/convex/self/none)
                             (default: "hono")
  --database <database>      Database (sqlite/postgres/mysql/mongodb/none)
                             (default: "sqlite")
  --orm <orm>                ORM (drizzle/prisma/mongoose/none) (default:
                             "drizzle")
  --auth <auth>              Authentication (better-auth/clerk/none) (default:
                             "better-auth")
  --no-auth                  Exclude authentication
  --addons <addons...>       Addons
                             (turborepo/pwa/tauri/biome/husky/starlight/fumadocs/ultracite/oxlint/ruler/opentui/wxt)
  --examples <examples...>   Examples to include (todo/ai)
  --template <template>      Use a predefined template
                             (mern/pern/t3/uniwind/none)
  --no-git                   Skip git initialization
  --package-manager <pm>     Package manager (npm/pnpm/bun) (default: "npm")
  --no-install               Skip installing dependencies
  --db-setup <setup>         Database setup
                             (turso/neon/prisma-postgres/mongodb-atlas)
  --runtime <runtime>        Runtime (bun/node) (default: "node")
  --api <type>               API type (trpc/orpc)
  --payment <payment>        Payment provider (none/polar) (default: "none")
  --cli-deps <level>         CLI dependency level
                             (minimal/standard/full/task-o-matic) (default:
                             "standard")
  -h, --help                 display help for command
```

### init attach --help
```
Usage: task-o-matic init attach [options]

Attach task-o-matic to an existing project (detect stack automatically)

Options:
  --analyze                 Run full project analysis including TODOs and
                            features
  --create-prd              Auto-generate a PRD from codebase analysis
  --dry-run                 Just detect, don't create files
  --redetect                Force re-detection of stack (overwrites cached
                            stack.json)
  --ai-provider <provider>  AI provider (openrouter/anthropic/openai/custom)
                            (default: "openrouter")
  --ai-model <model>        AI model (default: "z-ai/glm-4.6")
  --ai-key <key>            AI API key
  --ai-provider-url <url>   AI provider URL
  --max-tokens <tokens>     Max tokens for AI (min 32768 for 2025) (default:
                            "32768")
  --temperature <temp>      AI temperature (default: "0.5")
  --context7-api-key <key>  Context7 API key
  -h, --help                display help for command
```


## Workflow Commands

### workflow --help
```
Usage: task-o-matic workflow [options]

Interactive workflow for complete project setup and task management

Options:
  --stream                                Show streaming AI output
  --ai-provider <provider>                AI provider override
  --ai-model <model>                      AI model override
  --ai-key <key>                          AI API key override
  --ai-provider-url <url>                 AI provider URL override
  --skip-all                              Skip all optional steps (use defaults)
  --auto-accept                           Auto-accept all AI suggestions
  --config-file <path>                    Load workflow options from JSON file
  --skip-init                             Skip initialization step
  --project-name <name>                   Project name
  --init-method <method>                  Initialization method: quick, custom, ai
  --project-description <desc>            Project description for AI-assisted init
  --use-existing-config                   Use existing configuration if found
  --frontend <framework>                  Frontend framework
  --backend <framework>                   Backend framework
  --database <db>                         Database choice
  --auth                                  Include authentication
  --no-auth                               Exclude authentication
  --bootstrap                             Bootstrap with Better-T-Stack
  --no-bootstrap                          Skip bootstrapping
  --include-docs                          Include Task-O-Matic documentation in new project (default: true)
  --no-include-docs                       Skip including documentation
  --skip-prd                              Skip PRD definition
  --prd-method <method>                   PRD method: upload, manual, ai, skip
  --prd-file <path>                       Path to existing PRD file
  --prd-description <desc>                Product description for AI-assisted PRD
  --prd-content <content>                 Direct PRD content
  --prd-multi-generation                  Generate multiple PRDs and compare
  --skip-prd-multi-generation             Skip PRD multi-generation
  --prd-multi-generation-models <models>  Comma-separated list of models for multi-generation
  --prd-combine                           Combine generated PRDs into a master PRD
  --skip-prd-combine                      Skip PRD combination
  --prd-combine-model <model>             Model to use for combining PRDs (provider:model)
  --skip-stack-suggestion                 Skip stack suggestion step
  --suggest-stack-from-prd [path]         Get stack from PRD (path or current)
  --skip-bootstrap                        Skip bootstrap step
  --skip-prd-question-refine              Skip PRD question/refine step
  --prd-question-refine                   Use question-based PRD refinement
  --prd-answer-mode <mode>                Who answers questions: user, ai
  --prd-answer-ai-provider <provider>     AI provider for answering (optional override)
  --prd-answer-ai-model <model>           AI model for answering (optional override)
  --prd-answer-ai-reasoning               Enable reasoning for AI answering model (if supported)
  --skip-refine                           Skip PRD refinement
  --refine-method <method>                Refinement method: manual, ai, skip
  --refine-feedback <feedback>            Feedback for AI refinement
  --skip-generate                         Skip task generation
  --generate-method <method>              Generation method: standard, ai
  --generate-instructions <instructions>  Custom task generation instructions
  --skip-split                            Skip task splitting
  --split-tasks <ids>                     Comma-separated task IDs to split
  --split-all                             Split all tasks
  --split-method <method>                 Split method: interactive, standard, custom
  --split-instructions <instructions>     Custom split instructions
  --execute                               Execute generated tasks immediately
  --execute-concurrency <number>          Number of concurrent tasks (default: 1)
  --no-auto-commit                        Disable auto-commit during execution
  --execute-tool <tool>                   Executor tool (opencode/claude/gemini/codex)
  --execute-model <model>                 Model override for execution
  --execute-max-retries <number>          Max retries per task
  --execute-plan                          Enable planning phase
  --execute-plan-model <model>            Model for planning
  --execute-review                        Enable review phase
  --execute-review-model <model>          Model for review
  --verify <command>                      Verification command to run after each task (can be used multiple times)
  --validate <command>                    Alias for --verify (validation command, can be used multiple times)
  --try-models <models>                   Progressive model/executor configs for each retry (e.g., 'gpt-4o-mini,gpt-4o,claude:sonnet-4')
  -h, --help                              display help for command
```


## Benchmark Commands

### benchmark --help
```
Usage: task-o-matic benchmark [options] [command]

Run and manage AI benchmarks

Options:
  -h, --help                 display help for command

Commands:
  run [options] <operation>  Run a benchmark operation
  list                       List past benchmark runs
  operations                 List all available benchmark operations
  show <id>                  Show details of a benchmark run
  compare <id>               Compare results of a benchmark run
  execution [options]        Run execution benchmark (Git Branch Isolation)
  execute-loop [options]     Benchmark task loop execution across models
  workflow [options]         Benchmark complete workflow execution across
                             multiple models
  help [command]             display help for command
```

### benchmark run --help
```
Usage: task-o-matic benchmark run [options] <operation>

Run a benchmark operation

Arguments:
  operation               Operation to benchmark (e.g., prd-parse,
                          task-breakdown, task-create, prd-create)

Options:
  --models <list>         Comma-separated list of models
                          (provider:model[:reasoning=<tokens>])
  --file <path>           Input file path (for PRD ops)
  --task-id <id>          Task ID (for Task ops)
  --concurrency <number>  Max concurrent requests (default: "5")
  --delay <number>        Delay between requests in ms (default: "250")
  --prompt <prompt>       Override prompt
  --message <message>     User message
  --tools                 Enable filesystem tools
  --feedback <feedback>   Feedback (for prd-rework)
  --title <title>         Task title (for task-create)
  --content <content>     Task content (for task-create)
  --parent-id <id>        Parent task ID (for task-create)
  --effort <effort>       Effort estimate: small, medium, large (for
                          task-create)
  --force                 Force operation (for task-document)
  --description <desc>    Project/PRD description (for prd-create, prd-combine)
  --output-dir <dir>      Output directory (for prd-create, prd-combine)
  --filename <name>       Output filename (for prd-create, prd-combine)
  --prds <list>           Comma-separated list of PRD file paths (for
                          prd-combine)
  --question-mode <mode>  Question mode: user or ai (for prd-refine)
  --answers <json>        JSON string of answers (for prd-refine user mode)
  -h, --help              display help for command
```

### benchmark list --help
```
Usage: task-o-matic benchmark list [options]

List past benchmark runs

Options:
  -h, --help  display help for command
```

### benchmark operations --help
```
Usage: task-o-matic benchmark operations [options]

List all available benchmark operations

Options:
  -h, --help  display help for command
```

### benchmark show --help
```
Usage: task-o-matic benchmark show [options] <id>

Show details of a benchmark run

Arguments:
  id          Run ID

Options:
  -h, --help  display help for command
```

### benchmark compare --help
```
Usage: task-o-matic benchmark compare [options] <id>

Compare results of a benchmark run

Arguments:
  id          Run ID

Options:
  -h, --help  display help for command
```

### benchmark execution --help
```
Usage: task-o-matic benchmark execution [options]

Run execution benchmark (Git Branch Isolation)

Options:
  --task-id <id>          Task ID to benchmark
  --models <list>         Comma-separated list of models (provider:model)
  --verify <command>      Verification command (can be used multiple times)
  --max-retries <number>  Maximum retries per model (default: 3)
  --no-keep-branches      Delete benchmark branches after run
  -h, --help              display help for command
```

### benchmark execute-loop --help
```
Usage: task-o-matic benchmark execute-loop [options]

Benchmark task loop execution across models

Options:
  --status <status>       Filter tasks by status (todo/in-progress/completed)
  --tag <tag>             Filter tasks by tag
  --ids <ids>             Comma-separated list of task IDs to execute
  --models <list>         Comma-separated list of models (provider:model)
  --verify <command>      Verification command to run after each task (can be
                          used multiple times)
  --max-retries <number>  Maximum number of retries per task (default: 3)
  --try-models <models>   Progressive model/executor configs for each retry
  --no-keep-branches      Delete benchmark branches after run
  -h, --help              display help for command
```

### benchmark workflow --help
```
Usage: task-o-matic benchmark workflow [options]

Benchmark complete workflow execution across multiple models

Options:
  --models <list>                         Comma-separated list of models (provider:model[:reasoning=<tokens>])
  --concurrency <number>                  Max concurrent requests (default: "3")
  --delay <number>                        Delay between requests in ms (default: "1000")
  --temp-dir <dir>                        Base directory for temporary projects
  --execute                               Execute generated tasks in the benchmark
  --skip-all                              Skip all optional steps (use defaults)
  --project-name <name>                   Project name
  --init-method <method>                  Initialization method: quick, custom, ai
  --project-description <desc>            Project description for AI-assisted init
  --frontend <framework>                  Frontend framework
  --backend <framework>                   Backend framework
  --auth                                  Include authentication
  --prd-method <method>                   PRD method: upload, manual, ai, skip
  --prd-file <path>                       Path to existing PRD file
  --prd-description <desc>                Product description
  --skip-refine                           Skip PRD refinement
  --skip-generate                         Skip task generation
  --skip-split                            Skip task splitting
  --generate-instructions <instructions>  Custom task generation instructions
  --split-instructions <instructions>     Custom split instructions
  -h, --help                              display help for command
```

### benchmark help --help
```
Usage: task-o-matic benchmark [options] [command]

Run and manage AI benchmarks

Options:
  -h, --help                 display help for command

Commands:
  run [options] <operation>  Run a benchmark operation
  list                       List past benchmark runs
  operations                 List all available benchmark operations
  show <id>                  Show details of a benchmark run
  compare <id>               Compare results of a benchmark run
  execution [options]        Run execution benchmark (Git Branch Isolation)
  execute-loop [options]     Benchmark task loop execution across models
  workflow [options]         Benchmark complete workflow execution across
                             multiple models
  help [command]             display help for command
```


## Install Commands

### install --help
```
Usage: task-o-matic install [options] <target>

Install task-o-matic documentation and agent guides into current project

Arguments:
  target      Installation target: doc, claude, or agents

Options:
  --force     Overwrite existing files (default: false)
  -h, --help  display help for command
```


## Detect Commands

### detect --help
```
Usage: task-o-matic detect [options]

Detect technology stack of the current project

Options:
  --save      Save detected stack to .task-o-matic/stack.json
  --json      Output result as JSON
  -h, --help  display help for command
```


