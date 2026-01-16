## TECHNICAL BULLETIN NO. 004
### RETRY HANDLER - RESILIENCE SURVIVAL SYSTEM

**DOCUMENT ID:** `task-o-matic-retry-handler-v1`  
**CLEARANCE:** `All Personnel`  
**MANDATORY COMPLIANCE:** `Yes`

### ⚠️ CRITICAL SURVIVAL NOTICE
Citizen, Retry Handler is your shield against the chaos of network failures and API rate limits in the digital wasteland. Without this resilience system, you're exposing your operations to certain death by transient errors and service outages.

### SYSTEM ARCHITECTURE OVERVIEW

Retry Handler provides intelligent retry logic with exponential backoff, configurable error classification, and comprehensive failure handling. It ensures AI operations can survive temporary service disruptions without manual intervention.

**Core Design Principles:**
- **Exponential Backoff**: Increasing delays between retry attempts
- **Error Classification**: Distinguish retryable vs. fatal errors
- **Configurable Limits**: Customizable retry parameters per operation
- **Graceful Failure**: Clean error propagation after all retries exhausted
- **Performance Awareness**: Minimal overhead on successful operations

**Retry Strategy Components**:
- **Base Delay**: Initial delay between retry attempts
- **Backoff Factor**: Multiplier for exponential delay increase
- **Maximum Delay**: Upper limit to prevent excessive waits
- **Maximum Attempts**: Total retry attempts before giving up
- **Error Filtering**: Selective retry based on error types

### COMPLETE API DOCUMENTATION

#### Class: RetryHandler

**Purpose**: Provides intelligent retry logic with exponential backoff for AI operations.

**Constructor**: No explicit constructor required. Uses default configuration from environment variables.

---

#### Method: getRetryConfig()

**Purpose**: Retrieve default retry configuration from environment variables.

**Signature**:
```typescript
private getRetryConfig(): RetryConfig
```

**Parameters**: None

**Return Value**:
```typescript
RetryConfig {
  maxAttempts: number;        // Default: 3
  baseDelay: number;         // Default: 1000ms
  maxDelay: number;          // Default: 10000ms
  backoffFactor: number;      // Default: 2
  retryableErrors: string[];  // Default: [common network and API errors]
}
```

**Environment Variable Configuration**:
```typescript
const defaultConfig = {
  maxAttempts: parseInt(process.env.AI_MAX_RETRY_ATTEMPTS || "3", 10),
  baseDelay: parseInt(process.env.AI_RETRY_BASE_DELAY || "1000", 10),
  maxDelay: parseInt(process.env.AI_RETRY_MAX_DELAY || "10000", 10),
  backoffFactor: parseFloat(process.env.AI_RETRY_BACKOFF_FACTOR || "2"),
  retryableErrors: [
    "ECONNRESET",
    "ENOTFOUND", 
    "ECONNREFUSED",
    "ETIMEDOUT",
    "NETWORK_ERROR",
    "RATE_LIMIT",
    "TEMPORARY_FAILURE",
    "INTERNAL_ERROR"
  ]
};
```

**Examples**:

**Custom Environment Configuration**:
```bash
# Set custom retry behavior
export AI_MAX_RETRY_ATTEMPTS=5
export AI_RETRY_BASE_DELAY=2000
export AI_RETRY_MAX_DELAY=30000
export AI_RETRY_BACKOFF_FACTOR=1.5
```

**Programmatic Configuration Access**:
```typescript
const retryHandler = new RetryHandler();
const config = retryHandler.getRetryConfig();

console.log("Max attempts:", config.maxAttempts);        // 5 (from env)
console.log("Base delay:", config.baseDelay);          // 2000ms
console.log("Max delay:", config.maxDelay);            // 30000ms
console.log("Backoff factor:", config.backoffFactor);    // 1.5
```

---

#### Method: shouldRetryError()

**Purpose**: Determine if an error should trigger a retry based on error classification.

**Signature**:
```typescript
private shouldRetryError(error: unknown, retryableErrors: string[]): boolean
```

**Parameters**:
- `error` (unknown): Error to evaluate for retry eligibility
- `retryableErrors` (string[]): List of retryable error patterns

**Return Value**:
- `boolean`: True if error should trigger retry, false otherwise

