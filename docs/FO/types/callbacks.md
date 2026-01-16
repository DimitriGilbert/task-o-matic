## TECHNICAL BULLETIN NO. 001
### CALLBACKS SYSTEM - EVENT COORDINATION PROTOCOL

**DOCUMENT ID:** `task-o-matic-callbacks-v1`
**CLEARANCE:** `All Personnel`
**MANDATORY COMPLIANCE:** `Yes`

### ⚠️ CRITICAL SURVIVAL NOTICE
Citizen, ignore this callback system and your AI operations run blind in the wasteland. Progress tracking becomes impossible, streaming output turns to static, and error handling becomes a guessing game. This is your nervous system for AI operations.

### TYPE SYSTEM ARCHITECTURE

The callback system operates on a **discriminated union pattern** for type-safe event handling. Each event type carries specific payload data, preventing runtime errors and ensuring proper event routing. The system supports:

- **Progress Events**: Real-time operation feedback with optional metrics
- **Streaming Events**: Live AI output with text and reasoning chunks
- **Completion Events**: Final results and error states
- **Callback Interfaces**: Optional handlers for each event type

This architecture enables **composable event handling** where different components can register for specific events without interfering with each other.

### COMPLETE TYPE DOCUMENTATION

#### ProgressEvent Type

```typescript
export type ProgressEvent =
  | { type: "started"; message: string }
  | { type: "progress"; message: string; current?: number; total?: number }
  | { type: "stream-chunk"; text: string }
  | { type: "reasoning-chunk"; text: string }
  | { type: "completed"; message: string }
  | { type: "info"; message: string }
  | { type: "warning"; message: string };
```

**Purpose**: Core event type for all AI operation progress reporting

**Event Variants**:

1. **"started" Event**
   - **Properties**: `type: "started"`, `message: string`
   - **Usage**: Fired when an AI operation begins
   - **Example**: `{ type: "started", message: "Enhancing task-123..." }`

2. **"progress" Event**
   - **Properties**: `type: "progress"`, `message: string`, `current?: number`, `total?: number`
   - **Usage**: Reports progress through multi-step operations
   - **Example**: `{ type: "progress", message: "Analyzing dependencies", current: 2, total: 5 }`

3. **"stream-chunk" Event**
   - **Properties**: `type: "stream-chunk"`, `text: string`
   - **Usage**: Live streaming of AI-generated text
   - **Example**: `{ type: "stream-chunk", text: "Based on the requirements..." }`

4. **"reasoning-chunk" Event**
   - **Properties**: `type: "reasoning-chunk"`, `text: string`
   - **Usage**: Live streaming of AI reasoning (for models that support it)
   - **Example**: `{ type: "reasoning-chunk", text: "The user needs authentication..." }`

5. **"completed" Event**
   - **Properties**: `type: "completed"`, `message: string`
   - **Usage**: Fired when operation completes successfully
   - **Example**: `{ type: "completed", message: "Task enhanced successfully" }`

6. **"info" Event**
   - **Properties**: `type: "info"`, `message: string`
   - **Usage**: General informational messages
   - **Example**: `{ type: "info", message: "Using Claude Sonnet model" }`

7. **"warning" Event**
   - **Properties**: `type: "warning"`, `message: string`
   - **Usage**: Non-critical warnings that don't stop operation
   - **Example**: `{ type: "warning", message: "Token usage approaching limit" }`

**Integration Patterns**:
```typescript
// Type-safe event handling
function handleProgress(event: ProgressEvent): void {
  switch (event.type) {
    case "started":
      console.log(`🚀 ${event.message}`);
      break;
    case "progress":
      const progress = event.current && event.total
        ? ` (${event.current}/${event.total})`
        : "";
      console.log(`📊 ${event.message}${progress}`);
      break;
    case "stream-chunk":
      process.stdout.write(event.text);
      break;
    case "reasoning-chunk":
      process.stdout.write(chalk.magenta(event.text));
      break;
    case "completed":
      console.log(`✅ ${event.message}`);
      break;
    case "info":
      console.log(`ℹ️ ${event.message}`);
      break;
    case "warning":
      console.log(`⚠️ ${event.message}`);
      break;
  }
}
```

