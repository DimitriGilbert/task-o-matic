import { experimental_createMCPClient } from "@ai-sdk/mcp";
import { getStorage } from "../../utils/ai-service-factory";
import { ToolSet, Tool } from "ai";

export class Context7Client {
  private mcpClient: any = null;

  async initializeMCPClient() {
    if (this.mcpClient) return this.mcpClient;

    try {
      // Connect to Context7 MCP server using HTTP transport
      this.mcpClient = await experimental_createMCPClient({
        transport: {
          type: "http",
          url: "https://mcp.context7.com/mcp",
          headers: {
            CONTEXT7_API_KEY: process.env.CONTEXT7_API_KEY || "",
          },
        },
      });
      return this.mcpClient;
    } catch (error) {
      throw error;
    }
  }

  async getMCPTools(): Promise<ToolSet> {
    const client = await this.initializeMCPClient();
    if (!client) {
      throw new Error("Failed to initialize MCP client");
    }
    
    // Return original tools without wrapping - tool wrapping doesn't work with MCP tools
    // Context7 result saving will be handled in ai-operations.ts by processing toolResults
    return await client.tools();
  }

  async closeMCPConnection() {
    if (this.mcpClient) {
      await this.mcpClient.close();
      this.mcpClient = null;
    }
  }

  async saveContext7Documentation(
    library: string,
    query: string,
    content: string,
  ): Promise<string> {
    const storage = getStorage();
    return await storage.saveContext7Documentation(library, query, content);
  }
}