---
## TECHNICAL BULLETIN NO. 001
### AI OPERATIONS - CENTRAL COMMAND SURVIVAL SYSTEM

**DOCUMENT ID:** `task-o-matic-ai-operations-v2`
**CLEARANCE:** `All Personnel`
**MANDATORY COMPLIANCE:** `Yes`

### ⚠️ CRITICAL SURVIVAL NOTICE

Citizen, ignoring this AI Operations system means certain death in the digital wasteland. This is your central command for all AI-powered task management operations. Without it, you're just another scavenger picking through broken code.

This documentation has been updated to reflect the ACTUAL source code reality. Pay attention - the wasteland doesn't forgive those who work with outdated manuals.

---

### SYSTEM ARCHITECTURE OVERVIEW

The AI Operations system serves as the unified command interface for all AI interactions within Task-O-Matic. It implements a delegation pattern where the main `AIOperations` class acts as a facade, routing requests to specialized operation classes while maintaining a clean, modular architecture.

**Core Design Principles:**

- **Delegation Pattern**: Main class delegates to specialized operations (PRD, Task, Documentation)
- **Configuration Merging**: Proper precedence handling for AI configuration
- **Error Propagation**: All errors bubble up with proper context
- **Streaming Support**: Real-time response streaming for all operations
- **Retry Logic**: Built-in resilience with configurable retry strategies
- **Filesystem Tools**: Optional AI access to project files for enhanced context

**Component Dependencies:**

- **BaseOperations**: Core streaming and configuration functionality
- **PRDOperations**: Product Requirements Document processing
- **TaskOperations**: Task management and enhancement
- **DocumentationOperations**: Documentation research and enhancement
- **JSONParser**: Response parsing and normalization
- **Context7Client**: External documentation integration (MCP)
- **RetryHandler**: Exponential backoff retry logic
- **ModelProvider**: AI model abstraction and configuration

---

### COMPLETE API DOCUMENTATION

#### Class: AIOperations

**Purpose**: Main facade class providing unified access to all AI operations. Extends BaseOperations for core functionality.

**Constructor**: No explicit constructor required. Inherits from BaseOperations.

---

#### Method: parsePRD()

**Purpose**: Parse Product Requirements Document content into actionable tasks using AI analysis.

**Signature**:
```typescript
async parsePRD(
  prdContent: string,
  config?: Partial<AIConfig>,
  promptOverride?: string,
  userMessage?: string,
  streamingOptions?: StreamingOptions,
  retryConfig?: Partial<RetryConfig>,
  workingDirectory?: string,
  enableFilesystemTools?: boolean
): Promise<AIPRDParseResult>
```

**Parameters**:

- `prdContent` (string, required): Raw PRD content to parse
- `config` (Partial<AIConfig>, optional): AI configuration overrides for this operation
- `promptOverride` (string, optional): Custom prompt to replace default PRD parsing prompt
- `userMessage` (string, optional): Additional user context message
- `streamingOptions` (StreamingOptions, optional): Streaming callbacks for real-time updates
- `retryConfig` (Partial<RetryConfig>, optional): Retry behavior configuration
- `workingDirectory` (string, optional): Directory path for stack detection and filesystem access
- `enableFilesystemTools` (boolean, optional): Enable filesystem tool access for AI (readFile, listDirectory)

**Return Value**:
```typescript
Promise<AIPRDParseResult> {
  tasks: Task[];           // Parsed tasks from PRD
  summary: string;         // PRD summary
  estimatedDuration: string; // Time estimate
  confidence: number;      // Parsing confidence (0-1)
}
```

**Error Conditions**:

- Throws TaskOMaticError with PRD_PARSING_ERROR code on parsing failures
- Throws TaskOMaticError with AI_CONFIGURATION_ERROR on configuration issues
- Propagates network errors and AI service failures

**Examples**:

**Basic PRD Parsing**:
```typescript
const aiOps = new AIOperations();
const prdContent = `
Build a user authentication system with:
- User registration
- Login/logout functionality
- Password reset
- Session management
`;

const result = await aiOps.parsePRD(prdContent);
console.log(`Parsed ${result.tasks.length} tasks`);
console.log(`Summary: ${result.summary}`);
```

**Advanced PRD Parsing with Filesystem Tools**:
```typescript
const result = await aiOps.parsePRD(prdContent,
  undefined, // default config
  undefined, // default prompt
  undefined, // no user message
  {
    onChunk: (text) => console.log('Streaming:', text),
    onFinish: (result) => console.log('Complete:', result.text)
  },
  { maxAttempts: 3 }, // retry config
  '/path/to/project', // working directory
  true // enable filesystem tools
);
```

