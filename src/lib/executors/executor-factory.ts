import { ExternalExecutor, ExecutorTool } from "../../types";
import { OpencodeExecutor } from "./opencode-executor";
import { ClaudeCodeExecutor } from "./claude-code-executor";
import { GeminiExecutor } from "./gemini-executor";
import { CodexExecutor } from "./codex-executor";

export class ExecutorFactory {
  static create(tool: ExecutorTool = "opencode"): ExternalExecutor {
    switch (tool) {
      case "opencode":
        return new OpencodeExecutor();
      case "claude":
        return new ClaudeCodeExecutor();
      case "gemini":
        return new GeminiExecutor();
      case "codex":
        return new CodexExecutor();
      default:
        throw new Error(`Unknown executor tool: ${tool}`);
    }
  }
}