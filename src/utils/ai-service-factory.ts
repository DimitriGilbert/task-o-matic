import { FileSystemStorage } from "../lib/storage/file-system";
import { TaskRepository } from "../lib/storage/types";
import { ContextBuilder, ContextCallbacks } from "../lib/context-builder";
import { existsSync } from "fs";
import { configManager, ConfigCallbacks } from "../lib/config";
import { AIOperations } from "../lib/ai-service/ai-operations";
import { ModelProvider } from "../lib/ai-service/model-provider";
import { StorageCallbacks } from "../lib/storage/storage-callbacks";

export interface ServiceOptions {
  storageCallbacks?: StorageCallbacks;
  configCallbacks?: ConfigCallbacks;
  contextCallbacks?: ContextCallbacks;
  workingDirectory?: string;
}

let aiOperations: AIOperations | null = null;
let modelProvider: ModelProvider | null = null;
let storage: TaskRepository | null = null;
let contextBuilder: ContextBuilder | null = null;

/**
 * Initialize services with optional custom callbacks.
 * This is the entry point for web applications or custom environments.
 * It also ensures configuration is loaded asynchronously.
 */
export async function initializeServices(
  options: ServiceOptions = {}
): Promise<void> {
  if (options.workingDirectory) {
    configManager.setWorkingDirectory(options.workingDirectory);
  }

  if (options.configCallbacks) {
    configManager.setCallbacks(options.configCallbacks);
  }

  // Ensure config is loaded (async)
  await configManager.load();

  // Initialize storage
  // If storageCallbacks provided, use them.
  // If not, FileSystemStorage will use default callbacks (which use configManager.getTaskOMaticDir)
  storage = new FileSystemStorage(options.storageCallbacks);

  // Initialize context builder
  contextBuilder = new ContextBuilder(storage, options.contextCallbacks);

  // Reset other services to ensure they use fresh dependencies if needed
  aiOperations = null;
  modelProvider = null;
}

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
    // Default behavior for CLI (if initializeServices wasn't called)

    // Ensure we're in a task-o-matic project before creating storage
    // We use configManager (sync path) to check existence.
    const taskOMaticDir = configManager.getTaskOMaticDir();

    // Note: This check relies on FS. Web apps should call initializeServices first.
    if (!existsSync(taskOMaticDir)) {
      throw new Error(
        `Not a task-o-matic project. Run 'task-o-matic init' first.`
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

/**
 * FOR TESTING ONLY: Inject mock instances
 * This allows tests to provide mock implementations without complex module mocking
 */
export function injectTestInstances(instances: {
  storage?: TaskRepository;
  aiOperations?: AIOperations;
  modelProvider?: ModelProvider;
  contextBuilder?: ContextBuilder;
}): void {
  if (instances.storage) storage = instances.storage;
  if (instances.aiOperations) aiOperations = instances.aiOperations;
  if (instances.modelProvider) modelProvider = instances.modelProvider;
  if (instances.contextBuilder) contextBuilder = instances.contextBuilder;
}
