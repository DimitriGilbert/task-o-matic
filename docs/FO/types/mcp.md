## TECHNICAL BULLETIN NO. 004

### MCP TYPES - MODEL CONTEXT PROTOCOL SUPPORT

**DOCUMENT ID:** `task-o-matic-mcp-types-v1`
**CLEARANCE:** `All Personnel`
**MANDATORY COMPLIANCE:** `Yes`

### ⚠️ CRITICAL SURVIVAL NOTICE

Citizen, ignore these MCP type definitions and your Model Context Protocol integration becomes a black box of undefined behavior. Tool discovery fails, resource management collapses, and your AI agents wander blind without context. This is your gateway to external AI capabilities.

### TYPE SYSTEM ARCHITECTURE

The MCP types system provides **minimal yet extensible foundation** for Model Context Protocol integration. It follows MCP specification while maintaining flexibility for future protocol evolution and custom tool implementations. The architecture supports:

- **Tool Definition**: Standardized tool input/output structures
- **Resource Management**: File and data resource handling
- **Protocol Evolution**: Extensible interfaces for new MCP features
- **Type Safety**: Compile-time validation of MCP interactions
- **Integration Points**: Clean separation between MCP and TaskOMatic systems

This is currently a **placeholder** awaiting implementation as full MCP integration develops.

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
        description: "File path to read",
      },
    },
    required: ["path"],
  },
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
        description: "Git repository directory",
      },
    },
    required: ["directory"],
  },
};
```

**Usage Scenarios**:

When MCP is fully integrated, this interface will support:

1. **File System Operations**: Read, write, list files
2. **Git Operations**: Status, commit, branch operations
3. **Task Management**: Get tasks, update status, manage dependencies
4. **Documentation**: Fetch Context7 docs, search documentation
5. **Project Analysis**: Analyze code structure, detect stack

### INTEGRATION PROTOCOLS

#### MCP Server Integration Pattern

```typescript
// MCP server implementation structure
import { McpToolInput } from "../types/mcp";

class MCPServer {
  private tools: Map<string, McpToolInput> = new Map();
  private resources: Map<string, any> = new Map();

