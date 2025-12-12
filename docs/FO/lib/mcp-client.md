---
## TECHNICAL BULLETIN NO. 006
### MCP CLIENT - DOCUMENTATION BRIDGE SURVIVAL SYSTEM

**DOCUMENT ID:** `task-o-matic-mcp-client-v1`  
**CLEARANCE:** `All Personnel`  
**MANDATORY COMPLIANCE:** `Yes`

### ⚠️ CRITICAL SURVIVAL NOTICE
Citizen, MCP Client is your bridge to Context7 documentation oasis in the barren wasteland of AI ignorance. Without mastering this connection system, you're scavenging for documentation while a treasure trove of knowledge remains locked behind protocol barriers.

### SYSTEM ARCHITECTURE OVERVIEW

MCP Client provides Model Context Protocol (MCP) integration for accessing Context7 documentation services. It manages HTTP connections, tool retrieval, and documentation caching for AI-enhanced task operations.

**Core Design Principles:**
- **Protocol Abstraction**: HTTP-based MCP client implementation
- **Connection Management**: Lazy initialization and cleanup
- **Tool Integration**: Seamless tool retrieval for AI operations
- **Documentation Caching**: Local storage of retrieved documentation
- **Error Resilience**: Graceful handling of service failures

**MCP Integration Components**:
- **HTTP Transport**: RESTful API communication with Context7
- **Authentication**: API key-based authentication
- **Tool Discovery**: Dynamic tool enumeration and retrieval
- **Result Processing**: Documentation extraction and caching
- **Connection Lifecycle**: Proper resource management

### COMPLETE API DOCUMENTATION

#### Class: Context7Client

**Purpose**: MCP client for Context7 documentation service integration and tool access.

**Constructor**: No explicit constructor required. Uses lazy initialization pattern.

---

#### Method: initializeMCPClient()

**Purpose**: Initialize MCP client connection to Context7 service with HTTP transport.

**Signature**:
```typescript
async initializeMCPClient(): Promise<any>
```

**Parameters**: None

**Return Value**:
- `Promise<any>`: Initialized MCP client instance

**Connection Configuration**:
```typescript
const mcpClient = await experimental_createMCPClient({
  transport: {
    type: "http",
    url: "https://mcp.context7.com/mcp",
    headers: {
      CONTEXT7_API_KEY: process.env.CONTEXT7_API_KEY || ""
    }
  }
});
```

**Lazy Initialization**:
- Checks if client already exists
- Creates new connection only if needed
- Returns existing client instance if available
- Throws connection errors for debugging

**Examples**:

**Basic Initialization**:
```typescript
const client = new Context7Client();

// First call - creates new connection
const client1 = await client.initializeMCPClient();
console.log("MCP client initialized");

// Subsequent calls - returns existing client
const client2 = await client.initializeMCPClient();
console.log("Same client instance:", client1 === client2); // true
```

**Environment Configuration**:
```typescript
// Set environment variable for authentication
process.env.CONTEXT7_API_KEY = "your-context7-api-key";

const client = new Context7Client();
try {
  const mcpClient = await client.initializeMCPClient();
  console.log("Connected to Context7 successfully");
} catch (error) {
  console.error("Failed to initialize MCP client:", error);
}
```

**Error Handling**:
```typescript
class RobustContext7Client extends Context7Client {
  async initializeWithRetry(maxAttempts: number = 3): Promise<any> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await this.initializeMCPClient();
      } catch (error) {
        lastError = error as Error;
        console.warn(`MCP initialization attempt ${attempt} failed:`, error.message);
        
        if (attempt < maxAttempts) {
          // Exponential backoff
          const delay = Math.pow(2, attempt - 1) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw new Error(`Failed to initialize MCP client after ${maxAttempts} attempts: ${lastError.message}`);
  }
}
```

---

#### Method: getMCPTools()

**Purpose**: Retrieve available MCP tools from Context7 service for AI integration.

