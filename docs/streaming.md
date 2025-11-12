# 🌊 Streaming Output

Real-time streaming allows you to watch AI responses generate live, providing immediate feedback and a more interactive experience. All AI-powered commands in task-o-matic support streaming output.

## How Streaming Works

Streaming uses Server-Sent Events (SSE) to deliver AI responses chunk by chunk as they're generated, rather than waiting for the complete response. This provides:

- **Immediate Feedback**: See results as they're being generated
- **Better UX**: No more waiting for long-running AI operations
- **Real-time Monitoring**: Watch the AI's reasoning process unfold
- **Early Termination**: Stop operations if you see they're going in the wrong direction

## Commands with Streaming Support

### Task Management Commands

#### `tasks create`

Create a new task with AI enhancement and streaming output:

```bash
# Basic task creation with streaming
task-o-matic tasks create --title "Implement user authentication" --ai-enhance --stream

# Task with description and streaming
task-o-matic tasks create \
  --title "Add payment integration" \
  --content "Integrate Stripe for payment processing" \
  --ai-enhance \
  --stream
```

#### `tasks enhance`

Enhance existing tasks with streaming:

```bash
# Enhance a specific task with streaming
task-o-matic tasks enhance --task-id abc123 --stream

# Enhance and breakdown with streaming
task-o-matic tasks enhance --task-id abc123 --breakdown --stream
```

#### `tasks document`

Generate documentation for tasks with streaming:

```bash
# Document task with streaming
task-o-matic tasks document --task-id abc123 --stream

# Document with custom template and streaming
task-o-matic tasks document --task-id abc123 --template technical --stream
```

### PRD Commands

#### `prd parse`

Parse PRD files with streaming output:

```bash
# Parse PRD with streaming
task-o-matic prd parse --file requirements.md --stream

# Parse PRD with custom prompt and streaming
task-o-matic prd parse \
  --file requirements.md \
  --prompt-template custom-technical \
  --stream
```

#### `prd rework`

Rwork PRD content with streaming:

```bash
# Rework PRD with streaming
task-o-matic prd rework --content "old PRD content" --stream

# Rework with custom context and streaming
task-o-matic prd rework \
  --content "old content" \
  --context "Focus on security aspects" \
  --stream
```

## Streaming Output Format

When streaming is enabled, you'll see:

```bash
$ task-o-matic tasks create --title "Add user auth" --ai-enhance --stream

🤖 AI Enhancement in progress...
The task "Add user auth" can be enhanced by breaking it down into several subtasks:

1. **User Authentication System Design**
   - Define authentication requirements (social login, email/password, etc.)
   - Choose authentication framework (NextAuth.js, Auth0, etc.)
   - Plan token storage and session management

2. **Database Schema Implementation**
   - Create users table with authentication fields
   - Set up secure password hashing (bcrypt)
   - Design session storage structure

✓ Enhancement complete
Task created successfully: abc123
```

## Error Handling

Streaming commands include enhanced error handling:

```bash
$ task-o-matic tasks create --title "Complex task" --ai-enhance --stream

🤖 AI Enhancement in progress...
Analyzing task requirements and breaking down into subtasks...

⚠️ Enhancement finished: length
Response was truncated due to length limits, but enhancement was completed.
Task created successfully: def456
```

## Performance Considerations

### When to Use Streaming

**Use streaming for:**

- Long-running AI operations (task enhancement, PRD parsing)
- Interactive development sessions
- Debugging AI responses
- Complex task breakdowns

**Skip streaming for:**

- Quick operations (task listing, status updates)
- Automated scripts where human monitoring isn't needed
- CI/CD environments

### Network and Resource Usage

- **Bandwidth**: Streaming uses slightly more bandwidth due to multiple small requests
- **Memory**: Lower memory usage as responses are processed incrementally
- **CPU**: Similar CPU usage to non-streaming operations

## Troubleshooting

### Common Issues

**1. Stream stops unexpectedly**

```bash
# This might indicate network issues or API limits
# Try again or check your API configuration
task-o-matic config show
```

**2. garbled output**

```bash
# Ensure your terminal supports UTF-8 encoding
export LANG=en_US.UTF-8
```

**3. No streaming output**

```bash
# Verify the --stream flag is properly placed after the command
task-o-matic tasks create --title "Test" --ai-enhance --stream
```

### Debug Mode

Enable debug mode to see streaming internals:

```bash
# Set debug environment variable
export TASK_O_MATIC_DEBUG=true
task-o-matic tasks create --title "Test" --ai-enhance --stream
```

## Integration with Scripts

### Script Usage

For automated scripts, you might want to disable streaming:

```bash
#!/bin/bash
# Automated task creation script
task-o-matic tasks create \
  --title "Automated task" \
  --ai-enhance \
  # Note: no --stream flag for automated usage
```

### Conditional Streaming

Make streaming conditional based on environment:

```bash
#!/bin/bash
# Use streaming only in interactive mode
if [ -t 0 ]; then
  STREAM_FLAG="--stream"
else
  STREAM_FLAG=""
fi

task-o-matic tasks create --title "My task" --ai-enhance $STREAM_FLAG
```

## Configuration

Streaming behavior can be configured through environment variables:

```bash
# Enable streaming by default (can be overridden with --no-stream)
export TASK_O_MATIC_DEFAULT_STREAM=true

# Streaming buffer size (characters)
export TASK_O_MATIC_STREAM_BUFFER_SIZE=1024

# Streaming timeout (seconds)
export TASK_O_MATIC_STREAM_TIMEOUT=300
```

## Best Practices

1. **Use Interactive Mode**: Streaming works best when you can monitor the output
2. **Monitor for Errors**: Watch for warning messages during streaming operations
3. **Combine with Logging**: Streaming output isn't saved to logs automatically
4. **Test Without Streaming**: Verify commands work before adding --stream flag
5. **Handle Interruptions**: Use Ctrl+C to safely stop streaming operations

## Examples

### End-to-End Workflow with Streaming

```bash
# 1. Parse PRD with streaming
task-o-matic prd parse --file product-requirements.md --stream

# 2. Review generated tasks
task-o-matic tasks list

# 3. Enhance specific task with streaming
task-o-matic tasks enhance --task-id task123 --stream

# 4. Document enhanced task with streaming
task-o-matic tasks document --task-id task123 --stream
```

### Batch Operations

```bash
# Create multiple tasks with streaming
for title in "Setup auth" "Create database" "Build UI"; do
  task-o-matic tasks create --title "$title" --ai-enhance --stream
done
```

---

**Tip**: Streaming is designed for interactive use. For automated scripts, consider omitting the `--stream` flag for cleaner output.
