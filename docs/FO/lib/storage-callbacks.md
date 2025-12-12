---
## TECHNICAL BULLETIN NO. 009
### STORAGE CALLBACKS - CUSTOMIZATION SURVIVAL SYSTEM

**DOCUMENT ID:** `task-o-matic-storage-callbacks-v1`  
**CLEARANCE:** `All Personnel`  
**MANDATORY COMPLIANCE:** `Yes`

### ⚠️ CRITICAL SURVIVAL NOTICE
Citizen, Storage Callbacks are your customization interface in the digital wasteland. Without mastering these hooks, you're stuck with generic file operations that don't understand your project's unique storage needs.

### SYSTEM ARCHITECTURE OVERVIEW

Storage Callbacks provide a flexible callback system for customizing file system operations. It enables projects to use alternative storage backends while maintaining compatibility with the TaskRepository interface.

**Core Design Principles:**
- **Callback Pattern**: Function-based hooks for storage operations
- **Interface Compliance**: Implements StorageCallbacks interface
- **Error Handling**: Consistent error reporting across all callbacks
- **Path Management**: Flexible path resolution for different storage systems
- **Async Support**: Promise-based operations for modern storage backends
- **Validation**: Input validation and sanitization in callbacks

**Callback Interface**:
```typescript
interface StorageCallbacks {
  read: (key: string) => Promise<string | null>;
  write: (key: string, value: string) => Promise<void>;
  delete: (key: string) => Promise<void>;
  list: (prefix?: string) => Promise<string[]>;
  exists: (key: string) => Promise<boolean>;
}
```

### COMPLETE API DOCUMENTATION

#### Function: createFileSystemCallbacks()

**Purpose**: Create default file system callbacks using Node.js fs/promises.

**Signature**:
```typescript
export function createFileSystemCallbacks(
  baseDir: string = process.cwd()
): StorageCallbacks
```

**Parameters**:
- `baseDir` (string, optional): Base directory for file operations

**Return Value**:
- `StorageCallbacks`: Complete callback implementation for file operations

**Implementation Details**:
- Uses `fs/promises` for async file operations
- Implements all StorageCallbacks interface methods
- Provides relative path resolution from base directory
- Includes comprehensive error handling and logging

**Callback Implementations**:

**Read Callback**:
```typescript
read: async (key: string) => {
  try {
    const path = join(baseDir, key);
    return await readFile(path, "utf-8");
  } catch (error) {
    console.error(`Failed to read ${key}:`, error);
    return null;
  }
}
```

**Write Callback**:
```typescript
write: async (key: string, value: string) => {
  try {
    const path = join(baseDir, key);
    await writeFile(path, value, "utf-8");
  } catch (error) {
    console.error(`Failed to write ${key}:`, error);
    throw error;
  }
}
```

**Delete Callback**:
```typescript
delete: async (key: string) => {
  try {
    const path = join(baseDir, key);
    await unlink(path);
  } catch (error) {
    console.error(`Failed to delete ${key}:`, error);
    throw error;
  }
}
```

**List Callback**:
```typescript
list: async (prefix?: string) => {
  try {
    const dir = prefix ? join(baseDir, prefix) : baseDir;
    const entries = await readdir(dir, { withFileTypes: true });
    
    return entries
      .filter(entry => entry.isFile())
      .map(entry => entry.name)
      .filter(name => prefix ? name.startsWith(prefix) : true);
  } catch (error) {
    console.error(`Failed to list directory:`, error);
    return [];
  }
}
```

**Exists Callback**:
```typescript
exists: async (key: string) => {
  try {
    const path = join(baseDir, key);
    await stat(path);
    return true;
  } catch (error) {
    if ((error as any).code === "ENOENT") {
      return false;
    }
    console.error(`Error checking ${key}:`, error);
    return false;
  }
}
```

---

#### Function: createDatabaseCallbacks()

**Purpose**: Create callbacks for database storage systems (example for customization).

**Signature**:
```typescript
export function createDatabaseCallbacks(): StorageCallbacks
```

**Parameters**: None

**Return Value**:
- `StorageCallbacks`: Database-specific callback implementation

**Implementation Details**:
- **Read Operation**: SQL SELECT with prepared statements
- **Write Operation**: SQL INSERT/UPDATE with transactions
- **Delete Operation**: SQL DELETE with proper constraints
- **List Operation**: SQL SELECT with filtering options
- **Exists Operation**: SQL EXISTS query
- **Error Handling**: Database-specific error handling

