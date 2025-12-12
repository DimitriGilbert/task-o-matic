# VAULT-TEC PERCEPTION ENHANCEMENT SYSTEM
## PRDService S.P.E.C.I.A.L. Manual v2.0.1

---

### **⚠️ VAULT-TEC SAFETY NOTICE ⚠️**
This documentation contains classified Vault-Tec proprietary information about PRD analysis systems. Unauthorized access may result in mandatory assignment to radroach counting duties.

---

## **PERCEPTION: THE EYES OF YOUR VAULT**

Welcome, Vault Dweller! You hold in your hands the **PRDService Manual** - your comprehensive guide to the **Perception** attribute of the task-o-matic S.P.E.C.I.A.L. system. Just as a skilled sniper spots threats from miles away, PRDService gives you the uncanny ability to **see**, **analyze**, and **understand** Product Requirements Documents with crystal clarity!

### **WHAT IS PRDSERVICE?**

The **PRDService** is your vault's advanced perception enhancement system that:

- **Parses Product Requirements Documents** (PRDs) with AI-powered precision
- **Extracts actionable tasks** from complex project specifications
- **Generates clarifying questions** to eliminate ambiguity
- **Improves and refines PRDs** with intelligent feedback
- **Combines multiple PRDs** into master documents
- **Creates PRDs from simple descriptions** using advanced AI

---

## **CORE PERCEPTION OPERATIONS**

### **🔍 OPERATION 1: parsePRD - THE EAGLE EYE**

The primary perception operation that transforms raw PRD data into actionable intelligence!

#### **VAULT-TEC SPECIFICATIONS**
```typescript
async parsePRD(input: {
  file: string;                           // Path to PRD file
  workingDirectory?: string;               // Current vault location
  enableFilesystemTools?: boolean;         // Enable file scanning tools
  aiOptions?: AIOptions;                   // Robobrain configuration
  promptOverride?: string;                 // Custom perception prompt
  messageOverride?: string;                // Override message
  streamingOptions?: StreamingOptions;     // Real-time feedback
  callbacks?: ProgressCallback;            // Status updates
}): Promise<PRDParseResult>
```

#### **OPERATION WORKFLOW**
1. **File Validation** - Confirms PRD file exists and is readable
2. **Vault Setup** - Ensures you're in a proper task-o-matic project
3. **PRD Storage** - Copies PRD to vault's secure storage (`.task-o-matic/prd/`)
4. **AI Analysis** - Robobrain parses and extracts tasks
5. **Task Creation** - Generates actionable tasks from PRD content
6. **Metadata Logging** - Records all AI operations for audit trails

#### **VAULT-TEC EXAMPLE**
```typescript
import { PRDService } from 'task-o-matic';

const prdService = new PRDService();

// Analyze a vault expansion PRD
const result = await prdService.parsePRD({
  file: './docs/vault-88-expansion.md',
  enableFilesystemTools: true,
  aiOptions: {
    aiProvider: 'openrouter',
    aiModel: 'anthropic/claude-3.5-sonnet'
  },
  callbacks: {
    onProgress: (update) => {
      console.log(`Perception Status: ${update.message}`);
    }
  }
});

console.log(`Tasks Identified: ${result.stats.tasksCreated}`);
console.log(`Analysis Time: ${result.stats.duration}ms`);
```

#### **PERCEPTION RESULTS**
```typescript
interface PRDParseResult {
  success: true;
  prd: {
    overview: string;           // Executive summary
    objectives: string[];       // Key objectives
    features: string[];         // Feature list
  };
  tasks: Task[];                // Extracted tasks
  stats: {
    tasksCreated: number;       // Number of tasks found
    duration: number;           // Analysis time
    aiProvider: string;         // Robobrain model used
    aiModel: string;            // Specific model
    tokenUsage?: {              // Resource consumption
      prompt: number;
      completion: number;
      total: number;
    };
    timeToFirstToken?: number;  // Response speed
    cost?: number;              // Operation cost
  };
  steps: Array<{                // Operation log
    step: string;
    status: "completed" | "failed";
    duration: number;
    details?: any;
  }>;
}
```

---

### **🤔 OPERATION 2: generateQuestions - THE CLARITY SEEKER**

When PRDs are as clear as mud, this operation generates targeted questions to eliminate ambiguity!

#### **VAULT-TEC SPECIFICATIONS**
```typescript
async generateQuestions(input: {
  file: string;                           // PRD file path
  workingDirectory?: string;               // Vault location
  enableFilesystemTools?: boolean;         // File scanning enabled
  aiOptions?: AIOptions;                   // Robobrain config
  promptOverride?: string;                 // Custom question prompt
  messageOverride?: string;                // Override message
  streamingOptions?: StreamingOptions;     // Real-time updates
  callbacks?: ProgressCallback;            // Status feedback
}): Promise<string[]>
```

