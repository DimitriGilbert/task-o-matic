#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerMcpTools } from "./tools";
import { registerMcpResources } from "./resources";
import { registerMcpPrompts } from "./prompts";

const mcpServer = new McpServer({
  name: "task-o-matic-mcp-server",
  version: "0.1.0",
});

// Register all tools, resources, and prompts
registerMcpTools(mcpServer);
registerMcpResources(mcpServer);
registerMcpPrompts(mcpServer);

async function main() {
  const transport = new StdioServerTransport();
  await mcpServer.connect(transport);
  console.error("task-o-matic MCP server is running...");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
