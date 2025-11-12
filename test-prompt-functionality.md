# Prompt Command Functionality Test

This document demonstrates the prompt command functionality that has been implemented.

## Overview

The prompt command allows building AI service prompts with variable replacement for external tools. It supports both system and user prompts with comprehensive variable handling.

## Available Prompts

### User Prompts:

1. **prd-parsing** - Parse PRD into structured tasks with dependency analysis
   - Required: PRD_CONTENT
   - Optional: STACK_INFO

2. **task-enhancement** - Enhance task description with Context7 documentation
   - Required: TASK_TITLE
   - Optional: TASK_DESCRIPTION, CONTEXT_INFO

3. **task-breakdown** - Break down complex tasks into smaller subtasks
   - Required: TASK_TITLE
   - Optional: TASK_DESCRIPTION

4. **prd-rework** - Improve PRD based on user feedback
   - Required: PRD_CONTENT, USER_FEEDBACK

5. **documentation-detection** - Analyze task and identify required documentation libraries
   - Required: TASK_TITLE
   - Optional: TASK_DESCRIPTION, STACK_INFO

### System Prompts:

1. **prd-parsing-system** - System prompt for PRD parsing with task breakdown rules
2. **task-enhancement-system** - System prompt for task enhancement with documentation integration
3. **task-breakdown-system** - System prompt for task breakdown methodology
4. **prd-rework-system** - System prompt for PRD improvement and enhancement
5. **documentation-detection-system** - System prompt for documentation analysis and Context7 integration

## Usage Examples

### 1. List all available prompts

```bash
task-o-matic prompt --list
```

### 2. Show metadata for a specific prompt

```bash
task-o-matic prompt --metadata prd-parsing
task-o-matic prompt --metadata task-enhancement --type user
```

### 3. Build PRD parsing prompt with content from file

```bash
task-o-matic prompt prd-parsing --prd-file ./my-prd.md
```

### 4. Build PRD parsing prompt with inline content

```bash
task-o-matic prompt prd-parsing --prd-content "Build a todo app with user authentication" --stack-info "Next.js, Convex, Better-Auth"
```

### 5. Build task enhancement prompt with task info

```bash
task-o-matic prompt task-enhancement --task-title "Add user auth" --task-description "Implement JWT authentication"
```

### 6. Build with custom variables

```bash
task-o-matic prompt prd-parsing --var PRD_CONTENT="My PRD content" --var STACK_INFO="Next.js, Convex"
```

### 7. Build system prompt

```bash
task-o-matic prompt prd-parsing --type system
```

### 8. Build PRD rework prompt

```bash
task-o-matic prompt prd-rework --prd-content "Build a basic todo app" --user-feedback "Add more details about user roles and permissions"
```

## Implementation Components

### 1. Prompt Registry (`src/lib/prompt-registry.ts`)

- Contains metadata for all available prompts
- Validates required and optional variables
- Provides prompt discovery and listing functionality

### 2. Prompt Builder (`src/lib/prompt-builder.ts`)

- Handles variable replacement logic
- Supports file loading for PRD and task content
- Auto-detects stack information from package.json
- Provides comprehensive error handling

### 3. CLI Command (`src/commands/prompt.ts`)

- Command-line interface for the prompt system
- Supports all prompt options and variables
- Provides help and examples
- Handles custom variable parsing

## Key Features

1. **Variable Replacement**: Automatically replaces {VAR_NAME} patterns with provided values
2. **File Loading**: Support for loading content from files for PRD and task descriptions
3. **Stack Detection**: Automatic detection of technology stack from package.json
4. **Custom Variables**: Support for arbitrary key=value variable pairs
5. **Validation**: Comprehensive validation of required variables with helpful error messages
6. **Type Support**: Separate handling for system and user prompts
7. **Help System**: Built-in help with examples and usage patterns

## Error Handling

The command provides detailed error messages for:

- Missing required variables (with lists of what's needed)
- Invalid prompt names (with suggestions of available prompts)
- File not found errors
- Invalid variable formats
- Missing prompt names when required

## Integration with External Tools

The prompt command is designed to output complete, ready-to-use prompts that can be:

- Piped into other CLI tools
- Saved to files for later use
- Used in scripts and automation
- Integrated with external AI services
- Used for documentation generation

This implementation provides a robust foundation for using the AI service prompts in any external workflow.
