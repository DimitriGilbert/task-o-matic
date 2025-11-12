
import { ListTasksOptions } from "../../types/options";
import { Task } from "../../types";
import { getStorage } from "../../utils/ai-service-factory";

export async function listTasks(options: ListTasksOptions): Promise<Task[]> {
  const storage = getStorage();
  const topLevelTasks = await storage.getTopLevelTasks();

  let filteredTasks = topLevelTasks;

  if (options.status) {
    filteredTasks = filteredTasks.filter(
      (task) => task.status === options.status,
    );
  }

  if (options.tag) {
    const tag = options.tag;
    filteredTasks = filteredTasks.filter(
      (task) => task.tags && task.tags.includes(tag),
    );
  }

  return filteredTasks;
}
