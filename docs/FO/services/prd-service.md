## TECHNICAL BULLETIN NO. 003
### PRD SERVICE - PRODUCT REQUIREMENTS SURVIVAL SYSTEM

**DOCUMENT ID:** `task-o-matic-prd-v2`  
**CLEARANCE:** `All Personnel`  
**MANDATORY COMPLIANCE:** `Yes`

### ⚠️ CRITICAL SURVIVAL NOTICE
Citizen, PRDService is your blueprint for survival in the post-deadline wasteland. Without proper PRD management, your projects will wander aimlessly like lost scavengers in the radioactive fog. This service transforms vague ideas into actionable specifications and structured tasks, reverse-engineers plans from existing codebases, and suggests technology stacks when you're lost in the wilderness.

### SYSTEM ARCHITECTURE OVERVIEW

The PRDService serves as the central hub for Product Requirements Document management, providing AI-powered analysis, task extraction, document refinement, stack suggestion, and codebase reverse-engineering capabilities. It bridges the gap between high-level product vision and concrete implementation tasks.

**Core Dependencies:**
- **Storage Layer**: Local file-based storage for PRDs and tasks
- **AI Operations**: Vercel AI SDK integration for PRD processing
- **ConfigManager**: Project configuration and working directory management
- **Validation**: Input validation and error handling
- **File Utils**: File operations and path management
- **Project Analysis Service**: Codebase analysis for reverse-engineering PRDs

**Service Capabilities:**
1. **PRD Parsing**: Extract tasks from existing PRD documents
2. **PRD Generation**: Create PRDs from descriptions
3. **PRD Refinement**: Improve PRDs based on feedback
4. **Question Generation**: Generate clarifying questions
5. **Multi-Model Support**: Generate PRDs with different AI models
6. **PRD Combination**: Merge multiple PRDs into master document
7. **Stack Suggestion**: Recommend technology stacks based on PRD analysis
8. **Codebase Reverse-Engineering**: Generate PRDs from existing projects
9. **PRD Versioning**: Track PRD evolution over time

---

### COMPLETE API DOCUMENTATION

#### CONSTRUCTOR

```typescript
constructor(dependencies: PRDServiceDependencies = {})
```

**Parameters:**
- `dependencies` (PRDServiceDependencies, optional): Dependency injection object for testing
  - `storage` (Storage, optional): Storage layer instance
  - `aiOperations` (AIOperations, optional): AI service instance

**Returns:** PRDService instance

**Error Conditions:** None - constructor never throws

**Example: Basic Initialization**
```typescript
import { PRDService } from "task-o-matic-core";

// Default initialization
const prdService = new PRDService();
```

**Example: Test Configuration**
```typescript
// For testing with mocked dependencies
const mockStorage = createMockStorage();
const mockAI = createMockAI();
const prdService = new PRDService({
  storage: mockStorage,
  aiOperations: mockAI
});
```

---

#### parsePRD

```typescript
async parsePRD(input: {
  file: string;
  workingDirectory?: string;
  enableFilesystemTools?: boolean;
  aiOptions?: AIOptions;
  promptOverride?: string;
  messageOverride?: string;
  streamingOptions?: StreamingOptions;
  callbacks?: ProgressCallback;
}): Promise<PRDParseResult>
```

**Parameters:**
- `input.file` (string, required): Path to PRD file to parse
- `input.workingDirectory` (string, optional): Working directory for context
- `input.enableFilesystemTools` (boolean, optional): Enable filesystem analysis
- `input.aiOptions` (AIOptions, optional): AI configuration override
- `input.promptOverride` (string, optional): Custom prompt for parsing
- `input.messageOverride` (string, optional): Custom message override
- `input.streamingOptions` (StreamingOptions, optional): Streaming callbacks
- `input.callbacks` (ProgressCallback, optional): Progress event handlers

**Returns:** PRDParseResult containing:
- `success` (boolean): Operation success status
- `prd` (object): Parsed PRD structure
  - `overview` (string): PRD overview/summary
  - `objectives` (array): Project objectives
  - `features` (array): Feature list
- `tasks` (Task[]): Array of extracted tasks
- `stats` (object): Parsing statistics
  - `tasksCreated` (number): Number of tasks created
  - `duration` (number): Parsing duration in ms
  - `aiProvider` (string): AI provider used
  - `aiModel` (string): AI model used
  - `tokenUsage` (object, optional): Token usage statistics
  - `timeToFirstToken` (number, optional): Time to first token
  - `cost` (number, optional): Calculated cost