**Custom Prompt Override**:
```typescript
const customPrompt = "Parse this PRD focusing on security requirements and compliance needs";
const result = await aiOps.parsePRD(prdContent,
  { model: 'gpt-4o' }, // use GPT-4
  customPrompt
);
```

---

#### Method: breakdownTask()

**Purpose**: Break down a complex task into smaller, manageable subtasks using AI analysis.

**Signature**:
```typescript
async breakdownTask(
  task: Task,
  config?: Partial<AIConfig>,
  promptOverride?: string,
  userMessage?: string,
  streamingOptions?: StreamingOptions,
  retryConfig?: Partial<RetryConfig>,
  fullContent?: string,
  stackInfo?: string,
  existingSubtasks?: Task[],
  enableFilesystemTools?: boolean
): Promise<Array<{ title: string; content: string; estimatedEffort?: string }>>
```

**Parameters**:

- `task` (Task, required): Parent task to break down
- `config` (Partial<AIConfig>, optional): AI configuration overrides
- `promptOverride` (string, optional): Custom breakdown prompt
- `userMessage` (string, optional): Additional user context
- `streamingOptions` (StreamingOptions, optional): Streaming callbacks
- `retryConfig` (Partial<RetryConfig>, optional): Retry configuration
- `fullContent` (string, optional): Complete task content for context
- `stackInfo` (string, optional): Technology stack information
- `existingSubtasks` (Task[], optional): Current subtasks to avoid duplication
- `enableFilesystemTools` (boolean, optional): Enable filesystem access (readFile, listDirectory)

**Return Value**:
```typescript
Promise<Array<{
  title: string;                    // Subtask title
  content: string;                  // Subtask description
  estimatedEffort?: string;         // Effort estimate (optional)
}>>
```

**Error Conditions**:

- Throws TaskOMaticError with AI_OPERATION_FAILED on breakdown failures
- Invalid task structure results in parsing errors
- Network failures propagate with retry logic

**Examples**:

**Basic Task Breakdown**:
```typescript
const task: Task = {
  id: '1',
  title: 'Implement user authentication',
  description: 'Create complete auth system with registration and login',
  status: 'todo',
  createdAt: Date.now(),
  updatedAt: Date.now()
};

const subtasks = await aiOps.breakdownTask(task);
subtasks.forEach((subtask, index) => {
  console.log(`${index + 1}. ${subtask.title}`);
  console.log(`   Effort: ${subtask.estimatedEffort || 'Unknown'}`);
});
```

**Context-Aware Breakdown**:
```typescript
const stackInfo = 'React, Node.js, TypeScript, PostgreSQL';
const existingSubtasks = [/* existing subtasks */];

const subtasks = await aiOps.breakdownTask(
  task,
  { model: 'claude-3-sonnet' },
  undefined,
  undefined,
  { onChunk: (text) => process.stdout.write(text) },
  { maxAttempts: 2 },
  task.content, // full content
  stackInfo,
  existingSubtasks,
  true // enable filesystem tools
);
```

---

#### Method: enhanceTask()

**Purpose**: Enhance a task description with additional details, context, and implementation guidance using AI.

**Signature**:
```typescript
async enhanceTask(
  title: string,
  description?: string,
  config?: Partial<AIConfig>,
  promptOverride?: string,
  userMessage?: string,
  taskId?: string,
  streamingOptions?: StreamingOptions,
  retryConfig?: Partial<RetryConfig>
): Promise<string>
```

**Parameters**:

- `title` (string, required): Task title to enhance
- `description` (string, optional): Current task description
- `config` (Partial<AIConfig>, optional): AI configuration overrides
- `promptOverride` (string, optional): Custom enhancement prompt
- `userMessage` (string, optional): Additional user context
- `taskId` (string, optional): Task ID for context retrieval
- `streamingOptions` (StreamingOptions, optional): Streaming callbacks
- `retryConfig` (Partial<RetryConfig>, optional): Retry configuration

**Return Value**:

- `Promise<string>`: Enhanced task description

**Error Conditions**:

- Throws TaskOMaticError with AI_OPERATION_FAILED on enhancement failures
- Context retrieval failures for provided taskId
- Network and AI service errors with retry logic

**Examples**:

**Basic Task Enhancement**:
```typescript
const enhanced = await aiOps.enhanceTask(
  'Add user authentication',
  'Need login and registration'
);
console.log(enhanced);
```

**Context-Aware Enhancement**:
```typescript
const enhanced = await aiOps.enhanceTask(
  'Implement API rate limiting',
  'Add rate limiting to prevent abuse',
  { model: 'gpt-4' },
  undefined,
  undefined,
  'task-123', // will fetch context for this task
  {
    onChunk: (text) => console.log('Enhancing:', text),
    onFinish: () => console.log('Enhancement complete')
  }
);
```

