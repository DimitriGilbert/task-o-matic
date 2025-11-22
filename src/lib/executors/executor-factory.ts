import { ExternalExecutor, ExecutorTool, ExecutorConfig } from "../../types";
import { OpencodeExecutor } from "./opencode-executor";
import { ClaudeCodeExecutor } from "./claude-code-executor";
import { GeminiExecutor } from "./gemini-executor";
import { CodexExecutor } from "./codex-executor";

export class ExecutorFactory {
  static create(
    tool: ExecutorTool = "opencode",
    config?: ExecutorConfig
  ): ExternalExecutor {
    switch (tool) {
      case "opencode":
        return new OpencodeExecutor(config);
      case "claude":
        return new ClaudeCodeExecutor(config);
      case "gemini":
        return new GeminiExecutor(config);
      case "codex":
        return new CodexExecutor(config);
      default:
        throw new Error(`Unknown executor tool: ${tool}`);
    }
  }
}