- `steps` (array): Array of step results
  - `step` (string): Step name
  - `status` ("completed" | "failed"): Step status
  - `duration` (number): Step duration
  - `details` (any, optional): Step-specific details

**Error Conditions:**
- `TaskOMaticError`: File not found, not a task-o-matic project, AI operation failures
- `Error`: Input validation failures

**Example: Basic PRD Parsing**
```typescript
const result = await prdService.parsePRD({
  file: "./product-requirements.md",
  callbacks: {
    onProgress: (event) => console.log(event.message)
  }
});

console.log(`Parsed ${result.stats.tasksCreated} tasks from PRD`);
result.tasks.forEach(task => {
  console.log(`- ${task.title} (${task.estimatedEffort})`);
});
```

**Example: Enhanced PRD Parsing with Filesystem Tools**
```typescript
const result = await prdService.parsePRD({
  file: "./ecommerce-prd.md",
  workingDirectory: "/path/to/project",
  enableFilesystemTools: true,
  aiOptions: {
    aiProvider: "anthropic",
    aiModel: "claude-3-5-sonnet"
  },
  streamingOptions: {
    onChunk: (chunk) => process.stdout.write(chunk),
    onFinish: (result) => console.log("\nParsing complete!")
  },
  callbacks: {
    onProgress: (event) => {
      if (event.type === 'progress') {
        console.log(`[${event.current}/${event.total}] ${event.message}`);
      }
    }
  }
});

console.log(`Parsing completed in ${result.stats.duration}ms`);
console.log(`Token usage: ${result.stats.tokenUsage?.total || 0} tokens`);
```

---

#### generateQuestions

```typescript
async generateQuestions(input: {
  file: string;
  workingDirectory?: string;
  enableFilesystemTools?: boolean;
  aiOptions?: AIOptions;
  promptOverride?: string;
  messageOverride?: string;
  streamingOptions?: StreamingOptions;
  callbacks?: ProgressCallback;
}): Promise<string[]>
```

**Parameters:**
- `input.file` (string, required): Path to PRD file
- `input.workingDirectory` (string, optional): Working directory for context
- `input.enableFilesystemTools` (boolean, optional): Enable filesystem analysis
- `input.aiOptions` (AIOptions, optional): AI configuration override
- `input.promptOverride` (string, optional): Custom prompt
- `input.messageOverride` (string, optional): Custom message override
- `input.streamingOptions` (StreamingOptions, optional): Streaming callbacks
- `input.callbacks` (ProgressCallback, optional): Progress handlers

**Returns:** Array of generated questions

**Error Conditions:**
- `TaskOMaticError`: File not found, AI operation failures
- `Error`: Input validation failures

**Example: Generate Clarifying Questions**
```typescript
const questions = await prdService.generateQuestions({
  file: "./vague-prd.md",
  workingDirectory: "/path/to/project",
  enableFilesystemTools: true,
  aiOptions: {
    aiProvider: "anthropic",
    aiModel: "claude-3-5-sonnet"
  },
  callbacks: {
    onProgress: (event) => console.log(event.message)
  }
});

console.log(`Generated ${questions.length} clarifying questions:`);
questions.forEach((question, index) => {
  console.log(`${index + 1}. ${question}`);
});
```

---

#### reworkPRD

```typescript
async reworkPRD(input: {
  file: string;
  feedback: string;
  output?: string;
  workingDirectory?: string;
  enableFilesystemTools?: boolean;
  aiOptions?: AIOptions;
  promptOverride?: string;
  messageOverride?: string;
  streamingOptions?: StreamingOptions;
  callbacks?: ProgressCallback;
}): Promise<string>
```

**Parameters:**
- `input.file` (string, required): Path to original PRD file
- `input.feedback` (string, required): User feedback for improvements
- `input.output` (string, optional): Output file path (defaults to input file)
- `input.workingDirectory` (string, optional): Working directory for context
- `input.enableFilesystemTools` (boolean, optional): Enable filesystem analysis
- `input.aiOptions` (AIOptions, optional): AI configuration override
- `input.promptOverride` (string, optional): Custom prompt
- `input.messageOverride` (string, optional): Custom message override
- `input.streamingOptions` (StreamingOptions, optional): Streaming callbacks
- `input.callbacks` (ProgressCallback, optional): Progress handlers

**Returns:** Path to the reworked PRD file