---

#### Method: reworkPRD()

**Purpose**: Rework and improve a PRD based on user feedback using AI analysis.

**Signature**:
```typescript
async reworkPRD(
  prdContent: string,
  feedback: string,
  config?: Partial<AIConfig>,
  promptOverride?: string,
  userMessage?: string,
  streamingOptions?: StreamingOptions,
  retryConfig?: Partial<RetryConfig>,
  workingDirectory?: string,
  enableFilesystemTools?: boolean
): Promise<string>
```

**Parameters**:

- `prdContent` (string, required): Original PRD content
- `feedback` (string, required): User feedback for improvements
- `config` (Partial<AIConfig>, optional): AI configuration overrides
- `promptOverride` (string, optional): Custom rework prompt
- `userMessage` (string, optional): Additional user context
- `streamingOptions` (StreamingOptions, optional): Streaming callbacks
- `retryConfig` (Partial<RetryConfig>, optional): Retry configuration
- `workingDirectory` (string, optional): Directory for stack detection
- `enableFilesystemTools` (boolean, optional): Enable filesystem access (readFile, listDirectory)

**Return Value**:

- `Promise<string>`: Improved PRD content

**Error Conditions**:

- Throws TaskOMaticError with PRD_GENERATION_ERROR on rework failures
- Invalid feedback or PRD content results in errors
- Network failures with retry logic

**Examples**:

**Basic PRD Rework**:
```typescript
const feedback = 'Need more security requirements and compliance details';
const improvedPRD = await aiOps.reworkPRD(originalPRD, feedback);
```

**Advanced PRD Rework**:
```typescript
const improvedPRD = await aiOps.reworkPRD(
  originalPRD,
  feedback,
  { model: 'claude-3-opus' },
  undefined,
  'Focus on enterprise requirements and scalability',
  { onChunk: (text) => console.log(text) },
  { maxAttempts: 3 },
  '/project/path',
  true
);
```

---

#### Method: generatePRDQuestions()

**Purpose**: Generate clarifying questions for a PRD to identify gaps and missing information.

**Signature**:
```typescript
async generatePRDQuestions(
  prdContent: string,
  config?: Partial<AIConfig>,
  promptOverride?: string,
  userMessage?: string,
  streamingOptions?: StreamingOptions,
  retryConfig?: Partial<RetryConfig>,
  workingDirectory?: string,
  enableFilesystemTools?: boolean
): Promise<string[]>
```

**Parameters**:

- `prdContent` (string, required): PRD content to analyze
- `config` (Partial<AIConfig>, optional): AI configuration overrides
- `promptOverride` (string, optional): Custom question generation prompt
- `userMessage` (string, optional): Additional user context
- `streamingOptions` (StreamingOptions, optional): Streaming callbacks
- `retryConfig` (Partial<RetryConfig>, optional): Retry configuration
- `workingDirectory` (string, optional): Directory for stack detection
- `enableFilesystemTools` (boolean, optional): Enable filesystem access (readFile, listDirectory)

**Return Value**:

- `Promise<string[]>`: Array of clarifying questions

**Error Conditions**:

- Throws TaskOMaticError with PRD_GENERATION_ERROR on question generation failures
- Empty or invalid PRD content results in errors
- AI service failures with retry logic

**Examples**:

**Generate Questions**:
```typescript
const questions = await aiOps.generatePRDQuestions(prdContent);
questions.forEach((question, index) => {
  console.log(`${index + 1}. ${question}`);
});
```

---

#### Method: answerPRDQuestions()

**Purpose**: Answer generated PRD questions using AI analysis and project context.

**Signature**:
```typescript
async answerPRDQuestions(
  prdContent: string,
  questions: string[],
  config?: Partial<AIConfig>,
  contextInfo?: {
    stackInfo?: string;
    projectDescription?: string;
  },
  streamingOptions?: StreamingOptions,
  retryConfig?: Partial<RetryConfig>
): Promise<Record<string, string>>
```

**Parameters**:

- `prdContent` (string, required): PRD content for context
- `questions` (string[], required): Questions to answer
- `config` (Partial<AIConfig>, optional): AI configuration overrides
- `contextInfo` (object, optional): Additional project context
- `streamingOptions` (StreamingOptions, optional): Streaming callbacks
- `retryConfig` (Partial<RetryConfig>, optional): Retry configuration

**Return Value**:

- `Promise<Record<string, string>>`: Question-answer pairs (question -> answer)

**Error Conditions**:

