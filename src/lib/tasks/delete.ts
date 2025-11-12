import { Task } from "../../types";
import { getStorage } from "../../utils/ai-service-factory";
import { DeleteTaskOptions } from "../../types/options";

export async function deleteTask(
  options: DeleteTaskOptions,
): Promise<{ deleted: Task[]; orphanedSubtasks: Task[] }> {
  const { id, cascade, force } = options;
  const storage = getStorage();
  const taskToDelete = await storage.getTask(id);

  if (!taskToDelete) {
    throw new Error(`Task with ID ${id} not found`);
  }

  const deleted: Task[] = [];
  const orphanedSubtasks: Task[] = [];

  // Get subtasks before deletion
  const subtasks = await storage.getSubtasks(id);

  if (subtasks.length > 0 && !cascade) {
    if (!force) {
      throw new Error(
        `Task has ${subtasks.length} subtasks. Use --cascade to delete them or --force to orphan them`,
      );
    }
    // Orphan subtasks by removing parent reference
    for (const subtask of subtasks) {
      await storage.updateTask(subtask.id, { parentId: undefined });
      orphanedSubtasks.push(subtask);
    }
  } else if (cascade) {
    // Recursively delete subtasks
    for (const subtask of subtasks) {
      const result = await deleteTask({ id: subtask.id, cascade: true, force: true });
      deleted.push(...result.deleted);
      orphanedSubtasks.push(...result.orphanedSubtasks);
    }
  }

  // Delete the main task
  const success = await storage.deleteTask(id);
  if (success) {
    deleted.push(taskToDelete);
  }

  return { deleted, orphanedSubtasks };
}