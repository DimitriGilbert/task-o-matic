---
## TECHNICAL BULLETIN NO. 008
### FILE SYSTEM STORAGE - DATA PERSISTENCE SURVIVAL SYSTEM

**DOCUMENT ID:** `task-o-matic-file-system-storage-v1`  
**CLEARANCE:** `All Personnel`  
**MANDATORY COMPLIANCE:** `Yes`

### ⚠️ CRITICAL SURVIVAL NOTICE
Citizen, File System Storage is your fortress against data loss in the digital wasteland. Without mastering this persistence system, you're leaving your task data exposed to the radioactive dust of file corruption and accidental deletion.

### SYSTEM ARCHITECTURE OVERVIEW

File System Storage provides comprehensive task data persistence using JSON files with robust error handling, validation, and hierarchical task management. It implements the complete TaskRepository interface with support for tasks, metadata, documentation, and planning.

**Core Design Principles:**
- **JSON-Based Storage**: Human-readable file format for transparency
- **Hierarchical Tasks**: Parent-child relationships with subtask support
- **Atomic Operations**: Safe file operations with proper error handling
- **Data Validation**: Comprehensive input validation and sanitization
- **Integrity Checking**: Storage consistency validation and repair
- **Migration Support**: Automatic data structure upgrades and migrations

**Storage Structure**:
```
.task-o-matic/
├── tasks.json              # Main task data
├── ai-metadata.json         # AI operation metadata
├── plans/                  # Task implementation plans
│   ├── {taskId}.json      # Individual task plans
├── docs/                   # Documentation cache
│   ├── _cache/            # Context7 cached docs
│   ├── tasks/             # Task documentation
│   └── ...
└── logs/                   # Operation logs
```

### COMPLETE API DOCUMENTATION

#### Class: FileSystemStorage

**Purpose**: Complete file system-based task repository with hierarchical task management, content storage, and metadata tracking.

**Constructor**:
```typescript
constructor(callbacks?: StorageCallbacks)
```

**Parameters**:
- `callbacks` (StorageCallbacks, optional): Custom storage operation callbacks

---

#### Method: sanitizeForFilename()

**Purpose**: Sanitize filenames by removing dangerous characters and path separators.

**Signature**:
```typescript
public sanitizeForFilename(name: string): string
```

**Parameters**:
- `name` (string, required): Filename to sanitize

**Return Value**:
- `string`: Sanitized filename safe for file system use

**Sanitization Rules**:
- Remove path separators: `/`, `\`, `?`, `%`, `*`, `|`, `<`, `>`, `"`
- Replace with hyphens: Multiple characters replaced with single `-`

**Examples**:

**Basic Sanitization**:
```typescript
const storage = new FileSystemStorage();

console.log(storage.sanitizeForFilename("my-task.txt"));        // "my-task.txt"
console.log(storage.sanitizeForFilename("../dangerous/path"));     // "dangerous-path"
console.log(storage.sanitizeForFilename("file:with*chars"));   // "file-with-chars"
console.log(storage.sanitizeForFilename("normal_file.md"));       // "normal_file.md"
```

**Security Examples**:
```typescript
// Prevents directory traversal attacks
const maliciousNames = [
  "../../../etc/passwd",
  "..\\..\\windows\\system32\\config\\sam",
  "/etc/shadow"
];

maliciousNames.forEach(name => {
  const safe = storage.sanitizeForFilename(name);
  console.log(`Original: ${name} -> Safe: ${safe}`);
});
```

---

#### Method: validateTaskId()

**Purpose**: Validate task ID format and content to ensure data integrity.

**Signature**:
```typescript
private validateTaskId(taskId: string): void
```

**Parameters**:
- `taskId` (string, required): Task ID to validate

**Validation Rules**:
- Must be non-empty string
- Cannot be null or undefined
- No explicit length limit (but should be reasonable)

**Error Conditions**:
- Throws TaskOMaticError with INVALID_INPUT code
- Includes context and suggestions for resolution

**Examples**:

