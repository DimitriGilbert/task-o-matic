import { Task } from "../../types";
import { getStorage } from "../../utils/ai-service-factory";
import { ManageTagsOptions } from "../../types/options";

// Add tags function
export async function addTaskTags(
  options: ManageTagsOptions,
): Promise<Task | null> {
  const { id, tags: tagsString } = options;
  const tags = tagsString.split(',').map(tag => tag.trim());

  const storage = getStorage();
  const task = await storage.getTask(id);

  if (!task) {
    throw new Error(`Task with ID ${id} not found`);
  }

  const existingTags = task.tags || [];
  const newTags = tags.filter((tag) => !existingTags.includes(tag));

  if (newTags.length === 0) {
    return task; // No new tags to add
  }

  const updatedTags = [...existingTags, ...newTags];
  return await storage.updateTask(id, { tags: updatedTags });
}

// Remove tags function
export async function removeTaskTags(
  options: ManageTagsOptions,
): Promise<Task | null> {
  const { id, tags: tagsString } = options;
  const tagsToRemove = tagsString.split(',').map(tag => tag.trim());

  const storage = getStorage();
  const task = await storage.getTask(id);

  if (!task) {
    throw new Error(`Task with ID ${id} not found`);
  }

  const existingTags = task.tags || [];
  const updatedTags = existingTags.filter((tag) => !tagsToRemove.includes(tag));

  if (updatedTags.length === existingTags.length) {
    return task; // No tags removed
  }

  return await storage.updateTask(id, { tags: updatedTags });
}