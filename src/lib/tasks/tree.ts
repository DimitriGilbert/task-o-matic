
import { Task } from "../../types";
import { getStorage } from "../../utils/ai-service-factory";

// List subtasks function
export async function listTaskSubtasks(parentId: string): Promise<Task[]> {
  const storage = getStorage();
  const subtasks = await storage.getSubtasks(parentId);
  return subtasks;
}

// Get task tree function
export async function getTaskTree(rootId?: string): Promise<Task[]> {
  const storage = getStorage();

  if (rootId) {
    // Return tree starting from specific task
    const rootTask = await storage.getTask(rootId);
    if (!rootTask) {
      throw new Error(`Task with ID ${rootId} not found`);
    }

    // Get all subtasks recursively
    const getAllSubtasks = async (task: Task): Promise<Task[]> => {
      const subtasks = await storage.getSubtasks(task.id);
      const allSubtasks: Task[] = [];

      for (const subtask of subtasks) {
        allSubtasks.push(subtask);
        const deeperSubtasks = await getAllSubtasks(subtask);
        allSubtasks.push(...deeperSubtasks);
      }

      return allSubtasks;
    };

    const subtasks = await getAllSubtasks(rootTask);
    return [rootTask, ...subtasks];
  } else {
    // Return all top-level tasks and their subtasks
    return await storage.getTasks();
  }
}
