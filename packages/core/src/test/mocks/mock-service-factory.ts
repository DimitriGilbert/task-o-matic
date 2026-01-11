import { MockStorage } from "./mock-storage";
import { MockAIOperations } from "./mock-ai-operations";
import { MockModelProvider } from "./mock-model-provider";
import { MockContextBuilder } from "./mock-context-builder";

// Add jest types for TypeScript
declare const jest: any;

let mockStorage: MockStorage;
let mockAIOperations: MockAIOperations;
let mockModelProvider: MockModelProvider;
let mockContextBuilder: MockContextBuilder;

export function resetMockServices(): void {
  mockStorage = new MockStorage();
  mockAIOperations = new MockAIOperations();
  mockModelProvider = new MockModelProvider();
  mockContextBuilder = new MockContextBuilder(mockStorage);
}

export function getMockStorage(): MockStorage {
  if (!mockStorage) {
    resetMockServices();
  }
  return mockStorage;
}

export function getMockAIOperations(): MockAIOperations {
  if (!mockAIOperations) {
    resetMockServices();
  }
  return mockAIOperations;
}

export function getMockModelProvider(): MockModelProvider {
  if (!mockModelProvider) {
    resetMockServices();
  }
  return mockModelProvider;
}

export function getMockContextBuilder(): MockContextBuilder {
  if (!mockContextBuilder) {
    resetMockServices();
  }
  return mockContextBuilder;
}

// Mock the actual service factory functions
export function mockServiceFactory() {
  // Override the real service factory functions
  const originalFactory = jest.requireActual("../../utils/ai-service-factory");

  return {
    ...originalFactory,
    getStorage: () => getMockStorage(),
    getAIOperations: () => getMockAIOperations(),
    getModelProvider: () => getMockModelProvider(),
    getContextBuilder: () => getMockContextBuilder(),
    initializeServices: async () => {
      // No-op for tests
    },
  };
}
