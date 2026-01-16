/**
 * BenchmarkStore - Persistent storage for benchmark runs
 *
 * This class handles saving, loading, and querying benchmark run data.
 * Storage is organized in a structured directory under .task-o-matic/benchmarks/.
 */

import * as fs from "node:fs/promises";
import * as path from "node:path";

import { configManager } from "../config";
import { logger } from "../logger";
import type {
  BenchmarkRun,
  BenchmarkListOptions,
  BenchmarkModelResult,
  ModelScore,
} from "./types";

/**
 * Index file structure for quick run lookups
 */
interface BenchmarkIndex {
  runs: Array<{
    id: string;
    type: BenchmarkRun["type"];
    status: BenchmarkRun["status"];
    createdAt: number;
    completedAt?: number;
    modelCount: number;
  }>;
  version: number;
}

/**
 * BenchmarkStore provides persistent storage for benchmark runs.
 * 
 * Storage structure:
 * ```
 * .task-o-matic/benchmarks/
 * ├── runs/
 * │   ├── {run-id}/
 * │   │   ├── run.json         # Complete run data
 * │   │   ├── scores.json      # User scores
 * │   │   └── results/
 * │   │       ├── {model-id}.json  # Per-model results
 * │   │       └── ...
 * │   └── ...
 * └── index.json               # Quick lookup index
 * ```
 */
export class BenchmarkStore {
  private benchmarkDir: string;
  private runsDir: string;
  private indexPath: string;

  constructor(projectRoot?: string) {
    const root = projectRoot ?? configManager.getWorkingDirectory();
    this.benchmarkDir = path.join(root, ".task-o-matic", "benchmarks");
    this.runsDir = path.join(this.benchmarkDir, "runs");
    this.indexPath = path.join(this.benchmarkDir, "index.json");
  }

  /**
   * Ensure the storage directories exist
   */
  private async ensureDirs(): Promise<void> {
    await fs.mkdir(this.runsDir, { recursive: true });
  }

  /**
   * Get the directory path for a run
   */
  private getRunDir(runId: string): string {
    return path.join(this.runsDir, runId);
  }

  /**
   * Get the results directory for a run
   */
  private getResultsDir(runId: string): string {
    return path.join(this.getRunDir(runId), "results");
  }

  /**
   * Sanitize a model ID for use as a filename
   */
  private sanitizeModelId(modelId: string): string {
    return modelId
      .replace(/[/:]/g, "-")
      .replace(/[^a-zA-Z0-9.\-_]/g, "")
      .toLowerCase();
  }

  /**
   * Load the index file
   */
  private async loadIndex(): Promise<BenchmarkIndex> {
    try {
      const content = await fs.readFile(this.indexPath, "utf-8");
      return JSON.parse(content) as BenchmarkIndex;
    } catch {
      return { runs: [], version: 1 };
    }
  }

  /**
   * Save the index file
   */
  private async saveIndex(index: BenchmarkIndex): Promise<void> {
    await this.ensureDirs();
    await fs.writeFile(this.indexPath, JSON.stringify(index, null, 2));
  }

  /**
   * Save or update a benchmark run
   *
   * @param run - The benchmark run to save
   */
  async save(run: BenchmarkRun): Promise<void> {
    await this.ensureDirs();

    const runDir = this.getRunDir(run.id);
    const resultsDir = this.getResultsDir(run.id);
    await fs.mkdir(resultsDir, { recursive: true });

    // Save individual model results to separate files
    for (const result of run.results) {
      const safeModelId = this.sanitizeModelId(result.modelId);
      const resultPath = path.join(resultsDir, `${safeModelId}.json`);
      await fs.writeFile(resultPath, JSON.stringify(result, null, 2));
    }

    // Save scores to separate file
    const scoresPath = path.join(runDir, "scores.json");
    await fs.writeFile(scoresPath, JSON.stringify(run.scores, null, 2));

    // Save main run file (without results to avoid duplication)
    const runPath = path.join(runDir, "run.json");
    const runData = {
      ...run,
      // Store only result IDs in main file, full results in separate files
      resultIds: run.results.map((r) => r.modelId),
    };
    // Remove results from main run file to avoid duplication
    const { results: _, scores: __, ...runWithoutResults } = runData;
    await fs.writeFile(
      runPath,
      JSON.stringify({ ...runWithoutResults, resultIds: runData.resultIds }, null, 2)
    );

    // Update index
    const index = await this.loadIndex();
    const existingIndex = index.runs.findIndex((r) => r.id === run.id);
    const indexEntry = {
      id: run.id,
      type: run.type,
      status: run.status,
      createdAt: run.createdAt,
      completedAt: run.completedAt,
      modelCount: run.results.length,
    };

    if (existingIndex >= 0) {
      index.runs[existingIndex] = indexEntry;
    } else {
      index.runs.unshift(indexEntry); // Most recent first
    }

    await this.saveIndex(index);
    logger.info(`Saved benchmark run: ${run.id}`);
  }

