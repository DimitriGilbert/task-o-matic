import { FileSystemStorage } from "../lib/storage/file-system";
import { TaskRepository } from "../lib/storage/types";
import { ContextBuilder } from "../lib/context-builder";
import { existsSync } from "fs";
import { configManager } from "../lib/config";
import { AIOperations } from "../lib/ai-service/ai-operations";
import { ModelProvider } from "../lib/ai-service/model-provider";

let aiOperations: AIOperations | null = null;
let modelProvider: ModelProvider | null = null;
let storage: TaskRepository | null = null;
let contextBuilder: ContextBuilder | null = null;

export function getAIOperations(): AIOperations {
  if (!aiOperations) {
    aiOperations = new AIOperations();
  }
  return aiOperations;
}

export function getModelProvider(): ModelProvider {
  if (!modelProvider) {
    modelProvider = new ModelProvider();
  }
  return modelProvider;
}

export function getStorage(): TaskRepository {
  if (!storage) {
    // Ensure we're in a task-o-matic project before creating storage
    const taskOMaticDir = configManager.getTaskOMaticDir();
    if (!existsSync(taskOMaticDir)) {
      throw new Error(
        `Not a task-o-matic project. Run 'task-o-matic init init' first.`
      );
    }

    storage = new FileSystemStorage();
  }
  return storage;
}

export function getContextBuilder(): ContextBuilder {
  if (!contextBuilder) {
    const storage = getStorage();
    contextBuilder = new ContextBuilder(storage);
  }
  return contextBuilder;
}

export function resetServiceInstances(): void {
  aiOperations = null;
  modelProvider = null;
  storage = null;
  contextBuilder = null;
}