**Valid Task IDs**:
```typescript
const storage = new FileSystemStorage();

// These would pass validation
const validIds = ["task-1", "task-2", "user-auth", "api-setup"];

validIds.forEach(id => {
  storage.validateTaskId(id); // No error thrown
});

// These would throw errors
const invalidIds = ["", null, undefined, "   ", "\t", "\n"];

invalidIds.forEach(id => {
  try {
    storage.validateTaskId(id); // Throws error
  } catch (error) {
    console.log(`Validation error for "${id}": ${error.message}`);
  }
});
```

---

#### Method: validateTaskRequest()

**Purpose**: Comprehensive validation of task creation requests with detailed error reporting.

**Signature**:
```typescript
private validateTaskRequest(task: CreateTaskRequest): void
```

**Parameters**:
- `task` (CreateTaskRequest, required): Task creation request to validate

**Validation Checks**:
1. **Object Validation**: Ensure task is a valid object
2. **Title Validation**: Title must be non-empty string
3. **Parent ID Validation**: Parent ID must be valid string if provided
4. **Dependencies Validation**: Dependencies must be array of strings if provided
5. **Tags Validation**: Tags must be array of strings if provided
6. **Effort Validation**: Effort must be one of allowed values if provided

**Error Handling**:
- Structured error messages with context
- Specific suggestions for each validation failure
- Metadata inclusion for debugging

**Examples**:

**Complete Task Validation**:
```typescript
const storage = new FileSystemStorage();

const validTask = {
  title: "Build user authentication",
  description: "Implement OAuth2 with JWT tokens",
  parentId: "task-1",
  dependencies: ["task-1"],
  tags: ["backend", "security"],
  estimatedEffort: "large"
};

storage.validateTaskRequest(validTask); // No error thrown

const invalidTask = {
  title: "",  // Empty title
  description: "Implement auth"
};

try {
  storage.validateTaskRequest(invalidTask);
} catch (error) {
  console.error("Task validation failed:", error.message);
  console.log("Error code:", error.code);
  console.log("Suggestions:", error.suggestions);
  // Output: Detailed validation error with suggestions
}
```

**Validation Error Examples**:
```typescript
// Missing required fields
const missingTitle = { description: "Task without title" };
// Throws: "Task title is required and must be a non-empty string"

// Invalid dependencies
const invalidDeps = { dependencies: "not-an-array" };
// Throws: "Dependencies must be an array if provided"

// Invalid effort value
const invalidEffort = { estimatedEffort: "extra-large" };
// Throws: "Estimated effort must be 'small', 'medium', or 'large'"
```

---

#### Method: loadTasksData()

**Purpose**: Load and parse the main tasks data file with comprehensive error handling.

**Signature**:
```typescript
private async loadTasksData(): Promise<TasksData>
```

**Parameters**: None

**Return Value**:
```typescript
Promise<TasksData> {
  tasks: Task[];      // Array of all tasks
  nextId: number;       // Next available task ID
}
```

**Error Handling**:
- File not found: Returns empty tasks array with nextId = 1
- Parse errors: Logged and result in empty data structure
- Permission errors: Formatted with storage error codes
- Corrupted JSON: Graceful fallback to empty state

**Examples**:

**Basic Data Loading**:
```typescript
const storage = new FileSystemStorage();

try {
  const data = await storage.loadTasksData();
  console.log(`Loaded ${data.tasks.length} tasks`);
  console.log(`Next task ID: ${data.nextId}`);
  
  data.tasks.forEach(task => {
    console.log(`Task: ${task.id} - ${task.title}`);
  });
} catch (error) {
  console.error("Failed to load tasks:", error);
  // Continue with empty data structure
}
```

**Error Recovery**:
```typescript
class ResilientStorage extends FileSystemStorage {
  private retryCount = 0;
  
  async loadTasksDataWithRetry(maxRetries: number = 3): Promise<TasksData> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await super.loadTasksData();
      } catch (error) {
        this.retryCount++;
        console.warn(`Task load attempt ${attempt} failed:`, error.message);
        
        if (attempt === maxRetries) {
          // Final attempt - create backup and continue
          console.warn("All task load attempts failed, starting with empty data");
          return { tasks: [], nextId: 1 };
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }
}
```