- Throws TaskOMaticError with PRD_GENERATION_ERROR on answer generation failures
- Empty questions array results in error
- Context retrieval failures

**Examples**:

**Answer PRD Questions**:
```typescript
const answers = await aiOps.answerPRDQuestions(
  prdContent,
  questions,
  { model: 'gpt-4' },
  {
    stackInfo: 'React, Node.js, TypeScript',
    projectDescription: 'E-commerce platform for small businesses'
  }
);
```

---

#### Method: generatePRD()

**Purpose**: Generate a complete PRD from a product description using AI analysis.

**Signature**:
```typescript
async generatePRD(
  description: string,
  config?: Partial<AIConfig>,
  promptOverride?: string,
  userMessage?: string,
  streamingOptions?: StreamingOptions,
  retryConfig?: Partial<RetryConfig>
): Promise<string>
```

**Parameters**:

- `description` (string, required): Product description
- `config` (Partial<AIConfig>, optional): AI configuration overrides
- `promptOverride` (string, optional): Custom generation prompt
- `userMessage` (string, optional): Additional user context
- `streamingOptions` (StreamingOptions, optional): Streaming callbacks
- `retryConfig` (Partial<RetryConfig>, optional): Retry configuration

**Return Value**:

- `Promise<string>`: Generated PRD content

**Error Conditions**:

- Throws TaskOMaticError with PRD_GENERATION_ERROR on generation failures
- Empty description results in error
- AI service failures with retry logic

**Examples**:

**Generate PRD from Description**:
```typescript
const description = 'A mobile app for food delivery with real-time tracking';
const prd = await aiOps.generatePRD(description);
```

---

#### Method: combinePRDs()

**Purpose**: Combine multiple PRDs into a unified document using AI analysis.

**Signature**:
```typescript
async combinePRDs(
  prds: string[],
  originalDescription: string,
  config?: Partial<AIConfig>,
  promptOverride?: string,
  userMessage?: string,
  streamingOptions?: StreamingOptions,
  retryConfig?: Partial<RetryConfig>
): Promise<string>
```

**Parameters**:

- `prds` (string[], required): Array of PRD contents to combine
- `originalDescription` (string, required): Original product description
- `config` (Partial<AIConfig>, optional): AI configuration overrides
- `promptOverride` (string, optional): Custom combination prompt
- `userMessage` (string, optional): Additional user context
- `streamingOptions` (StreamingOptions, optional): Streaming callbacks
- `retryConfig` (Partial<RetryConfig>, optional): Retry configuration

**Return Value**:

- `Promise<string>`: Combined PRD content

**Error Conditions**:

- Throws TaskOMaticError with PRD_GENERATION_ERROR on combination failures
- Empty PRDs array results in error
- AI service failures with retry logic

**Examples**:

**Combine Multiple PRDs**:
```typescript
const combinedPRD = await aiOps.combinePRDs(
  [prd1, prd2, prd3],
  'E-commerce platform with advanced features'
);
```

---

#### Method: enhanceTaskWithDocumentation()

**Purpose**: Enhance a task with relevant documentation research using Context7 MCP integration.

**Signature**:
```typescript
async enhanceTaskWithDocumentation(
  taskId: string,
  taskTitle: string,
  taskDescription: string,
  stackInfo?: string,
  streamingOptions?: StreamingOptions,
  retryConfig?: Partial<RetryConfig>,
  config?: Partial<AIConfig>,
  existingResearch?: Record<string, Array<{ query: string; doc: string }>>,
  enableFilesystemTools?: boolean
): Promise<string>
```

**Parameters**:

- `taskId` (string, required): Task identifier
- `taskTitle` (string, required): Task title
- `taskDescription` (string, required): Task description
- `stackInfo` (string, optional): Technology stack information
- `streamingOptions` (StreamingOptions, optional): Streaming callbacks
- `retryConfig` (Partial<RetryConfig>, optional): Retry configuration
- `config` (Partial<AIConfig>, optional): AI configuration overrides
- `existingResearch` (Record, optional): Previously gathered research
- `enableFilesystemTools` (boolean, optional): Enable filesystem access (readFile, listDirectory)

**Return Value**:

- `Promise<string>`: Enhanced task description with documentation insights

**Error Conditions**:

- Throws TaskOMaticError on documentation enhancement failures
- Context7 MCP service failures
- Network and AI service errors

**Examples**:

**Enhance with Documentation**:
```typescript
const enhanced = await aiOps.enhanceTaskWithDocumentation(
  'task-123',
  'Implement React hooks',
  'Create custom hooks for state management',
  'React, TypeScript, Redux',
  { onChunk: (text) => console.log(text) },
  undefined,
  undefined,
  existingResearch, // from previous tasks
  true // enable filesystem tools
);
```

