import { resetMockServices } from "./mocks/mock-service-factory";
import { MockStorage } from "./mocks/mock-storage";
import { MockAIOperations } from "./mocks/mock-ai-operations";
import { MockModelProvider } from "./mocks/mock-model-provider";
import { MockContextBuilder } from "./mocks/mock-context-builder";

export interface TestContext {
  storage: MockStorage;
  aiOperations: MockAIOperations;
  modelProvider: MockModelProvider;
  contextBuilder: MockContextBuilder;
}

export function createTestContext(): TestContext {
  resetMockServices();

  const storage = new MockStorage();
  const aiOperations = new MockAIOperations();
  const modelProvider = new MockModelProvider();
  const contextBuilder = new MockContextBuilder(storage);

  return {
    storage,
    aiOperations,
    modelProvider,
    contextBuilder,
  };
}

export function createTestTaskData() {
  return {
    title: "Test Task",
    description: "This is a test task description",
    content: "Full content for the test task",
    effort: "medium" as const,
  };
}

export function createTestPRDData() {
  return {
    description: "Test PRD description",
    content:
      "# Test PRD\n\nThis is a test PRD document with multiple sections.\n\n## Features\n- Feature 1\n- Feature 2\n\n## Requirements\n- Requirement 1\n- Requirement 2",
  };
}
