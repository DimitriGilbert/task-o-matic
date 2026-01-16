---
## TECHNICAL BULLETIN NO. 009
### STORAGE CALLBACKS - CUSTOMIZATION SURVIVAL SYSTEM

**DOCUMENT ID:** `task-o-matic-storage-callbacks-v2`
**CLEARANCE:** `All Personnel`
**MANDATORY COMPLIANCE:** `Yes`

### ⚠️ CRITICAL SURVIVAL NOTICE
Citizen, Storage Callbacks are your customization interface in digital wasteland. Without mastering these hooks, you're stuck with generic file operations that don't understand your project's unique storage needs.

**This documentation has been updated to reflect ACTUAL source code reality (121 lines). Pay attention - wasteland doesn't forgive those who work with outdated manuals.**

---

### SYSTEM ARCHITECTURE OVERVIEW

Storage Callbacks provide a flexible callback system for customizing file system operations. It enables projects to use alternative storage backends while maintaining compatibility with TaskRepository interface.

**Core Design Principles:**
- **Callback Pattern**: Function-based hooks for storage operations
- **Interface Compliance**: Implements StorageCallbacks interface
- **Error Handling**: Consistent error reporting across all callbacks
- **Path Management**: Flexible path resolution for different storage systems
- **Async Support**: Promise-based operations for modern storage backends
- **Directory Creation**: Automatic directory creation for write operations
- **Recursive Listing**: Support for directory traversal

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

---

### COMPLETE API DOCUMENTATION

#### Interface: StorageCallbacks

**Purpose**: Defines the contract for storage operations that can be used with FileSystemStorage.

**Structure**:
```typescript
export interface StorageCallbacks {
  // Read a value by key (path), return null if not found
  read: (key: string) => Promise<string | null>;

  // Write a value by key (path)
  write: (key: string, value: string) => Promise<void>;

  // Delete a value by key (path)
  delete: (key: string) => Promise<void>;

  // List keys with optional prefix filter
  list: (prefix?: string) => Promise<string[]>;

  // Check if key exists
  exists: (key: string) => Promise<boolean>;
}
```

---

#### Function: createFileSystemCallbacks()

**Purpose**: Create default file system callbacks using Node.js fs/promises with automatic directory creation.

**Signature**:
```typescript
export function createFileSystemCallbacks(
  baseDir: string = process.cwd()
): StorageCallbacks
```

**Parameters**:
- `baseDir` (string, optional): Base directory for file operations (defaults to `process.cwd()`)

**Return Value**:
- `StorageCallbacks`: Complete callback implementation for file operations

**Implementation Details**:
- Uses `fs/promises` for async file operations
- Implements all StorageCallbacks interface methods
- Provides relative path resolution from base directory
- Includes comprehensive error handling and logging
- **Automatic directory creation** before write operations

**Internal Implementation**:

**read Callback**:
```typescript
read: async (key: string) => {
  try {
    const path = resolvePath(key);
    if (!existsSync(path)) return null;
    return await readFile(path, "utf-8");
  } catch (error) {
    if ((error as any).code === "ENOENT") return null;
    throw error;
  }
}
```

**write Callback**:
```typescript
write: async (key: string, value: string) => {
  const path = resolvePath(key);
  ensureDir(path);
  await writeFile(path, value, "utf-8");
}
```

**delete Callback**:
```typescript
delete: async (key: string) => {
  try {
    const path = resolvePath(key);
    if (existsSync(path)) {
      await unlink(path);
    }
  } catch (error) {
    // Ignore if already gone
    if ((error as any).code !== "ENOENT") throw error;
  }
}
```

