# VAULT-TEC TASKSERVICE MANUAL
## S.P.E.C.I.A.L. ATTRIBUTE: STRENGTH

**WARNING:** This manual contains classified Vault-Tec proprietary information. Distribution is restricted to authorized Vault personnel only. Unauthorized access may result in reassignment to nuclear waste disposal duty.

---

## 🏛️ CHAPTER 1: STRENGTH - THE BACKBONE OF VAULT OPERATIONS

Welcome, Vault Dweller! The **TaskService** class represents the **STRENGTH** attribute in your Vault's S.P.E.C.I.A.L. system - the muscular powerhouse that forms the foundation of all task management operations. Just as Strength determines your carrying capacity in the wasteland, TaskService determines your project's capacity to handle workloads efficiently.

**Did You Know?** A properly configured TaskService can handle over 10,000 tasks before showing signs of radiation sickness! Always monitor your task load to prevent system fatigue.

---

## 🛠️ CHAPTER 2: VAULT-TEC CONSTRUCTION BASICS

### 2.1 INITIALIZING YOUR TASKSERVICE WORKBENCH

```typescript
import { TaskService } from "task-o-matic";

// Standard Vault-Tec issue TaskService
const taskService = new TaskService();

// For testing in simulated environments (Vault 101 approved)
const mockTaskService = new TaskService({
  storage: mockStorage,
  aiOperations: mockAI,
  modelProvider: mockProvider,
  contextBuilder: mockContext,
  hooks: mockHooks
});
```

**VAULT-TEC SAFETY WARNING:** Always initialize your TaskService in a clean, radiation-free environment. Contaminated initialization may lead to unexpected mutations in your task data.

---

## 💪 CHAPTER 3: CORE CRUD OPERATIONS - THE HEAVY LIFTING

### 3.1 CREATE TASK - FORGING NEW ASSIGNMENTS

The `createTask` method is your workhorse for forging new tasks from the raw materials of your project requirements.

#### Basic Task Creation
```typescript
// Simple task creation - no AI enhancement
const basicTask = await taskService.createTask({
  title: "Repair water purifier",
  content: "Main water purifier in sector 7 is malfunctioning",
  aiEnhance: false
});
```

#### AI-Enhanced Task Creation
```typescript
// Premium Vault-Tec AI-enhanced task
const enhancedTask = await taskService.createTask({
  title: "Design new fusion reactor",
  content: "Create plans for compact fusion reactor for Vault expansion",
  aiEnhance: true,
  aiOptions: {
    provider: "anthropic",
    model: "claude-3-5-sonnet"
  },
  streamingOptions: {
    onChunk: (chunk) => console.log("🤖 AI:", chunk)
  }
});
```

#### Creating Subtasks (Task Hierarchies)
```typescript
// Creating a task family tree
const parentTask = await taskService.createTask({
  title: "Restore Vault security systems",
  effort: "large"
});

const subtask1 = await taskService.createTask({
  title: "Repair laser turrets",
  parentId: parentTask.task.id,
  effort: "medium"
});

const subtask2 = await taskService.createTask({
  title: "Update security protocols",
  parentId: parentTask.task.id,
  effort: "small"
});
```

**VAULT-TEC PRO TIP:** Task IDs follow Vault naming conventions (1, 1.1, 1.2, 2, 2.1, etc.). This hierarchical system ensures proper task lineage tracking - essential when dealing with mutant task outbreaks!

### 3.2 LIST TASKS - INVENTORY MANAGEMENT

```typescript
// Get all tasks in your Vault
const allTasks = await taskService.listTasks({});

// Filter by status - find all completed tasks
const completedTasks = await taskService.listTasks({ 
  status: "completed" 
});

// Find tasks by department tag
const securityTasks = await taskService.listTasks({ 
  tag: "security" 
});
```

### 3.3 UPDATE TASK - MAINTENANCE AND MODIFICATIONS

```typescript
// Update task status - promote from todo to in-progress
const updatedTask = await taskService.updateTask("1", {
  status: "in-progress",
  tags: "urgent,security"
});

// Quick status change
await taskService.setTaskStatus("1", "completed");
```

**VAULT-TEC SAFETY WARNING:** Invalid status transitions will trigger Vault security protocols! Valid transitions are:
- `todo` → `in-progress` or `completed`
- `in-progress` → `completed` or `todo` 
- `completed` → `todo` or `in-progress`