**Error Classification Logic**:
1. **Error Message Analysis**: Check error message for retryable patterns
2. **Error Name Analysis**: Check error type/name for retryable patterns
3. **Case-Insensitive Matching**: Pattern matching ignores case
4. **Partial Matching**: Error messages containing patterns count as matches

**Retryable Error Patterns**:
- **Network Errors**: `ECONNRESET`, `ENOTFOUND`, `ECONNREFUSED`, `ETIMEDOUT`
- **Service Errors**: `NETWORK_ERROR`, `TEMPORARY_FAILURE`, `INTERNAL_ERROR`
- **API Errors**: `RATE_LIMIT` (for API rate limiting)

**Examples**:

**Error Classification**:
```typescript
const retryHandler = new RetryHandler();
const retryableErrors = ["RATE_LIMIT", "NETWORK_ERROR"];

// Network timeout - should retry
const timeoutError = new Error("ETIMEDOUT: Connection timed out");
console.log(retryHandler.shouldRetryError(timeoutError, retryableErrors));
// Output: true

// Rate limit - should retry
const rateLimitError = new Error("RATE_LIMIT: Too many requests");
console.log(retryHandler.shouldRetryError(rateLimitError, retryableErrors));
// Output: true

// Authentication error - should NOT retry
const authError = new Error("INVALID_API_KEY: Authentication failed");
console.log(retryHandler.shouldRetryError(authError, retryableErrors));
// Output: false

// Custom error with retryable message
const customError = new Error("Temporary service failure, please retry");
console.log(retryHandler.shouldRetryError(customError, ["TEMPORARY_FAILURE"]));
// Output: true
```

**Custom Error Patterns**:
```typescript
class CustomRetryHandler extends RetryHandler {
  private customRetryableErrors = [
    "DATABASE_CONNECTION_LOST",
    "SERVICE_UNAVAILABLE",
    "QUEUE_FULL"
  ];
  
  shouldRetryCustomError(error: unknown): boolean {
    return this.shouldRetryError(error, this.customRetryableErrors);
  }
}
```

---

#### Method: delay()

**Purpose**: Create a delay for specified milliseconds using Promise-based timeout.

**Signature**:
```typescript
private async delay(ms: number): Promise<void>
```

**Parameters**:
- `ms` (number): Delay duration in milliseconds

**Return Value**:
- `Promise<void>`: Resolves after specified delay

**Implementation**:
```typescript
async delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
```

**Examples**:

**Basic Delay Usage**:
```typescript
const retryHandler = new RetryHandler();

// Wait 2 seconds
await retryHandler.delay(2000);
console.log("Delay complete");

// Wait with exponential backoff calculation
const attempt = 3;
const baseDelay = 1000;
const backoffFactor = 2;
const delayMs = Math.min(baseDelay * Math.pow(backoffFactor, attempt - 1), 10000);

await retryHandler.delay(delayMs);
console.log(`Waited ${delayMs}ms`);
```

**Delay in Retry Context**:
```typescript
async retryWithProgressiveDelay(operation: () => Promise<any>) {
  const baseDelay = 1000;
  const backoffFactor = 2;
  
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === 5) break;
      
      const delayMs = Math.min(
        baseDelay * Math.pow(backoffFactor, attempt - 1),
        30000
      );
      
      console.log(`Attempt ${attempt} failed, retrying in ${delayMs}ms`);
      await this.delay(delayMs);
    }
  }
}
```

---

#### Method: executeWithRetry()

**Purpose**: Execute an operation with intelligent retry logic and exponential backoff.

**Signature**:
```typescript
async executeWithRetry<T>(
  operation: () => Promise<T>,
  retryConfig?: Partial<RetryConfig>,
  operationName: string = "AI operation"
): Promise<T>
```

**Parameters**:
- `operation` (() => Promise<T>, required): Function to execute with retry logic
- `retryConfig` (Partial<RetryConfig>, optional): Override default retry configuration
- `operationName` (string, optional): Descriptive name for logging (default: "AI operation")

**Return Value**:
- `Promise<T>`: Result of successful operation execution

