import { GetNextTaskOptions } from "../../types/options";
import { Task } from "../../types";
import { getStorage } from "../../utils/ai-service-factory";

export async function getNextTask(options: GetNextTaskOptions): Promise<Task | null> {
  const storage = getStorage();
  const allTasks = await storage.getTasks();
  
  // Filter by status and other criteria
  let filteredTasks = allTasks.filter(task => {
    if (options.status && task.status !== options.status) return false;
    if (options.tag && (!task.tags || !task.tags.includes(options.tag))) return false;
    if (options.effort && task.estimatedEffort !== options.effort) return false;
    return true;
  });

  if (filteredTasks.length === 0) return null;

  // Sort based on priority
  switch (options.priority) {
    case "newest":
      return filteredTasks.sort((a, b) => b.createdAt - a.createdAt)[0];
    case "oldest":
      return filteredTasks.sort((a, b) => a.createdAt - b.createdAt)[0];
    case "effort":
      const effortOrder = { "small": 1, "medium": 2, "large": 3 };
      return filteredTasks.sort((a, b) => 
        (effortOrder[a.estimatedEffort || "medium"] || 2) - 
        (effortOrder[b.estimatedEffort || "medium"] || 2)
      )[0];
    default:
      // Default: task ID order (1, 1.1, 1.2, 2, 2.1, etc.)
      return filteredTasks.sort((a, b) => a.id.localeCompare(b.id))[0];
  }
}