---

#### Method: saveTasksData()

**Purpose**: Atomically save tasks data with backup creation and error recovery.

**Signature**:
```typescript
private async saveTasksData(data: TasksData): Promise<void>
```

**Parameters**:
- `data` (TasksData, required): Complete tasks data structure to save

**Atomic Save Process**:
1. **Backup Creation**: Create backup of current data before save
2. **Atomic Write**: Write to temporary file first
3. **Validation**: Verify written data integrity
4. **Atomic Move**: Replace original file atomically
5. **Cleanup**: Remove temporary and backup files

**Error Handling**:
- Backup failures: Logged but don't prevent save
- Write failures: Detailed error with context
- Validation failures: Rollback to backup if available
- Permission errors: Clear error messages with suggestions

**Examples**:

**Basic Save Operation**:
```typescript
const storage = new FileSystemStorage();

const newData = {
  tasks: [newTask1, newTask2],
  nextId: 5
};

try {
  await storage.saveTasksData(newData);
  console.log("Tasks saved successfully");
} catch (error) {
  console.error("Failed to save tasks:", error.message);
  // Handle save failure appropriately
}
```

**Atomic Save with Validation**:
```typescript
class ValidatedStorage extends FileSystemStorage {
  async saveTasksDataWithValidation(data: TasksData): Promise<void> {
    try {
      // Validate data before saving
      this.validateTasksData(data);
      
      await super.saveTasksData(data);
      console.log("Tasks saved with validation");
    } catch (error) {
      console.error("Save failed:", error.message);
      
      // Attempt data recovery
      try {
        const backup = await this.loadBackupData();
        if (backup) {
          await this.saveTasksData(backup);
          console.log("Recovered from backup");
        }
      } catch (recoveryError) {
        console.error("Backup recovery failed:", recoveryError.message);
      }
    }
  }
  
  private validateTasksData(data: TasksData): void {
    if (!Array.isArray(data.tasks)) {
      throw new Error("Tasks data must be an array");
    }
    
    if (typeof data.nextId !== "number" || data.nextId < 1) {
      throw new Error("Next ID must be a positive number");
    }
    
    // Validate each task
    data.tasks.forEach((task, index) => {
      if (!task.id || typeof task.id !== "string") {
        throw new Error(`Task ${index} has invalid ID`);
      }
    });
  }
}
```

---

#### Method: findTaskInHierarchy()

**Purpose**: Recursively search for a task within hierarchical task structure.

**Signature**:
```typescript
private findTaskInHierarchy(
  tasks: Task[],
  id: string
): { task: Task | null; parent: Task | null; index: number }
```

**Parameters**:
- `tasks` (Task[], required): Array of tasks to search
- `id` (string, required): Task ID to find

**Return Value**:
```typescript
{
  task: Task | null;    // Found task or null
  parent: Task | null;   // Parent task if found
  index: number          // Index in tasks array (-1 if not found)
}
```

**Search Algorithm**:
1. **Linear Search**: Iterate through tasks array
2. **ID Matching**: Exact string comparison
3. **Subtask Search**: Recursively search in subtasks
4. **Parent Tracking**: Return parent task when subtask found
5. **Index Tracking**: Maintain original array position

**Examples**:

**Basic Task Search**:
```typescript
const storage = new FileSystemStorage();
const tasks = await storage.getTasks();

const result = storage.findTaskInHierarchy(tasks, "task-3");
if (result.task) {
  console.log(`Found task: ${result.task.title}`);
  console.log(`Parent: ${result.parent?.title || 'None'}`);
  console.log(`Index: ${result.index}`);
} else {
  console.log("Task not found");
}
```