  /**
   * Get a benchmark run by ID
   *
   * @param id - The run ID
   * @returns The benchmark run, or null if not found
   */
  async get(id: string): Promise<BenchmarkRun | null> {
    const runDir = this.getRunDir(id);
    const runPath = path.join(runDir, "run.json");

    try {
      const runContent = await fs.readFile(runPath, "utf-8");
      const runData = JSON.parse(runContent) as {
        resultIds: string[];
      } & Omit<BenchmarkRun, "results" | "scores">;

      // Load results from separate files
      const results: BenchmarkModelResult[] = [];
      const resultsDir = this.getResultsDir(id);

      for (const modelId of runData.resultIds) {
        const safeModelId = this.sanitizeModelId(modelId);
        const resultPath = path.join(resultsDir, `${safeModelId}.json`);
        try {
          const resultContent = await fs.readFile(resultPath, "utf-8");
          results.push(JSON.parse(resultContent) as BenchmarkModelResult);
        } catch {
          logger.warn(`Failed to load result for model: ${modelId}`);
        }
      }

      // Load scores
      const scoresPath = path.join(runDir, "scores.json");
      let scores: ModelScore[] = [];
      try {
        const scoresContent = await fs.readFile(scoresPath, "utf-8");
        scores = JSON.parse(scoresContent) as ModelScore[];
      } catch {
        // Scores file might not exist yet
      }

      // Reconstruct full run
      const { resultIds: _, ...runWithoutResultIds } = runData;
      return {
        ...runWithoutResultIds,
        results,
        scores,
      } as BenchmarkRun;
    } catch {
      return null;
    }
  }

  /**
   * List benchmark runs with optional filtering
   *
   * @param options - Filter and pagination options
   * @returns Array of matching benchmark runs
   */
  async list(options?: BenchmarkListOptions): Promise<BenchmarkRun[]> {
    const index = await this.loadIndex();
    let runs = index.runs;

    // Apply filters
    if (options?.type) {
      runs = runs.filter((r) => r.type === options.type);
    }
    if (options?.status) {
      runs = runs.filter((r) => r.status === options.status);
    }

    // Apply pagination
    const offset = options?.offset ?? 0;
    const limit = options?.limit ?? runs.length;
    runs = runs.slice(offset, offset + limit);

    // Load full run data for each
    const fullRuns: BenchmarkRun[] = [];
    for (const entry of runs) {
      const run = await this.get(entry.id);
      if (run) {
        fullRuns.push(run);
      }
    }

    return fullRuns;
  }

  /**
   * Get summary of runs without loading full data
   *
   * @param options - Filter and pagination options
   * @returns Array of run summaries (from index)
   */
  async listSummaries(options?: BenchmarkListOptions): Promise<BenchmarkIndex["runs"]> {
    const index = await this.loadIndex();
    let runs = index.runs;

    // Apply filters
    if (options?.type) {
      runs = runs.filter((r) => r.type === options.type);
    }
    if (options?.status) {
      runs = runs.filter((r) => r.status === options.status);
    }

    // Apply pagination
    const offset = options?.offset ?? 0;
    const limit = options?.limit ?? runs.length;
    return runs.slice(offset, offset + limit);
  }