**Error Conditions:**
- `TaskOMaticError`: File not found, AI operation failures
- `Error`: Input validation failures

**Example: Basic PRD Rework**
```typescript
const outputPath = await prdService.reworkPRD({
  file: "./original-prd.md",
  feedback: "Add more technical specifications, API details, and security considerations. Include performance requirements.",
  aiOptions: {
    aiProvider: "anthropic",
    aiModel: "claude-3-5-sonnet"
  },
  callbacks: {
    onProgress: (event) => console.log(event.message)
  }
});

console.log(`Reworked PRD saved to: ${outputPath}`);
```

---

#### refinePRDWithQuestions

```typescript
async refinePRDWithQuestions(input: {
  file: string;
  questionMode: "user" | "ai";
  answers?: Record<string, string>;
  questionAIOptions?: AIOptions;
  workingDirectory?: string;
  enableFilesystemTools?: boolean;
  aiOptions?: AIOptions;
  streamingOptions?: StreamingOptions;
  callbacks?: ProgressCallback;
}): Promise<{
  questions: string[];
  answers: Record<string, string>;
  refinedPRDPath: string;
}>
```

**Parameters:**
- `input.file` (string, required): Path to PRD file
- `input.questionMode` ("user" | "ai", required): Question answering mode
  - "user": CLI prompts user for answers
  - "ai": AI answers questions automatically
- `input.answers` (Record<string, string>, optional): Pre-provided answers (user mode)
- `input.questionAIOptions` (AIOptions, optional): AI config for answering questions
- `input.workingDirectory` (string, optional): Working directory for context
- `input.enableFilesystemTools` (boolean, optional): Enable filesystem analysis
- `input.aiOptions` (AIOptions, optional): Main AI configuration
- `input.streamingOptions` (StreamingOptions, optional): Streaming callbacks
- `input.callbacks` (ProgressCallback, optional): Progress handlers

**Returns:** Object containing:
- `questions` (string[]): Generated questions
- `answers` (Record<string, string>): Question answers
- `refinedPRDPath` (string): Path to refined PRD

**Error Conditions:**
- `TaskOMaticError`: File not found, missing answers in user mode, AI operation failures
- `Error`: Input validation failures

**Example: AI-Answered Questions**
```typescript
const result = await prdService.refinePRDWithQuestions({
  file: "./incomplete-prd.md",
  questionMode: "ai",
  questionAIOptions: {
    aiProvider: "anthropic",
    aiModel: "claude-3-5-sonnet"
  },
  aiOptions: {
    aiProvider: "openai",
    aiModel: "gpt-4"
  },
  callbacks: {
    onProgress: (event) => console.log(event.message)
  }
});

console.log(`Generated ${result.questions.length} questions`);
console.log(`Refined PRD saved to: ${result.refinedPRDPath}`);
```

---

#### generatePRD

```typescript
async generatePRD(input: {
  description: string;
  outputDir?: string;
  filename?: string;
  aiOptions?: AIOptions;
  streamingOptions?: StreamingOptions;
  callbacks?: ProgressCallback;
}): Promise<{
  path: string;
  content: string;
  stats: {
    duration: number;
    tokenUsage?: { prompt: number; completion: number; total: number };
    timeToFirstToken?: number;
    cost?: number;
  };
}>
```

**Parameters:**
- `input.description` (string, required): Project description
- `input.outputDir` (string, optional): Output directory (defaults to current directory)
- `input.filename` (string, optional): Output filename (defaults to "prd.md")
- `input.aiOptions` (AIOptions, optional): AI configuration override
- `input.streamingOptions` (StreamingOptions, optional): Streaming callbacks
- `input.callbacks` (ProgressCallback, optional): Progress handlers

**Returns:** Object containing:
- `path` (string): Path to generated PRD file
- `content` (string): Generated PRD content
- `stats` (object): Generation statistics
  - `duration` (number): Generation duration in ms
  - `tokenUsage` (object, optional): Token usage statistics
  - `timeToFirstToken` (number, optional): Time to first token
  - `cost` (number, optional): Calculated cost

**Error Conditions:**
- `TaskOMaticError`: AI operation failures
- `Error`: Input validation failures

**Example: Basic PRD Generation**
```typescript
const result = await prdService.generatePRD({
  description: "A mobile app for fitness tracking with social features and workout plans",
  aiOptions: {
    aiProvider: "anthropic",
    aiModel: "claude-3-5-sonnet"
  },
  callbacks: {
    onProgress: (event) => console.log(event.message)
  }
});

console.log(`PRD generated and saved to: ${result.path}`);
console.log(`Generation took ${result.stats.duration}ms`);
```

