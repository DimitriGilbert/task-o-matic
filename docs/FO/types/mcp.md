---
## TECHNICAL BULLETIN NO. 004
### MCP TYPES - MODEL CONTEXT PROTOCOL SUPPORT

**DOCUMENT ID:** `task-o-matic-mcp-types-v1`  
**CLEARANCE:** `All Personnel`  
**MANDATORY COMPLIANCE:** `Yes`

### ⚠️ CRITICAL SURVIVAL NOTICE
Citizen, ignore these MCP type definitions and your Model Context Protocol integration becomes a black box of undefined behavior. Tool discovery fails, resource management collapses, and your AI agents wander blind without context. This is your gateway to external AI capabilities.

### TYPE SYSTEM ARCHITECTURE
The MCP types system provides **minimal yet extensible foundation** for Model Context Protocol integration. It follows the MCP specification while maintaining flexibility for future protocol evolution and custom tool implementations.

The architecture supports:
- **Tool Definition**: Standardized tool input/output structures
- **Resource Management**: File and data resource handling
- **Protocol Evolution**: Extensible interfaces for new MCP features
- **Type Safety**: Compile-time validation of MCP interactions
- **Integration Points**: Clean separation between MCP and TaskOMatic systems

### COMPLETE TYPE DOCUMENTATION

#### McpToolInput Interface
```typescript
export interface McpToolInput {
  // Define tool input structures
}
```

**Purpose**: Base interface for MCP tool input definitions

**Current State**: Placeholder interface awaiting implementation

**Planned Structure**:
```typescript
export interface McpToolInput {
  name: string;
  description?: string;
  inputSchema?: {
    type: "object";
    properties?: Record<string, any>;
    required?: string[];
  };
}
```

**Intended Usage**:
```typescript
// File system tool input
const fileSystemTool: McpToolInput = {
  name: "read_file",
  description: "Read contents of a file",
  inputSchema: {
    type: "object",
    properties: {
      path: {
        type: "string",
        description: "File path to read"
      }
    },
    required: ["path"]
  }
};

// Git operation tool input
const gitTool: McpToolInput = {
  name: "git_status",
  description: "Get git repository status",
  inputSchema: {
    type: "object",
    properties: {
      directory: {
        type: "string",
        description: "Git repository directory"
      }
    },
    required: ["directory"]
  }
};
```

### INTEGRATION PROTOCOLS

