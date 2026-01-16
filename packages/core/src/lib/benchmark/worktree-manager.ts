/**
 * WorktreeManager - Git worktree operations for benchmark isolation
 *
 * This class manages git worktrees for parallel benchmark execution.
 * Each benchmark model runs in its own isolated worktree, enabling
 * true parallel execution without blocking.
 */

import { exec } from "node:child_process";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { promisify } from "node:util";

import { configManager } from "../config";
import { logger } from "../logger";
import { TaskOMaticError, TaskOMaticErrorCodes } from "../../utils/task-o-matic-error";

const execAsync = promisify(exec);

/**
 * Represents a git worktree created for benchmarking
 */
export interface Worktree {
  /** Unique name for the worktree, e.g., "bench-run123-gpt4o" */
  name: string;
  /** Absolute path to the worktree directory */
  path: string;
  /** Git branch name backing this worktree */
  branch: string;
  /** Benchmark run ID this worktree belongs to */
  runId: string;
  /** Model identifier being tested in this worktree */
  modelId: string;
  /** Timestamp when the worktree was created */
  createdAt: number;
}

/**
 * Manifest file structure for tracking worktrees
 */
interface WorktreeManifest {
  worktrees: Record<string, Worktree>;
  version: number;
}

/**
 * Type for exec function to allow dependency injection in tests
 */
export type ExecFn = (
  command: string,
  options?: { cwd?: string }
) => Promise<{ stdout: string; stderr: string }>;

/**
 * WorktreeManager handles creation, management, and cleanup of git worktrees
 * for benchmark execution.
 */
export class WorktreeManager {
  private worktreeDir: string;
  private manifestPath: string;
  private execFn: ExecFn;
  private projectRoot: string;

  constructor(
    projectRoot?: string,
    execFn: ExecFn = execAsync
  ) {
    this.projectRoot = projectRoot ?? configManager.getWorkingDirectory();
    this.worktreeDir = path.join(this.projectRoot, ".task-o-matic", "worktrees");
    this.manifestPath = path.join(this.worktreeDir, "manifest.json");
    this.execFn = execFn;
  }

  /**
   * Sanitize a model ID to be safe for use in file/branch names
   * e.g., "openai:gpt-4o" -> "openai-gpt-4o"
   * Keeps dots and dashes as they are valid and meaningful in model names
   */
  private sanitizeModelId(modelId: string): string {
    return modelId
      .replace(/[/:]/g, "-")
      .replace(/[^a-zA-Z0-9.\-_]/g, "")
      .toLowerCase();
  }

  /**
   * Ensure the worktree directory exists
   */
  private async ensureWorktreeDir(): Promise<void> {
    await fs.mkdir(this.worktreeDir, { recursive: true });
  }

  /**
   * Load the worktree manifest from disk
   */
  private async loadManifest(): Promise<WorktreeManifest> {
    try {
      const content = await fs.readFile(this.manifestPath, "utf-8");
      return JSON.parse(content) as WorktreeManifest;
    } catch (error) {
      if ((error as any).code === "ENOENT") {
        return { worktrees: {}, version: 1 };
      }
      throw error;
    }
  }

  /**
   * Save the worktree manifest to disk
   */
  private async saveManifest(manifest: WorktreeManifest): Promise<void> {
    await this.ensureWorktreeDir();
    await fs.writeFile(this.manifestPath, JSON.stringify(manifest, null, 2));
  }

  /**
   * Create a new worktree for a benchmark run and model
   *
   * @param runId - Unique identifier for the benchmark run
   * @param modelId - Model identifier (e.g., "openai:gpt-4o")
   * @param baseCommit - Git commit to base the worktree on (defaults to HEAD)
   * @returns The created Worktree object
   */
  async create(
    runId: string,
    modelId: string,
    baseCommit: string = "HEAD"
  ): Promise<Worktree> {
    await this.ensureWorktreeDir();

    const safeName = this.sanitizeModelId(modelId);
    const worktreeName = `${runId}-${safeName}`;
    const branchName = `bench/${runId}/${safeName}`;
    const worktreePath = path.join(this.worktreeDir, worktreeName);

    logger.info(`Creating worktree: ${worktreeName}`);

    try {
      // Create the worktree with a new branch based on the specified commit
      // Using --force to handle edge cases where branch might exist
      await this.execFn(
        `git worktree add -b "${branchName}" "${worktreePath}" "${baseCommit}"`,
        { cwd: this.projectRoot }
      );
    } catch (error) {
      // If branch already exists, try without -b flag
      const errorMsg = error instanceof Error ? error.message : String(error);
      if (errorMsg.includes("already exists")) {
        logger.warn(`Branch ${branchName} exists, attempting recovery...`);
        // Clean up the branch and try again
        try {
          await this.execFn(`git branch -D "${branchName}"`, { cwd: this.projectRoot });
        } catch (err) {
          const errMsg = err instanceof Error ? err.message : String(err);
          logger.warn(`Failed to delete branch ${branchName}: ${errMsg}`);
        }
        await this.execFn(
          `git worktree add -b "${branchName}" "${worktreePath}" "${baseCommit}"`,
          { cwd: this.projectRoot }
        );
      } else {
        throw new Error(`Failed to create worktree ${worktreeName}: ${errorMsg}`);
      }
    }

    const worktree: Worktree = {
      name: worktreeName,
      path: worktreePath,
      branch: branchName,
      runId,
      modelId,
      createdAt: Date.now(),
    };

    // Save to manifest
    const manifest = await this.loadManifest();
    manifest.worktrees[worktreeName] = worktree;
    await this.saveManifest(manifest);

    logger.success(`Created worktree: ${worktreeName}`);
    return worktree;
  }