---

#### combinePRDs

```typescript
async combinePRDs(input: {
  prds: string[];
  originalDescription: string;
  outputDir?: string;
  filename?: string;
  aiOptions?: AIOptions;
  streamingOptions?: StreamingOptions;
  callbacks?: ProgressCallback;
}): Promise<{
  path: string;
  content: string;
  stats: {
    duration: number;
    tokenUsage?: { prompt: number; completion: number; total: number };
    timeToFirstToken?: number;
    cost?: number;
  };
}>
```

**Parameters:**
- `input.prds` (string[], required): Array of PRD **content strings** (not file paths)
- `input.originalDescription` (string, required): Original project description
- `input.outputDir` (string, optional): Output directory
- `input.filename` (string, optional): Output filename (defaults to "prd-master.md")
- `input.aiOptions` (AIOptions, optional): AI configuration override
- `input.streamingOptions` (StreamingOptions, optional): Streaming callbacks
- `input.callbacks` (ProgressCallback, optional): Progress handlers

**Returns:** Object containing:
- `path` (string): Path to combined PRD file
- `content` (string): Combined PRD content
- `stats` (object): Combination statistics
  - `duration` (number): Combination duration in ms
  - `tokenUsage` (object, optional): Token usage statistics
  - `timeToFirstToken` (number, optional): Time to first token
  - `cost` (number, optional): Calculated cost

**Error Conditions:**
- `TaskOMaticError`: AI operation failures
- `Error`: Input validation failures

**Example: Combine Multiple PRDs**
```typescript
const prdContents = [
  await fs.readFile("./prd-claude.md", "utf-8"),
  await fs.readFile("./prd-gpt4.md", "utf-8"),
  await fs.readFile("./prd-gemini.md", "utf-8")
];

const result = await prdService.combinePRDs({
  prds: prdContents,  // Pass content strings, not file paths
  originalDescription: "Multi-platform task management application",
  filename: "master-prd.md",
  outputDir: "./final",
  aiOptions: {
    aiProvider: "anthropic",
    aiModel: "claude-3-5-sonnet"
  },
  callbacks: {
    onProgress: (event) => console.log(event.message)
  }
});

console.log(`Combined PRD saved to: ${result.path}`);
```

---

#### suggestStack

```typescript
async suggestStack(input: {
  file?: string;
  content?: string;
  projectName?: string;
  output?: string;
  workingDirectory?: string;
  enableFilesystemTools?: boolean;
  save?: boolean;
  aiOptions?: AIOptions;
  promptOverride?: string;
  messageOverride?: string;
  streamingOptions?: StreamingOptions;
  callbacks?: ProgressCallback;
}): Promise<SuggestStackResult>
```

**Parameters:**
- `input.file` (string, optional): Path to PRD file (mutually exclusive with content)
- `input.content` (string, optional): PRD content as string (mutually exclusive with file)
- `input.projectName` (string, optional): Project name for context
- `input.output` (string, optional): Output file path for stack configuration
- `input.workingDirectory` (string, optional): Working directory
- `input.enableFilesystemTools` (boolean, optional): Enable filesystem analysis
- `input.save` (boolean, optional): Save stack to `.task-o-matic/stack.json`
- `input.aiOptions` (AIOptions, optional): AI configuration override
- `input.promptOverride` (string, optional): Custom prompt
- `input.messageOverride` (string, optional): Custom message override
- `input.streamingOptions` (StreamingOptions, optional): Streaming callbacks
- `input.callbacks` (ProgressCallback, optional): Progress handlers

**Returns:** SuggestStackResult containing:
- `success` (boolean): Operation success status
- `stack` (object): Suggested technology stack configuration
  - `frontend` (string): Frontend framework recommendation
  - `backend` (string): Backend framework recommendation
  - `database` (string): Database recommendation
  - `orm` (string): ORM recommendation
  - `auth` (string): Authentication solution recommendation
  - Additional stack-specific fields
- `reasoning` (string): AI reasoning for stack choices
- `savedPath` (string, optional): Path where stack was saved
- `stats` (object): Analysis statistics
  - `duration` (number): Analysis duration in ms
  - `tokenUsage` (object, optional): Token usage statistics
  - `timeToFirstToken` (number, optional): Time to first token
  - `cost` (number, optional): Calculated cost