#### MCP Server Integration Pattern
```typescript
// MCP server implementation structure
import { McpToolInput } from '../types/mcp';

class MCPServer {
  private tools: Map<string, McpToolInput> = new Map();
  private resources: Map<string, any> = new Map();

  registerTool(tool: McpToolInput): void {
    this.tools.set(tool.name, tool);
  }

  getTool(name: string): McpToolInput | undefined {
    return this.tools.get(name);
  }

  listTools(): McpToolInput[] {
    return Array.from(this.tools.values());
  }

  async callTool(name: string, input: any): Promise<any> {
    const tool = this.getTool(name);
    if (!tool) {
      throw new Error(`Tool ${name} not found`);
    }

    // Validate input against schema
    this.validateInput(tool, input);

    // Execute tool logic
    return await this.executeTool(name, input);
  }

  private validateInput(tool: McpToolInput, input: any): void {
    if (!tool.inputSchema) return;

    const { properties, required } = tool.inputSchema;
    
    // Check required properties
    for (const prop of required || []) {
      if (!(prop in input)) {
        throw new Error(`Missing required property: ${prop}`);
      }
    }

    // Type validation would go here
    for (const [prop, schema] of Object.entries(properties || {})) {
      if (prop in input) {
        this.validateProperty(prop, input[prop], schema);
      }
    }
  }

  private validateProperty(name: string, value: any, schema: any): void {
    // Implement JSON schema validation
    // This would validate type, format, constraints, etc.
  }

  private async executeTool(name: string, input: any): Promise<any> {
    switch (name) {
      case "read_file":
        return await this.readFile(input.path);
      case "write_file":
        return await this.writeFile(input.path, input.content);
      case "git_status":
        return await this.getGitStatus(input.directory);
      case "list_files":
        return await this.listFiles(input.directory, input.pattern);
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }

  private async readFile(path: string): Promise<{ content: string }> {
    try {
      const content = await fs.readFile(path, 'utf-8');
      return { content };
    } catch (error) {
      throw new Error(`Failed to read file ${path}: ${error.message}`);
    }
  }

  private async writeFile(path: string, content: string): Promise<{ success: boolean }> {
    try {
      await fs.writeFile(path, content, 'utf-8');
      return { success: true };
    } catch (error) {
      throw new Error(`Failed to write file ${path}: ${error.message}`);
    }
  }

  private async getGitStatus(directory: string): Promise<any> {
    try {
      const { stdout } = await execAsync('git status --porcelain', { cwd: directory });
      const lines = stdout.split('\n').filter(line => line.trim());
      
      const status = {
        modified: [],
        added: [],
        deleted: [],
        untracked: []
      };

      for (const line of lines) {
        const statusCode = line[0];
        const filePath = line.slice(3);
        
        switch (statusCode) {
          case 'M':
            status.modified.push(filePath);
            break;
          case 'A':
            status.added.push(filePath);
            break;
          case 'D':
            status.deleted.push(filePath);
            break;
          case '?':
            status.untracked.push(filePath);
            break;
        }
      }

      return status;
    } catch (error) {
      throw new Error(`Failed to get git status: ${error.message}`);
    }
  }

  private async listFiles(directory: string, pattern?: string): Promise<{ files: string[] }> {
    try {
      const files = await fs.readdir(directory, { withFileTypes: true });
      let filteredFiles = files
        .filter(file => file.isFile())
        .map(file => file.name);

      if (pattern) {
        const regex = new RegExp(pattern);
        filteredFiles = filteredFiles.filter(file => regex.test(file));
      }

      return { files: filteredFiles };
    } catch (error) {
      throw new Error(`Failed to list files: ${error.message}`);
    }
  }
}
```