---

#### Method: analyzeDocumentationNeeds()

**Purpose**: Analyze task documentation requirements and fetch relevant documentation using Context7 MCP tools.

**Signature**:
```typescript
async analyzeDocumentationNeeds(
  taskId: string,
  taskTitle: string,
  taskDescription: string,
  stackInfo?: string,
  streamingOptions?: StreamingOptions,
  retryConfig?: Partial<RetryConfig>,
  config?: Partial<AIConfig>,
  existingResearch?: (TaskDocumentation | undefined)[],
  enableFilesystemTools?: boolean
): Promise<DocumentationDetection>
```

**Parameters**:

- `taskId` (string, required): Task identifier
- `taskTitle` (string, required): Task title
- `taskDescription` (string, required): Task description
- `stackInfo` (string, optional): Technology stack information
- `streamingOptions` (StreamingOptions, optional): Streaming callbacks
- `retryConfig` (Partial<RetryConfig>, optional): Retry configuration
- `config` (Partial<AIConfig>, optional): AI configuration overrides
- `existingResearch` (TaskDocumentation[], optional): Existing research data
- `enableFilesystemTools` (boolean, optional): Enable filesystem access (readFile, listDirectory)

**Return Value**:
```typescript
Promise<DocumentationDetection> {
  libraries: Array<{          // Identified libraries
    name: string;
    context7Id: string;
    reason: string;
  }>;
  confidence: number;          // Detection confidence
  toolResults: Array<{        // Tool execution results
    toolName: string;
    output: any;
  }>;
  files: string[];            // Generated documentation files
}
```

**Error Conditions**:

- Documentation analysis failures
- Context7 MCP service errors
- File system errors during documentation saving

**Examples**:

**Analyze Documentation Needs**:
```typescript
const analysis = await aiOps.analyzeDocumentationNeeds(
  'task-456',
  'Build REST API',
  'Create CRUD endpoints for user management',
  'Node.js, Express, MongoDB',
  undefined,
  undefined,
  undefined,
  existingResearch,
  true // enable filesystem tools
);
```

---

#### Method: generateDocumentationRecap()

**Purpose**: Generate a summary of gathered documentation for task context.

**Signature**:
```typescript
async generateDocumentationRecap(
  libraries: Array<{ name: string; context7Id: string; reason: string }>,
  documentContents: Array<{ library: string; content: string }>,
  streamingOptions?: StreamingOptions,
  retryConfig?: Partial<RetryConfig>
): Promise<string>
```

**Parameters**:

- `libraries` (Array, required): Library information
- `documentContents` (Array, required): Documentation content
- `streamingOptions` (StreamingOptions, optional): Streaming callbacks
- `retryConfig` (Partial<RetryConfig>, optional): Retry configuration

**Return Value**:

- `Promise<string>`: Documentation recap/summary

**Error Conditions**:

- Recap generation failures
- Invalid library or document data
- AI service errors

**Examples**:

**Generate Documentation Recap**:
```typescript
const recap = await aiOps.generateDocumentationRecap(
  libraries,
  documentContents,
  { onChunk: (text) => console.log('Generating recap:', text) }
);
```

---

#### Method: planTask()

**Purpose**: Generate detailed implementation plan for a task using AI analysis and documentation research.

**Signature**:
```typescript
async planTask(
  taskContext: string,
  taskDetails: string,
  config?: Partial<AIConfig>,
  promptOverride?: string,
  userMessage?: string,
  streamingOptions?: StreamingOptions,
  retryConfig?: Partial<RetryConfig>
): Promise<string>
```

**Parameters**:

- `taskContext` (string, required): Task context information
- `taskDetails` (string, required): Detailed task requirements
- `config` (Partial<AIConfig>, optional): AI configuration overrides
- `promptOverride` (string, optional): Custom planning prompt
- `userMessage` (string, optional): Additional user context
- `streamingOptions` (StreamingOptions, optional): Streaming callbacks
- `retryConfig` (Partial<RetryConfig>, optional): Retry configuration

**Note**: This method automatically includes MCP tools and filesystem tools for comprehensive planning.

**Return Value**:

- `Promise<string>`: Detailed implementation plan

**Error Conditions**:

- Planning failures
- Context retrieval errors
- AI service errors with retry logic

**Examples**:

**Generate Task Plan**:
```typescript
const plan = await aiOps.planTask(
  'User authentication system',
  'Implement OAuth2, JWT tokens, and session management',
  { model: 'claude-3-sonnet' },
  undefined,
  'Focus on security best practices',
  { onChunk: (text) => console.log(text) }
);
```

