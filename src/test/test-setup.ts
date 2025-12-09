/**
 * Test Setup - Global test configuration and cleanup
 * This file sets up the test environment to ensure proper isolation and configuration
 */

import { configManager } from "../lib/config";
import { hooks } from "../lib/hooks";
import { resetMocks } from "./test-mock-setup";

// Global test setup
before(async function () {
  // Set up a test working directory
  const testDir = process.cwd();
  configManager.setWorkingDirectory(testDir);

  // Set up a minimal test configuration (no need to load from disk)
  configManager.setConfig({
    ai: {
      provider: "openrouter",
      model: "anthropic/claude-3-5-sonnet",
      maxTokens: 4000,
      temperature: 0.7,
      apiKey: "test-key",
    },
    workingDirectory: testDir,
  });

  // Reset mocks to ensure clean state
  resetMocks();
});

// Clean up between tests
afterEach(function () {
  // Reset mocks to ensure clean state
  resetMocks();

  // Clean up hooks to prevent interference
  hooks.clear();
});

// Additional test utilities
export function setupTestEnvironment() {
  // This can be called in individual tests for additional setup
  return {
    config: configManager.getConfig(),
    workingDir: configManager.getWorkingDirectory(),
  };
}