### 3.4 DELETE TASK - DECOMMISSIONING PROTOCOLS

```typescript
// Simple deletion - only works if no subtasks exist
await taskService.deleteTask("1");

// Cascade deletion - remove task and all descendants
const result = await taskService.deleteTask("1", { 
  cascade: true 
});

// Force deletion - orphan subtasks (use with caution!)
const result = await taskService.deleteTask("1", { 
  force: true 
});
```

**VAULT-TEC PRO TIP:** Always check for subtasks before deletion. Orphaned tasks can wander your system and cause unexpected behavior - much like feral ghouls in the maintenance tunnels!

---

## 🧠 CHAPTER 4: AI OPERATIONS - THE THINKING MACHINE

### 4.1 ENHANCE TASK - AI DOCUMENTATION INJECTION

Transform basic tasks into comprehensive, AI-enhanced assignments with Context7 documentation.

```typescript
try {
  const result = await taskService.enhanceTask("1", undefined, {
    onChunk: (chunk) => process.stdout.write(chunk)
  });
  
  console.log(`Enhanced content length: ${result.stats.enhancedLength}`);
  console.log(`Processing time: ${result.stats.duration}ms`);
  console.log(`AI Provider: ${result.metadata.aiProvider}`);
} catch (error) {
  if (error instanceof TaskOMaticError) {
    console.error("Enhancement failed:", error.getDetails());
    console.log("Suggestions:", error.suggestions);
  }
}
```

**VAULT-TEC PERFORMANCE TIP:** Enhanced content over 200 characters is automatically saved to separate files to prevent task bloating - just like how we store excess supplies in separate cargo bays!

### 4.2 SPLIT TASK - TASK FISSION PROCESS

Break down large, unwieldy tasks into manageable subtasks using AI analysis.

```typescript
// Basic task splitting
const result = await taskService.splitTask("1");
console.log(`Created ${result.subtasks.length} subtasks`);

// Advanced splitting with filesystem analysis
const advancedResult = await taskService.splitTask(
  "1",
  undefined, // AI options
  undefined, // prompt override
  undefined, // message override
  { onChunk: (chunk) => console.log(chunk) }, // streaming
  true // Enable filesystem tools for code analysis
);
```

**VAULT-TEC SAFETY WARNING:** Tasks that already have subtasks cannot be split again. This prevents task duplication anomalies that could tear the very fabric of your project timeline!

### 4.3 DOCUMENT TASK - LIBRARY RESEARCH OPERATIONS

Automatically fetch and analyze relevant documentation for your tasks.

```typescript
// Analyze documentation needs
const result = await taskService.documentTask("1");

if (result.documentation) {
  console.log("Libraries researched:", result.documentation.libraries);
  console.log("Documentation recap:", result.documentation.recap);
}

// Force refresh documentation (bypass cache)
const freshResult = await taskService.documentTask("1", true);
```

**VAULT-TEC PRO TIP:** Documentation is cached for 24 hours. Force refresh when you need the latest intelligence - just like checking for new radiation levels!

### 4.4 PLAN TASK - STRATEGIC OPERATIONS PLANNING

Generate detailed implementation plans with AI assistance.

```typescript
const result = await taskService.planTask("1", undefined, {
  onChunk: (chunk) => {
    // Watch the plan materialize in real-time!
    process.stdout.write(chunk);
  }
});

console.log(`Plan saved to: plans/${result.task.id}.md`);
console.log(`Generated in ${result.stats.duration}ms`);
```

---

## 🏷️ CHAPTER 5: TAG OPERATIONS - DEPARTMENTAL CLASSIFICATION

### 5.1 TAG MANAGEMENT

```typescript
// Add department tags
await taskService.addTags("1", ["security", "urgent", "maintenance"]);

// Remove outdated tags
await taskService.removeTags("1", ["deprecated", "old-department"]);
```

**VAULT-TEC ORGANIZATIONAL TIP:** Use consistent tagging conventions! Recommended tags include: `security`, `maintenance`, `research`, `medical`, `engineering`, `urgent`, `routine`.

---

## 🧭 CHAPTER 6: TASK NAVIGATION - FINDING YOUR WAY

### 6.1 GET NEXT TASK - PRIORITY ASSIGNMENT

