import { Command } from "commander";
import {
  listCommand,
  createCommand,
  showCommand,
  updateCommand,
  deleteCommand,
  statusCommand,
  addTagsCommand,
  removeTagsCommand,
  planCommand,
  getPlanCommand,
  listPlanCommand,
  deletePlanCommand,
  setPlanCommand,
  enhanceCommand,
  splitCommand,
  documentCommand,
  getDocumentationCommand,
  addDocumentationCommand,
  executeCommand,
  subtasksCommand,
  treeCommand,
  nextCommand,
} from "./tasks/index";

export const tasksCommand = new Command("tasks");

tasksCommand.addCommand(listCommand);
tasksCommand.addCommand(createCommand);
tasksCommand.addCommand(showCommand);
tasksCommand.addCommand(updateCommand);
tasksCommand.addCommand(deleteCommand);
tasksCommand.addCommand(statusCommand);
tasksCommand.addCommand(addTagsCommand);
tasksCommand.addCommand(removeTagsCommand);
tasksCommand.addCommand(planCommand);
tasksCommand.addCommand(getPlanCommand);
tasksCommand.addCommand(listPlanCommand);
tasksCommand.addCommand(deletePlanCommand);
tasksCommand.addCommand(setPlanCommand);
tasksCommand.addCommand(enhanceCommand);
tasksCommand.addCommand(splitCommand);
tasksCommand.addCommand(documentCommand);
tasksCommand.addCommand(getDocumentationCommand);
tasksCommand.addCommand(addDocumentationCommand);
tasksCommand.addCommand(executeCommand);
tasksCommand.addCommand(subtasksCommand);
tasksCommand.addCommand(treeCommand);
tasksCommand.addCommand(nextCommand);