---

#### Method: suggestStack()

**Purpose**: Suggest a technology stack (BTSConfig) based on PRD analysis using AI.

**Signature**:
```typescript
async suggestStack(
  prdContent: string,
  projectName?: string,
  config?: Partial<AIConfig>,
  promptOverride?: string,
  userMessage?: string,
  streamingOptions?: StreamingOptions,
  retryConfig?: Partial<RetryConfig>,
  workingDirectory?: string,
  enableFilesystemTools?: boolean
): Promise<{ config: BTSConfig; reasoning: string }>
```

**Parameters**:

- `prdContent` (string, required): PRD content to analyze for stack requirements
- `projectName` (string, optional): Project name for configuration
- `config` (Partial<AIConfig>, optional): AI configuration overrides
- `promptOverride` (string, optional): Custom stack suggestion prompt
- `userMessage` (string, optional): Additional user context
- `streamingOptions` (StreamingOptions, optional): Streaming callbacks
- `retryConfig` (Partial<RetryConfig>, optional): Retry configuration
- `workingDirectory` (string, optional): Directory for existing stack detection
- `enableFilesystemTools` (boolean, optional): Enable filesystem access to understand project structure

**Return Value**:
```typescript
Promise<{
  config: BTSConfig;      // Suggested stack configuration
  reasoning: string;        // AI reasoning for the suggestion
}>
```

Where BTSConfig includes:
```typescript
{
  projectName: string;
  frontend: string;        // "next", "svelte", "vue", "none"
  backend: string;         // "hono", "express", "none"
  database: string;        // "postgres", "mongodb", "sqlite", "none"
  orm: string;           // "prisma", "drizzle", "none"
  api: string;           // "trpc", "graphql", "rest", "none"
  auth: string;          // "better-auth", "clerk", "nextauth", "none"
  payments: string;      // "stripe", "none"
  dbSetup: string;       // "seed", "none"
  runtime: string;       // "bun", "node"
  packageManager: string; // "bun", "npm", "pnpm"
  git: boolean;          // Initialize git
  install: boolean;       // Install dependencies
  webDeploy: string;     // "vercel", "netlify", "none"
  serverDeploy: string;  // "railway", "fly", "none"
  addons: string[];      // Additional features
  examples: string[];    // Example components
}
```

**Error Conditions**:

- Stack suggestion failures
- Invalid PRD content
- AI service errors with retry logic

**Examples**:

**Basic Stack Suggestion**:
```typescript
const suggestion = await aiOps.suggestStack(prdContent);
console.log('Suggested stack:', suggestion.config);
console.log('Reasoning:', suggestion.reasoning);
```

**Advanced Stack Suggestion with Project Name**:
```typescript
const suggestion = await aiOps.suggestStack(
  prdContent,
  'my-awesome-app', // project name
  { model: 'claude-3-opus' },
  undefined,
  'Focus on performance and scalability',
  { onChunk: (text) => console.log('Analyzing:', text) },
  { maxAttempts: 2 },
  '/path/to/project',
  true // enable filesystem tools to check existing code
);
```

---

#### Method: generatePRDFromCodebase()

**Purpose**: Generate a PRD from an existing codebase by analyzing project structure, features, and documentation. This enables reverse-engineering requirements from implementation.

**Signature**:
```typescript
async generatePRDFromCodebase(
  analysisContext: {
    projectName: string;
    projectDescription?: string;
    fileTree: string;
    stackInfo: string;
    existingFeatures: string;
    documentation: string;
    todos: string;
    structureInfo: string;
  },
  config?: Partial<AIConfig>,
  streamingOptions?: StreamingOptions,
  retryConfig?: Partial<RetryConfig>,
  enableFilesystemTools?: boolean
): Promise<string>
```

**Parameters**:

- `analysisContext` (object, required): Complete project analysis context
  - `projectName` (string, required): Name of the project
  - `projectDescription` (string, optional): Brief project description
  - `fileTree` (string, required): ASCII/unicode tree representation of project structure
  - `stackInfo` (string, required): Detected technology stack information
  - `existingFeatures` (string, required): Summary of detected features
  - `documentation` (string, required): Existing documentation content
  - `todos` (string, required): TODO/FIXME comments found in codebase
  - `structureInfo` (string, required): Additional project structure information
- `config` (Partial<AIConfig>, optional): AI configuration overrides
- `streamingOptions` (StreamingOptions, optional): Streaming callbacks
- `retryConfig` (Partial<RetryConfig>, optional): Retry configuration
- `enableFilesystemTools` (boolean, optional): Enable filesystem access for deeper analysis

**Return Value**:

- `Promise<string>`: Generated PRD documenting current state and suggesting improvements

**Error Conditions**:

- PRD generation from codebase failures
- Invalid analysis context
- AI service errors with retry logic

**Examples**:

**Generate PRD from Codebase**:
```typescript
const analysis = await projectAnalysisService.analyzeProject({
  workingDir: '/path/to/project'
});

const prd = await aiOps.generatePRDFromCodebase({
  projectName: analysis.projectName,
  projectDescription: analysis.description,
  fileTree: analysis.fileTree,
  stackInfo: analysis.stackInfo,
  existingFeatures: analysis.features,
  documentation: analysis.documentation,
  todos: analysis.todos,
  structureInfo: analysis.structureInfo
}, undefined, { onChunk: (text) => console.log('Generating PRD:', text) });
```

**Advanced with Filesystem Tools**:
```typescript
const prd = await aiOps.generatePRDFromCodebase(
  analysisContext,
  { model: 'claude-3-opus' },
  { onChunk: (text) => console.log(text) },
  { maxAttempts: 2 },
  true // enable filesystem tools for deeper analysis
);
```

---

### INTEGRATION PROTOCOLS

#### Configuration Precedence

The AI Operations system follows strict configuration precedence:

1. Method parameter `config` (highest priority)
2. ConfigManager global project configuration
3. Environment variables (OPENAI_API_KEY, ANTHROPIC_API_KEY, etc.)
4. Provider defaults (lowest priority)

#### Error Handling Protocol

All methods follow consistent error handling:

1. Wrap operations in retry logic
2. Throw TaskOMaticError with appropriate error codes
3. Include context and suggestions in error objects
4. Propagate original errors for debugging

#### Streaming Protocol

Streaming operations follow this pattern:

1. Accept StreamingOptions parameter
2. Call onChunk for text deltas
3. Call onReasoning for reasoning deltas (if supported by model)
4. Call onFinish with completion details
5. Call onError for any failures

#### Filesystem Tools Protocol

When `enableFilesystemTools` is set to `true`:

1. AI gains access to `readFile` and `listDirectory` tools
2. AI can inspect project structure to understand context
3. AI can read existing code patterns for consistency
4. Tools are available for PRD parsing, task breakdown, and planning operations

**Use Cases for Filesystem Tools:**

- Understanding existing project architecture
- Reading configuration files for context
- Checking for duplicate functionality
- Analyzing code patterns for consistency
- Understanding dependency relationships

#### Context Integration

Methods that accept `taskId` automatically:

1. Retrieve task context using ContextBuilder
2. Include PRD content if available
3. Include stack information if detected
4. Include existing documentation research
5. Include relevant Context7 documentation

#### MCP Integration

Context7 MCP tools are available for:

- Documentation research (`enhanceTaskWithDocumentation`)
- Library identification (`analyzeDocumentationNeeds`)
- Task planning with external docs (`planTask`)

MCP tools are automatically closed after operation completion.

---

### SURVIVAL SCENARIOS

#### Scenario 1: Complete PRD Processing Pipeline

```typescript
// Complete PRD processing workflow
const aiOps = new AIOperations();

// 1. Parse initial PRD with filesystem tools
const parseResult = await aiOps.parsePRD(prdContent,
  undefined, undefined, undefined, {
    onChunk: (text) => console.log('Parsing:', text)
  },
  undefined,
  '/path/to/project',
  true // enable filesystem tools
);

// 2. Generate clarifying questions
const questions = await aiOps.generatePRDQuestions(prdContent);

// 3. Answer questions with context
const answers = await aiOps.answerPRDQuestions(prdContent, questions,
  undefined, {
    stackInfo: 'React, Node.js, TypeScript',
    projectDescription: 'E-commerce platform'
  }
);

// 4. Rework PRD based on feedback with filesystem access
const improvedPRD = await aiOps.reworkPRD(prdContent,
  'Add security requirements', undefined, undefined, {
    onChunk: (text) => console.log('Reworking:', text)
  },
  undefined,
  '/path/to/project',
  true
);
```

#### Scenario 2: Stack Suggestion for New Project

```typescript
// Suggest optimal stack based on PRD requirements
const suggestion = await aiOps.suggestStack(
  prdContent,
  'vault-manager',
  { model: 'claude-3-opus' },
  undefined,
  'Focus on security and offline capabilities',
  { onChunk: (text) => console.log('Analyzing requirements:', text) },
  { maxAttempts: 2 }
);

console.log('Recommended Stack:', suggestion.config);
console.log('AI Reasoning:', suggestion.reasoning);

// Use suggested config for bootstrapping
const { frontend, backend, database, auth } = suggestion.config;
```