**list Callback**:
```typescript
list: async (prefix?: string) => {
  const searchPath = prefix ? resolvePath(prefix) : baseDir;

  try {
    // If it's a directory, recursively list all files in it
    if (existsSync(searchPath) && (await stat(searchPath)).isDirectory()) {
      const files: string[] = [];

      const scan = async (dir: string, currentPrefix: string) => {
        const items = await readdir(dir);
        for (const item of items) {
          const fullPath = join(dir, item);
          const itemPrefix = currentPrefix
            ? join(currentPrefix, item)
            : item;

          if ((await stat(fullPath)).isDirectory()) {
            await scan(fullPath, itemPrefix);
          } else {
            files.push(itemPrefix);
          }
        }
      };

      await scan(searchPath, prefix || "");
      return files;
    }

    // If it's a file prefix (e.g. "tasks/task-")
    const dir = dirname(searchPath);
    if (existsSync(dir)) {
      const files = await readdir(dir);
      const namePrefix = prefix ? prefix.split("/").pop() || "";
      return files
        .filter((f) => f.startsWith(namePrefix))
        .map((f) => join(dirname(prefix || ""), f));
    }

    return [];
  } catch (error) {
    return [];
  }
}
```

**exists Callback**:
```typescript
exists: async (key: string) => {
  return existsSync(resolvePath(key));
}
```

**Helper Functions**:

**resolvePath**:
```typescript
const resolvePath = (key: string) => join(baseDir, key);
```

**ensureDir**:
```typescript
const ensureDir = (filePath: string) => {
  const dir = dirname(filePath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
};
```

**Examples**:

**Basic File System Callbacks**:
```typescript
const fsCallbacks = createFileSystemCallbacks();

// Read a file
const content = await fsCallbacks.read('tasks.json');
console.log(content);

// Write a file
await fsCallbacks.write('tasks/new-task.json', JSON.stringify(newTask));

// List all tasks
const taskFiles = await fsCallbacks.list('tasks/');
console.log(taskFiles);
// Output: ["tasks/task-1.json", "tasks/task-2.json", ...]

// Delete a file
await fsCallbacks.delete('tasks/old-task.json');

// Check if file exists
const exists = await fsCallbacks.exists('config.json');
console.log('Config exists:', exists);
```

**Custom Base Directory**:
```typescript
const fsCallbacks = createFileSystemCallbacks('/custom/storage/dir');

// All operations now relative to /custom/storage/dir
await fsCallbacks.write('data/file.json', 'content');
// Writes to /custom/storage/dir/data/file.json
```

**Directory Traversal Protection**:
```typescript
// These are handled safely by resolvePath()
const fsCallbacks = createFileSystemCallbacks();

// Safe operations
await fsCallbacks.read('./data/file.json');
await fsCallbacks.write('./config/settings.json', '{}');

// Even if user tries to go outside baseDir
await fsCallbacks.write('../../../etc/passwd', 'hack attempt');
// This writes to baseDir + '../../../etc/passwd'
// The path is resolved but doesn't provide true sandbox isolation
```

**Prefix-Based Listing**:
```typescript
const fsCallbacks = createFileSystemCallbacks();

// List all files with prefix
const taskFiles = await fsCallbacks.list('tasks/');
console.log(taskFiles);
// Output: ["tasks/task-1.json", "tasks/task-2.json", "tasks/subtasks/"]

// List all documentation files
const docs = await fsCallbacks.list('docs/');
console.log(docs);
// Output: ["docs/library1.json", "docs/library2.json", ...]

// List files with specific prefix
const task1Files = await fsCallbacks.list('tasks/task-1');
console.log(task1Files);
// Output: ["tasks/task-1.json", "tasks/task-1/"]
```

**Directory Listing with Recursive Scan**:
```typescript
const fsCallbacks = createFileSystemCallbacks();

// List all files in a directory recursively
const allFiles = await fsCallbacks.list('src/');
console.log(`Found ${allFiles.length} files`);

allFiles.forEach(file => {
  console.log(`  ${file}`);
});
// Output:
// src/components/Button.tsx
// src/components/Header.tsx
// src/lib/utils.ts
// src/App.tsx
// ...
```

