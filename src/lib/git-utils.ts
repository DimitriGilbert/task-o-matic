import { exec } from "child_process";
import { promisify } from "util";
import chalk from "chalk";
import { getAIOperations } from "../utils/ai-service-factory";

const execAsync = promisify(exec);

/**
 * Git state captured before and after execution
 */
export interface GitState {
  beforeHead: string;
  afterHead: string;
  hasUncommittedChanges: boolean;
}

/**
 * Commit information extracted from git state
 */
export interface CommitInfo {
  message: string;
  files: string[];
}

/**
 * Capture git state (HEAD commit and uncommitted changes)
 */
export async function captureGitState(
  execFn: (
    command: string
  ) => Promise<{ stdout: string; stderr: string }> = execAsync
): Promise<Partial<GitState>> {
  try {
    const { stdout: headStdout } = await execFn("git rev-parse HEAD");
    const { stdout: statusStdout } = await execFn("git status --porcelain");

    return {
      beforeHead: headStdout.trim(),
      afterHead: headStdout.trim(),
      hasUncommittedChanges: statusStdout.trim().length > 0,
    };
  } catch (e) {
    // Git might not be initialized or no commits yet
    return {};
  }
}

/**
 * Extract commit message and file list from git state
 * This function analyzes the actual git state to generate appropriate commit info
 */
export async function extractCommitInfo(
  taskId: string,
  taskTitle: string,
  executionMessage: string,
  gitState: GitState,
  execFn: (
    command: string
  ) => Promise<{ stdout: string; stderr: string }> = execAsync,
  aiOps: any = getAIOperations()
): Promise<CommitInfo> {
  try {
    // Case 1: Executor created a commit
    if (gitState.beforeHead !== gitState.afterHead) {
      console.log(
        chalk.blue("📝 Executor created a commit, extracting info...")
      );
      const { stdout } = await execFn(
        `git show --stat --format="%s%n%b" ${gitState.afterHead}`
      );

      const lines = stdout.trim().split("\n");
      const message = lines[0].trim();
      // Parse files from stat output (e.g. " src/file.ts | 10 +")
      const files = lines
        .slice(1)
        .filter((line) => line.includes("|"))
        .map((line) => line.split("|")[0].trim());

      return {
        message,
        files,
      };
    }

    // Case 2: Executor left uncommitted changes
    if (gitState.hasUncommittedChanges) {
      console.log(
        chalk.blue(
          "📝 Uncommitted changes detected, generating commit message..."
        )
      );

      // Get the diff to send to AI
      const { stdout: diff } = await execFn("git diff HEAD");

      // Get list of changed files
      const { stdout: status } = await execFn("git status --porcelain");
      const files = status
        .split("\n")
        .filter((line) => line.length > 0)
        .map((line) => line.substring(3).trim())
        .filter((file) => file.length > 0);

      // Use AI to generate commit message based on the diff
      const prompt = `Based on the following git diff, generate a concise git commit message.

Task: ${taskTitle}

Git Diff:
${diff.substring(0, 10000)} // Limit diff size

Please respond in JSON format:
{
  "message": "concise commit message following conventional commits format"
}

The commit message should:
- Follow conventional commits format (feat:, fix:, refactor:, etc.)
- Be concise and descriptive
- Focus on what changed
`;

      const response = await aiOps.streamText(
        prompt,
        undefined,
        "You are a helpful assistant that generates git commit messages."
      );

      // Try to parse JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      let message = `feat: complete task ${taskTitle}`;

      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.message) {
            message = parsed.message;
          }
        } catch (e) {
          // Ignore parse error
        }
      }

      return {
        message,
        files,
      };
    }

    // Case 3: No changes detected
    return {
      message: `feat: complete task ${taskTitle}`,
      files: [],
    };
  } catch (error) {
    console.warn(
      chalk.yellow(
        `⚠️  Failed to extract commit info: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      )
    );
    // Fallback commit info
    return {
      message: `feat: complete task ${taskTitle}`,
      files: [],
    };
  }
}

/**
 * Auto-commit changes using the provided commit info
 */
export async function autoCommit(
  commitInfo: CommitInfo,
  execFn: (
    command: string
  ) => Promise<{ stdout: string; stderr: string }> = execAsync
): Promise<void> {
  try {
    const { message, files } = commitInfo;

    if (files.length > 0) {
      // Stage specific files
      const gitAdd = `git add ${files.join(" ")}`;
      console.log(chalk.blue(`📦 Staging files: ${gitAdd}`));
      await execFn(gitAdd);
    } else {
      // Stage all changes
      console.log(chalk.blue("📦 Staging all changes"));
      await execFn("git add .");
    }

    // Commit
    const gitCommit = `git commit -m "${message}"`;
    console.log(chalk.blue(`💾 Committing: ${message}`));
    await execFn(gitCommit);

    console.log(chalk.green("✅ Changes committed successfully\n"));
  } catch (error) {
    console.warn(
      chalk.yellow(
        `⚠️  Auto-commit failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }\n`
      )
    );
  }
}

/**
 * Commit a specific file with a custom message
 */
export async function commitFile(
  filePath: string,
  message: string,
  execFn: (
    command: string
  ) => Promise<{ stdout: string; stderr: string }> = execAsync
): Promise<void> {
  try {
    console.log(chalk.blue(`📦 Staging file: ${filePath}`));
    await execFn(`git add ${filePath}`);
    await execFn(`git commit -m "${message}"`);
    console.log(chalk.green("✅ File committed successfully"));
  } catch (e) {
    console.warn(
      chalk.yellow(
        `⚠️  Failed to commit file: ${
          e instanceof Error ? e.message : "Unknown error"
        }`
      )
    );
  }
}
