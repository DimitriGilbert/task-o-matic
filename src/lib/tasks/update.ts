import { Task } from "../../types";
import { getStorage } from "../../utils/ai-service-factory";
import { UpdateTaskOptions, SetTaskStatusOptions } from "../../types/options";

export async function updateTask(
  options: UpdateTaskOptions,
): Promise<Task | null> {
  const { id, ...updates } = options;
  const storage = getStorage();
  const existingTask = await storage.getTask(id);

  if (!existingTask) {
    throw new Error(`Task with ID ${id} not found`);
  }

  // Validate status transitions
  if (updates.status) {
    const validTransitions: Record<string, string[]> = {
      todo: ["in-progress", "completed"],
      "in-progress": ["completed", "todo"],
      completed: ["todo", "in-progress"],
    };

    if (!validTransitions[existingTask.status].includes(updates.status)) {
      throw new Error(
        `Invalid status transition from ${existingTask.status} to ${updates.status}`,
      );
    }
  }

  // The final updates object that will be passed to the storage layer
  const finalUpdates: { [key: string]: any } = { ...updates };

  // Handle tags: convert comma-separated string to array and merge
  if (typeof updates.tags === 'string') {
    const newTags = updates.tags.split(',').map(tag => tag.trim());
    const existingTags = existingTask.tags || [];
    finalUpdates.tags = [...new Set([...existingTags, ...newTags])];
  }

  return await storage.updateTask(id, finalUpdates);
}

// Set task status function
export async function setTaskStatus(
  options: SetTaskStatusOptions,
): Promise<Task | null> {
  return await updateTask({ id: options.id, status: options.status });
}