**Complex Hierarchy Search**:
```typescript
// Find task at any level in hierarchy
const findTaskAnywhere = (tasks: Task[], id: string) => {
  const result = storage.findTaskInHierarchy(tasks, id);
  
  if (result.task) {
    return result; // Found at current level
  }
  
  // Search in parent tasks recursively
  for (const task of tasks) {
    if (task.subtasks && task.subtasks.length > 0) {
      const subResult = storage.findTaskInHierarchy(task.subtasks, id);
      if (subResult.task) {
        return {
          task: subResult.task,
          parent: task,
          index: -1 // Special index for subtask
        };
      }
    }
  }
  
  return { task: null, parent: null, index: -1 };
};
```

---

#### Method: flattenTasks()

**Purpose**: Convert hierarchical task structure to flat array for processing.

**Signature**:
```typescript
private flattenTasks(tasks: Task[]): Task[]
```

**Parameters**:
- `tasks` (Task[], required): Hierarchical tasks to flatten

**Return Value**:
- `Task[]`: Flat array with all tasks and subtasks at same level

**Flattening Algorithm**:
1. **Depth-First Traversal**: Process parent tasks before subtasks
2. **Preserve Order**: Maintain relative ordering
3. **Subtask Expansion**: Recursively flatten nested subtasks
4. **Reference Preservation**: Keep original task references

**Examples**:

**Basic Flattening**:
```typescript
const storage = new FileSystemStorage();

const hierarchicalTasks = [
  {
    id: "task-1",
    title: "Parent Task",
    subtasks: [
      { id: "task-1-1", title: "Subtask 1" },
      { id: "task-1-2", title: "Subtask 2" }
    ]
  },
  {
    id: "task-2", 
    title: "Independent Task",
    subtasks: []
  }
];

const flatTasks = storage.flattenTasks(hierarchicalTasks);
console.log(`Flattened ${flatTasks.length} tasks`);
// Output: 5 tasks (2 parents + 3 subtasks)
```

**Deep Hierarchy Flattening**:
```typescript
const deepHierarchy = [
  {
    id: "root",
    title: "Root Task",
    subtasks: [
      {
        id: "child-1",
        title: "Child 1",
        subtasks: [
          { id: "grandchild-1", title: "Grandchild 1" }
        ]
      }
    ]
  }
];

const flatDeep = storage.flattenTasks(deepHierarchy);
console.log(`Deep flatten: ${flatDeep.length} tasks`);
// Output: 4 tasks (all levels flattened)
```

---

#### Method: taskExists()

**Purpose**: Check if a task exists anywhere in the task hierarchy.

**Signature**:
```typescript
private taskExists(tasks: Task[], taskId: string): boolean
```

**Parameters**:
- `tasks` (Task[], required): Task array to search
- `taskId` (string, required): Task ID to check

**Return Value**:
- `boolean`: True if task exists, false otherwise

**Existence Checking**:
- **Exact ID Match**: Case-sensitive string comparison
- **Hierarchy Search**: Uses findTaskInHierarchy for recursive search
- **Prefix Matching**: Supports task- prefixed IDs for subtasks
- **Performance**: O(n) linear search through task array

**Examples**:

**Basic Existence Check**:
```typescript
const storage = new FileSystemStorage();
const tasks = await storage.getTasks();

console.log(storage.taskExists(tasks, "task-1")); // true if task 1 exists
console.log(storage.taskExists(tasks, "task-999")); // false if Task 999 doesn't exist
console.log(storage.taskExists(tasks, "task-1-1")); // true if subtask exists
```

**Batch Existence Checking**:
```typescript
const checkMultipleTasks = async (taskIds: string[]) => {
  const tasks = await storage.getTasks();
  
  const results = taskIds.map(id => ({
    id,
    exists: storage.taskExists(tasks, id)
  }));
  
  return results;
};

const results = await checkMultipleTasks([
  "task-1", "task-2", "task-1-1", "non-existent"
]);

results.forEach(result => {
  console.log(`${result.id}: ${result.exists ? 'EXISTS' : 'MISSING'}`);
});
```

---

#### Method: wouldCreateCircularDependency()

