# VAULT-TEC STORAGE SYSTEM MANUAL
## INTELLIGENCE ATTRIBUTE - DATA PERSISTENCE & MEMORY RETENTION

**Welcome, Vault Dweller!** This manual documents the Storage System - the **INTELLIGENCE** component of your Task-O-Matic S.P.E.C.I.A.L. attributes. Just as Intelligence determines your ability to remember and process information, the Storage System ensures your valuable vault data survives the nuclear wasteland of system crashes and power failures.

---

## 🧠 UNDERSTANDING VAULT-TEC STORAGE ARCHITECTURE

### The Intelligence Principle
In the pre-war world, scientists understood that **Intelligence** wasn't just about processing power - it was about **memory retention**. Our Storage System embodies this principle through:

- **Persistent Data Storage**: Your tasks survive even when the power grid fails
- **Hierarchical Memory Organization**: Like a well-organized filing cabinet, but radiation-proof
- **Atomic Operations**: Either your data saves completely or not at all - no half-corrupted memories
- **Integrity Validation**: Automatic checks to prevent data corruption from radiation exposure

### Core Components

#### 1. TaskRepository Interface
The master blueprint for all storage operations. Think of it as the **Vault-Tec Standard for Memory Management**.

```typescript
interface TaskRepository {
  // Task Operations - Your primary quest log
  getTasks(): Promise<Task[]>;
  getTopLevelTasks(): Promise<Task[]>;
  getTask(id: string): Promise<Task | null>;
  createTask(task: CreateTaskRequest, aiMetadata?: TaskAIMetadata): Promise<Task>;
  updateTask(id: string, updates: Partial<Task>): Promise<Task | null>;
  deleteTask(id: string): Promise<boolean>;
  getSubtasks(parentId: string): Promise<Task[]>;

  // Content Operations - Detailed mission briefings
  getTaskContent(taskId: string): Promise<string | null>;
  saveTaskContent(taskId: string, content: string): Promise<string>;
  saveEnhancedTaskContent(taskId: string, content: string): Promise<string>;
  deleteTaskContent(taskId: string): Promise<void>;
  migrateTaskContent(): Promise<number>;
  cleanupOrphanedContent(): Promise<number>;

  // AI Metadata Operations - Enhanced cognitive records
  getTaskAIMetadata(taskId: string): Promise<TaskAIMetadata | null>;
  saveTaskAIMetadata(metadata: TaskAIMetadata): Promise<void>;
  deleteTaskAIMetadata(taskId: string): Promise<void>;

  // Documentation Operations - Research archives
  getTaskDocumentation(taskId: string): Promise<string | null>;
  saveTaskDocumentation(taskId: string, content: string): Promise<string>;
  saveContext7Documentation(library: string, query: string, content: string): Promise<string>;
  getDocumentationFile(fileName: string): Promise<string | null>;
  listDocumentationFiles(): Promise<string[]>;

  // Plan Operations - Strategic mission planning
  getPlan(taskId: string): Promise<{plan: string; createdAt: number; updatedAt: number} | null>;
  savePlan(taskId: string, plan: string): Promise<void>;
  listPlans(): Promise<Array<{taskId: string; plan: string; createdAt: number; updatedAt: number}>>;
  deletePlan(taskId: string): Promise<boolean>;

  // Utility Operations - System maintenance
  sanitizeForFilename(name: string): string;
  validateStorageIntegrity(): Promise<{isValid: boolean; issues: string[]}>;
}
```

#### 2. FileSystemStorage Class
The **Pip-Boy 3000** of storage systems - your personal, radiation-hardened data vault.

```typescript
class FileSystemStorage implements TaskRepository {
  constructor(callbacks?: StorageCallbacks)
  
  // All TaskRepository methods implemented with Vault-Tec reliability
}
```

#### 3. StorageCallbacks Interface
The universal adapter system - like having the right power adapter for any pre-war technology.

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

## 🗄️ VAULT DATA STRUCTURES

### Task Object Structure
Each task is a carefully catalogued artifact in your vault's database:

