
import { Task } from "../../types";
import { getStorage } from "../../utils/ai-service-factory";

export async function getTask(id: string): Promise<Task | null> {
  return await getStorage().getTask(id);
}

export async function getTaskContent(id: string): Promise<string | null> {
  return await getStorage().getTaskContent(id);
}

export async function getTaskAIMetadata(id: string): Promise<any | null> {
  return await getStorage().getTaskAIMetadata(id);
}

export async function getSubtasks(id: string): Promise<Task[]> {
  return await getStorage().getSubtasks(id);
}