**Database Callback Examples**:
```typescript
const dbCallbacks = createDatabaseCallbacks();

// Read callback
dbCallbacks.read = async (key: string) => {
  const result = await db.query(
    'SELECT value FROM storage WHERE key = ?',
    [key]
  );
  return result.rows[0]?.value || null;
};

// Write callback
dbCallbacks.write = async (key: string, value: string) => {
  await db.query(
    'INSERT INTO storage (key, value) VALUES (?, ?)',
    [key, value]
  );
};

// Delete callback
dbCallbacks.delete = async (key: string) => {
  await db.query('DELETE FROM storage WHERE key = ?', [key]);
};
```

---

#### Function: createCloudStorageCallbacks()

**Purpose**: Create callbacks for cloud storage systems (AWS S3, Google Cloud, etc.).

**Signature**:
```typescript
export function createCloudStorageCallbacks(
  provider: 'aws' | 'gcp' | 'azure',
  config: any
): StorageCallbacks
```

**Parameters**:
- `provider` (string, required): Cloud storage provider
- `config` (any, required): Provider-specific configuration

**Implementation Details**:
- **AWS S3**: Uses AWS SDK for S3 operations
- **Google Cloud**: Uses Google Cloud Storage SDK
- **Azure Blob**: Uses Azure Blob Storage SDK
- **Error Handling**: Provider-specific error translation
- **Authentication**: Automatic credential handling

**Cloud Storage Examples**:
```typescript
// AWS S3 callbacks
const s3Callbacks = createCloudStorageCallbacks('aws', {
  region: 'us-east-1',
  bucket: 'my-task-storage'
});

s3Callbacks.read = async (key: string) => {
  const s3 = new AWS.S3(config);
  const result = await s3.getObject({ Bucket: config.bucket, Key: key }).promise();
  return result.Body.toString();
};

// Google Cloud callbacks
const gcpCallbacks = createCloudStorageCallbacks('gcp', {
  projectId: 'my-project',
  bucket: 'task-storage'
});

gcpCallbacks.read = async (key: string) => {
  const storage = new Storage(config);
  const [file] = await storage.bucket(config.bucket).file(key).get();
  return file.toString();
};
```

### INTEGRATION PROTOCOLS

#### Custom Storage Integration
Custom storage systems can integrate by implementing the StorageCallbacks interface:

```typescript
class CustomStorage implements TaskRepository {
  private callbacks: StorageCallbacks;
  
  constructor(callbacks: StorageCallbacks) {
    this.callbacks = callbacks;
  }
  
  async getTasks(): Promise<Task[]> {
    // Use custom storage logic
    return this.callbacks.read('tasks.json').then(content => {
      return content ? JSON.parse(content) : [];
    });
  }
  
  async createTask(task: CreateTaskRequest): Promise<Task> {
    const taskId = this.generateTaskId();
    const taskData = { ...task, id: taskId };
    
    const existingTasks = await this.getTasks();
    const updatedTasks = [...existingTasks, taskData];
    
    await this.callbacks.write('tasks.json', JSON.stringify(updatedTasks));
    return taskData;
  }
  
  // Implement other methods using callbacks...
  private generateTaskId(): string {
    return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
```

#### Callback Error Handling
All callbacks should implement consistent error handling:

```typescript
const safeCallback = (operation: string) => async (...args: any[]) => {
  try {
    return await originalCallback(...args);
  } catch (error) {
    // Log error with context
    console.error(`${operation} failed:`, error);
    
    // Add operation-specific context
    const enhancedError = new Error(`${operation}: ${error.message}`);
    (enhancedError as any).operation = operation;
    (enhancedError as any).timestamp = new Date();
    
    throw enhancedError;
  }
};

// Usage with error handling
const safeRead = safeCallback('read');
await safeRead('tasks.json'); // Errors are logged and re-thrown with context
```

#### Performance Considerations
Callback implementations should consider:

- **Async Operations**: All callbacks should be async
- **Error Propagation**: Always throw errors for proper handling
- **Resource Cleanup**: Clean up resources in finally blocks
- **Logging**: Include operation context in error messages
- **Validation**: Validate inputs before processing

### SURVIVAL SCENARIOS