**Purpose**: Detect potential circular dependency chains in task relationships.

**Signature**:
```typescript
private wouldCreateCircularDependency(
  tasks: Task[],
  newTaskId: string,
  dependencies: string[]
): boolean
```

**Parameters**:
- `tasks` (Task[], required): Current task hierarchy
- `newTaskId` (string, required): ID of new task being created
- `dependencies` (string[], required): Dependencies of new task

**Return Value**:
- `boolean`: True if circular dependency would be created

**Circular Detection Algorithm**:
1. **Dependency Tracing**: Follow each dependency path recursively
2. **Cycle Detection**: Check if any path leads back to new task
3. **Depth Limiting**: Prevent infinite recursion with reasonable depth
4. **Path Validation**: Ensure all dependencies exist in current hierarchy

**Examples**:

**Circular Dependency Detection**:
```typescript
const storage = new FileSystemStorage();
const tasks = await storage.getTasks();

// Would create circular dependency
const circular1 = storage.wouldCreateCircularDependency(
  tasks,
  "task-3",
  ["task-1"] // task-3 depends on task-1, but task-1 would depend on task-3
);
console.log(circular1); // true

// No circular dependency
const circular2 = storage.wouldCreateCircularDependency(
  tasks,
  "task-4",
  ["task-1"] // task-4 depends on task-1, no cycle
);
console.log(circular2); // false

// Complex chain analysis
const complexCircular = storage.wouldCreateCircularDependency(
  tasks,
  "task-5",
  ["task-2", "task-3"] // task-5 -> task-2 -> task-3 -> task-5 (cycle)
);
console.log(complexCircular); // true
```

**Dependency Chain Visualization**:
```typescript
class DependencyAnalyzer {
  static analyzeDependencyChain(
    storage: FileSystemStorage,
    rootTaskId: string
  ): void {
    const tasks = await storage.getTasks();
    
    const buildChain = (taskId: string, visited: Set<string>): string[] => {
      const task = storage.findTaskInHierarchy(tasks, taskId);
      if (!task) return [];
      
      const chain = [taskId];
      visited.add(taskId);
      
      if (task.dependencies) {
        for (const depId of task.dependencies) {
          if (!visited.has(depId)) {
            const depChain = buildChain(depId, visited);
            chain.push(...depChain);
          }
        }
      }
      
      return chain;
    };
    
    const chain = buildChain(rootTaskId, new Set());
    console.log(`Dependency chain for ${rootTaskId}:`, chain);
    
    // Detect cycles
    const hasCycle = chain.some((taskId, index) => 
      chain.indexOf(taskId, index + 1) !== -1
    );
    
    if (hasCycle) {
      console.warn("Circular dependency detected!");
    } else {
      console.log("No circular dependencies");
    }
  }
}
```

### INTEGRATION PROTOCOLS

#### File Operation Protocol
All file operations follow this pattern:
1. **Path Resolution**: Use join() and resolve() for cross-platform compatibility
2. **Atomic Operations**: Temporary files with atomic moves for data safety
3. **Error Handling**: Comprehensive try-catch with specific error types
4. **Backup Strategy**: Create backups before destructive operations
5. **Cleanup Protocol**: Remove temporary files and maintain directory hygiene

#### Data Validation Protocol
Input validation follows these principles:
1. **Type Checking**: Runtime type validation for all inputs
2. **Content Validation**: Business logic validation for data integrity
3. **Reference Validation**: Ensure referenced entities exist
4. **Sanitization**: Input cleaning and security checks
5. **Error Context**: Rich error information with resolution suggestions

#### Hierarchy Management Protocol
Task relationships follow this structure:
1. **Parent-Child**: Tasks can have multiple subtasks
2. **Single Parent**: Subtasks have exactly one parent
3. **Hierarchical IDs**: Subtask IDs use parent prefix
4. **Flattening**: Convert hierarchy to flat array for operations
5. **Integrity**: Maintain consistency across hierarchy operations

### SURVIVAL SCENARIOS