**Signature**:
```typescript
async getMCPTools(): Promise<ToolSet>
```

**Parameters**: None

**Return Value**:
- `Promise<ToolSet>`: Set of available MCP tools

**Tool Retrieval Process**:
1. **Client Initialization**: Ensure MCP connection is established
2. **Tool Discovery**: Retrieve tool definitions from service
3. **Format Conversion**: Convert MCP tools to AI SDK compatible format
4. **Error Handling**: Throw descriptive errors for failures

**Tool Structure**:
```typescript
interface ToolSet {
  [toolName: string]: Tool;
}

interface Tool {
  description: string;
  parameters: any; // Zod schema or similar
  execute: (input: any) => Promise<any>;
}
```

**Examples**:

**Basic Tool Retrieval**:
```typescript
const client = new Context7Client();

try {
  const tools = await client.getMCPTools();
  console.log("Available MCP tools:", Object.keys(tools));
  
  // Tools typically include:
  // - context7_resolve_library_id
  // - context7_get_library_docs
  // - Additional Context7 tools
  
  return tools;
} catch (error) {
  console.error("Failed to retrieve MCP tools:", error);
  throw error;
}
```

**Tool Integration with AI**:
```typescript
class AIWithMCPTools {
  private context7Client = new Context7Client();
  
  async generateWithTools(prompt: string) {
    try {
      const mcpTools = await this.context7Client.getMCPTools();
      
      // Combine with other tools
      const allTools = {
        ...mcpTools,
        // Add local tools
        readFile: fileReadTool,
        listDirectory: directoryListTool
      };
      
      // Use with Vercel AI SDK
      const result = await streamText({
        model: this.getModel(),
        messages: [{ role: "user", content: prompt }],
        tools: allTools
      });
      
      return result;
    } catch (error) {
      console.error("Failed to get MCP tools:", error);
      // Fallback to generation without tools
      return await streamText({
        model: this.getModel(),
        messages: [{ role: "user", content: prompt }]
      });
    }
  }
}
```

**Tool Inspection**:
```typescript
class ToolInspector {
  private context7Client = new Context7Client();
  
  async inspectAvailableTools() {
    const tools = await this.context7Client.getMCPTools();
    
    for (const [toolName, tool] of Object.entries(tools)) {
      console.log(`\n=== ${toolName} ===`);
      console.log(`Description: ${tool.description}`);
      console.log(`Parameters:`, tool.parameters);
      
      // Show parameter details
      if (tool.parameters && typeof tool.parameters === 'object') {
        const schema = tool.parameters as any;
        if (schema.properties) {
          for (const [paramName, paramSchema] of Object.entries(schema.properties)) {
            console.log(`  - ${paramName}: ${paramSchema.type || 'unknown'}`);
            if (paramSchema.description) {
              console.log(`    ${paramSchema.description}`);
            }
          }
        }
      }
    }
  }
  
  async testTool(toolName: string, testInput: any) {
    const tools = await this.context7Client.getMCPTools();
    const tool = tools[toolName];
    
    if (!tool) {
      throw new Error(`Tool ${toolName} not found`);
    }
    
    try {
      const result = await tool.execute(testInput);
      console.log(`Tool ${toolName} result:`, result);
      return result;
    } catch (error) {
      console.error(`Tool ${toolName} failed:`, error);
      throw error;
    }
  }
}
```

---

#### Method: closeMCPConnection()

**Purpose**: Close MCP client connection and cleanup resources.

**Signature**:
```typescript
async closeMCPConnection(): Promise<void>
```

**Parameters**: None

**Return Value**:
- `Promise<void>`: Resolves when connection is closed

**Cleanup Process**:
1. **Connection Check**: Verify client exists before cleanup
2. **Resource Cleanup**: Close HTTP connections and release resources
3. **State Reset**: Set client instance to null
4. **Error Handling**: Graceful handling of cleanup failures

**Examples**:

**Basic Connection Cleanup**:
```typescript
const client = new Context7Client();

// Use client
await client.initializeMCPClient();
const tools = await client.getMCPTools();
// ... use tools for AI operations

// Clean up when done
await client.closeMCPConnection();
console.log("MCP connection closed");
```

**Resource Management**:
```typescript
class ManagedContext7Client {
  private context7Client = new Context7Client();
  private connectionCount = 0;
  
  async withConnection<T>(operation: () => Promise<T>): Promise<T> {
    try {
      await this.context7Client.initializeMCPClient();
      this.connectionCount++;
      console.log(`MCP connection opened (count: ${this.connectionCount})`);
      
      const result = await operation();
      return result;
    } finally {
      await this.context7Client.closeMCPConnection();
      console.log("MCP connection closed");
    }
  }
  
  async batchOperations(operations: Array<() => Promise<any>>) {
    const results = [];
    
    // Open connection once for all operations
    await this.withConnection(async () => {
      for (const operation of operations) {
        const result = await operation();
        results.push(result);
      }
    });
    
    return results;
  }
}
```

**Error Handling During Cleanup**:
```typescript
class SafeContext7Client extends Context7Client {
  async closeMCPConnection(): Promise<void> {
    try {
      await super.closeMCPConnection();
      console.log("MCP connection closed successfully");
    } catch (error) {
      console.warn("Error during MCP connection cleanup:", error.message);
      // Don't throw - cleanup errors shouldn't stop execution
    }
  }
  
  async forceClose(): Promise<void> {
    // Force close with timeout
    try {
      const closePromise = this.closeMCPConnection();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Cleanup timeout")), 5000)
      );
      
      await Promise.race([closePromise, timeoutPromise]);
      console.log("MCP connection force-closed");
    } catch (error) {
      console.warn("Force close failed:", error.message);
    }
  }
}
```

---

#### Method: saveContext7Documentation()

**Purpose**: Save retrieved Context7 documentation to local storage for caching and future use.

**Signature**:
```typescript
async saveContext7Documentation(
  library: string,
  query: string,
  content: string
): Promise<string>
```

**Parameters**:
- `library` (string, required): Library name for documentation
- `query` (string, required): Search query or topic identifier
- `content` (string, required): Documentation content to save

**Return Value**:
- `Promise<string>`: Path to saved documentation file

**Storage Process**:
1. **Storage Retrieval**: Get storage instance from factory
2. **File Path Generation**: Create unique filename with timestamp
3. **Directory Creation**: Ensure documentation directory exists
4. **File Writing**: Save content with proper formatting
5. **Path Return**: Return relative path for reference

**File Organization**:
```
.task-o-matic/
├── docs/
│   ├── _cache/
│   │   ├── react-hooks-1703123456.json
│   │   ├── nextjs-routing-1703123457.json
│   │   └── ...
│   └── ...
```

**Examples**:

**Basic Documentation Saving**:
```typescript
const client = new Context7Client();

// Save documentation from Context7
const filePath = await client.saveContext7Documentation(
  "react",
  "hooks",
  `# React Hooks Documentation

## useState
The useState Hook lets you add React state to function components...

## useEffect
The useEffect Hook lets you perform side effects in function components...
`
);

console.log("Documentation saved to:", filePath);
// Output: .task-o-matic/docs/_cache/react-hooks-1703123456.json
```

**Batch Documentation Saving**:
```typescript
class DocumentationBatcher {
  private context7Client = new Context7Client();
  
  async saveBatch(documentationList: Array<{
    library: string;
    query: string;
    content: string;
  }>): Promise<string[]> {
    const savedPaths = [];
    
    for (const doc of documentationList) {
      try {
        const path = await this.context7Client.saveContext7Documentation(
          doc.library,
          doc.query,
          doc.content
        );
        savedPaths.push(path);
        console.log(`Saved documentation for ${doc.library}: ${path}`);
      } catch (error) {
        console.error(`Failed to save documentation for ${doc.library}:`, error);
        // Continue with other documents
        continue;
      }
    }
    
    return savedPaths;
  }
  
  async saveWithTimestamp(library: string, content: string): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const query = `${library}-${timestamp}`;
    
    return await this.context7Client.saveContext7Documentation(
      library,
      query,
      content
    );
  }
}
```