#### **VAULT-TEC EXAMPLE**
```typescript
// Generate clarifying questions for a confusing PRD
const questions = await prdService.generateQuestions({
  file: './docs/unclear-requirements.md',
  aiOptions: {
    aiProvider: 'openai',
    aiModel: 'gpt-4'
  }
});

console.log('Clarifying Questions:');
questions.forEach((q, i) => {
  console.log(`${i + 1}. ${q}`);
});
```

---

### **🔧 OPERATION 3: reworkPRD - THE IMPROVEMENT ENGINE**

Transform mediocre PRDs into vault-worthy specifications with AI-powered enhancement!

#### **VAULT-TEC SPECIFICATIONS**
```typescript
async reworkPRD(input: {
  file: string;                           // Original PRD path
  feedback: string;                        // Improvement feedback
  output?: string;                         // Output file path
  workingDirectory?: string;               // Vault location
  enableFilesystemTools?: boolean;         // File scanning
  aiOptions?: AIOptions;                   // Robobrain config
  promptOverride?: string;                 // Custom prompt
  messageOverride?: string;                // Override message
  streamingOptions?: StreamingOptions;     // Real-time updates
  callbacks?: ProgressCallback;            // Status feedback
}): Promise<string>                        // Output file path
```

#### **VAULT-TEC EXAMPLE**
```typescript
// Improve a weak PRD with specific feedback
const improvedPath = await prdService.reworkPRD({
  file: './docs/weak-prd.md',
  feedback: 'Add more technical specifications, include security requirements, and define acceptance criteria for each feature.',
  output: './docs/improved-prd.md',
  aiOptions: {
    aiProvider: 'anthropic',
    aiModel: 'claude-3-opus'
  }
});

console.log(`Improved PRD saved to: ${improvedPath}`);
```

---

### **🎯 OPERATION 4: refinePRDWithQuestions - THE PRECISION ENHANCER**

The ultimate perception operation that combines question generation and PRD improvement in one seamless workflow!

#### **VAULT-TEC SPECIFICATIONS**
```typescript
async refinePRDWithQuestions(input: {
  file: string;                           // PRD file path
  questionMode: "user" | "ai";             // Who answers questions
  answers?: Record<string, string>;        // Pre-provided answers (user mode)
  questionAIOptions?: AIOptions;            // AI for answering (optional)
  workingDirectory?: string;               // Vault location
  enableFilesystemTools?: boolean;         // File scanning
  aiOptions?: AIOptions;                   // Main AI config
  streamingOptions?: StreamingOptions;     // Real-time updates
  callbacks?: ProgressCallback;            // Status feedback
}): Promise<{
  questions: string[];                     // Generated questions
  answers: Record<string, string>;         // Provided answers
  refinedPRDPath: string;                  // Improved PRD path
}>
```

#### **VAULT-TEC EXAMPLES**

**USER MODE - Vault Overseer Provides Answers:**
```typescript
const userModeResult = await prdService.refinePRDWithQuestions({
  file: './docs/vault-security-prd.md',
  questionMode: 'user',
  answers: {
    'What are the security clearance levels?': 'Level 1: Basic Access, Level 2: Restricted Areas, Level 3: Command Center',
    'What authentication methods are required?': 'Retinal scan + voice recognition + keycard'
  }
});
```

**AI MODE - Robobrain Answers Automatically:**
```typescript
const aiModeResult = await prdService.refinePRDWithQuestions({
  file: './docs/vault-automation-prd.md',
  questionMode: 'ai',
  questionAIOptions: {
    aiProvider: 'openrouter',
    aiModel: 'anthropic/claude-3.5-sonnet'
  }
});
```

---

### **📝 OPERATION 5: generatePRD - THE CREATION MATRIX**

Generate complete PRDs from simple descriptions using advanced AI perception!

#### **VAULT-TEC SPECIFICATIONS**
```typescript
async generatePRD(input: {
  description: string;                     // Project description
  outputDir?: string;                      // Output directory
  filename?: string;                       // Custom filename
  aiOptions?: AIOptions;                   // Robobrain config
  streamingOptions?: StreamingOptions;     // Real-time updates
  callbacks?: ProgressCallback;            // Status feedback
}): Promise<{
  path: string;                            // Generated file path
  content: string;                         // PRD content
  stats: {                                 // Operation stats
    duration: number;
    tokenUsage?: { prompt: number; completion: number; total: number; };
    timeToFirstToken?: number;
    cost?: number;
  };
}>
```