```typescript
interface Task {
  id: string;                    // Unique vault identification number
  title: string;                 // Mission name
  description?: string;          // Briefing summary
  content?: string;              // Full mission details
  contentFile?: string;          // External content storage path
  status: "todo" | "in-progress" | "completed";
  estimatedEffort?: "small" | "medium" | "large";
  dependencies?: string[];       // Prerequisite missions
  tags?: string[];              // Classification tags
  subtasks?: Task[];            // Sub-missions
  createdAt: number;            // Creation timestamp
  updatedAt: number;            // Last modification
  prdFile?: string;            // Source PRD document
}
```

### AI Metadata Structure
Enhanced cognitive records for AI-assisted operations:

```typescript
interface TaskAIMetadata {
  taskId: string;
  aiGenerated: boolean;
  aiPrompt?: string;
  confidence?: number;
  aiProvider?: string;
  aiModel?: string;
  generatedAt?: number;
  enhancedAt?: number;
  analyzedAt?: number;
  splitAt?: number;
}
```

---

## ⚙️ VAULT-TEC STORAGE OPERATIONS

### Basic Task Management

#### Creating a New Task
```typescript
import { FileSystemStorage } from './src/lib/storage/file-system';

// Initialize your vault storage system
const storage = new FileSystemStorage();

// Create a new mission entry
const newTask = await storage.createTask({
  title: "Repair Water Purification System",
  description: "Fix the main water chip before vault residents get thirsty",
  content: "Detailed repair instructions including safety protocols...",
  estimatedEffort: "large",
  tags: ["maintenance", "critical", "water"],
  dependencies: ["gather-tools", "shutdown-system"]
});

console.log(`Task created with ID: ${newTask.id}`);
```

#### Retrieving Tasks
```typescript
// Get all missions in your quest log
const allTasks = await storage.getTasks();

// Get only top-level missions (no sub-quests)
const mainTasks = await storage.getTopLevelTasks();

// Find a specific mission by ID
const specificTask = await storage.getTask("42");

// Get all sub-missions for a main quest
const subtasks = await storage.getSubtasks("42");
```

#### Updating Tasks
```typescript
// Update mission status
const updatedTask = await storage.updateTask("42", {
  status: "in-progress",
  description: "Water chip repair in progress - 75% complete"
});

// Add new tags to classify the mission
await storage.updateTask("42", {
  tags: ["maintenance", "critical", "water", "priority-1"]
});
```

### Content Management

#### Saving Task Content
```typescript
// Save detailed mission briefing
const contentPath = await storage.saveTaskContent("42", `
# Water Purification System Repair

## Safety First
- Wear radiation suit
- Ensure system is powered down
- Have backup water supply ready

## Step-by-Step Instructions
1. Locate main water chip (Sector 7G)
2. Remove protective casing
3. Replace damaged components
4. Run diagnostic tests
5. Restore power and test output

## Required Tools
- Multitool
- Replacement water chip
- Radiation detector
- Emergency repair kit
`);

console.log(`Content saved to: ${contentPath}`);
```

#### Enhanced Content Storage
```typescript
// Save AI-enhanced content with additional insights
const enhancedPath = await storage.saveEnhancedTaskContent("42", `
# AI-Enhanced Water Purification Repair Guide

## Predictive Analysis
Based on current failure patterns, this repair has a 94% success rate
when following the enhanced protocol below.

## Optimized Repair Sequence
[AI-generated optimized steps with time estimates]
`);

console.log(`Enhanced content saved to: ${enhancedPath}`);
```

### AI Metadata Operations

#### Saving AI Analysis
```typescript
await storage.saveTaskAIMetadata({
  taskId: "42",
  aiGenerated: true,
  aiPrompt: "Analyze water purification repair requirements",
  confidence: 0.94,
  aiProvider: "openrouter",
  aiModel: "claude-3.5-sonnet",
  generatedAt: Date.now(),
  enhancedAt: Date.now()
});
```