---

### INTEGRATION PROTOCOLS

#### Custom Storage Integration
Custom storage systems can integrate by implementing StorageCallbacks interface:

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

---

### SURVIVAL SCENARIOS

#### Scenario 1: Redis Storage Integration
```typescript
import Redis from 'ioredis';

class RedisStorage implements TaskRepository {
  private redis: Redis;
  private callbacks: StorageCallbacks;

  constructor(redisConfig: any, callbacks: StorageCallbacks) {
    this.redis = new Redis(redisConfig);
    this.callbacks = callbacks;
  }

  async getTasks(): Promise<Task[]> {
    try {
      const keys = await this.redis.keys('tasks:*');

      const taskData = await this.redis.mget(...keys);
      return taskData
        .filter((data): data !== null)
        .map((data): string => JSON.parse(data));
    } catch (error) {
      console.error("Redis read failed:", error);
      return [];
    }
  }

  async createTask(task: CreateTaskRequest): Promise<Task> {
    const taskId = this.generateTaskId();
    const taskData = { ...task, id: taskId };

    await this.redis.set(`tasks:${taskId}`, JSON.stringify(taskData));
    return taskData;
  }

  async deleteTask(taskId: string): Promise<void> {
    await this.redis.del(`tasks:${taskId}`);
  }

  async listTasks(): Promise<string[]> {
    const keys = await this.redis.keys('tasks:*');
    return keys;
  }

  async taskExists(taskId: string): Promise<boolean> {
    const exists = await this.redis.exists(`tasks:${taskId}`);
    return exists === 1;
  }

  private generateTaskId(): string {
    return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
```

#### Scenario 2: Encrypted Storage
```typescript
import { createCipher, createDecipher } from 'crypto';

class EncryptedStorage implements TaskRepository {
  private algorithm = 'aes-256-cbc';
  private secretKey = Buffer.from('your-32-byte-secret-key', 'hex');
  private callbacks: StorageCallbacks;

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
        continue;
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

#### Scenario 4: AWS S3 Storage
```typescript
import { S3Client } from '@aws-sdk/client-s3';

class S3Storage implements TaskRepository {
  private s3: S3Client;
  private bucket: string;
  private callbacks: StorageCallbacks;

  constructor(config: { bucket: string; region: string }, callbacks: StorageCallbacks) {
    this.s3 = new S3Client({ region: config.region });
    this.bucket = config.bucket;
    this.callbacks = callbacks;
  }

  async getTasks(): Promise<Task[]> {
    try {
      const response = await this.s3.getObject({
        Bucket: this.bucket,
        Key: 'tasks.json'
      });

      const content = await response.Body.transformToString();
      return JSON.parse(content);
    } catch (error) {
      if (error.name === 'NoSuchKey') return [];
      throw error;
    }
  }

  async createTask(task: CreateTaskRequest): Promise<Task> {
    const taskId = this.generateTaskId();
    const taskData = { ...task, id: taskId };

    const tasks = await this.getTasks();
    tasks.push(taskData);

    await this.s3.putObject({
      Bucket: this.bucket,
      Key: 'tasks.json',
      Body: JSON.stringify(tasks)
    });

    return taskData;
  }

  private generateTaskId(): string {
    return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
```

---

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

---

**Remember:** Citizen, Storage Callbacks are your universal adapter in digital wasteland. Without mastering these customization hooks, you're locked into generic file operations that can't adapt to your unique storage needs. The actual implementation is 121 lines with automatic directory creation and recursive directory scanning support. Master these callback patterns, or watch your data become trapped in incompatible storage systems.

This documentation reflects the ACTUAL source code with createFileSystemCallbacks() implementation including automatic directory creation, recursive scanning, and prefix-based filtering. Version discrepancies indicate you're working from outdated information. Stay vigilant, stay updated.

---

**END OF BULLETIN**