  /**
   * Add or update a score for a model in a run
   *
   * @param runId - The run ID
   * @param score - The score to add/update
   */
  async addScore(runId: string, score: ModelScore): Promise<void> {
    const run = await this.get(runId);
    if (!run) {
      throw new Error(`Benchmark run not found: ${runId}`);
    }

    // Update or add score
    const existingIndex = run.scores.findIndex((s) => s.modelId === score.modelId);
    if (existingIndex >= 0) {
      run.scores[existingIndex] = score;
    } else {
      run.scores.push(score);
    }

    // Save updated scores
    const runDir = this.getRunDir(runId);
    const scoresPath = path.join(runDir, "scores.json");
    await fs.writeFile(scoresPath, JSON.stringify(run.scores, null, 2));

    logger.info(`Added score for ${score.modelId} in run ${runId}: ${score.score}/5`);
  }

  /**
   * Delete a benchmark run
   *
   * @param runId - The run ID to delete
   * @param cleanupWorktrees - Whether to also cleanup worktrees (default: false)
   */
  async delete(runId: string, cleanupWorktrees: boolean = false): Promise<void> {
    // Remove from index
    const index = await this.loadIndex();
    index.runs = index.runs.filter((r) => r.id !== runId);
    await this.saveIndex(index);

    // Remove run directory
    const runDir = this.getRunDir(runId);
    try {
      await fs.rm(runDir, { recursive: true, force: true });
    } catch {
      logger.warn(`Failed to delete run directory: ${runDir}`);
    }

    // Optionally cleanup worktrees
    if (cleanupWorktrees) {
      // Import dynamically to avoid circular dependency
      const { WorktreeManager } = await import("./worktree-manager");
      const worktreeManager = new WorktreeManager();
      await worktreeManager.cleanupRun(runId);
    }

    logger.info(`Deleted benchmark run: ${runId}`);
  }

  /**
   * Check if a run exists
   *
   * @param runId - The run ID to check
   * @returns True if the run exists
   */
  async exists(runId: string): Promise<boolean> {
    const index = await this.loadIndex();
    return index.runs.some((r) => r.id === runId);
  }

  /**
   * Get the count of runs matching filters
   *
   * @param options - Filter options
   * @returns Count of matching runs
   */
  async count(options?: Omit<BenchmarkListOptions, "limit" | "offset">): Promise<number> {
    const index = await this.loadIndex();
    let runs = index.runs;

    if (options?.type) {
      runs = runs.filter((r) => r.type === options.type);
    }
    if (options?.status) {
      runs = runs.filter((r) => r.status === options.status);
    }

    return runs.length;
  }

  /**
   * Update the status of a run
   *
   * @param runId - The run ID
   * @param status - New status
   * @param completedAt - Optional completion timestamp
   */
  async updateStatus(
    runId: string,
    status: BenchmarkRun["status"],
    completedAt?: number
  ): Promise<void> {
    const run = await this.get(runId);
    if (!run) {
      throw new Error(`Benchmark run not found: ${runId}`);
    }

    run.status = status;
    if (completedAt) {
      run.completedAt = completedAt;
    }

    await this.save(run);
  }

  /**
   * Add a result to an existing run
   *
   * @param runId - The run ID
   * @param result - The model result to add
   */
  async addResult(runId: string, result: BenchmarkModelResult): Promise<void> {
    const resultsDir = this.getResultsDir(runId);
    await fs.mkdir(resultsDir, { recursive: true });

    // Save result file
    const safeModelId = this.sanitizeModelId(result.modelId);
    const resultPath = path.join(resultsDir, `${safeModelId}.json`);
    await fs.writeFile(resultPath, JSON.stringify(result, null, 2));

    // Update run file with new result ID
    const runDir = this.getRunDir(runId);
    const runPath = path.join(runDir, "run.json");

    try {
      const runContent = await fs.readFile(runPath, "utf-8");
      const runData = JSON.parse(runContent) as { resultIds: string[] };

      if (!runData.resultIds.includes(result.modelId)) {
        runData.resultIds.push(result.modelId);
        await fs.writeFile(runPath, JSON.stringify(runData, null, 2));
      }
    } catch {
      logger.warn(`Failed to update run file with result: ${result.modelId}`);
    }

    // Update index model count
    const index = await this.loadIndex();
    const entry = index.runs.find((r) => r.id === runId);
    if (entry) {
      entry.modelCount++;
      await this.saveIndex(index);
    }

    logger.info(`Added result for ${result.modelId} to run ${runId}`);
  }
}
