import { Task } from "../types";

// Define all possible event types
export type TaskEventType =
  | "task:created"
  | "task:updated"
  | "task:deleted"
  | "task:status-changed"
  | "task:progress"
  | "execution:start"
  | "execution:end"
  | "execution:error"
  | "log:info"
  | "log:warn"
  | "log:error"
  | "log:success"
  | "log:progress";

// Log event payload
export interface LogEventPayload {
  message: string;
  context?: Record<string, unknown>;
}

// Define payload types for each event
export interface TaskEventPayloads {
  "task:created": { task: Task };
  "task:updated": { task: Task; changes: Partial<Task> };
  "task:deleted": { taskId: string };
  "task:status-changed": { task: Task; oldStatus: string; newStatus: string };
  "task:progress": { taskId?: string; message: string; type?: string };
  "execution:start": { taskId: string; tool: string };
  "execution:end": { taskId: string; success: boolean };
  "execution:error": { taskId: string; error: Error };
  "log:info": LogEventPayload;
  "log:warn": LogEventPayload;
  "log:error": LogEventPayload;
  "log:success": LogEventPayload;
  "log:progress": LogEventPayload;
}

// Type for the event handler function
export type TaskEventHandler<T extends TaskEventType> = (
  payload: TaskEventPayloads[T]
) => Promise<void> | void;

class HookRegistry {
  private static instance: HookRegistry;
  private listeners: Map<TaskEventType, Set<TaskEventHandler<any>>>;

  private constructor() {
    this.listeners = new Map();
  }

  public static getInstance(): HookRegistry {
    if (!HookRegistry.instance) {
      HookRegistry.instance = new HookRegistry();
    }
    return HookRegistry.instance;
  }

  /**
   * Register a handler for a specific event type
   */
  public on<T extends TaskEventType>(
    type: T,
    handler: TaskEventHandler<T>
  ): void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(handler);
  }

  /**
   * Remove a handler
   */
  public off<T extends TaskEventType>(
    type: T,
    handler: TaskEventHandler<T>
  ): void {
    const handlers = this.listeners.get(type);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  /**
   * Emit an event to all registered handlers
   * We don't await handlers to prevent blocking the main flow,
   * but we catch errors to prevent crashes.
   */
  public async emit<T extends TaskEventType>(
    type: T,
    payload: TaskEventPayloads[T]
  ): Promise<void> {
    const handlers = this.listeners.get(type);
    if (!handlers || handlers.size === 0) return;

    const promises = Array.from(handlers).map(async (handler) => {
      try {
        await handler(payload);
      } catch (error) {
        // NOTE: Using console.error here intentionally - this is the hooks system
        // that the logger depends on, so we can't use logger here (circular dependency)
        console.error(`Error in hook handler for event ${type}:`, error);
      }
    });

    await Promise.all(promises);
  }

  /**
   * Clear all listeners (useful for testing)
   */
  public clear(): void {
    this.listeners.clear();
  }
}

export const hooks = HookRegistry.getInstance();
