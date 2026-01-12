## TECHNICAL BULLETIN NO. 003
### PRD SERVICE - PRODUCT REQUIREMENTS SURVIVAL SYSTEM

**DOCUMENT ID:** `task-o-matic-prd-v1`  
**CLEARANCE:** `All Personnel`  
**MANDATORY COMPLIANCE:** `Yes`

### ⚠️ CRITICAL SURVIVAL NOTICE
Citizen, PRDService is your blueprint for survival in the post-deadline wasteland. Without proper PRD management, your projects will wander aimlessly like lost scavengers in the radioactive fog. This service transforms vague ideas into actionable specifications and structured tasks.

### SYSTEM ARCHITECTURE OVERVIEW

The PRDService serves as the central hub for Product Requirements Document management, providing AI-powered analysis, task extraction, and document refinement capabilities. It bridges the gap between high-level product vision and concrete implementation tasks.

**Core Dependencies:**
- **Storage Layer**: Local file-based storage for PRDs and tasks
- **AI Operations**: Vercel AI SDK integration for PRD processing
- **ConfigManager**: Project configuration and working directory management
- **Validation**: Input validation and error handling
- **File Utils**: File operations and path management

**Service Capabilities:**
1. **PRD Parsing**: Extract tasks from existing PRD documents
2. **PRD Generation**: Create PRDs from descriptions
3. **PRD Refinement**: Improve PRDs based on feedback
4. **Question Generation**: Generate clarifying questions
5. **Multi-Model Support**: Generate PRDs with different AI models
6. **PRD Combination**: Merge multiple PRDs into master document

### COMPLETE API DOCUMENTATION

---

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

**Example: Custom Prompt Override**
```typescript
const result = await prdService.parsePRD({
  file: "./api-prd.md",
  promptOverride: "Extract API-specific tasks with focus on endpoints, authentication, and data validation. Include testing tasks.",
  messageOverride: "Parse this API PRD with emphasis on technical implementation details",
  aiOptions: {
    aiProvider: "openai",
    aiModel: "gpt-4"
  }
});

result.steps.forEach(step => {
  console.log(`${step.step}: ${step.status} (${step.duration}ms)`);
});
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

**Example: Questions with Custom Prompt**
```typescript
const questions = await prdService.generateQuestions({
  file: "./technical-prd.md",
  promptOverride: "Generate questions focused on technical architecture, performance requirements, and scalability considerations",
  streamingOptions: {
    onChunk: (chunk) => process.stdout.write(chunk)
  }
});

console.log("Technical questions generated:", questions.length);
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

**Example: Rework with Custom Output**
```typescript
const outputPath = await prdService.reworkPRD({
  file: "./draft-prd.md",
  feedback: "Focus on user experience, mobile responsiveness, and accessibility features",
  output: "./improved-prd-v2.md",
  enableFilesystemTools: true,
  streamingOptions: {
    onChunk: (chunk) => process.stdout.write(chunk)
  }
});

console.log(`Improved PRD saved as: ${outputPath}`);
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

**Example: User-Answered Questions**
```typescript
const result = await prdService.refinePRDWithQuestions({
  file: "./draft-prd.md",
  questionMode: "user",
  answers: {
    "What is the target audience?": "Enterprise developers and project managers",
    "What are the key performance requirements?": "Handle 10,000 concurrent users with <100ms response time",
    "What authentication methods are needed?": "OAuth2, SAML, and LDAP integration"
  },
  callbacks: {
    onProgress: (event) => console.log(event.message)
  }
});

console.log(`Refined PRD with ${Object.keys(result.answers).length} answered questions`);
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

**Example: PRD Generation with Streaming**
```typescript
const result = await prdService.generatePRD({
  description: "E-commerce platform with real-time inventory and AI-powered recommendations",
  filename: "ecommerce-prd.md",
  outputDir: "./docs",
  aiOptions: {
    aiProvider: "openai",
    aiModel: "gpt-4"
  },
  streamingOptions: {
    onChunk: (chunk) => process.stdout.write(chunk),
    onFinish: () => console.log("\nPRD generation complete!")
  }
});

console.log(`Generated ${result.content.length} characters of PRD content`);
console.log(`Token usage: ${result.stats.tokenUsage?.total || 0} tokens`);
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
- `input.prds` (string[], required): Array of PRD contents to combine
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
  prds: prdContents,
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
console.log(`Combined from ${prdContents.length} source PRDs`);
```

**Example: Real-time Combination**
```typescript
const result = await prdService.combinePRDs({
  prds: [prd1, prd2, prd3],
  originalDescription: "AI-powered development tools platform",
  aiOptions: {
    aiProvider: "openrouter",
    aiModel: "anthropic/claude-3-opus"
  },
  streamingOptions: {
    onChunk: (chunk) => process.stdout.write(chunk),
    onFinish: () => console.log("\nCombination complete!")
  }
});

console.log(`Master PRD generated in ${result.stats.duration}ms`);
console.log(`Total tokens used: ${result.stats.tokenUsage?.total || 0}`);
```

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
}
```

**File System Integration:**
- Automatic PRD directory creation in `.task-o-matic/prd/`
- Relative path handling for project portability
- File validation and error handling
- Backup and versioning support

**Task Creation Integration:**
- Direct integration with TaskService for task extraction
- Preservation of AI metadata for generated tasks
- Dependency relationship maintenance
- Tag and effort estimation inheritance

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

**Scenario 2: Multi-Model PRD Generation and Combination**
```typescript
// Generate PRDs with different models
const models = [
  { provider: "anthropic", model: "claude-3-5-sonnet" },
  { provider: "openai", model: "gpt-4" },
  { provider: "openrouter", model: "anthropic/claude-3-opus" }
];

const prdResults = await Promise.all(
  models.map(async (model, index) => {
    return await prdService.generatePRD({
      description: "AI-powered code review platform",
      filename: `prd-${model.provider}-${model.model.replace(/\//g, '-')}.md`,
      aiOptions: model
    });
  })
);

// Combine into master PRD
const masterResult = await prdService.combinePRDs({
  prds: prdResults.map(r => r.content),
  originalDescription: "AI-powered code review platform",
  filename: "master-prd.md",
  aiOptions: { provider: "anthropic", model: "claude-3-5-sonnet" }
});

console.log(`Combined ${prdResults.length} PRDs into master document`);
```

**Scenario 3: Iterative PRD Refinement**
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
  
  console.log(`Refinement ${i + 1} complete: ${currentPRD}`);
}

// Final parsing into tasks
const finalResult = await prdService.parsePRD({
  file: currentPRD,
  enableFilesystemTools: true
});

console.log(`Final PRD parsed: ${finalResult.stats.tasksCreated} tasks extracted`);
```

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

**Performance Optimizations:**
- Streaming responses for large PRDs
- Concurrent processing for multi-model operations
- Efficient file I/O with proper buffering
- Memory-conscious processing of large documents

**Integration Points:**
- TaskService: Direct task creation and metadata management
- ConfigManager: Working directory and configuration management
- AI Operations: Provider-agnostic AI integration
- Storage Layer: File-based persistence with validation

**Remember:** Citizen, PRDService is your blueprint for project survival. Master its methods to transform vague ideas into concrete specifications, and your projects will stand strong against the winds of uncertainty. Each PRD is a foundation stone - place it carefully, build upon it wisely, and your structures will endure.