**Error Handling and Recovery**:
```typescript
class RobustDocumentationSaver {
  private context7Client = new Context7Client();
  
  async saveWithRetry(
    library: string,
    query: string,
    content: string,
    maxRetries: number = 3
  ): Promise<string> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.context7Client.saveContext7Documentation(
          library,
          query,
          content
        );
      } catch (error) {
        lastError = error as Error;
        console.warn(`Documentation save attempt ${attempt} failed:`, error.message);
        
        if (attempt < maxRetries) {
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }
    
    throw new Error(`Failed to save documentation after ${maxRetries} attempts: ${lastError.message}`);
  }
  
  async saveWithValidation(library: string, query: string, content: string): Promise<string> {
    // Validate inputs before saving
    if (!library || !query || !content) {
      throw new Error("Library, query, and content are required");
    }
    
    if (content.length === 0) {
      console.warn(`Empty content for ${library}:${query}, skipping save`);
      return "";
    }
    
    // Check content size
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (content.length > maxSize) {
      throw new Error(`Content too large: ${content.length} bytes (max: ${maxSize})`);
    }
    
    return await this.context7Client.saveContext7Documentation(
      library,
      query,
      content
    );
  }
}
```

### INTEGRATION PROTOCOLS

#### Connection Management Protocol
MCP connection follows this lifecycle:
1. **Lazy Initialization**: Connect only when needed
2. **Singleton Pattern**: Reuse existing connections
3. **Graceful Cleanup**: Proper resource release
4. **Error Recovery**: Handle connection failures gracefully

#### Tool Integration Protocol
Tool retrieval follows this pattern:
1. **Client Verification**: Ensure MCP connection exists
2. **Tool Discovery**: Retrieve available tools from service
3. **Format Conversion**: Convert to AI SDK compatible format
4. **Error Propagation**: Clear error messages for debugging

#### Documentation Caching Protocol
Documentation storage follows this structure:
1. **Path Generation**: Unique filenames with timestamps
2. **Directory Management**: Automatic creation of cache directories
3. **Content Validation**: Input validation before storage
4. **Error Handling**: Graceful failure handling with retries

### SURVIVAL SCENARIOS

#### Scenario 1: Robust MCP Integration
```typescript
class ProductionMCPClient {
  private context7Client = new Context7Client();
  private connectionHealth = {
    lastConnected: null as Date | null,
    failureCount: 0,
    totalConnections: 0
  };
  
  async executeWithTools<T>(
    operation: (tools: ToolSet) => Promise<T>
  ): Promise<T> {
    const startTime = Date.now();
    
    try {
      // Initialize with health tracking
      await this.context7Client.initializeMCPClient();
      this.connectionHealth.lastConnected = new Date();
      this.connectionHealth.totalConnections++;
      
      // Get tools with timeout
      const toolsPromise = this.context7Client.getMCPTools();
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error("Tool retrieval timeout")), 10000)
      );
      
      const tools = await Promise.race([toolsPromise, timeoutPromise]);
      
      // Execute operation with tools
      const result = await operation(tools);
      
      const duration = Date.now() - startTime;
      console.log(`MCP operation completed in ${duration}ms`);
      
      return result;
    } catch (error) {
      this.connectionHealth.failureCount++;
      console.error(`MCP operation failed:`, error);
      
      // Determine if we should retry
      if (this.shouldRetry(error)) {
        console.log("Retrying MCP operation...");
        return await this.executeWithTools(operation);
      }
      
      throw error;
    } finally {
      // Always cleanup
      await this.context7Client.closeMCPConnection();
    }
  }
  
  private shouldRetry(error: Error): boolean {
    const message = error.message.toLowerCase();
    
    // Retry on network or timeout errors
    return message.includes('timeout') ||
           message.includes('network') ||
           message.includes('connection') ||
           this.connectionHealth.failureCount < 3;
  }
  
  getHealthStatus() {
    return {
      ...this.connectionHealth,
      successRate: this.connectionHealth.totalConnections > 0 
        ? ((this.connectionHealth.totalConnections - this.connectionHealth.failureCount) / this.connectionHealth.totalConnections * 100)
        : 0
    };
  }
}
```