#### Retrieving AI Insights
```typescript
const aiMetadata = await storage.getTaskAIMetadata("42");
if (aiMetadata) {
  console.log(`AI Confidence: ${aiMetadata.confidence}`);
  console.log(`Generated by: ${aiMetadata.aiProvider}/${aiMetadata.aiModel}`);
}
```

### Documentation Management

#### Saving Research Documentation
```typescript
// Save Context7 documentation for library research
const docPath = await storage.saveContext7Documentation(
  "react-hooks",
  "usestate-patterns",
  `
# React useState Best Practices

## Common Patterns
- State initialization
- Update functions
- Object state management
- Array operations

## Performance Considerations
[Detailed performance analysis]
`
);
```

#### Managing Documentation Files
```typescript
// List all available documentation
const docs = await storage.listDocumentationFiles();
console.log("Available documentation:", docs);

// Retrieve specific documentation
const specificDoc = await storage.getDocumentationFile("react-hooks/usestate-patterns.md");
```

### Plan Management

#### Saving Implementation Plans
```typescript
await storage.savePlan("42", `
# Water Purification System Repair Plan

## Phase 1: Preparation (2 hours)
- Gather all required tools
- Power down system safely
- Set up safety barriers

## Phase 2: Repair (4 hours)
- Remove damaged components
- Install new water chip
- Calibrate system settings

## Phase 3: Testing (1 hour)
- Power on tests
- Water quality verification
- Performance monitoring
`);
```

#### Retrieving Plans
```typescript
const plan = await storage.getPlan("42");
if (plan) {
  console.log(`Plan created: ${new Date(plan.createdAt).toLocaleString()}`);
  console.log(`Last updated: ${new Date(plan.updatedAt).toLocaleString()}`);
  console.log(`Plan content:\n${plan.plan}`);
}
```

---

## 🛡️ VAULT-TEC SAFETY PROTOCOLS

### Data Integrity Validation
```typescript
// Run comprehensive vault integrity check
const integrityCheck = await storage.validateStorageIntegrity();

if (!integrityCheck.isValid) {
  console.error("⚠️ VAULT INTEGRITY ISSUES DETECTED:");
  integrityCheck.issues.forEach(issue => {
    console.error(`- ${issue}`);
  });
  
  // Alert vault security
  // Implement repair procedures
} else {
  console.log("✅ Vault integrity confirmed - all systems operational");
}
```

### Content Migration
```typescript
// Migrate old content to new storage format
const migratedCount = await storage.migrateTaskContent();
console.log(`Migrated ${migratedCount} tasks to new storage format`);
```

### Orphaned Content Cleanup
```typescript
// Clean up content files without associated tasks
const cleanedCount = await storage.cleanupOrphanedContent();
console.log(`Cleaned up ${cleanedCount} orphaned content files`);
```

---

## 🔧 CUSTOM STORAGE BACKENDS

### Creating Custom Storage Callbacks
Need to store data in a different vault? Implement your own StorageCallbacks:

```typescript
import { StorageCallbacks } from './src/lib/storage/storage-callbacks';

// Example: Cloud Storage Callbacks
class CloudStorageCallbacks implements StorageCallbacks {
  constructor(private cloudProvider: any) {}

  async read(key: string): Promise<string | null> {
    // Implement cloud read logic
    return await this.cloudProvider.download(key);
  }

  async write(key: string, value: string): Promise<void> {
    // Implement cloud write logic
    await this.cloudProvider.upload(key, value);
  }

  async delete(key: string): Promise<void> {
    // Implement cloud delete logic
    await this.cloudProvider.remove(key);
  }

  async list(prefix?: string): Promise<string[]> {
    // Implement cloud list logic
    return await this.cloudProvider.listFiles(prefix);
  }

  async exists(key: string): Promise<boolean> {
    // Implement cloud exists logic
    return await this.cloudProvider.checkExists(key);
  }
}

// Use with FileSystemStorage
const cloudStorage = new FileSystemStorage(new CloudStorageCallbacks(myCloudProvider));
```

---