**Error Conditions:**
- `TaskOMaticError`: Both file and content specified, neither specified, AI operation failures
- `Error`: Input validation failures

**Example: Suggest Stack from PRD File**
```typescript
const result = await prdService.suggestStack({
  file: "./my-project-prd.md",
  projectName: "my-shelter-manager",
  save: true,  // Save to .task-o-matic/stack.json
  aiOptions: {
    aiProvider: "anthropic",
    aiModel: "claude-3-5-sonnet"
  },
  callbacks: {
    onProgress: (event) => console.log(event.message)
  }
});

console.log("Suggested stack:", result.stack);
console.log("Reasoning:", result.reasoning);
console.log("Saved to:", result.savedPath);
```

**Example: Suggest Stack from Content**
```typescript
const result = await prdService.suggestStack({
  content: "A real-time collaboration platform with video conferencing and file sharing...",
  projectName: "collaboration-hub",
  output: "./stack-suggestion.json",
  aiOptions: {
    aiProvider: "anthropic",
    aiModel: "claude-3-5-sonnet"
  },
  callbacks: {
    onProgress: (event) => console.log(event.message)
  }
});

console.log(`Stack suggestion saved to: ${result.savedPath}`);
```

---

#### generateFromCodebase

```typescript
async generateFromCodebase(input: {
  workingDirectory?: string;
  outputFile?: string;
  aiOptions?: AIOptions;
  streamingOptions?: StreamingOptions;
  callbacks?: ProgressCallback;
  enableFilesystemTools?: boolean;
  analysisResult?: ProjectAnalysisResult;
}): Promise<PRDFromCodebaseResult>
```

**Parameters:**
- `input.workingDirectory` (string, optional): Working directory (defaults to current directory)
- `input.outputFile` (string, optional): Output filename (defaults to "current-state.md")
- `input.aiOptions` (AIOptions, optional): AI configuration override
- `input.streamingOptions` (StreamingOptions, optional): Streaming callbacks
- `input.callbacks` (ProgressCallback, optional): Progress handlers
- `input.enableFilesystemTools` (boolean, optional): Enable filesystem analysis
- `input.analysisResult` (ProjectAnalysisResult, optional): Pre-computed analysis result (skips analysis step)

**Returns:** PRDFromCodebaseResult containing:
- `success` (boolean): Operation success status
- `prdPath` (string): Path to generated PRD file
- `content` (string): Generated PRD content
- `analysis` (ProjectAnalysis): Full project analysis results
  - `projectName` (string): Detected project name
  - `description` (string): Project description
  - `stack` (DetectedStack): Technology stack
  - `structure` (ProjectStructure): Project structure
  - `existingFeatures` (DetectedFeature[]): Detected features
  - `documentation` (DocumentationFile[]): Documentation files
  - `todos` (CodeComment[]): TODO/FIXME comments
- `stats` (object): Generation statistics
  - `duration` (number): Generation duration in ms
  - `tokenUsage` (object, optional): Token usage statistics
  - `timeToFirstToken` (number, optional): Time to first token
  - `cost` (number, optional): Calculated cost

**Error Conditions:**
- `TaskOMaticError`: Project analysis failed, AI operation failures
- `Error`: Input validation failures

**Example: Generate PRD from Existing Codebase**
```typescript
const result = await prdService.generateFromCodebase({
  workingDirectory: "/path/to/existing/project",
  outputFile: "reverse-engineered-prd.md",
  enableFilesystemTools: true,
  aiOptions: {
    aiProvider: "anthropic",
    aiModel: "claude-3-5-sonnet"
  },
  callbacks: {
    onProgress: (event) => console.log(event.message)
  }
});

console.log(`PRD generated from codebase: ${result.prdPath}`);
console.log(`Detected stack:`, result.analysis.stack);
console.log(`Detected ${result.analysis.existingFeatures.length} features`);
```

**Example: Generate PRD with Pre-computed Analysis**
```typescript
// First, analyze the project separately
const analysisService = getProjectAnalysisService();
const analysisResult = await analysisService.analyzeProject("/path/to/project");

// Then generate PRD using that analysis
const result = await prdService.generateFromCodebase({
  analysisResult: analysisResult,
  outputFile: "optimized-prd.md",
  aiOptions: {
    aiProvider: "anthropic",
    aiModel: "claude-3-5-sonnet"
  },
  callbacks: {
    onProgress: (event) => console.log(event.message)
  }
});

console.log(`PRD generated using existing analysis`);
```

