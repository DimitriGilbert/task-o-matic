import { ExternalExecutor, ExecutorTool } from "../../types";
import { OpencodeExecutor } from "./opencode-executor";

export class ExecutorFactory {
  static create(tool: ExecutorTool = "opencode"): ExternalExecutor {
    switch (tool) {
      case "opencode":
        return new OpencodeExecutor();
      case "claude":
        throw new Error("Claude executor not implemented yet");
      case "gemini":
        throw new Error("Gemini executor not implemented yet");
      case "codex":
        throw new Error("Codex executor not implemented yet");
      default:
        throw new Error(`Unknown executor tool: ${tool}`);
    }
  }
}