#### **VAULT-TEC EXAMPLE**
```typescript
const prdResult = await prdService.generatePRD({
  description: 'Build a new water purification system for Vault 88 that can handle 1000 dwellers, includes radiation filtering, and has backup power systems.',
  filename: 'water-purification-prd.md',
  outputDir: './docs/',
  aiOptions: {
    aiProvider: 'openai',
    aiModel: 'gpt-4'
  }
});

console.log(`PRD Generated: ${prdResult.path}`);
console.log(`Content Length: ${prdResult.content.length} characters`);
```

---

### **🔀 OPERATION 6: combinePRDs - THE SYNTHESIS PROTOCOL**

Merge multiple PRDs into a single master document with intelligent conflict resolution!

#### **VAULT-TEC SPECIFICATIONS**
```typescript
async combinePRDs(input: {
  prds: string[];                          // Array of PRD file paths
  originalDescription: string;             // Project context
  outputDir?: string;                      // Output directory
  filename?: string;                       // Output filename
  aiOptions?: AIOptions;                   // Robobrain config
  streamingOptions?: StreamingOptions;     // Real-time updates
  callbacks?: ProgressCallback;            // Status feedback
}): Promise<{
  path: string;                            // Combined PRD path
  content: string;                         // Merged content
  stats: {                                 // Operation stats
    duration: number;
    tokenUsage?: { prompt: number; completion: number; total: number; };
    timeToFirstToken?: number;
    cost?: number;
  };
}>
```

#### **VAULT-TEC EXAMPLE**
```typescript
const combinedResult = await prdService.combinePRDs({
  prds: [
    './docs/vault-security-prd.md',
    './docs/vault-automation-prd.md',
    './docs/vault-communications-prd.md'
  ],
  originalDescription: 'Complete Vault 88 System Upgrade Initiative',
  filename: 'vault-88-master-prd.md',
  aiOptions: {
    aiProvider: 'anthropic',
    aiModel: 'claude-3-opus'
  }
});

console.log(`Master PRD created: ${combinedResult.path}`);
```

---

## **VAULT-TEC PRO TIPS**

### **💡 PERCEPTION ENHANCEMENT #1: FILESYSTEM TOOLS**
Always enable `enableFilesystemTools: true` when possible. This gives your Robobrain access to project files, allowing it to understand context and create more accurate tasks!

### **💡 PERCEPTION ENHANCEMENT #2: CUSTOM PROMPTS**
Use `promptOverride` to tailor the AI's perception to your specific vault needs. Different projects may require different analysis approaches!

### **💡 PERCEPTION ENHANCEMENT #3: STREAMING FEEDBACK**
Enable streaming options for real-time progress updates. Large PRDs can take time to analyze, and nobody likes staring at a loading screen!

### **⚠️ RADIATION WARNING: CORRUPTED PRDS**
PRDs exposed to high radiation may become corrupted. Symptoms include:
- Inconsistent formatting
- Missing sections
- Contradictory requirements
- Gibberish text

**SOLUTION**: Use `reworkPRD` with feedback like "Fix formatting errors, resolve contradictions, and complete missing sections."

---

## **TROUBLESHOOTING: PERCEPTION PROBLEMS**

### **🚨 PROBLEM: AI PROVIDER NOT RECOGNIZED**
```
ERROR: Invalid AI provider: invalid-provider
```
**SOLUTION**: Use valid providers: 'openai', 'anthropic', 'openrouter', or custom endpoints.

### **🚨 PROBLEM: PRD FILE NOT FOUND**
```
ERROR: PRD file not found: ./nonexistent/prd.md
```
**SOLUTION**: Verify file path exists and is readable. Check for feral ghoul interference with your file system!

### **🚨 PROBLEM: NOT A TASK-O-MATIC PROJECT**
```
ERROR: Not a task-o-matic project. Run 'task-o-matic init init' first.
```
**SOLUTION**: Initialize your vault project first! PRDService requires a proper task-o-matic environment.

### **🚨 PROBLEM: NO TASKS EXTRACTED**
**SOLUTION**: The PRD may be too vague or poorly structured. Try:
1. Using `generateQuestions` to identify gaps
2. Using `reworkPRD` to improve clarity
3. Enabling filesystem tools for better context

### **🚨 PROBLEM: AI MODEL TIMEOUT**
**SOLUTION**: Large PRDs may timeout slower models. Try:
1. Using faster models (Claude 3.5 Sonnet)
2. Breaking large PRDs into smaller sections
3. Increasing timeout in streaming options

---

## **ADVANCED PERCEPTION TECHNIQUES**

### **🎯 MULTI-PRD ANALYSIS**
Analyze multiple related PRDs in sequence:
```typescript
const prds = ['./security.md', './automation.md', './power.md'];
const results = [];

for (const prd of prds) {
  const result = await prdService.parsePRD({
    file: prd,
    enableFilesystemTools: true,
    aiOptions: { aiProvider: 'anthropic', aiModel: 'claude-3.5-sonnet' }
  });
  results.push(result);
}

// Combine all tasks
const allTasks = results.flatMap(r => r.tasks);
console.log(`Total tasks across all PRDs: ${allTasks.length}`);
```

