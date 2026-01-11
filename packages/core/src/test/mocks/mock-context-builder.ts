import { TaskRepository } from "../../lib/storage/types";
import { TaskContext } from "../../types";

export class MockContextBuilder {
  constructor(private storage: TaskRepository) {}

  async buildContextForNewTask(
    title: string,
    content?: string
  ): Promise<TaskContext> {
    return {
      task: {
        id: "new-task",
        title,
        description: content || "",
        fullContent: content,
      },
      stack: {
        projectName: "test-project",
        frontend: "next",
        backend: "hono",
        database: "sqlite",
        auth: "better-auth",
        runtime: "node",
        api: "none",
        payments: "none",
        orm: "drizzle",
        dbSetup: "none",
        packageManager: "npm",
        git: true,
        webDeploy: "none",
        serverDeploy: "none",
        install: true,
        addons: [],
        examples: [],
        createdAt: new Date().toISOString(),
        _source: "mock",
      },
      existingResearch: {},
    };
  }

  async buildContext(taskId: string): Promise<TaskContext> {
    const task = await this.storage.getTask(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    return {
      task: {
        id: task.id,
        title: task.title,
        description: task.description || "",
        fullContent: task.content || task.description,
      },
      stack: {
        projectName: "test-project",
        frontend: "next",
        backend: "hono",
        database: "sqlite",
        auth: "better-auth",
        runtime: "node",
        api: "none",
        payments: "none",
        orm: "drizzle",
        dbSetup: "none",
        packageManager: "npm",
        git: true,
        webDeploy: "none",
        serverDeploy: "none",
        install: true,
        addons: [],
        examples: [],
        createdAt: new Date().toISOString(),
        _source: "mock",
      },
      existingResearch: {},
    };
  }

  isDocumentationFresh(documentation: any): boolean {
    return true;
  }
}