#### Scenario 1: Redis Storage Integration
```typescript
import Redis from 'ioredis';

class RedisStorage implements TaskRepository {
  private redis: Redis;
  private keyPrefix = 'tasks:';
  
  constructor(redisConfig: any) {
    this.redis = new Redis(redisConfig);
  }
  
  async getTasks(): Promise<Task[]> {
    try {
      const keys = await this.redis.keys(`${this.keyPrefix}*`);
      const taskData = await this.redis.mget(...keys);
      
      return taskData
        .filter((data): data): data !== null)
        .map((data): string): Task => JSON.parse(data));
    } catch (error) {
      console.error("Redis read failed:", error);
      return [];
    }
  }
  
  async createTask(task: CreateTaskRequest): Promise<Task> {
    const taskId = this.generateTaskId();
    const taskData = { ...task, id: taskId };
    
    await this.redis.set(`${this.keyPrefix}${taskId}`, JSON.stringify(taskData));
    return taskData;
  }
  
  private generateTaskId(): string {
    return `${this.keyPrefix}${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
```

#### Scenario 2: Encrypted Storage
```typescript
import { createCipher, createDecipher } from 'crypto';

class EncryptedStorage implements TaskRepository {
  private algorithm = 'aes-256-cbc';
  private secretKey = Buffer.from('your-32-byte-secret-key', 'hex');
  
  constructor(callbacks: StorageCallbacks) {
    this.callbacks = callbacks;
  }
  
  async getTasks(): Promise<Task[]> {
    try {
      const encryptedData = await this.callbacks.read('tasks.encrypted');
      if (!encryptedData) return [];
      
      const decipher = createDecipher(this.algorithm, this.secretKey);
      let decryptedData = '';
      
      for (const chunk of encryptedData) {
        const decrypted = decipher.update(chunk, 'hex', 'utf8');
        decryptedData += decipher.final('utf8');
      }
      
      return JSON.parse(decryptedData);
    } catch (error) {
      console.error("Decryption failed:", error);
      return [];
    }
  }
  
  async createTask(task: CreateTaskRequest): Promise<Task> {
    const taskId = this.generateTaskId();
    const taskData = { ...task, id: taskId };
    
    const cipher = createCipher(this.algorithm, this.secretKey);
    let encryptedData = '';
    
    const jsonData = JSON.stringify(taskData);
    for (let i = 0; i < jsonData.length; i += 16) {
      const chunk = jsonData.slice(i, i + 16);
      encryptedData += cipher.update(chunk, 'utf8', 'hex');
    }
    encryptedData += cipher.final('utf8');
    
    await this.callbacks.write('tasks.encrypted', encryptedData);
    return taskData;
  }
  
  private generateTaskId(): string {
    return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
```

#### Scenario 3: Multi-Storage Fallback
```typescript
class FallbackStorage implements TaskRepository {
  private storages: Array<TaskRepository>;
  private currentStorageIndex = 0;
  
  constructor(storages: TaskRepository[]) {
    this.storages = storages;
  }
  
  async getTasks(): Promise<Task[]> {
    for (let i = 0; i < this.storages.length; i++) {
      try {
        const tasks = await this.storages[i].getTasks();
        if (tasks.length > 0) {
          this.currentStorageIndex = i;
          return tasks;
        }
      } catch (error) {
        console.warn(`Storage ${i} failed, trying next:`, error.message);
      }
    }
    
    // All storages failed
    throw new Error('All storage backends unavailable');
  }
  
  async createTask(task: CreateTaskRequest): Promise<Task> {
    const activeStorage = this.storages[this.currentStorageIndex];
    return await activeStorage.createTask(task);
  }
  
  // Implement other methods using active storage...
}
```

### TECHNICAL SPECIFICATIONS

#### Performance Characteristics
- **Callback Overhead**: Minimal function call overhead
- **Async Operations**: Non-blocking I/O for all storage operations
- **Error Handling**: Consistent error propagation and logging
- **Resource Management**: Proper cleanup and connection handling

#### Security Considerations
- **Input Validation**: All callbacks should validate inputs
- **Path Traversal**: Use join() and resolve() for safe paths
- **Error Sanitization**: Remove sensitive information from error messages
- **Access Control**: Respect file system permissions

#### Extensibility Features
- **Custom Backends**: Easy integration with databases, cloud storage
- **Callback Composition**: Combine multiple storage strategies
- **Migration Support**: Built-in data migration capabilities
- **Monitoring**: Hooks for performance and usage analytics

#### Error Handling Standards
- **Consistent Types**: All callbacks throw Error objects
- **Context Preservation**: Include operation context in errors
- **Recovery Strategies**: Graceful fallback and retry logic
- **Logging Integration**: Structured logging for debugging

**Remember:** Citizen, Storage Callbacks are your universal adapter in the digital wasteland. Without mastering these customization hooks, you're locked into generic file operations that can't adapt to your unique storage needs. Master these callback patterns, or watch your data become trapped in incompatible storage systems.

---

**END OF BULLETIN**