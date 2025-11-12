import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { z } from "zod";
import { listTasks } from "../lib/tasks/list";
import { createTask } from "../lib/tasks/create";
import { configManager } from "../lib/config";

export function registerMcpTools(server: McpServer) {
  server.registerTool(
    "get_project_info",
    {
      title: "Get Project Info",
      description:
        "Gets information about the current task-o-matic project, including AI configuration.",
      inputSchema: {},
    },
    async () => {
      try {
        const config = configManager.getConfig();
        const projectPath = configManager.getWorkingDirectory();
        const info = {
          projectPath,
          aiConfig: config.ai,
        };
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(info, null, 2),
            },
          ],
        };
      } catch (err: unknown) {
        const error = err as Error;
        return {
          content: [{ type: "text", text: `Error: ${error.message}` }],
          isError: true,
        };
      }
    }
  );

  server.registerTool(
    "list_tasks",
    {
      title: "List Tasks",
      description:
        "List all tasks for the current project. Can filter by status.",
      inputSchema: {
        filterByStatus: z.enum(["todo", "in-progress", "completed"]).optional(),
      },
    },
    async (input) => {
      try {
        const tasks = await listTasks({ status: input.filterByStatus });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(tasks, null, 2),
            },
          ],
        };
      } catch (err: unknown) {
        const error = err as Error;
        return {
          content: [{ type: "text", text: `Error: ${error.message}` }],
          isError: true,
        };
      }
    }
  );

  server.registerTool(
    "create_task",
    {
      title: "Create Task",
      description: "Creates a new task.",
      inputSchema: {
        taskTitle: z.string(),
        taskContent: z.string().optional(),
        effort: z.enum(["small", "medium", "large"]).optional(),
        aiEnhance: z.boolean().optional(),
      },
    },
    async (input) => {
      try {
        const { task } = await createTask({
          title: input.taskTitle,
          content: input.taskContent,
          effort: input.effort,
          aiEnhance: input.aiEnhance,
        });
        return {
          content: [
            {
              type: "text",
              text: `Task created successfully with ID: ${task.id}`,
            },
          ],
        };
      } catch (err: unknown) {
        const error = err as Error;
        return {
          content: [{ type: "text", text: `Error: ${error.message}` }],
          isError: true,
        };
      }
    }
  );
}