  registerTool(tool: McpToolInput): void {
    // Validate tool structure
    if (!tool.name) {
      throw new Error("Tool must have a name");
    }

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
    // Type validation, format validation, constraints, etc.
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
      const content = await fs.readFile(path, "utf-8");
      return { content };
    } catch (error) {
      throw new Error(`Failed to read file ${path}: ${error.message}`);
    }
  }

  private async writeFile(
    path: string,
    content: string
  ): Promise<{ success: boolean }> {
    try {
      await fs.writeFile(path, content, "utf-8");
      return { success: true };
    } catch (error) {
      throw new Error(`Failed to write file ${path}: ${error.message}`);
    }
  }

  private async getGitStatus(directory: string): Promise<any> {
    try {
      const { stdout } = await execAsync("git status --porcelain", {
        cwd: directory,
      });
      const lines = stdout.split("\n").filter((line) => line.trim());

      const status = {
        modified: [],
        added: [],
        deleted: [],
        untracked: [],
      };

      for (const line of lines) {
        const statusCode = line[0];
        const filePath = line.slice(3);

        switch (statusCode) {
          case "M":
            status.modified.push(filePath);
            break;
          case "A":
            status.added.push(filePath);
            break;
          case "D":
            status.deleted.push(filePath);
            break;
          case "?":
            status.untracked.push(filePath);
            break;
        }
      }

      return status;
    } catch (error) {
      throw new Error(`Failed to get git status: ${error.message}`);
    }
  }

  private async listFiles(
    directory: string,
    pattern?: string
  ): Promise<{ files: string[] }> {
    try {
      const files = await fs.readdir(directory, { withFileTypes: true });
      let fileList = files
        .filter((file) => file.isFile())
        .map((file) => ({
          name: file.name,
          path: path.join(directory, file.name),
          size: file.size,
          modified: file.mtime,
        }));

      if (pattern) {
        const regex = new RegExp(pattern.replace("*", ".*"));
        fileList = fileList.filter(
          (file) => file.type === "file" && regex.test(file.name)
        );
      }

      return { files: fileList };
    } catch (error) {
      throw new Error(
        `Failed to list directory ${directory}: ${error.message}`
      );
    }
  }
}
```

#### TaskOMatic MCP Integration

```typescript
// Integration with TaskOMatic AI operations
import { McpToolInput } from "../types/mcp";
import { AIOperations } from "../lib/ai-service/ai-operations";

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
            description: "File path relative to project root",
          },
        },
        required: ["path"],
      },
    });

    this.mcpServer.registerTool({
      name: "task_list_files",
      description: "List files in task directories",
      inputSchema: {
        type: "object",
        properties: {
          directory: {
            type: "string",
            description: "Directory path to list",
          },
          pattern: {
            type: "string",
            description: "File pattern to match (glob syntax)",
          },
        },
        required: ["directory"],
      },
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
            description: "Task ID to retrieve",
          },
        },
        required: ["taskId"],
      },
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
            description: "Filter by task status",
          },
          tag: {
            type: "string",
            description: "Filter by tag name",
          },
        },
      },
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
            description: "Task ID to get documentation for",
          },
        },
        required: ["taskId"],
      },
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
        success: false,
      };
    }
  }

  private async handleReadFile(input: { path: string }): Promise<any> {
    const fullPath = path.resolve(input.path);

    // Security check - ensure path is within project
    if (!this.isPathSafe(fullPath)) {
      throw new Error("Access denied: path outside project bounds");
    }

    const content = await fs.readFile(fullPath, "utf-8");
    return {
      success: true,
      content,
      path: fullPath,
    };
  }

  private async handleListFiles(input: {
    directory: string;
    pattern?: string;
  }): Promise<any> {
    const fullPath = path.resolve(input.directory);

    if (!this.isPathSafe(fullPath)) {
      throw new Error("Access denied: path outside project bounds");
    }

    const files = await fs.readdir(fullPath, { withFileTypes: true });
    let fileList = files
      .filter((file) => file.isFile())
      .map((file) => ({
        name: file.name,
        path: path.join(fullPath, file.name),
        size: file.size,
        modified: file.mtime,
      }));

    if (input.pattern) {
      const regex = new RegExp(input.pattern.replace("*", ".*"));
      fileList = fileList.filter(
        (file) => file.type === "file" && regex.test(file.name)
      );
    }

    return {
      success: true,
      files: fileList,
      directory: fullPath,
    };
  }

  private async handleGetTask(input: { taskId: string }): Promise<any> {
    const task = await this.aiOperations.getTask(input.taskId);

    if (!task) {
      return {
        success: false,
        error: `Task ${input.taskId} not found`,
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
        effort: task.estimatedEffort,
      },
    };
  }

  private async handleListTasks(input: {
    status?: string;
    tag?: string;
  }): Promise<any> {
    const filters: {
      status: input.status;
      tag: input.tag;
    };

    const tasks = await this.aiOperations.listTasks(filters);

    return {
      success: true,
      tasks: tasks.map((task) => ({
        id: task.id,
        title: task.title,
        status: task.status,
        effort: task.estimatedEffort,
        tags: task.tags || [],
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      })),
      total: tasks.length,
    };
  }

  private async handleGetDocumentation(input: {
    taskId: string;
  }): Promise<any> {
    const task = await this.aiOperations.getTask(input.taskId);

    if (!task) {
      return {
        success: false,
        error: `Task ${input.taskId} not found`,
      };
    }

    if (!task.documentation) {
      return {
        success: false,
        error: `No documentation found for task ${input.taskId}`,
      };
    }

    return {
      success: true,
      documentation: task.documentation,
      taskId: input.taskId,
    };
  }

  private isPathSafe(requestedPath: string): boolean {
    const projectRoot = process.cwd();
    const resolvedPath = path.resolve(requestedPath);

    return resolvedPath.startsWith(projectRoot);
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
- **Extensibility**: Support for schema versioning

#### Performance Considerations

- **Tool Registration**: O(1) lookup using Map data structure
- **Input Validation**: Efficient schema validation
- **Async Operations**: Non-blocking tool execution
- **Memory Management**: Minimal memory footprint for tool definitions
- **Security Measures**: Path validation prevents directory traversal attacks

#### Security Measures

1. **Path Validation**: Prevents directory traversal attacks
2. **Input Sanitization**: Validates all tool inputs
3. **Access Controls**: Restricts file system access to project bounds
4. **Error Boundaries**: Prevents error leakage across tool boundaries

#### Extensibility Patterns

1. **Tool Registration**: Dynamic tool addition and removal
2. **Schema Evolution**: Support for schema versioning
3. **Custom Tools**: Easy addition of domain-specific tools
4. **Protocol Updates**: Forward-compatible protocol evolution

**Remember:** Citizen, in wasteland of AI integration, MCP is your universal translator. It lets AI agents understand your project structure, access your files, and manipulate your tasks through standardized protocols. Without proper MCP typing, your AI agents are deaf, dumb, and blind to your codebase.