**Execution Flow**:
1. **Configuration Merge**: Combine defaults with provided overrides
2. **Retry Loop**: Execute operation with configurable attempt limits
3. **Error Classification**: Determine if error warrants retry
4. **Delay Calculation**: Apply exponential backoff between attempts
5. **Progress Logging**: Log retry attempts with delays
6. **Final Failure**: Throw original error after all attempts exhausted

**Retry Configuration Override**:
```typescript
interface Partial<RetryConfig> {
  maxAttempts?: number;        // Override default max attempts
  baseDelay?: number;         // Override default base delay
  maxDelay?: number;          // Override default max delay
  backoffFactor?: number;      // Override default backoff factor
  retryableErrors?: string[];  // Override default retryable errors
}
```

**Examples**:

**Basic Retry Execution**:
```typescript
const retryHandler = new RetryHandler();

async fetchUserData(userId: string) {
  return retryHandler.executeWithRetry(
    async () => {
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    },
    { maxAttempts: 3 },
    "User data fetch"
  );
}

// Usage
try {
  const userData = await fetchUserData("user-123");
  console.log("User data:", userData);
} catch (error) {
  console.error("Failed to fetch user data after retries:", error);
}
```

**Custom Retry Configuration**:
```typescript
async criticalOperation(data: any) {
  return retryHandler.executeWithRetry(
    async () => {
      // Critical operation that needs more retries
      const result = await processCriticalData(data);
      return result;
    },
    {
      maxAttempts: 10,           // More attempts for critical ops
      baseDelay: 5000,          // Longer initial delay
      maxDelay: 120000,         // 2 minute max delay
      backoffFactor: 1.5,        // Gentler backoff
      retryableErrors: [
        "RATE_LIMIT",
        "NETWORK_ERROR",
        "DATABASE_ERROR",
        "SERVICE_UNAVAILABLE"
      ]
    },
    "Critical data processing"
  );
}
```

**Fast-Fail Configuration**:
```typescript
async nonCriticalOperation() {
  return retryHandler.executeWithRetry(
    async () => {
      // Quick operation that should fail fast
      const result = await quickCheck();
      return result;
    },
    {
      maxAttempts: 1,           // No retries for non-critical
      baseDelay: 100,           // Very short delay
      retryableErrors: []         // No error retries
    },
    "Quick health check"
  );
}
```

**Rate Limit Handling**:
```typescript
async apiCallWithRateLimitHandling(endpoint: string, data: any) {
  return retryHandler.executeWithRetry(
    async () => {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (response.status === 429) {
        throw new Error("RATE_LIMIT: Too many requests");
      }
      
      if (!response.ok) {
        throw new Error(`HTTP_ERROR: ${response.status}`);
      }
      
      return response.json();
    },
    {
      maxAttempts: 5,
      baseDelay: 60000,          // Start with 1 minute delay for rate limits
      maxDelay: 300000,          // 5 minute max delay
      backoffFactor: 2,
      retryableErrors: ["RATE_LIMIT", "NETWORK_ERROR", "HTTP_ERROR"]
    },
    `API call to ${endpoint}`
  );
}
```

**Complex Operation with Context**:
```typescript
class RobustAPIClient {
  private retryHandler = new RetryHandler();
  
  async executeWithFullContext<T>(
    operation: () => Promise<T>,
    context: {
      operationName: string;
      criticality: 'low' | 'medium' | 'high';
      customRetryableErrors?: string[];
    }
  ): Promise<T> {
    const retryConfig = this.getRetryConfigForCriticality(context.criticality);
    
    if (context.customRetryableErrors) {
      retryConfig.retryableErrors = [
        ...retryConfig.retryableErrors!,
        ...context.customRetryableErrors
      ];
    }
    
    return this.retryHandler.executeWithRetry(
      operation,
      retryConfig,
      context.operationName
    );
  }
  
  private getRetryConfigForCriticality(criticality: string): Partial<RetryConfig> {
    switch (criticality) {
      case 'high':
        return {
          maxAttempts: 10,
          baseDelay: 5000,
          maxDelay: 120000,
          backoffFactor: 1.5
        };
      case 'medium':
        return {
          maxAttempts: 5,
          baseDelay: 2000,
          maxDelay: 60000,
          backoffFactor: 2
        };
      case 'low':
      default:
        return {
          maxAttempts: 2,
          baseDelay: 500,
          maxDelay: 10000,
          backoffFactor: 2
        };
    }
  }
}
```