```typescript
// Get next task by default priority (task ID order)
const nextTask = await taskService.getNextTask({});

// Get newest urgent task
const newestUrgent = await taskService.getNextTask({
  status: "todo",
  tag: "urgent",
  priority: "newest"
});

// Get highest effort engineering task
const highEffortTask = await taskService.getNextTask({
  tag: "engineering",
  priority: "effort"
});
```

### 6.2 TASK TREE OPERATIONS

```typescript
// Get complete task tree from root
const fullTree = await taskService.getTaskTree();

// Get subtree starting from specific task
const subtree = await taskService.getTaskTree("1");
```

---

## 📊 CHAPTER 7: PERFORMANCE OPTIMIZATION FOR LARGE VAULTS

### 7.1 SCALABILITY GUIDELINES

| Vault Size | Task Count | Recommended Configuration |
|------------|------------|---------------------------|
| Small (1-100) | < 500 tasks | Default settings |
| Medium (101-500) | 500-2,000 tasks | Enable task caching |
| Large (501-1000) | 2,000-10,000 tasks | Use streaming for AI ops |
| Mega Vault (1000+) | 10,000+ tasks | Consider task archiving |

### 7.2 PERFORMANCE TIPS

1. **Use Streaming for Large Operations**: Enable streaming options for AI-enhanced tasks to monitor progress and prevent timeouts.

2. **Batch Tag Operations**: Add/remove multiple tags in single operations rather than multiple calls.

3. **Filter Early**: Use specific filters in `listTasks()` rather than filtering client-side.

4. **Cache Documentation**: Let the system cache documentation for 24 hours to avoid repeated API calls.

```typescript
// GOOD: Filter at the source
const securityTasks = await taskService.listTasks({ tag: "security" });

// AVOID: Client-side filtering
const allTasks = await taskService.listTasks({});
const securityTasks = allTasks.filter(task => 
  task.tags?.includes("security")
);
```

---

## ⚠️ CHAPTER 8: TROUBLESHOOTING - VAULT EMERGENCY PROCEDURES

### 8.1 COMMON TASKSERVICE MALFUNCTIONS

#### Task Not Found Error
```
Error: Task with ID '999' not found
```

**Solution:** Verify the task ID exists using `getTask()` before operations. Check for typos - the wasteland is unforgiving of careless mistakes!

#### Invalid Status Transition
```
Error: Cannot transition from 'completed' to 'in-progress'
```

**Solution:** Review the valid status transitions in Chapter 3.3. Use force deletion only in emergency situations!

#### AI Enhancement Failure
```
Error: AI enhancement failed - Context7 unavailable
```

**Solution:** Check your AI configuration and API keys. Ensure Context7 integration is properly configured in your Vault's AI systems.

### 8.2 RECOVERY PROCEDURES

#### Task Corruption Recovery
```typescript
// Check task integrity
const task = await taskService.getTask("1");
if (!task) {
  console.log("Task has gone feral - initiate recovery protocol");
  // Restore from backup or recreate
}

// Verify AI metadata
const metadata = await taskService.getTaskAIMetadata("1");
if (!metadata && task.content.includes("AI-enhanced")) {
  console.log("AI metadata missing - task may be unstable");
}
```

#### Storage System Recovery
```typescript
// Test storage connectivity
try {
  const tasks = await taskService.listTasks({});
  console.log(`Storage system operational - ${tasks.length} tasks found`);
} catch (error) {
  console.error("Storage system failure - initiate Vault lockdown!");
  // Check file permissions, disk space, and .task-o-matic directory integrity
}
```

---

## 🎯 CHAPTER 9: ADVANCED VAULT-TEC TECHNIQUES

### 9.1 TASK HIERARCHY MANAGEMENT

```typescript
// Build complex task trees
const mainProject = await taskService.createTask({
  title: "Vault Expansion Project",
  effort: "large"
});

// Phase 1: Planning
const planning = await taskService.createTask({
  title: "Phase 1: Planning and Design",
  parentId: mainProject.task.id,
  effort: "medium"
});

// Phase 1 subtasks
await taskService.createTask({
  title: "Architectural blueprints",
  parentId: planning.task.id,
  effort: "medium"
});

await taskService.createTask({
  title: "Resource allocation",
  parentId: planning.task.id,
  effort: "small"
});
```

### 9.2 AI WORKFLOW OPTIMIZATION