---

#### createVersion

```typescript
async createVersion(input: {
  file: string;
  message?: string;
  changes?: PRDChange[];
  implementedTasks?: string[];
  workingDirectory?: string;
}): Promise<PRDVersion>
```

**Parameters:**
- `input.file` (string, required): Path to PRD file to version
- `input.message` (string, optional): Version message/description
- `input.changes` (PRDChange[], optional): Array of change descriptions
  - Each change includes: `type` (add, modify, remove), `section`, `description`
- `input.implementedTasks` (string[], optional): IDs of tasks implemented in this version
- `input.workingDirectory` (string, optional): Working directory

**Returns:** PRDVersion containing:
- `version` (number): Version number (auto-incremented)
- `content` (string): PRD content at this version
- `createdAt` (number): Timestamp when version was created
- `changes` (PRDChange[]): Change log for this version
- `implementedTasks` (string[]): Tasks implemented in this version
- `message` (string, optional): Version message
- `prdFile` (string): Relative path to PRD file

**Error Conditions:**
- `TaskOMaticError`: File not found
- `Error`: Input validation failures

**Example: Create Version Snapshot**
```typescript
const version = await prdService.createVersion({
  file: "./requirements.md",
  message: "Added emergency response section",
  changes: [
    { type: "add", section: "Emergency Protocols", description: "Added new emergency response procedures" },
    { type: "modify", section: "Security", description: "Enhanced biometric authentication requirements" }
  ],
  implementedTasks: ["task-123", "task-456", "task-789"]
});

console.log(`Created version ${version.version} at ${new Date(version.createdAt).toISOString()}`);
console.log(`Changes: ${version.changes.length}`);
console.log(`Implemented tasks: ${version.implementedTasks.length}`);
```

**Example: Quick Version Snapshot**
```typescript
const version = await prdService.createVersion({
  file: "./requirements.md",
  message: "Pre-deployment checkpoint"
});

console.log(`Version ${version.version} created`);
```

---

#### getHistory

```typescript
async getHistory(input: {
  file: string;
  workingDirectory?: string;
}): Promise<PRDVersion[]>
```

**Parameters:**
- `input.file` (string, required): Path to PRD file
- `input.workingDirectory` (string, optional): Working directory

**Returns:** Array of PRDVersion objects containing:
- `version` (number): Version number
- `content` (string): PRD content at this version
- `createdAt` (number): Timestamp
- `changes` (PRDChange[]): Change log
- `implementedTasks` (string[]): Tasks implemented
- `message` (string, optional): Version message
- `prdFile` (string): Relative path to PRD file

**Error Conditions:**
- Returns empty array if no versions exist
- `TaskOMaticError`: File not found

**Example: Get PRD Version History**
```typescript
const history = await prdService.getHistory({
  file: "./requirements.md"
});

console.log(`Found ${history.length} versions:`);
history.forEach((version) => {
  console.log(`\nVersion ${version.number}: ${version.message || 'No message'}`);
  console.log(`  Created: ${new Date(version.createdAt).toISOString()}`);
  console.log(`  Changes: ${version.changes.length}`);
  console.log(`  Implemented tasks: ${version.implementedTasks.length}`);
  
  version.changes.forEach(change => {
    console.log(`    - [${change.type}] ${change.section}: ${change.description || 'N/A'}`);
  });
});
```

**Example: Track PRD Evolution**
```typescript
const history = await prdService.getHistory({ file: "./requirements.md" });

const implementedTasks = new Set<string>();
history.forEach(version => {
  version.implementedTasks.forEach(taskId => implementedTasks.add(taskId));
});

console.log(`Total unique tasks implemented across ${history.length} versions: ${implementedTasks.size}`);
console.log(`Latest version: ${history[history.length - 1].version}`);
```

---

### INTEGRATION PROTOCOLS

**Progress Callback Interface:**
```typescript
interface ProgressCallback {
  onProgress?: (event: {
    type: "started" | "progress" | "completed" | "info" | "stream-chunk" | "reasoning-chunk";
    message?: string;
    current?: number;
    total?: number;
  }) => void;
  onError?: (error: Error) => void;
}
```