#### ProgressCallback Interface

```typescript
export interface ProgressCallback {
  onProgress?: (event: ProgressEvent) => void;
  onComplete?: (result: any) => void;
  onError?: (error: Error) => void;
}
```

**Purpose**: Optional callback handlers for AI operations

**Properties**:

1. **onProgress** (Optional)
   - **Type**: `(event: ProgressEvent) => void`
   - **Usage**: Called for each progress event during operation
   - **Example**:
      ```typescript
      const callbacks: ProgressCallback = {
        onProgress: (event) => {
          if (event.type === "stream-chunk") {
            process.stdout.write(event.text);
          }
        }
      };
      ```

2. **onComplete** (Optional)
   - **Type**: `(result: any) => void`
   - **Usage**: Called when operation completes successfully
   - **Example**:
      ```typescript
      const callbacks: ProgressCallback = {
        onComplete: (result) => {
          console.log(`Operation result:`, result);
        }
      };
      ```

3. **onError** (Optional)
   - **Type**: `(error: Error) => void`
   - **Usage**: Called when operation encounters an error
   - **Example**:
      ```typescript
      const callbacks: ProgressCallback = {
        onError: (error) => {
          console.error(`Operation failed:`, error.message);
        }
      };
      ```

**Usage Scenarios**:

1. **CLI Operations**: Real-time progress display
   ```typescript
   function createCLICallbacks(): ProgressCallback {
     return {
       onProgress: (event) => {
         switch (event.type) {
           case "started":
             console.log(chalk.blue(`🚀 ${event.message}`));
             break;
           case "progress":
             console.log(chalk.cyan(`📊 ${event.message}`));
             break;
           case "stream-chunk":
             process.stdout.write(event.text);
             break;
           case "completed":
             console.log(chalk.green(`✅ ${event.message}`));
             break;
         }
       },
       onError: (error) => {
         console.error(chalk.red(`❌ ${error.message}`));
       }
     };
   }
   ```

2. **Web Application**: UI state updates
   ```typescript
   function createWebCallbacks(setState: any): ProgressCallback {
     return {
       onProgress: (event) => {
         setState(prev => ({
           ...prev,
           events: [...prev.events, event],
           status: event.type === "completed" ? "idle" : "working"
         }));
       },
       onComplete: (result) => {
         setState(prev => ({
           ...prev,
           result,
           status: "completed"
         }));
       },
       onError: (error) => {
         setState(prev => ({
           ...prev,
           error: error.message,
           status: "error"
         }));
       }
     };
   }
   ```

3. **Testing**: Event capture and verification
   ```typescript
   function createTestCallbacks(): ProgressCallback & { events: ProgressEvent[] } {
     const events: ProgressEvent[] = [];
     return {
       events,
       onProgress: (event) => events.push(event),
       onComplete: (result) => {
         events.push({ type: "completed", message: "Test complete" });
       },
       onError: (error) => {
         events.push({ type: "warning", message: error.message });
       }
     };
   }
   ```

### FUNCTION DOCUMENTATION

No standalone functions in this module - this is a type definition file.

### INTEGRATION PROTOCOLS

#### AI Service Integration

```typescript
// In AI operations
async function performAIOperation(
  prompt: string,
  callbacks?: ProgressCallback
): Promise<string> {
  callbacks?.onProgress?.({
    type: "started",
    message: "Starting AI operation..."
  });

  try {
    // Simulate streaming response
    for await (const chunk of streamAIResponse(prompt)) {
      callbacks?.onProgress?.({
        type: "stream-chunk",
        text: chunk
      });
    }

    callbacks?.onProgress?.({
      type: "completed",
      message: "AI operation completed"
    });

    callbacks?.onComplete?.("result data");

    return "final result";
  } catch (error) {
    callbacks?.onError?.(error as Error);
    throw error;
  }
}
```

#### CLI Command Integration