### INTEGRATION PROTOCOLS

#### Configuration Hierarchy Protocol
Retry configuration follows this precedence:
1. **Method Parameters**: Operation-specific overrides (highest priority)
2. **Environment Variables**: System-wide retry settings
3. **Default Values**: Built-in fallback configurations

#### Error Classification Protocol
Error evaluation follows this logic:
1. **Error Message Check**: Search error message for retryable patterns
2. **Error Type Check**: Search error name/type for retryable patterns
3. **Case-Insensitive Matching**: Pattern matching ignores case
4. **Partial Match Support**: Substring matching counts as match

#### Delay Calculation Protocol
Exponential backoff calculation:
```typescript
delayMs = Math.min(
  baseDelay * Math.pow(backoffFactor, attempt - 1),
  maxDelay
);
```

#### Logging Protocol
Retry attempts logged with context:
```typescript
console.warn(
  `${operationName} failed (attempt ${attempt}/${maxAttempts}), retrying in ${delayMs}ms:`,
  error
);
```

### SURVIVAL SCENARIOS

#### Scenario 1: Network Resilience
```typescript
class NetworkResilientService {
  private retryHandler = new RetryHandler();
  
  async fetchWithResilience(url: string): Promise<Response> {
    return this.retryHandler.executeWithRetry(
      async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);
        
        try {
          const response = await fetch(url, {
            signal: controller.signal,
            headers: {
              'User-Agent': 'Task-O-Matic/1.0',
              'Connection': 'keep-alive'
            }
          });
          
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            throw new Error(`HTTP_ERROR: ${response.status} ${response.statusText}`);
          }
          
          return response;
        } catch (error) {
          clearTimeout(timeoutId);
          
          // Classify network errors for retry
          if (error.name === 'AbortError') {
            throw new Error('ETIMEDOUT: Request timeout');
          } else if (error.code === 'ECONNRESET') {
            throw error; // Already retryable
          } else {
            throw new Error(`NETWORK_ERROR: ${error.message}`);
          }
        }
      },
      {
        maxAttempts: 5,
        baseDelay: 2000,
        maxDelay: 60000,
        backoffFactor: 2,
        retryableErrors: [
          'ETIMEDOUT',
          'ECONNRESET',
          'ENOTFOUND',
          'ECONNREFUSED',
          'NETWORK_ERROR',
          'HTTP_ERROR'
        ]
      },
      `Fetch ${url}`
    );
  }
}
```

#### Scenario 2: API Rate Limit Management
```typescript
class RateLimitAwareClient {
  private retryHandler = new RetryHandler();
  
  async callWithRateLimitHandling(
    endpoint: string,
    data: any,
    options: { priority?: 'high' | 'normal' | 'low' } = {}
  ): Promise<any> {
    const priority = options.priority || 'normal';
    
    return this.retryHandler.executeWithRetry(
      async () => {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Priority': priority
          },
          body: JSON.stringify(data)
        });
        
        const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining');
        const rateLimitReset = response.headers.get('X-RateLimit-Reset');
        
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After');
          const customError = new Error(
            `RATE_LIMIT: ${retryAfter ? `Retry after ${retryAfter}s` : 'Rate limited'}`
          );
          
          // Add custom retry delay for rate limits
          (customError as any).retryAfter = retryAfter ? parseInt(retryAfter) * 1000 : null;
          
          throw customError;
        }
        
        if (!response.ok) {
          throw new Error(`API_ERROR: ${response.status} ${response.statusText}`);
        }
        
        return response.json();
      },
      {
        maxAttempts: priority === 'high' ? 10 : 5,
        baseDelay: 1000,
        maxDelay: 300000, // 5 minutes
        backoffFactor: 2,
        retryableErrors: ['RATE_LIMIT', 'API_ERROR', 'NETWORK_ERROR']
      },
      `API call to ${endpoint} (priority: ${priority})`
    );
  }
}
```