**AI Configuration Integration:**
All methods support AI configuration overrides:
```typescript
interface AIOptions {
  aiProvider?: string;        // "openai" | "anthropic" | "openrouter" | custom
  aiModel?: string;          // Model name (e.g., "claude-3-5-sonnet")
  aiKey?: string;            // API key override
  aiProviderUrl?: string;     // Custom provider URL
  models?: Array<{provider, model, aiKey}>;  // Multi-AI generation
  combineAI?: {provider, model, aiKey};      // Combination AI for multi-model
}
```

**File System Integration:**
- Automatic PRD directory creation in `.task-o-matic/prd/`
- Relative path handling for project portability
- File validation and error handling
- PRD versioning in `.task-o-matic/prd/versions/`

**Project Analysis Integration:**
- Automatic stack detection from existing codebase
- Feature extraction from source code
- Documentation parsing
- TODO/FIXME comment detection
- File structure analysis

---

### SURVIVAL SCENARIOS

**Scenario 1: Complete PRD Workflow**
```typescript
// Step 1: Generate initial PRD
const initialResult = await prdService.generatePRD({
  description: "Real-time collaboration platform for remote teams",
  aiOptions: { aiProvider: "anthropic", aiModel: "claude-3-5-sonnet" },
  filename: "initial-prd.md"
});

// Step 2: Generate clarifying questions
const questions = await prdService.generateQuestions({
  file: initialResult.path,
  enableFilesystemTools: true
});

// Step 3: Refine with AI answers
const refinedResult = await prdService.refinePRDWithQuestions({
  file: initialResult.path,
  questionMode: "ai",
  questionAIOptions: { aiProvider: "openai", aiModel: "gpt-4" }
});

// Step 4: Parse into tasks
const parsedResult = await prdService.parsePRD({
  file: refinedResult.refinedPRDPath,
  enableFilesystemTools: true,
  aiOptions: { aiProvider: "anthropic", aiModel: "claude-3-5-sonnet" }
});

console.log(`Complete workflow: ${parsedResult.stats.tasksCreated} tasks created`);
```

**Scenario 2: Reverse-Engineering Existing Project**
```typescript
// Step 1: Generate PRD from existing codebase
const generatedResult = await prdService.generateFromCodebase({
  workingDirectory: "/path/to/existing/project",
  outputFile: "current-state-prd.md",
  enableFilesystemTools: true,
  aiOptions: { aiProvider: "anthropic", aiModel: "claude-3-5-sonnet" }
});

console.log("Analyzed stack:", generatedResult.analysis.stack);
console.log(`Detected ${generatedResult.analysis.existingFeatures.length} features`);

// Step 2: Create version snapshot
const version = await prdService.createVersion({
  file: generatedResult.prdPath,
  message: "Initial reverse-engineering from existing codebase"
});

console.log(`Created version ${version.version}`);
```

**Scenario 3: Multi-Model PRD Generation and Combination**
```typescript
// Generate PRDs with different models
const models = [
  { provider: "anthropic", model: "claude-3-5-sonnet" },
  { provider: "openai", model: "gpt-4" },
  { provider: "openrouter", model: "anthropic/claude-3-opus" }
];

const prdResults = await Promise.all(
  models.map(async (model) => {
    return await prdService.generatePRD({
      description: "AI-powered code review platform",
      aiOptions: model
    });
  })
);

// Combine into master PRD
const masterResult = await prdService.combinePRDs({
  prds: prdResults.map(r => r.content),  // Content strings
  originalDescription: "AI-powered code review platform",
  filename: "master-prd.md",
  aiOptions: { provider: "anthropic", model: "claude-3-5-sonnet" }
});

console.log(`Combined ${prdResults.length} PRDs into master document`);
```

**Scenario 4: Technology Stack Recommendation**
```typescript
// Analyze PRD and recommend stack
const stackResult = await prdService.suggestStack({
  file: "./ecommerce-prd.md",
  projectName: "bunker-supplies-store",
  save: true,  // Save to .task-o-matic/stack.json
  aiOptions: { aiProvider: "anthropic", aiModel: "claude-3-5-sonnet" }
});

console.log("Recommended stack:", JSON.stringify(stackResult.stack, null, 2));
console.log("\nAI Reasoning:");
console.log(stackResult.reasoning);

console.log("\nStack saved to:", stackResult.savedPath);
```