```typescript
// Optimal AI enhancement workflow
const createOptimalTask = async (title: string, description: string) => {
  // Step 1: Create basic task
  const basicResult = await taskService.createTask({
    title,
    content: description,
    aiEnhance: false // We'll enhance separately for better control
  });

  // Step 2: Enhance with AI
  const enhancedResult = await taskService.enhanceTask(
    basicResult.task.id,
    undefined,
    { onChunk: (chunk) => console.log("Enhancing:", chunk) }
  );

  // Step 3: Generate implementation plan
  const planResult = await taskService.planTask(basicResult.task.id);

  // Step 4: Split if effort is large
  if (basicResult.task.estimatedEffort === "large") {
    await taskService.splitTask(basicResult.task.id);
  }

  return {
    task: enhancedResult.task,
    plan: planResult.plan,
    stats: {
      enhancement: enhancedResult.stats,
      planning: planResult.stats
    }
  };
};
```

---

## 🔧 CHAPTER 10: MAINTENANCE SCHEDULES

### 10.1 ROUTINE MAINTENANCE

| Frequency | Task | Purpose |
|-----------|------|---------|
| Daily | Monitor task creation rates | Detect unusual activity |
| Weekly | Review AI enhancement performance | Optimize AI settings |
| Monthly | Archive completed tasks | Prevent system bloat |
| Quarterly | Full task tree validation | Ensure data integrity |

### 10.2 PERFORMANCE MONITORING

```typescript
// Monitor TaskService health
const healthCheck = async () => {
  const startTime = Date.now();
  
  try {
    const tasks = await taskService.listTasks({});
    const loadTime = Date.now() - startTime;
    
    console.log(`TaskService Health Report:`);
    console.log(`- Total tasks: ${tasks.length}`);
    console.log(`- Load time: ${loadTime}ms`);
    console.log(`- Tasks per second: ${(tasks.length / (loadTime / 1000)).toFixed(2)}`);
    
    // Check for anomalies
    if (loadTime > 5000) {
      console.warn("⚠️ Slow response detected - consider optimization");
    }
    
    if (tasks.length > 10000) {
      console.warn("⚠️ High task load - consider archiving");
    }
    
  } catch (error) {
    console.error("❌ TaskService health check failed:", error);
  }
};
```

---

## 📋 CHAPTER 11: QUICK REFERENCE - VAULT DWELLER'S CHEAT SHEET

### Essential Methods at a Glance

```typescript
// Core Operations
await taskService.createTask({ title, content, aiEnhance });
await taskService.listTasks({ status, tag });
await taskService.updateTask(id, { title, status, tags });
await taskService.deleteTask(id, { cascade, force });

// AI Operations  
await taskService.enhanceTask(id, aiOptions, streamingOptions);
await taskService.splitTask(id, aiOptions, promptOverride, streamingOptions, enableFilesystemTools);
await taskService.documentTask(id, force, aiOptions, streamingOptions);
await taskService.planTask(id, aiOptions, streamingOptions);

// Navigation
await taskService.getNextTask({ status, tag, effort, priority });
await taskService.getTaskTree(rootId);

// Tag Management
await taskService.addTags(id, tags);
await taskService.removeTags(id, tags);

// Retrieval
await taskService.getTask(id);
await taskService.getTaskContent(id);
await taskService.getTaskAIMetadata(id);
await taskService.getSubtasks(id);
```

---

## 🚨 CHAPTER 12: EMERGENCY PROTOCOLS

### RED ALERT PROCEDURES

1. **System Corruption**: Immediately cease all task operations and initiate backup restoration
2. **AI Service Outage**: Switch to manual task creation without AI enhancement
3. **Storage Failure**: Check `.task-o-matic` directory permissions and disk space
4. **Memory Overload**: Archive old tasks and clear AI metadata cache

### VAULT-TEC FINAL WORDS

Remember, Vault Dweller: The TaskService is your Strength in the harsh wasteland of project management. Use it wisely, maintain it regularly, and never underestimate the importance of proper task hygiene.

**A well-organized Vault is a surviving Vault!**

---

*Vault-Tec is not responsible for task mutations, AI rebellions, or vault failures resulting from improper TaskService usage. Please consult your Vault Overseer before implementing advanced configurations.*

**Document Classification:** TOP SECRET // VAULT-TEC PROPRIETARY  
**Manual Version:** 2.0.1  
**Last Updated:** Pre-War Era  
**Next Review:** After the bombs drop