#### Scenario 2: Documentation Management System
```typescript
class DocumentationManager {
  private context7Client = new Context7Client();
  private cache = new Map<string, { content: string; timestamp: Date; path: string }>();
  
  async getOrFetchDocumentation(
    library: string,
    query: string,
    forceRefresh: boolean = false
  ): Promise<string> {
    const cacheKey = `${library}:${query}`;
    const cached = this.cache.get(cacheKey);
    
    // Return cached version if available and not forced refresh
    if (!forceRefresh && cached && this.isCacheValid(cached)) {
      console.log(`Returning cached documentation for ${cacheKey}`);
      return cached.content;
    }
    
    try {
      // Fetch fresh documentation
      await this.context7Client.initializeMCPClient();
      const tools = await this.context7Client.getMCPTools();
      
      // Use resolve-library-id tool to find library
      const resolveTool = tools['context7_resolve_library_id'];
      if (resolveTool) {
        const libraryInfo = await resolveTool.execute({ libraryName: library });
        console.log(`Resolved library ${library} to:`, libraryInfo);
      }
      
      // Use get-library-docs tool to fetch documentation
      const docsTool = tools['context7_get_library_docs'];
      if (docsTool) {
        const docs = await docsTool.execute({
          context7CompatibleLibraryID: libraryInfo.id || `/openai/docs`,
          topic: query
        });
        
        const content = this.extractContent(docs);
        
        // Save to cache
        const path = await this.context7Client.saveContext7Documentation(
          library,
          query,
          content
        );
        
        // Update cache
        this.cache.set(cacheKey, {
          content,
          timestamp: new Date(),
          path
        });
        
        console.log(`Fetched and cached documentation for ${cacheKey}: ${path}`);
        return content;
      }
      
      throw new Error(`Required MCP tools not available for documentation fetching`);
    } catch (error) {
      console.error(`Failed to fetch documentation for ${cacheKey}:`, error);
      
      // Return stale cache if available
      if (cached) {
        console.log(`Returning stale cache for ${cacheKey} due to fetch failure`);
        return cached.content;
      }
      
      throw error;
    } finally {
      await this.context7Client.closeMCPConnection();
    }
  }
  
  private extractContent(docs: any): string {
    if (docs && typeof docs === 'object') {
      if ('content' in docs) {
        const content = docs.content;
        if (Array.isArray(content)) {
          return content.map((item: any) => item.text || '').join('\n');
        } else if (typeof content === 'string') {
          return content;
        }
      }
    }
    
    return '';
  }
  
  private isCacheValid(cached: { timestamp: Date }): boolean {
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    return (Date.now() - cached.timestamp.getTime()) < maxAge;
  }
  
  clearCache() {
    this.cache.clear();
    console.log("Documentation cache cleared");
  }
  
  getCacheStats() {
    return {
      totalEntries: this.cache.size,
      totalSize: Array.from(this.cache.values())
        .reduce((sum, entry) => sum + entry.content.length, 0)
    };
  }
}
```