**Scenario 5: Iterative PRD Refinement with Versioning**
```typescript
let currentPRD = "./draft-prd.md";
const feedback = [
  "Add security requirements and compliance considerations",
  "Include performance benchmarks and scalability targets",
  "Detail user experience and accessibility requirements"
];

for (let i = 0; i < feedback.length; i++) {
  console.log(`Refinement iteration ${i + 1}: ${feedback[i]}`);
  
  currentPRD = await prdService.reworkPRD({
    file: currentPRD,
    feedback: feedback[i],
    output: `prd-refined-v${i + 1}.md`,
    aiOptions: {
      aiProvider: "anthropic",
      aiModel: "claude-3-5-sonnet"
    },
    streamingOptions: {
      onChunk: (chunk) => process.stdout.write(chunk)
    }
  });
  
  // Create version after each iteration
  await prdService.createVersion({
    file: currentPRD,
    message: `Refinement iteration ${i + 1}: ${feedback[i]}`,
    changes: [
      { type: "modify", section: "Requirements", description: feedback[i] }
    ]
  });
  
  console.log(`Refinement ${i + 1} complete: ${currentPRD}`);
}

// View version history
const history = await prdService.getHistory({ file: currentPRD });
console.log(`\nVersion history: ${history.length} versions created`);
```

---

### TECHNICAL SPECIFICATIONS

**PRD File Structure:**
```markdown
# Project Title

## Overview
Brief project description and goals

## Objectives
- Primary objective 1
- Primary objective 2

## Features
### Core Features
- Feature 1 description
- Feature 2 description

### Technical Requirements
- Technical requirement 1
- Technical requirement 2

## User Stories
As a [user type], I want [feature] so that [benefit].

## Acceptance Criteria
- Criteria 1
- Criteria 2

## Technical Considerations
- Performance requirements
- Security requirements
- Scalability considerations
```

**PRD Versioning Structure:**
```
.task-o-matic/prd/versions/
├── v1.json
├── v2.json
└── v3.json
```

Each version file contains:
- Full PRD content
- Creation timestamp
- Change log
- Implemented task IDs
- Version message

**Stack Detection Capabilities:**
- **Languages**: JavaScript, TypeScript, Python, Go, Rust, Java
- **Frameworks**: Next.js, React, Vue, Svelte, Express, Hono, FastAPI, Django
- **Databases**: PostgreSQL, MongoDB, SQLite, MySQL
- **ORMs**: Prisma, Drizzle, TypeORM, Sequelize
- **Auth**: Better-Auth, Clerk, NextAuth, Auth0, Passport
- **Testing**: Jest, Vitest, Mocha, Pytest
- **Build Tools**: Vite, Webpack, esbuild, Turbopack

**Task Extraction Logic:**
1. Parse PRD structure into sections
2. Identify actionable items from features and user stories
3. Estimate effort based on complexity indicators
4. Generate dependencies between tasks
5. Assign appropriate tags and categories
6. Create AI metadata for traceability

**Error Handling Strategy:**
- Graceful degradation for missing sections
- Detailed error messages with file context
- Automatic backup creation before modifications
- Rollback capability for failed operations
- Validation of mutual exclusive parameters

**Performance Optimizations:**
- Streaming responses for large PRDs
- Concurrent processing for multi-model operations
- Efficient file I/O with proper buffering
- Memory-conscious processing of large documents
- Optional pre-computed analysis reuse

**Integration Points:**
- TaskService: Direct task creation and metadata management
- ConfigManager: Working directory and configuration management
- AI Operations: Provider-agnostic AI integration
- Storage Layer: File-based persistence with validation
- ProjectAnalysisService: Codebase analysis for reverse-engineering

---

### OPEN QUESTIONS / TODO

**TODO:**
- [ ] Add PRD comparison/diff functionality between versions
- [ ] Implement PRD export to multiple formats (PDF, DOCX)
- [ ] Add PRD templates for different project types
- [ ] Implement automatic stack validation against detected code
- [ ] Add PRD quality scoring metrics
- [ ] Implement collaborative PRD editing with conflict resolution

**Open Questions:**
- Should PRD versioning include git commit SHA references for traceability?
- What additional metrics should be tracked for PRD quality assessment?
- Should we add support for importing/exporting PRDs from external PM tools (Jira, Linear)?
- What's the optimal retention policy for PRD versions?

---

**Remember:** Citizen, PRDService is your blueprint for project survival. Master its methods to transform vague ideas into concrete specifications, reverse-engineer clarity from existing code, and your projects will stand strong against the winds of uncertainty. Each PRD is a foundation stone - place it carefully, build upon it wisely, and your structures will endure.

The wasteland is unforgiving to those who plan poorly. Plan well, execute precisely, and you may just survive.