#### Scenario 3: PRD Generation from Existing Codebase

```typescript
// Reverse-engineer PRD from existing project
const analysis = await projectAnalysisService.analyzeProject({
  workingDir: '/path/to/legacy-project'
});

const generatedPRD = await aiOps.generatePRDFromCodebase({
  projectName: analysis.projectName,
  projectDescription: 'Legacy monolithic application',
  fileTree: analysis.fileTree,
  stackInfo: analysis.stackInfo,
  existingFeatures: analysis.features,
  documentation: analysis.documentation,
  todos: analysis.todos,
  structureInfo: analysis.structureInfo
}, { model: 'claude-3-opus' }, {
  onChunk: (text) => console.log('Generating PRD from codebase:', text)
});

// Save generated PRD for review
await fs.writeFile('./generated-prd.md', generatedPRD);
```

#### Scenario 4: Task Enhancement with Documentation Research

```typescript
// Enhance task with comprehensive documentation research
const enhancedTask = await aiOps.enhanceTaskWithDocumentation(
  'task-789',
  'Implement GraphQL API',
  'Create GraphQL schema and resolvers for user data',
  'Node.js, Apollo Server, MongoDB',
  {
    onChunk: (text) => console.log('Researching:', text),
    onFinish: () => console.log('Documentation research complete')
  },
  { maxAttempts: 3 },
  { model: 'claude-3-sonnet' },
  existingResearch, // from previous tasks
  true // enable filesystem tools to check existing schema
);
```

#### Scenario 5: Complex Task Breakdown with Context

```typescript
// Break down complex task with full context
const subtasks = await aiOps.breakdownTask(
  complexTask,
  { model: 'gpt-4o' },
  undefined,
  undefined,
  { onChunk: (text) => process.stdout.write(text) },
  { maxAttempts: 2 },
  complexTask.content,
  'React, TypeScript, Redux, PostgreSQL',
  existingSubtasks,
  true // enable filesystem tools
);
```

#### Scenario 6: Task Planning with MCP and Filesystem Tools

```typescript
// Generate comprehensive implementation plan
const plan = await aiOps.planTask(
  'Microservices architecture migration',
  'Migrate monolith to microservices with API Gateway',
  { model: 'claude-3-opus' },
  undefined,
  'Include deployment strategy and testing approach',
  {
    onChunk: (text) => console.log('Planning:', text),
    onFinish: (result) => console.log(`Plan generated: ${result.text.length} chars`)
  }
);

// planTask automatically includes:
// - MCP tools for documentation research
// - Filesystem tools for code inspection
// - Context from existing project structure
```

---

### TECHNICAL SPECIFICATIONS

#### Performance Characteristics

- **Concurrent Operations**: Supports multiple simultaneous AI operations
- **Memory Usage**: Streaming responses minimize memory footprint
- **Retry Logic**: Exponential backoff with configurable limits
- **Caching**: Documentation research cached for reuse
- **MCP Connection Management**: Automatic cleanup after operations

#### Security Considerations

- **API Keys**: Managed through secure configuration system
- **Context Isolation**: Task-specific context prevents data leakage
- **Input Validation**: All inputs validated before processing
- **Error Sanitization**: Sensitive data removed from error messages
- **Filesystem Access**: Controlled via explicit enableFilesystemTools parameter

#### Scalability Features

- **Horizontal Scaling**: Stateless design enables multiple instances
- **Resource Management**: Automatic cleanup of AI connections and MCP sessions
- **Rate Limiting**: Built-in retry logic handles API rate limits
- **Circuit Breaking**: Fail-fast on persistent service failures

#### Monitoring Integration

- **Operation Logging**: All operations logged with context
- **Performance Metrics**: Duration and token usage tracked
- **Error Tracking**: Detailed error reporting with context
- **Health Checks**: Service availability monitoring
- **Tool Call Logging**: MCP and filesystem tool calls are logged

---

### NEW METHODS IN THIS UPDATE

The following methods were added in the latest code update:

1. **suggestStack()**: Suggest optimal technology stack based on PRD requirements
2. **generatePRDFromCodebase()**: Reverse-engineer PRD from existing codebase analysis
3. **enableFilesystemTools parameter**: Added to multiple methods for enhanced project understanding

---

**Remember:** Citizen, in the wasteland of broken code and failed projects, the AI Operations system is your lifeline. Master it, or perish in the chaos of manual task management. Every method documented here is a survival tool - use them wisely, and you may just live to see another deployment cycle.

This documentation reflects the ACTUAL source code state. Version discrepancies indicate you're working from outdated information. Stay vigilant, stay updated.

---

**END OF BULLETIN**
