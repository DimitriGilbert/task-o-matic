# AI Service Retry Functionality

The AIService now includes robust retry functionality with configurable retry attempts, exponential backoff, and intelligent error detection.

## Features

- **Configurable retry attempts**: Set maximum number of retry attempts per operation
- **Exponential backoff**: Automatically increases delay between retries
- **Intelligent error detection**: Only retries on retryable errors (network issues, rate limits, etc.)
- **Environment variable configuration**: Configure defaults via environment variables
- **Per-operation override**: Override retry settings for specific operations

## Configuration

### Environment Variables

```bash
AI_MAX_RETRY_ATTEMPTS=3     # Default max retry attempts
AI_RETRY_BASE_DELAY=1000    # Base delay in milliseconds
AI_RETRY_MAX_DELAY=10000    # Maximum delay in milliseconds
AI_RETRY_BACKOFF_FACTOR=2   # Exponential backoff multiplier
```

### Retryable Errors

The system automatically retries on these error types:
- Network errors (ECONNRESET, ENOTFOUND, ECONNREFUSED, ETIMEDOUT)
- Rate limiting errors (RATE_LIMIT)
- Temporary failures (TEMPORARY_FAILURE)
- Internal server errors (INTERNAL_ERROR)

## Usage Examples

### Basic Usage (uses default retry config)

```typescript
import { AIService } from './lib/ai-service.js';

const aiService = new AIService();

// Uses default retry configuration from environment variables
const result = await aiService.streamText(
  "Write a hello world message",
  undefined, // AI config
  "You are a helpful assistant.",
  "Write a hello world message"
);
```

### Custom Retry Configuration

```typescript
import { AIService } from './lib/ai-service.js';
import type { RetryConfig } from './types/index.js';

const aiService = new AIService();

const retryConfig: Partial<RetryConfig> = {
  maxAttempts: 5,
  baseDelay: 2000,
  maxDelay: 30000,
  backoffFactor: 2.5,
};

const result = await aiService.streamText(
  "Write a complex response",
  undefined,
  "You are a helpful assistant.",
  "Write a complex response",
  undefined, // streaming options
  retryConfig
);
```

### Retry with Different Operations

```typescript
// PRD Parsing with retry
const prdResult = await aiService.parsePRD(
  prdContent,
  undefined,
  undefined,
  undefined,
  undefined,
  { maxAttempts: 3, baseDelay: 1500 }
);

// Task breakdown with retry
const subtasks = await aiService.breakdownTask(
  task,
  undefined,
  undefined,
  undefined,
  undefined,
  { maxAttempts: 2, baseDelay: 1000 }
);

// Task enhancement with retry
const enhanced = await aiService.enhanceTask(
  title,
  description,
  undefined,
  undefined,
  undefined,
  taskId,
  undefined,
  { maxAttempts: 4, baseDelay: 2000 }
);
```

## RetryConfig Interface

```typescript
interface RetryConfig {
  maxAttempts?: number;        // Maximum retry attempts (default: 3)
  baseDelay?: number;          // Base delay in ms (default: 1000)
  maxDelay?: number;           // Maximum delay in ms (default: 10000)
  backoffFactor?: number;      // Exponential backoff multiplier (default: 2)
  retryableErrors?: string[];  // Custom retryable error types
}
```

## How It Works

1. **Operation Execution**: The AI operation is attempted
2. **Error Detection**: If an error occurs, it's checked against retryable error types
3. **Delay Calculation**: Exponential backoff delay is calculated: `baseDelay * (backoffFactor ^ attempt)`
4. **Retry**: Operation is retried after the delay
5. **Final Failure**: After max attempts, the error is thrown

## Error Handling

The retry system distinguishes between:
- **Retryable errors**: Network issues, rate limits, temporary failures
- **Non-retryable errors**: Authentication failures, invalid requests, malformed data

Non-retryable errors are thrown immediately without retry attempts.

## Logging

Retry attempts are logged to console with:
- Operation name
- Attempt number (e.g., "attempt 2/3")
- Delay before next retry
- Error message

Example log output:
```
AI streaming failed (attempt 2/3), retrying in 2000ms: Error: Network timeout
```

## Best Practices

1. **Set reasonable limits**: Don't set maxAttempts too high to avoid excessive delays
2. **Configure appropriate delays**: Use longer base delays for external API calls
3. **Monitor retry patterns**: High retry rates may indicate underlying issues
4. **Use per-operation config**: Override defaults for operations with different reliability requirements

## Migration

Existing code will continue to work with default retry settings. To add custom retry configuration:

```typescript
// Before (no retry config)
await aiService.streamText(prompt, config, system, user);

// After (with custom retry config)
await aiService.streamText(prompt, config, system, user, undefined, {
  maxAttempts: 5,
  baseDelay: 2000
});
```