#### TaskOMatic MCP Integration
```typescript
// Integration with TaskOMatic AI operations
import { McpToolInput } from '../types/mcp';
import { AIOperations } from '../lib/ai-service/ai-operations';

class TaskOMaticMCPIntegration {
  private mcpServer: MCPServer;
  private aiOperations: AIOperations;

  constructor() {
    this.mcpServer = new MCPServer();
    this.aiOperations = new AIOperations();
    this.registerTools();
  }

  private registerTools(): void {
    // File system tools
    this.mcpServer.registerTool({
      name: "task_read_file",
      description: "Read task-related files",
      inputSchema: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description: "File path relative to project root"
          }
        },
        required: ["path"]
      }
    });

    this.mcpServer.registerTool({
      name: "task_list_files",
      description: "List files in task directories",
      inputSchema: {
        type: "object",
        properties: {
          directory: {
            type: "string",
            description: "Directory path to list"
          },
          pattern: {
            type: "string",
            description: "File pattern to match (glob syntax)"
          }
        },
        required: ["directory"]
      }
    });

    // Task management tools
    this.mcpServer.registerTool({
      name: "task_get_task",
      description: "Get task details by ID",
      inputSchema: {
        type: "object",
        properties: {
          taskId: {
            type: "string",
            description: "Task ID to retrieve"
          }
        },
        required: ["taskId"]
      }
    });

    this.mcpServer.registerTool({
      name: "task_list_tasks",
      description: "List tasks with optional filters",
      inputSchema: {
        type: "object",
        properties: {
          status: {
            type: "string",
            enum: ["todo", "in-progress", "completed"],
            description: "Filter by task status"
          },
          tag: {
            type: "string",
            description: "Filter by tag"
          }
        }
      }
    });

    // Documentation tools
    this.mcpServer.registerTool({
      name: "task_get_documentation",
      description: "Get AI-generated documentation for task",
      inputSchema: {
        type: "object",
        properties: {
          taskId: {
            type: "string",
            description: "Task ID to get documentation for"
          }
        },
        required: ["taskId"]
      }
    });
  }

  async handleMCPRequest(toolName: string, input: any): Promise<any> {
    try {
      switch (toolName) {
        case "task_read_file":
          return await this.handleReadFile(input);
        case "task_list_files":
          return await this.handleListFiles(input);
        case "task_get_task":
          return await this.handleGetTask(input);
        case "task_list_tasks":
          return await this.handleListTasks(input);
        case "task_get_documentation":
          return await this.handleGetDocumentation(input);
        default:
          throw new Error(`Unknown MCP tool: ${toolName}`);
      }
    } catch (error) {
      return {
        error: error.message,
        success: false
      };
    }
  }

  private async handleReadFile(input: { path: string }): Promise<any> {
    const fullPath = path.resolve(input.path);
    
    // Security check - ensure path is within project
    if (!this.isPathSafe(fullPath)) {
      throw new Error("Access denied: path outside project bounds");
    }

    const content = await fs.readFile(fullPath, 'utf-8');
    return {
      success: true,
      content,
      path: fullPath
    };
  }

  private async handleListFiles(input: { directory: string; pattern?: string }): Promise<any> {
    const fullPath = path.resolve(input.directory);
    
    if (!this.isPathSafe(fullPath)) {
      throw new Error("Access denied: path outside project bounds");
    }

    const files = await fs.readdir(fullPath, { withFileTypes: true });
    let fileList = files
      .filter(file => file.isFile())
      .map(file => ({
        name: file.name,
        path: path.join(fullPath, file.name),
        size: file.size,
        modified: file.mtime
      }));

    if (input.pattern) {
      const regex = new RegExp(input.pattern.replace('*', '.*'));
      fileList = fileList.filter(file => regex.test(file.name));
    }

    return {
      success: true,
      files: fileList,
      directory: fullPath
    };
  }

  private async handleGetTask(input: { taskId: string }): Promise<any> {
    const task = await this.aiOperations.getTask(input.taskId);
    
    if (!task) {
      return {
        success: false,
        error: `Task ${input.taskId} not found`
      };
    }

    return {
      success: true,
      task: {
        id: task.id,
        title: task.title,
        status: task.status,
        content: task.content,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        tags: task.tags || [],
        effort: task.estimatedEffort
      }
    };
  }

  private async handleListTasks(input: { status?: string; tag?: string }): Promise<any> {
    const filters: any = {};
    
    if (input.status) {
      filters.status = input.status;
    }
    
    if (input.tag) {
      filters.tag = input.tag;
    }

    const tasks = await this.aiOperations.listTasks(filters);
    
    return {
      success: true,
      tasks: tasks.map(task => ({
        id: task.id,
        title: task.title,
        status: task.status,
        effort: task.estimatedEffort,
        tags: task.tags || [],
        createdAt: task.createdAt,
        updatedAt: task.updatedAt
      })),
      total: tasks.length
    };
  }

  private async handleGetDocumentation(input: { taskId: string }): Promise<any> {
    const task = await this.aiOperations.getTask(input.taskId);
    
    if (!task) {
      return {
        success: false,
        error: `Task ${input.taskId} not found`
      };
    }

    if (!task.documentation) {
      return {
        success: false,
        error: `No documentation found for task ${input.taskId}`
      };
    }

    return {
      success: true,
      documentation: task.documentation,
      taskId: input.taskId
    };
  }

  private isPathSafe(requestedPath: string): boolean {
    const projectRoot = process.cwd();
    const resolvedPath = path.resolve(requestedPath);
    
    return resolvedPath.startsWith(projectRoot);
  }
}
```

### SURVIVAL SCENARIOS