## ⚠️ VAULT-TEC TROUBLESHOOTING GUIDE

### Common Storage Issues

#### Issue: Task Not Found
**Symptoms**: `getTask()` returns null for valid-looking IDs

**Vault-Tec Solutions**:
```typescript
// Check if task exists with different ID formats
const task = await storage.getTask("42");
if (!task) {
  // Try with task- prefix
  const taskWithPrefix = await storage.getTask("task-42");
  if (!taskWithPrefix) {
    // List all tasks to find correct ID
    const allTasks = await storage.getTasks();
    console.log("Available task IDs:", allTasks.map(t => t.id));
  }
}
```

#### Issue: Circular Dependency Detected
**Symptoms**: Error when creating tasks with dependencies

**Vault-Tec Solutions**:
```typescript
// Before creating task, check dependencies
const dependencies = ["task-1", "task-2"];
const allTasks = await storage.getTasks();
const existingIds = allTasks.map(t => t.id);

const invalidDeps = dependencies.filter(dep => !existingIds.includes(dep));
if (invalidDeps.length > 0) {
  console.error(`Invalid dependencies: ${invalidDeps.join(", ")}`);
  // Create missing dependencies first
}
```

#### Issue: Storage Corruption
**Symptoms**: JSON parse errors or missing data

**Vault-Tec Solutions**:
```typescript
// Run integrity check
const check = await storage.validateStorageIntegrity();
if (!check.isValid) {
  console.error("Storage issues detected:", check.issues);
  
  // Backup current data
  // Attempt repair procedures
  // Restore from backup if necessary
}
```

#### Issue: Permission Denied
**Symptoms**: File system errors when writing data

**Vault-Tec Solutions**:
```typescript
// Check vault directory permissions
import { access } from 'fs/promises';
import { constants } from 'fs';

try {
  await access('.task-o-matic', constants.W_OK);
  console.log("Vault directory is writable");
} catch (error) {
  console.error("Vault directory permissions issue:");
  console.log("Run: chmod 755 .task-o-matic");
  console.log("Or: chown $USER:$USER .task-o-matic");
}
```

### Performance Optimization

#### Issue: Slow Task Loading
**Vault-Tec Solutions**:
```typescript
// Use specific queries instead of loading all tasks
const topLevelTasks = await storage.getTopLevelTasks(); // Faster than getTasks()

// Cache frequently accessed tasks
const taskCache = new Map<string, Task>();

async function getCachedTask(id: string): Promise<Task | null> {
  if (taskCache.has(id)) {
    return taskCache.get(id)!;
  }
  
  const task = await storage.getTask(id);
  if (task) {
    taskCache.set(id, task);
  }
  return task;
}
```

---

## 📊 VAULT DATA ORGANIZATION

### Directory Structure
Your vault data is organized in the `.task-o-matic` directory:

```
.task-o-matic/
├── tasks.json              # Main task database
├── ai-metadata.json        # AI operation records
├── tasks/                  # Individual task content
│   ├── 1.md
│   ├── 2.md
│   └── ...
├── tasks/enhanced/         # AI-enhanced content
│   ├── 1.md
│   └── ...
├── plans/                  # Implementation plans
│   ├── 1.json
│   └── ...
├── docs/                   # Documentation cache
│   ├── tasks/
│   └── [library-name]/
├── prd/                    # PRD parsing results
└── logs/                   # Operation logs
```

### File Naming Conventions
- **Tasks**: `{taskId}.md` in `tasks/` directory
- **Enhanced Content**: `{taskId}.md` in `tasks/enhanced/` directory
- **Plans**: `{taskId}.json` in `plans/` directory
- **Documentation**: `{library}/{query}.md` in `docs/` directory

---

## 🎯 VAULT-TEC PRO TIPS

### Tip #1: Regular Backups
```bash
# Create vault backup
cp -r .task-o-matic .task-o-matic.backup.$(date +%Y%m%d)

# Automated backup script
#!/bin/bash
BACKUP_DIR=".task-o-matic.backup.$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp -r .task-o-matic/* "$BACKUP_DIR/"
echo "Vault backed up to: $BACKUP_DIR"
```