#### Scenario 3: Multi-Provider Documentation Strategy
```typescript
class MultiSourceDocumentationProvider {
  private context7Client = new Context7Client();
  private fallbackProviders = [
    { name: 'local', priority: 1 },
    { name: 'github', priority: 2 },
    { name: 'custom-api', priority: 3 }
  ];
  
  async getDocumentationFromBestSource(
    library: string,
    query: string
  ): Promise<{ content: string; source: string; path?: string }> {
    const sources = [
      // Try Context7 first (highest priority)
      {
        name: 'context7',
        priority: 0,
        fetch: async () => {
          try {
            await this.context7Client.initializeMCPClient();
            const tools = await this.context7Client.getMCPTools();
            
            const docsTool = tools['context7_get_library_docs'];
            if (docsTool) {
              const resolveTool = tools['context7_resolve_library_id'];
              const libraryInfo = await resolveTool?.execute({ libraryName: library });
              
              const docs = await docsTool.execute({
                context7CompatibleLibraryID: libraryInfo?.id || `/openai/docs`,
                topic: query
              });
              
              const content = this.extractContent(docs);
              const path = await this.context7Client.saveContext7Documentation(
                library,
                query,
                content
              );
              
              return { content, source: 'context7', path };
            }
          } catch (error) {
            console.warn("Context7 failed:", error.message);
            return null;
          } finally {
            await this.context7Client.closeMCPConnection();
          }
        }
      },
      ...this.fallbackProviders.map(provider => ({
        name: provider.name,
        priority: provider.priority,
        fetch: async () => this.fetchFromProvider(provider, library, query)
      }))
    ];
    
    // Try sources in priority order
    for (const source of sources.sort((a, b) => a.priority - b.priority)) {
      try {
        const result = await source.fetch();
        if (result && result.content.trim().length > 0) {
          console.log(`Documentation fetched from ${source.name}:`, result.source);
          return result;
        }
      } catch (error) {
        console.warn(`Source ${source.name} failed:`, error.message);
        continue;
      }
    }
    
    throw new Error(`All documentation sources failed for ${library}:${query}`);
  }
  
  private async fetchFromProvider(
    provider: { name: string; priority: number },
    library: string,
    query: string
  ): Promise<{ content: string; source: string } | null> {
    switch (provider.name) {
      case 'local':
        return this.fetchFromLocalCache(library, query);
      case 'github':
        return this.fetchFromGitHub(library, query);
      case 'custom-api':
        return this.fetchFromCustomAPI(library, query);
      default:
        return null;
    }
  }
  
  // Implement other fetch methods...
  private async fetchFromLocalCache(library: string, query: string) {
    // Implementation for local cache fetching
    return null;
  }
  
  private async fetchFromGitHub(library: string, query: string) {
    // Implementation for GitHub documentation fetching
    return null;
  }
  
  private async fetchFromCustomAPI(library: string, query: string) {
    // Implementation for custom API fetching
    return null;
  }
}
```

### TECHNICAL SPECIFICATIONS

#### Performance Characteristics
- **Connection Reuse**: Singleton pattern minimizes connection overhead
- **Lazy Loading**: Resources allocated only when needed
- **Tool Caching**: Tool definitions cached for repeated use
- **Documentation Storage**: Efficient file I/O with proper organization

#### Security Considerations
- **API Key Management**: Secure handling of authentication tokens
- **Input Validation**: Parameter validation before API calls
- **Path Sanitization**: Safe file path generation
- **Error Boundaries**: No sensitive data in error messages

#### Reliability Features
- **Graceful Degradation**: Fallback behavior for service failures
- **Timeout Protection**: Prevents hanging connections
- **Resource Cleanup**: Proper connection and memory management
- **Error Recovery**: Retry logic with exponential backoff

#### Monitoring Integration
- **Connection Metrics**: Track connection success/failure rates
- **Performance Monitoring**: Operation duration and tool usage
- **Cache Analytics**: Documentation cache hit/miss ratios
- **Health Checks**: Service availability monitoring

**Remember:** Citizen, MCP Client is your diplomatic envoy to the Context7 knowledge empire. Without mastering this protocol bridge, you're isolated in the wasteland with no access to the vast libraries of documented wisdom. Master these connection patterns, or remain forever ignorant of the documented world.

---

**END OF BULLETIN**