#### Scenario 1: Complete MCP Tool Implementation
```typescript
// Comprehensive MCP tool suite
class TaskOMaticMCPTools {
  private tools: Map<string, McpToolInput> = new Map();

  constructor() {
    this.initializeFileSystemTools();
    this.initializeTaskTools();
    this.initializeGitTools();
    this.initializeDocumentationTools();
  }

  private initializeFileSystemTools(): void {
    // Read file tool
    this.tools.set("read_file", {
      name: "read_file",
      description: "Read contents of a text file",
      inputSchema: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description: "Path to the file to read"
          },
          encoding: {
            type: "string",
            enum: ["utf-8", "ascii", "base64"],
            default: "utf-8",
            description: "File encoding"
          }
        },
        required: ["path"]
      }
    });

    // Write file tool
    this.tools.set("write_file", {
      name: "write_file",
      description: "Write content to a text file",
      inputSchema: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description: "Path to the file to write"
          },
          content: {
            type: "string",
            description: "Content to write to the file"
          },
          encoding: {
            type: "string",
            enum: ["utf-8", "ascii", "base64"],
            default: "utf-8",
            description: "File encoding"
          },
          createDirectories: {
            type: "boolean",
            default: false,
            description: "Create parent directories if they don't exist"
          }
        },
        required: ["path", "content"]
      }
    });

    // List directory tool
    this.tools.set("list_directory", {
      name: "list_directory",
      description: "List files and directories in a path",
      inputSchema: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description: "Directory path to list"
          },
          recursive: {
            type: "boolean",
            default: false,
            description: "List directories recursively"
          },
          includeHidden: {
            type: "boolean",
            default: false,
            description: "Include hidden files and directories"
          },
          pattern: {
            type: "string",
            description: "Glob pattern to filter files"
          }
        },
        required: ["path"]
      }
    });
  }

  private initializeTaskTools(): void {
    // Create task tool
    this.tools.set("create_task", {
      name: "create_task",
      description: "Create a new task",
      inputSchema: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "Task title"
          },
          content: {
            type: "string",
            description: "Task description or content"
          },
          effort: {
            type: "string",
            enum: ["small", "medium", "large"],
            description: "Estimated effort required"
          },
          parentId: {
            type: "string",
            description: "Parent task ID for subtasks"
          },
          tags: {
            type: "array",
            items: { type: "string" },
            description: "Tags to categorize the task"
          }
        },
        required: ["title"]
      }
    });

    // Update task tool
    this.tools.set("update_task", {
      name: "update_task",
      description: "Update an existing task",
      inputSchema: {
        type: "object",
        properties: {
          taskId: {
            type: "string",
            description: "ID of the task to update"
          },
          title: {
            type: "string",
            description: "New task title"
          },
          content: {
            type: "string",
            description: "New task content"
          },
          status: {
            type: "string",
            enum: ["todo", "in-progress", "completed"],
            description: "New task status"
          },
          effort: {
            type: "string",
            enum: ["small", "medium", "large"],
            description: "New effort estimate"
          }
        },
        required: ["taskId"]
      }
    });

    // Delete task tool
    this.tools.set("delete_task", {
      name: "delete_task",
      description: "Delete a task",
      inputSchema: {
        type: "object",
        properties: {
          taskId: {
            type: "string",
            description: "ID of the task to delete"
          },
          force: {
            type: "boolean",
            default: false,
            description: "Delete without confirmation"
          }
        },
        required: ["taskId"]
      }
    });
  }

  private initializeGitTools(): void {
    // Git status tool
    this.tools.set("git_status", {
      name: "git_status",
      description: "Get git repository status",
      inputSchema: {
        type: "object",
        properties: {
          directory: {
            type: "string",
            description: "Git repository directory (default: current directory)"
          },
          includeUntracked: {
            type: "boolean",
            default: true,
            description: "Include untracked files in status"
          }
        }
      }
    });

    // Git commit tool
    this.tools.set("git_commit", {
      name: "git_commit",
      description: "Commit changes to git repository",
      inputSchema: {
        type: "object",
        properties: {
          message: {
            type: "string",
            description: "Commit message"
          },
          files: {
            type: "array",
            items: { type: "string" },
            description: "Files to commit (default: all changes)"
          },
          addAll: {
            type: "boolean",
            default: true,
            description: "Add all changes before committing"
          }
        },
        required: ["message"]
      }
    });
  }

  private initializeDocumentationTools(): void {
    // Generate documentation tool
    this.tools.set("generate_documentation", {
      name: "generate_documentation",
      description: "Generate AI documentation for a task",
      inputSchema: {
        type: "object",
        properties: {
          taskId: {
            type: "string",
            description: "Task ID to generate documentation for"
          },
          force: {
            type: "boolean",
            default: false,
            description: "Regenerate documentation even if it exists"
          },
          includeCode: {
            type: "boolean",
            default: true,
            description: "Include code examples in documentation"
          }
        },
        required: ["taskId"]
      }
    });

    // Search documentation tool
    this.tools.set("search_documentation", {
      name: "search_documentation",
      description: "Search through task documentation",
      inputSchema: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Search query"
          },
          taskId: {
            type: "string",
            description: "Limit search to specific task"
          },
          maxResults: {
            type: "number",
            default: 10,
            description: "Maximum number of results to return"
          }
        },
        required: ["query"]
      }
    });
  }

  async executeTool(toolName: string, input: any): Promise<any> {
    const tool = this.tools.get(toolName);
    if (!tool) {
      throw new Error(`Tool ${toolName} not found`);
    }

    // Validate input
    this.validateToolInput(tool, input);

    // Execute tool
    return await this.performToolOperation(toolName, input);
  }

  private validateToolInput(tool: McpToolInput, input: any): void {
    if (!tool.inputSchema) return;

    const { properties, required } = tool.inputSchema;
    
    // Check required fields
    for (const field of required || []) {
      if (!(field in input)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validate field types and constraints
    for (const [field, schema] of Object.entries(properties || {})) {
      if (field in input) {
        this.validateField(field, input[field], schema);
      }
    }
  }

  private validateField(fieldName: string, value: any, schema: any): void {
    // Type validation
    if (schema.type === "string" && typeof value !== "string") {
      throw new Error(`Field ${fieldName} must be a string`);
    }
    
    if (schema.type === "number" && typeof value !== "number") {
      throw new Error(`Field ${fieldName} must be a number`);
    }
    
    if (schema.type === "boolean" && typeof value !== "boolean") {
      throw new Error(`Field ${fieldName} must be a boolean`);
    }
    
    if (schema.type === "array" && !Array.isArray(value)) {
      throw new Error(`Field ${fieldName} must be an array`);
    }

    // Enum validation
    if (schema.enum && !schema.enum.includes(value)) {
      throw new Error(`Field ${fieldName} must be one of: ${schema.enum.join(", ")}`);
    }

    // Custom validation would go here
  }

  private async performToolOperation(toolName: string, input: any): Promise<any> {
    switch (toolName) {
      case "read_file":
        return await this.readFileOperation(input);
      case "write_file":
        return await this.writeFileOperation(input);
      case "list_directory":
        return await this.listDirectoryOperation(input);
      case "create_task":
        return await this.createTaskOperation(input);
      case "update_task":
        return await this.updateTaskOperation(input);
      case "delete_task":
        return await this.deleteTaskOperation(input);
      case "git_status":
        return await this.gitStatusOperation(input);
      case "git_commit":
        return await this.gitCommitOperation(input);
      case "generate_documentation":
        return await this.generateDocumentationOperation(input);
      case "search_documentation":
        return await this.searchDocumentationOperation(input);
      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  }

  private async readFileOperation(input: any): Promise<any> {
    const { path, encoding = "utf-8" } = input;
    
    try {
      const content = await fs.readFile(path, encoding);
      return {
        success: true,
        content,
        path,
        encoding,
        size: content.length
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to read file: ${error.message}`
      };
    }
  }

  private async writeFileOperation(input: any): Promise<any> {
    const { path, content, encoding = "utf-8", createDirectories = false } = input;
    
    try {
      if (createDirectories) {
        const dir = path.dirname(path);
        await fs.mkdir(dir, { recursive: true });
      }
      
      await fs.writeFile(path, content, encoding);
      return {
        success: true,
        path,
        bytesWritten: Buffer.byteLength(content, encoding),
        encoding
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to write file: ${error.message}`
      };
    }
  }

  // Additional operation implementations...
}
```

#### Scenario 2: MCP Client Integration
```typescript
// Client-side MCP integration for AI operations
class MCPClient {
  private server: MCPServer;
  private availableTools: Map<string, McpToolInput> = new Map();

  constructor(server: MCPServer) {
    this.server = server;
    this.loadAvailableTools();
  }

  private async loadAvailableTools(): Promise<void> {
    const tools = await this.server.listTools();
    
    for (const tool of tools) {
      this.availableTools.set(tool.name, tool);
    }
  }

  async callTool(toolName: string, input: any): Promise<any> {
    const tool = this.availableTools.get(toolName);
    if (!tool) {
      throw new Error(`Tool ${toolName} is not available`);
    }

    console.log(`Calling MCP tool: ${toolName}`);
    console.log(`Input:`, JSON.stringify(input, null, 2));

    try {
      const result = await this.server.callTool(toolName, input);
      console.log(`Tool result:`, JSON.stringify(result, null, 2));
      return result;
    } catch (error) {
      console.error(`Tool ${toolName} failed:`, error.message);
      throw error;
    }
  }

  getAvailableTools(): McpToolInput[] {
    return Array.from(this.availableTools.values());
  }

  searchTools(query: string): McpToolInput[] {
    const tools = this.getAvailableTools();
    
    return tools.filter(tool => 
      tool.name.toLowerCase().includes(query.toLowerCase()) ||
      (tool.description && tool.description.toLowerCase().includes(query.toLowerCase()))
    );
  }

  // Convenience methods for common operations
  async readFile(path: string, encoding?: string): Promise<any> {
    return await this.callTool("read_file", { path, encoding });
  }

  async writeFile(path: string, content: string, options?: any): Promise<any> {
    return await this.callTool("write_file", { path, content, ...options });
  }

  async createTask(title: string, options?: any): Promise<any> {
    return await this.callTool("create_task", { title, ...options });
  }

  async getTaskStatus(taskId: string): Promise<any> {
    return await this.callTool("get_task", { taskId });
  }

  async listTasks(filters?: any): Promise<any> {
    return await this.callTool("list_tasks", filters || {});
  }
}

// Usage in AI operations
class EnhancedAIOperations {
  private mcpClient: MCPClient;

  constructor() {
    this.mcpClient = new MCPClient(new MCPServer());
  }

  async generateTaskWithFileContext(prompt: string): Promise<string> {
    // Read relevant files first
    const packageJson = await this.mcpClient.readFile("package.json");
    const readme = await this.mcpClient.readFile("README.md");
    
    const enhancedPrompt = `
Context:
package.json: ${packageJson.content}
README.md: ${readme.content}

User Request: ${prompt}

Generate a task based on the context and user request.
    `;

    return await this.generateText(enhancedPrompt);
  }

  async implementTaskWithCode(taskId: string): Promise<void> {
    // Get task details
    const task = await this.mcpClient.getTaskStatus(taskId);
    
    if (!task.success) {
      throw new Error(`Task ${taskId} not found`);
    }

    // List relevant source files
    const srcFiles = await this.mcpClient.listFiles("src");
    
    // Generate implementation plan
    const plan = await this.generateImplementationPlan(task.task, srcFiles.files);
    
    // Write plan to file
    await this.mcpClient.writeFile(`plans/${taskId}.md`, plan);
    
    // Execute implementation (would integrate with external executors)
    console.log(`Implementation plan created for task ${taskId}`);
  }
}
```

### TECHNICAL SPECIFICATIONS

#### Protocol Compliance
- **MCP Specification**: Follows Model Context Protocol standards
- **Tool Discovery**: Standardized tool listing and description
- **Input Validation**: JSON Schema-based input validation
- **Error Handling**: Consistent error response format
- **Security**: Path validation and access controls

#### Performance Considerations
- **Tool Registration**: O(1) lookup using Map data structure
- **Input Validation**: Efficient schema validation
- **Async Operations**: Non-blocking tool execution
- **Memory Management**: Minimal memory footprint for tool definitions

#### Security Measures
- **Path Validation**: Prevents directory traversal attacks
- **Input Sanitization**: Validates all tool inputs
- **Access Controls**: Restricts file system access to project bounds
- **Error Boundaries**: Prevents error leakage across tool boundaries

#### Extensibility Patterns
- **Tool Registration**: Dynamic tool addition and removal
- **Schema Evolution**: Support for schema versioning
- **Custom Tools**: Easy addition of domain-specific tools
- **Protocol Updates**: Forward-compatible protocol evolution

**Remember:** Citizen, in the wasteland of AI integration, MCP is your universal translator. It lets AI agents understand your project structure, access your files, and manipulate your tasks through standardized protocols. Without proper MCP typing, your AI agents are deaf, dumb, and blind to your codebase.