  /**
   * Remove a worktree and its associated branch
   *
   * @param name - The worktree name to remove
   */
  async remove(name: string): Promise<void> {
    const manifest = await this.loadManifest();
    const worktree = manifest.worktrees[name];

    if (!worktree) {
      logger.warn(`Worktree ${name} not found in manifest`);
      return;
    }

    logger.info(`Removing worktree: ${name}`);

    try {
      // Remove the worktree
      await this.execFn(`git worktree remove "${worktree.path}" --force`, {
        cwd: this.projectRoot,
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.warn(`Failed to remove worktree: ${errorMsg}`);
      // Try to remove the directory manually if git command failed
      try {
        await fs.rm(worktree.path, { recursive: true, force: true });
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);
        logger.warn(`Failed to manually remove worktree ${worktree.path}: ${errMsg}`);
      }
    }

    try {
      // Delete the branch
      await this.execFn(`git branch -D "${worktree.branch}"`, {
        cwd: this.projectRoot,
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.warn(`Failed to delete branch ${worktree.branch}: ${errorMsg}`);
    }

    // Remove from manifest
    delete manifest.worktrees[name];
    await this.saveManifest(manifest);

    logger.success(`Removed worktree: ${name}`);
  }

  /**
   * List all worktrees tracked by this manager
   *
   * @returns Array of all tracked worktrees
   */
  async list(): Promise<Worktree[]> {
    const manifest = await this.loadManifest();
    return Object.values(manifest.worktrees);
  }

  /**
   * Get a worktree by name
   *
   * @param name - The worktree name
   * @returns The worktree if found, null otherwise
   */
  async get(name: string): Promise<Worktree | null> {
    const manifest = await this.loadManifest();
    return manifest.worktrees[name] ?? null;
  }

  /**
   * Reset a worktree to its base commit (for re-running benchmarks)
   *
   * @param name - The worktree name to reset
   */
  async reset(name: string): Promise<void> {
    const manifest = await this.loadManifest();
    const worktree = manifest.worktrees[name];

    if (!worktree) {
      throw new TaskOMaticError(`Worktree ${name} not found`, {
        code: TaskOMaticErrorCodes.STORAGE_ERROR,
        context: `Attempted to reset worktree ${name}`,
      });
    }

    logger.info(`Resetting worktree: ${name}`);

    // Reset to the first commit on the branch (the base commit)
    await this.execFn(`git reset --hard HEAD~0`, { cwd: worktree.path });
    await this.execFn(`git clean -fdx`, { cwd: worktree.path });

    logger.success(`Reset worktree: ${name}`);
  }

  /**
   * Get all worktrees for a specific benchmark run
   *
   * @param runId - The benchmark run ID
   * @returns Array of worktrees for the run
   */
  async getByRunId(runId: string): Promise<Worktree[]> {
    const manifest = await this.loadManifest();
    return Object.values(manifest.worktrees).filter((wt) => wt.runId === runId);
  }

  /**
   * Cleanup all worktrees for a specific benchmark run
   *
   * @param runId - The benchmark run ID to cleanup
   */
  async cleanupRun(runId: string): Promise<void> {
    const worktrees = await this.getByRunId(runId);

    logger.info(`Cleaning up ${worktrees.length} worktrees for run: ${runId}`);

    for (const worktree of worktrees) {
      await this.remove(worktree.name);
    }

    logger.success(`Cleaned up run: ${runId}`);
  }

  /**
   * Prune worktrees that no longer exist on disk
   * This syncs the manifest with actual git worktrees
   */
  async prune(): Promise<void> {
    const manifest = await this.loadManifest();
    const toRemove: string[] = [];

    // Run git worktree prune first
    try {
      await this.execFn("git worktree prune", { cwd: this.projectRoot });
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      logger.warn(`Failed to prune git worktrees: ${errMsg}`);
    }

    // Check each worktree in manifest
    for (const [name, worktree] of Object.entries(manifest.worktrees)) {
      try {
        await fs.access(worktree.path);
      } catch {
        // Worktree path doesn't exist, mark for removal from manifest
        toRemove.push(name);
      }
    }

    // Remove stale entries from manifest
    for (const name of toRemove) {
      delete manifest.worktrees[name];
    }

    if (toRemove.length > 0) {
      await this.saveManifest(manifest);
      logger.info(`Pruned ${toRemove.length} stale worktree entries`);
    }
  }

  /**
   * Get the current HEAD commit hash
   *
   * @returns The current HEAD commit hash
   */
  async getCurrentCommit(): Promise<string> {
    const { stdout } = await this.execFn("git rev-parse HEAD", {
      cwd: this.projectRoot,
    });
    return stdout.trim();
  }

  /**
   * Check if the main repository is clean (no uncommitted changes)
   *
   * @returns True if the repository is clean
   */
  async isClean(): Promise<boolean> {
    const { stdout } = await this.execFn("git status --porcelain", {
      cwd: this.projectRoot,
    });
    return stdout.trim().length === 0;
  }
}
