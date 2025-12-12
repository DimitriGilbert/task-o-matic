---
## TECHNICAL BULLETIN NO. 001
### CALLBACKS SYSTEM - EVENT COORDINATION SUPPORT SYSTEM

**DOCUMENT ID:** `task-o-matic-callbacks-v1`  
**CLEARANCE:** `All Personnel`  
**MANDATORY COMPLIANCE:** `Yes`

### ⚠️ CRITICAL SURVIVAL NOTICE
Citizen, ignore this callback system and your AI operations will run blind in the wasteland. Progress tracking becomes impossible, streaming output turns to static, and error handling becomes a guessing game. This is your nervous system for AI operations.

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
function handleProgress(event: ProgressEvent) {
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
import chalk from 'chalk';

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

#### Scenario 2: Web Application State Management

```typescript
// React integration example
interface TaskState {
  status: 'idle' | 'working' | 'completed' | 'error';
  progress: ProgressEvent[];
  result?: any;
  error?: string;
}

function useTaskEnhancement() {
  const [state, setState] = useState<TaskState>({
    status: 'idle',
    progress: []
  });

  const enhanceTask = useCallback(async (taskId: string) => {
    setState(prev => ({ ...prev, status: 'working', progress: [] }));

    const callbacks: ProgressCallback = {
      onProgress: (event) => {
        setState(prev => ({
          ...prev,
          progress: [...prev.progress, event],
          status: event.type === 'completed' ? 'completed' : 'working'
        }));
      },
      onComplete: (result) => {
        setState(prev => ({
          ...prev,
          result,
          status: 'completed'
        }));
      },
      onError: (error) => {
        setState(prev => ({
          ...prev,
          error: error.message,
          status: 'error'
        }));
      }
    };

    try {
      await taskService.enhanceTask(taskId, callbacks);
    } catch (error) {
      // Error already handled by callback
    }
  }, []);

  return { state, enhanceTask };
}

// React component
function TaskEnhancer({ taskId }: { taskId: string }) {
  const { state, enhanceTask } = useTaskEnhancement();

  return (
    <div>
      <button onClick={() => enhanceTask(taskId)}>
        Enhance Task
      </button>
      
      <div>Status: {state.status}</div>
      
      {state.progress.map((event, index) => (
        <div key={index}>
          {event.type}: {event.message || event.text}
        </div>
      ))}
      
      {state.result && (
        <div>Result: {JSON.stringify(state.result)}</div>
      )}
      
      {state.error && (
        <div style={{ color: 'red' }}>Error: {state.error}</div>
      )}
    </div>
  );
}
```

#### Scenario 3: Testing and Validation

```typescript
// Testing framework integration
class ProgressEventCollector {
  public events: ProgressEvent[] = [];
  public completed: boolean = false;
  public errors: Error[] = [];

  getCallbacks(): ProgressCallback {
    return {
      onProgress: (event) => {
        this.events.push(event);
      },
      onComplete: (result) => {
        this.completed = true;
        this.events.push({ 
          type: "completed", 
          message: "Test completed" 
        });
      },
      onError: (error) => {
        this.errors.push(error);
        this.events.push({ 
          type: "warning", 
          message: error.message 
        });
      }
    };
  }

  expectEvent(type: ProgressEvent['type'], message?: string): void {
    const event = this.events.find(e => e.type === type);
    if (!event) {
      throw new Error(`Expected event of type ${type} not found`);
    }
    if (message && !('message' in event) || event.message !== message) {
      throw new Error(`Expected message "${message}" but got "${event.message}"`);
    }
  }

  expectStreamChunk(text: string): void {
    const chunk = this.events.find(e => 
      e.type === "stream-chunk" && e.text.includes(text)
    );
    if (!chunk) {
      throw new Error(`Expected stream chunk containing "${text}" not found`);
    }
  }

  reset(): void {
    this.events = [];
    this.completed = false;
    this.errors = [];
  }
}

// Unit test example
describe('Task Enhancement', () => {
  let collector: ProgressEventCollector;

  beforeEach(() => {
    collector = new ProgressEventCollector();
  });

  it('should emit progress events during enhancement', async () => {
    const callbacks = collector.getCallbacks();
    
    await taskService.enhanceTask('test-123', callbacks);
    
    collector.expectEvent('started');
    collector.expectEvent('completed');
    expect(collector.completed).toBe(true);
    expect(collector.errors).toHaveLength(0);
  });

  it('should stream AI output', async () => {
    const callbacks = collector.getCallbacks();
    
    await taskService.enhanceTask('test-123', callbacks);
    
    collector.expectStreamChunk('enhanced');
    const streamEvents = collector.events.filter(e => e.type === 'stream-chunk');
    expect(streamEvents.length).toBeGreaterThan(0);
  });
});
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

#### Thread Safety

- **Single-threaded**: Node.js event model ensures callback ordering
- **Async Boundaries**: Events cross async boundaries safely
- **State Mutation**: Callbacks should handle concurrent operations

**Remember:** Citizen, in the wasteland of failed operations, proper callback handling is your lifeline. Every event is a breadcrumb back to success, and every error callback is your chance to survive another day.