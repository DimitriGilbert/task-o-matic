/**
 * Test Mock Setup - Provides mock instances for ai-service-factory
 * Uses the injectTestInstances function to inject mocks
 */

import { MockStorage } from "./mocks/mock-storage";
import { MockAIOperations } from "./mocks/mock-ai-operations";
import { MockModelProvider } from "./mocks/mock-model-provider";
import { MockContextBuilder } from "./mocks/mock-context-builder";
import { injectTestInstances } from "../utils/ai-service-factory";

// Store mock instances
export let mockStorage: MockStorage;
export let mockAIOperations: MockAIOperations;
export let mockModelProvider: MockModelProvider;
export let mockContextBuilder: MockContextBuilder;

/**
 * Initialize fresh mock instances and inject them into the service factory
 */
export function resetMocks() {
  mockStorage = new MockStorage();
  mockAIOperations = new MockAIOperations() as any; // Cast to any to avoid type issues
  mockModelProvider = new MockModelProvider() as any;
  mockContextBuilder = new MockContextBuilder(mockStorage) as any;

  // Inject mocks into the service factory
  injectTestInstances({
    storage: mockStorage,
    aiOperations: mockAIOperations as any,
    modelProvider: mockModelProvider as any,
    contextBuilder: mockContextBuilder as any,
  });
}

/**
 * Get current mock instances for test assertions
 */
export function getMocks() {
  return {
    storage: mockStorage,
    aiOperations: mockAIOperations,
    modelProvider: mockModelProvider,
    contextBuilder: mockContextBuilder,
  };
}