### Tip #2: Batch Operations
```typescript
// Efficiently update multiple tasks
const taskUpdates = [
  { id: "1", status: "completed" },
  { id: "2", status: "in-progress" },
  { id: "3", status: "todo" }
];

for (const update of taskUpdates) {
  await storage.updateTask(update.id, update);
}
```

### Tip #3: Content Size Management
```typescript
// Automatically split large content
const MAX_INLINE_CONTENT = 200;

async function saveTaskContentOptimized(taskId: string, content: string): Promise<string> {
  if (content.length > MAX_INLINE_CONTENT) {
    return await storage.saveTaskContent(taskId, content);
  }
  return content; // Store inline
}
```

### Tip #4: Dependency Validation
```typescript
// Validate task dependencies before operations
async function validateTaskDependencies(taskId: string): Promise<boolean> {
  const task = await storage.getTask(taskId);
  if (!task?.dependencies) return true;

  const allTasks = await storage.getTasks();
  const existingIds = new Set(allTasks.map(t => t.id));

  return task.dependencies.every(dep => existingIds.has(dep));
}
```

---

## 🚨 VAULT-TEC EMERGENCY PROCEDURES

### Data Recovery
If your vault data becomes corrupted:

1. **Stop all operations** - Prevent further damage
2. **Check integrity** - Run `validateStorageIntegrity()`
3. **Restore from backup** - Use your most recent backup
4. **Migrate if needed** - Run `migrateTaskContent()`
5. **Verify recovery** - Check critical tasks exist

### Emergency Reset
```typescript
// Last resort: reset vault storage
import { createFileSystemCallbacks } from './src/lib/storage/storage-callbacks';
import { configManager } from './src/lib/config';

const emergencyCallbacks = createFileSystemCallbacks(configManager.getTaskOMaticDir());
const emergencyStorage = new FileSystemStorage(emergencyCallbacks);

// Create fresh storage with backup of existing data
const backup = await emergencyCallbacks.read("tasks.json");
await emergencyCallbacks.write("tasks.json.backup", backup || "");
await emergencyCallbacks.write("tasks.json", JSON.stringify({ tasks: [], nextId: 1 }));
```

---

## 📈 PERFORMANCE METRICS

### Expected Performance
- **Task Retrieval**: < 50ms for typical vault (< 1000 tasks)
- **Content Loading**: < 100ms for standard content (< 10KB)
- **Batch Operations**: ~10ms per task update
- **Integrity Validation**: < 500ms for medium vaults

### Monitoring Storage Health
```typescript
// Regular health check
async function vaultHealthCheck(): Promise<void> {
  const integrity = await storage.validateStorageIntegrity();
  const taskCount = (await storage.getTasks()).length;
  const orphanedCount = await storage.cleanupOrphanedContent();

  console.log(`Vault Health Report:`);
  console.log(`- Tasks: ${taskCount}`);
  console.log(`- Integrity: ${integrity.isValid ? 'PASS' : 'FAIL'}`);
  console.log(`- Cleaned orphaned files: ${orphanedCount}`);
  
  if (!integrity.isValid) {
    console.warn('⚠️ Integrity issues detected:', integrity.issues);
  }
}
```

---

## 🎓 CONCLUSION

The Storage System represents the **Intelligence** attribute of your Task-O-Matic system - the ability to remember, organize, and persist knowledge in the harsh post-apocalyptic environment. With proper maintenance and adherence to Vault-Tec protocols, your vault data will remain safe and accessible for generations to come.

**Remember**: A well-maintained storage system is the difference between a thriving vault and forgotten ruins. Regular backups, integrity checks, and proper error handling will ensure your mission data survives any nuclear winter.

---

*This manual is classified Vault-Tec proprietary information. Distribution is restricted to authorized vault personnel only. For technical support, contact your local Vault-Tec representative or consult the terminal in your vault's overseer office.*

**Vault-Tec - Building a Better Tomorrow, Underground!**