### **🔄 ITERATIVE PRD IMPROVEMENT**
Continuously improve PRDs through multiple refinement cycles:
```typescript
let currentPRD = './draft-prd.md';
let improvementCount = 0;

while (improvementCount < 3) {
  const questions = await prdService.generateQuestions({
    file: currentPRD
  });
  
  if (questions.length === 0) break; // PRD is clear enough
  
  const result = await prdService.refinePRDWithQuestions({
    file: currentPRD,
    questionMode: 'ai'
  });
  
  currentPRD = result.refinedPRDPath;
  improvementCount++;
  
  console.log(`Improvement ${improvementCount}: ${questions.length} questions addressed`);
}
```

### **📊 PRD QUALITY METRICS**
Track PRD quality over time:
```typescript
const qualityMetrics = {
  totalPRDs: 0,
  averageTasksPerPRD: 0,
  averageAnalysisTime: 0,
  improvementCycles: []
};

// After each parsePRD call
qualityMetrics.totalPRDs++;
qualityMetrics.averageTasksPerPRD = 
  (qualityMetrics.averageTasksPerPRD * (qualityMetrics.totalPRDs - 1) + result.stats.tasksCreated) 
  / qualityMetrics.totalPRDs;
```

---

## **VAULT-TEC INTEGRATION EXAMPLES**

### **🏭 COMPLETE WORKFLOW INTEGRATION**
```typescript
import { PRDService, TaskService } from 'task-o-matic';

class VaultProjectManager {
  private prdService = new PRDService();
  private taskService = new TaskService();
  
  async initializeVaultProject(prdPath: string) {
    console.log('🔍 Analyzing PRD with enhanced perception...');
    
    // Step 1: Parse the PRD
    const prdResult = await this.prdService.parsePRD({
      file: prdPath,
      enableFilesystemTools: true,
      aiOptions: {
        aiProvider: 'openrouter',
        aiModel: 'anthropic/claude-3.5-sonnet'
      }
    });
    
    console.log(`📋 Extracted ${prdResult.stats.tasksCreated} tasks`);
    
    // Step 2: Plan each task
    for (const task of prdResult.tasks) {
      console.log(`🎯 Planning task: ${task.title}`);
      const plan = await this.taskService.planTask(task.id, {
        includeContext: true,
        focus: 'implementation'
      });
      
      console.log(`✅ Plan ready: ${plan.plan.substring(0, 100)}...`);
    }
    
    return {
      prdAnalysis: prdResult,
      totalTasks: prdResult.tasks.length,
      analysisTime: prdResult.stats.duration
    };
  }
}
```

---

## **PERFORMANCE OPTIMIZATION**

### **⚡ SPEED ENHANCEMENTS**
- **Use Claude 3.5 Sonnet** for fastest PRD parsing
- **Enable filesystem tools** only when needed
- **Cache PRD analysis** results for repeated operations
- **Use streaming options** for better user experience

### **💰 COST OPTIMIZATION**
- **Benchmark different models** for cost/quality tradeoffs
- **Use prompt overrides** to reduce token usage
- **Batch multiple PRDs** when using combinePRDs
- **Monitor token usage** in stats to control costs

---

## **OPEN QUESTIONS / TODO**

- [ ] Add support for PRD templates for common vault projects
- [ ] Implement PRD versioning and change tracking
- [ ] Add PRD quality scoring algorithm
- [ ] Create PRD validation against vault standards
- [ ] Add support for PRD export to multiple formats (PDF, DOCX)
- [ ] Implement PRD collaboration features for multiple overseers

---

## **VAULT-TEC MAINTENANCE SCHEDULE**

### **WEEKLY MAINTENANCE**
- Clean up old PRD files in `.task-o-matic/prd/`
- Review AI model performance metrics
- Update AI provider configurations

### **MONTHLY MAINTENANCE**
- Benchmark new AI models for PRD analysis
- Review and update PRD templates
- Audit PRD quality metrics

### **QUARTERLY MAINTENANCE**
- Full system performance review
- Update perception algorithms
- Review and update documentation

---

### **🏁 VAULT-TEC PERCEPTION MOTTO**
*"In the fog of project requirements, PRDService is your night vision. See clearly, plan wisely, execute perfectly!"*

---

**© 2077 Vault-Tec Corporation** - *Enhancing Perception for Better Project Outcomes*

*Manual Revision: 2.0.1*  
*Classification: Vault-Tec Internal Use Only*  
*Attribute: Perception (P)*  
*System: task-o-matic S.P.E.C.I.A.L.*