#### Scenario 1: Robust Task Management
```typescript
class TaskManager {
  private storage = new FileSystemStorage();
  
  async createTaskWithHierarchy(taskData: CreateTaskRequest): Promise<Task> {
    try {
      // Validate input
      this.storage.validateTaskRequest(taskData);
      
      // Create parent task if needed
      let parentTask = null;
      if (taskData.parentId) {
        parentTask = await this.storage.getTask(taskData.parentId);
        if (!parentTask) {
          throw new Error(`Parent task ${taskData.parentId} not found`);
        }
      }
      
      // Create the task
      const newTask = await this.storage.createTask({
        ...taskData,
        parentId: taskData.parentId
      });
      
      console.log(`Created task: ${newTask.id} - ${newTask.title}`);
      return newTask;
    } catch (error) {
      console.error("Task creation failed:", error.message);
      throw error;
    }
  }
  
  async reorganizeTasks(): Promise<void> {
    const tasks = await this.storage.getTasks();
    
    // Rebuild hierarchy
    const reorganized = tasks.map(task => {
      // Ensure subtasks are properly organized
      if (task.subtasks && task.subtasks.length > 0) {
        const subtasks = task.subtasks.sort((a, b) => 
          a.title.localeCompare(b.title)
        );
        return { ...task, subtasks };
      }
      return task;
    });
    
    // Save reorganized tasks
    await this.storage.saveTasksData({
      tasks: reorganized,
      nextId: Math.max(...tasks.map(t => parseInt(t.id) || 0)) + 1
    });
    
    console.log("Tasks reorganized successfully");
  }
}
```

#### Scenario 2: Data Migration and Recovery
```typescript
class DataMigrationManager {
  private storage = new FileSystemStorage();
  
  async migrateFromOldFormat(): Promise<void> {
    try {
      // Simulate loading old format data
      const oldData = await this.loadOldFormatData();
      
      // Transform to new format
      const newData = this.transformToNewFormat(oldData);
      
      // Backup current data
      const backup = await this.storage.loadTasksData();
      await this.createBackupFile(backup);
      
      // Save new format
      await this.storage.saveTasksData(newData);
      
      console.log("Migration completed successfully");
    } catch (error) {
      console.error("Migration failed:", error.message);
      
      // Attempt rollback
      try {
        const backup = await this.loadBackupFile();
        if (backup) {
          await this.storage.saveTasksData(backup);
          console.log("Rolled back to backup");
        }
      } catch (rollbackError) {
        console.error("Rollback failed:", rollbackError.message);
      }
    }
  }
  
  private async loadOldFormatData(): Promise<any> {
    // Implementation for loading old data format
    // This would read from legacy files and convert
    return { tasks: [], nextId: 1 };
  }
  
  private transformToNewFormat(oldData: any): TasksData {
    // Transform old format to new Task[] structure
    const tasks = (oldData.tasks || []).map((oldTask: any) => ({
      id: oldTask.id || this.generateTaskId(),
      title: oldTask.title || "Untitled Task",
      description: oldTask.description || "",
      status: "todo",
      createdAt: oldTask.created || Date.now(),
      updatedAt: Date.now(),
      // Map other properties as needed
    }));
    
    return {
      tasks,
      nextId: Math.max(...tasks.map(t => parseInt(t.id) || 0)) + 1
    };
  }
  
  private generateTaskId(): string {
    return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private async createBackupFile(data: TasksData): Promise<void> {
    const backupPath = `.task-o-matic/backup-${Date.now()}.json`;
    await this.storage.saveTasksData(data);
    console.log(`Backup created: ${backupPath}`);
  }
  
  private async loadBackupFile(): Promise<TasksData | null> {
    // Implementation for loading most recent backup
    return null; // Simplified for example
  }
}
```