```typescript
// In CLI commands
export async function enhanceTaskCommand(
  taskId: string,
  options: any
): Promise<void> {
  const callbacks: ProgressCallback = {
    onProgress: (event) => {
      switch (event.type) {
        case "started":
        case "progress":
        case "completed":
          console.log(`${event.message}`);
          break;
        case "stream-chunk":
          process.stdout.write(event.text);
          break;
        case "warning":
          console.warn(`⚠️ ${event.message}`);
          break;
      }
    },
    onError: (error) => {
      console.error(`❌ Enhancement failed: ${error.message}`);
      process.exit(1);
    }
  };

  await taskService.enhanceTask(taskId, callbacks);
}
```

#### Web API Integration

```typescript
// In web endpoints
app.post('/api/tasks/:id/enhance', async (req, res) => {
  const callbacks: ProgressCallback = {
    onProgress: (event) => {
      // Send progress via WebSocket
      websocket.broadcast({
        type: 'progress',
        data: event,
        taskId: req.params.id
      });
    },
    onComplete: (result) => {
      res.json({ success: true, result });
    },
    onError: (error) => {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  };

  await taskService.enhanceTask(req.params.id, callbacks);
});
```

### SURVIVAL SCENARIOS

#### Scenario 1: CLI Progress Tracking

```typescript
// Complete CLI integration example
class CLIProgressTracker {
  private startTime: number;
  private lastProgress: number = 0;

  constructor() {
    this.startTime = Date.now();
  }

  getCallbacks(): ProgressCallback {
    return {
      onProgress: (event) => this.handleProgress(event),
      onComplete: (result) => this.handleComplete(result),
      onError: (error) => this.handleError(error)
    };
  }

  private handleProgress(event: ProgressEvent): void {
    const elapsed = Date.now() - this.startTime;

    switch (event.type) {
      case "started":
        console.log(chalk.blue(`\n🚀 ${event.message}`));
        console.log(chalk.gray(`Started at ${new Date().toLocaleTimeString()}`));
        break;

      case "progress":
        const progress = event.current && event.total
          ? chalk.cyan(` (${event.current}/${event.total})`)
          : "";
        console.log(chalk.cyan(`📊 ${event.message}${progress}`));
        break;

      case "stream-chunk":
        process.stdout.write(chalk.white(event.text));
        break;

      case "reasoning-chunk":
        process.stdout.write(chalk.magenta(event.text));
        break;

      case "info":
        console.log(chalk.blue(`ℹ️ ${event.message}`));
        break;

      case "warning":
        console.log(chalk.yellow(`⚠️ ${event.message}`));
        break;
    }

    this.lastProgress = Date.now();
  }

  private handleComplete(result: any): void {
    const duration = Date.now() - this.startTime;
    console.log(chalk.green(`\n✅ Operation completed in ${duration}ms`));
    if (result) {
      console.log(chalk.gray(`Result: ${JSON.stringify(result, null, 2)}`));
    }
  }

  private handleError(error: Error): void {
    const duration = Date.now() - this.startTime;
    console.log(chalk.red(`\n❌ Operation failed after ${duration}ms`));
    console.log(chalk.red(`Error: ${error.message}`));
  }
}

// Usage in CLI command
export async function enhanceTask(taskId: string): Promise<void> {
  const tracker = new CLIProgressTracker();
  const callbacks = tracker.getCallbacks();

  await taskService.enhanceTask(taskId, callbacks);
}
```

### TECHNICAL SPECIFICATIONS

#### Event Flow Diagram

```
AI Operation Start
    ↓
"started" event
    ↓
Multiple "progress" events (optional)
    ↓
Multiple "stream-chunk" events (optional)
    ↓
Multiple "reasoning-chunk" events (optional)
    ↓
"info"/"warning" events (optional)
    ↓
"completed" event OR onError callback
```

#### Memory Management

- **Event Objects**: Lightweight, single-use objects
- **Callback References**: Held only during operation duration
- **Streaming Chunks**: Processed immediately, not accumulated
- **Error Propagation**: Errors don't prevent cleanup

#### Performance Considerations

- **Event Frequency**: High-frequency events (stream-chunk) should be fast
- **Callback Overhead**: Minimal - direct function calls
- **Memory Usage**: O(1) for event processing, O(n) only if collecting
- **Type Safety**: Compile-time checking prevents runtime errors

**Remember:** Citizen, in the wasteland of failed operations, proper callback handling is your lifeline. Every event is a breadcrumb back to success, and every error callback is your chance to survive another day.