#### Scenario 3: Database Operation Resilience
```typescript
class ResilientDatabaseService {
  private retryHandler = new RetryHandler();
  
  async executeWithTransaction<T>(
    operations: () => Promise<T>
  ): Promise<T> {
    return this.retryHandler.executeWithRetry(
      async () => {
        try {
          return await operations();
        } catch (error) {
          // Classify database errors for retry
          if (error.code === 'ECONNRESET') {
            throw new Error('DATABASE_CONNECTION_LOST: Connection reset');
          } else if (error.code === 'ETIMEDOUT') {
            throw new Error('DATABASE_TIMEOUT: Query timeout');
          } else if (error.code === 'ENOTFOUND') {
            throw new Error('DATABASE_UNAVAILABLE: Database not reachable');
          } else if (error.message?.includes('deadlock')) {
            throw new Error('DATABASE_DEADLOCK: Transaction deadlock');
          } else {
            // Don't retry validation or constraint errors
            throw error;
          }
        }
      },
      {
        maxAttempts: 3,
        baseDelay: 1000,
        maxDelay: 10000,
        backoffFactor: 2,
        retryableErrors: [
          'DATABASE_CONNECTION_LOST',
          'DATABASE_TIMEOUT',
          'DATABASE_UNAVAILABLE',
          'DATABASE_DEADLOCK'
        ]
      },
      "Database transaction"
    );
  }
  
  async batchOperationWithRetry(items: any[]): Promise<void> {
    const batchSize = 10;
    
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      
      await this.executeWithTransaction(async () => {
        // Process batch with transaction
        for (const item of batch) {
          await this.processItem(item);
        }
      });
      
      console.log(`Processed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(items.length / batchSize)}`);
    }
  }
}
```

#### Scenario 4: Multi-Service Failover
```typescript
class FailoverService {
  private retryHandler = new RetryHandler();
  private services = [
    { name: 'primary', url: 'https://api.primary.com' },
    { name: 'secondary', url: 'https://api.secondary.com' },
    { name: 'tertiary', url: 'https://api.tertiary.com' }
  ];
  
  async callWithFailover<T>(endpoint: string, data: any): Promise<T> {
    let lastError: Error;
    
    for (const service of this.services) {
      try {
        return await this.retryHandler.executeWithRetry(
          async () => {
            const url = `${service.url}${endpoint}`;
            const response = await fetch(url, {
              method: 'POST',
              body: JSON.stringify(data),
              headers: { 'Content-Type': 'application/json' }
            });
            
            if (!response.ok) {
              throw new Error(`SERVICE_ERROR: ${response.status}`);
            }
            
            return response.json();
          },
          {
            maxAttempts: 3,
            baseDelay: 1000,
            maxDelay: 10000,
            retryableErrors: ['SERVICE_ERROR', 'NETWORK_ERROR']
          },
          `${service.name} service call`
        );
      } catch (error) {
        console.warn(`${service.name} service failed:`, error.message);
        lastError = error;
        continue; // Try next service
      }
    }
    
    // All services failed
    throw new Error(`All services failed. Last error: ${lastError.message}`);
  }
}
```

### TECHNICAL SPECIFICATIONS

#### Performance Characteristics
- **Minimal Overhead**: Negligible impact on successful operations
- **Memory Efficiency**: No persistent state between operations
- **CPU Usage**: Minimal calculation overhead for delay computation
- **Network Impact**: Reduced through intelligent retry logic

#### Reliability Features
- **Exponential Backoff**: Prevents service overload
- **Configurable Limits**: Prevents infinite retry loops
- **Error Classification**: Intelligent retry decision making
- **Clean Failure**: Original error preservation

#### Monitoring Integration
- **Attempt Tracking**: Detailed logging of retry attempts
- **Delay Monitoring**: Visibility into backoff behavior
- **Error Analytics**: Classification of failure types
- **Performance Metrics**: Success/failure rate tracking

#### Security Considerations
- **Error Sanitization**: Sensitive data removed from logs
- **Timeout Protection**: Prevents hanging operations
- **Resource Limits**: Configurable attempt and delay limits
- **Fail-Safe Behavior**: Predictable failure modes

**Remember:** Citizen, Retry Handler is your immune system against the digital plague of transient failures. Without it, every network glitch and API timeout becomes a terminal condition. Master this resilience system, or watch your operations crumble at the first sign of trouble.

---

**END OF BULLETIN**