#### Scenario 3: Performance Optimization
```typescript
class OptimizedTaskStorage {
  private storage = new FileSystemStorage();
  private cache = new Map<string, any>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes
  
  async getTasksWithCache(): Promise<Task[]> {
    // Check cache first
    const cached = this.cache.get("tasks");
    if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
      console.log("Returning cached tasks");
      return cached.data;
    }
    
    // Load from storage
    const tasks = await this.storage.getTasks();
    
    // Update cache
    this.cache.set("tasks", {
      data: tasks,
      timestamp: Date.now()
    });
    
    return tasks;
  }
  
  async createTaskWithCache(taskData: CreateTaskRequest): Promise<Task> {
    const task = await this.storage.createTask(taskData);
    
    // Invalidate relevant cache entries
    this.cache.delete("tasks");
    this.cache.delete("hierarchy");
    
    return task;
  }
  
  private buildHierarchyCache(tasks: Task[]): Map<string, Task[]> {
    const hierarchy = new Map<string, Task[]>();
    
    for (const task of tasks) {
      if (task.parentId) {
        const parent = hierarchy.get(task.parentId);
        if (parent) {
          hierarchy.set(task.parentId, [...parent, task]);
        }
      } else {
        hierarchy.set(task.id, [task]);
      }
    }
    
    return hierarchy;
  }
}
```

#### Scenario 4: Concurrent Access Management
```typescript
class ConcurrentTaskManager {
  private storage = new FileSystemStorage();
  private operationQueue = new Map<string, Promise<Task>>();
  
  async createTaskWithLocking(taskData: CreateTaskRequest): Promise<Task> {
    const taskId = this.generateTaskId();
    
    // Check if operation is already in progress
    if (this.operationQueue.has(taskId)) {
      throw new Error(`Task creation already in progress: ${taskId}`);
    }
    
    // Add to queue
    const operation = this.storage.createTask(taskData);
    this.operationQueue.set(taskId, operation);
    
    try {
      const task = await operation;
      console.log(`Task created with locking: ${task.id}`);
      return task;
    } finally {
      this.operationQueue.delete(taskId);
    }
  }
  
  async batchCreateTasks(requests: CreateTaskRequest[]): Promise<Task[]> {
    const results = await Promise.allSettled(
      requests.map((request, index) => 
        this.createTaskWithLocking({
          ...request,
          id: `batch-${index}-${Date.now()}`
        })
      )
    );
    
    const tasks = results
      .filter((result): result.status === "fulfilled")
      .map((result): Task => result.value);
    
    const failed = results
      .filter((result): result.status === "rejected")
      .map((result): Error => result.reason);
    
    if (failed.length > 0) {
      console.warn(`${failed.length} tasks failed to create:`, failed);
    }
    
    return tasks;
  }
  
  private generateTaskId(): string {
    return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
```

### TECHNICAL SPECIFICATIONS

#### Performance Characteristics
- **File I/O**: Optimized JSON reading/writing with minimal memory usage
- **Caching**: Optional in-memory caching for frequently accessed data
- **Atomic Operations**: Safe file operations with backup/restore capability
- **Indexing**: Efficient task lookup with hierarchical indexing

#### Security Considerations
- **Path Traversal**: Filename sanitization prevents directory traversal attacks
- **Input Validation**: Comprehensive validation prevents injection attacks
- **File Permissions**: Respects system file permissions
- **Data Isolation**: Task data isolated per project directory

#### Reliability Features
- **Atomic Saves**: Prevents data corruption during writes
- **Backup Creation**: Automatic backups before destructive operations
- **Error Recovery**: Graceful handling of file system errors
- **Data Integrity**: Validation and consistency checking

#### Scalability Characteristics
- **Large Datasets**: Efficient handling of thousands of tasks
- **Hierarchical Data**: Optimized tree traversal and manipulation
- **Concurrent Access**: Thread-safe operations with proper locking
- **Memory Usage**: Streaming operations for large datasets

**Remember:** Citizen, File System Storage is your vault in the digital wasteland. Without mastering this persistence system, you're leaving your valuable task data exposed to the radioactive storms of data corruption, accidental deletion, and system failures. Master these storage protocols, or watch your hard work dissolve into digital dust.

---

**END OF BULLETIN**