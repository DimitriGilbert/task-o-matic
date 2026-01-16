/**
 * MetricsCollector - Collects code and verification metrics for benchmarks
 *
 * This class handles collecting code metrics from git diff output and
 * running verification commands to assess task completion quality.
 */

import { exec } from "node:child_process";
import { promisify } from "node:util";

import { logger } from "../logger";
import type {
  BenchmarkMetrics,
  CodeMetrics,
  TimingMetrics,
  TokenMetrics,
  VerificationMetrics,
} from "./types";

const execAsync = promisify(exec);

/**
 * Type for exec function to allow dependency injection in tests
 */
export type ExecFn = (
  command: string,
  options?: { cwd?: string }
) => Promise<{ stdout: string; stderr: string }>;

/**
 * Options for running verification commands
 */
export interface VerificationOptions {
  /** Working directory for commands */
  cwd: string;
  /** Timeout in milliseconds (default: 120000 = 2 minutes) */
  timeout?: number;
  /** Whether to continue on failure (default: true) */
  continueOnError?: boolean;
}

/**
 * MetricsCollector gathers code metrics and verification results
 * for benchmark analysis and comparison.
 */
export class MetricsCollector {
  private execFn: ExecFn;

  constructor(execFn: ExecFn = execAsync) {
    this.execFn = execFn;
  }

  /**
   * Collect code metrics from git diff between current state and base commit
   *
   * @param worktreePath - Path to the worktree
   * @param baseCommit - Base commit to diff against
   * @returns Code change metrics
   */
  async collectCodeMetrics(
    worktreePath: string,
    baseCommit: string
  ): Promise<CodeMetrics> {
    const metrics: CodeMetrics = {
      linesAdded: 0,
      linesRemoved: 0,
      filesChanged: 0,
      newFiles: [],
      modifiedFiles: [],
    };

    try {
      // Get diff stats
      const { stdout: statOutput } = await this.execFn(
        `git diff --stat "${baseCommit}"...HEAD`,
        { cwd: worktreePath }
      );

      // Parse stat output for line changes
      // Example: " src/file.ts | 10 +++++-----"
      const lines = statOutput.split("\n");
      for (const line of lines) {
        // Match file change lines (exclude the summary line)
        const match = line.match(/^\s*(.+?)\s*\|\s*(\d+)\s*([+-]+)?$/);
        if (match) {
          const additions = (line.match(/\+/g) ?? []).length;
          const deletions = (line.match(/-/g) ?? []).length;
          metrics.linesAdded += additions;
          metrics.linesRemoved += deletions;
          metrics.filesChanged++;
        }
      }

      // Get list of new files
      const { stdout: newFilesOutput } = await this.execFn(
        `git diff --name-only --diff-filter=A "${baseCommit}"...HEAD`,
        { cwd: worktreePath }
      );
      metrics.newFiles = newFilesOutput
        .split("\n")
        .filter((f) => f.trim().length > 0);

      // Get list of modified files
      const { stdout: modifiedFilesOutput } = await this.execFn(
        `git diff --name-only --diff-filter=M "${baseCommit}"...HEAD`,
        { cwd: worktreePath }
      );
      metrics.modifiedFiles = modifiedFilesOutput
        .split("\n")
        .filter((f) => f.trim().length > 0);

      // Update filesChanged with accurate count
      const { stdout: allChangedOutput } = await this.execFn(
        `git diff --name-only "${baseCommit}"...HEAD`,
        { cwd: worktreePath }
      );
      const allChanged = allChangedOutput
        .split("\n")
        .filter((f) => f.trim().length > 0);
      metrics.filesChanged = allChanged.length;

      // Get more accurate line counts using numstat
      const { stdout: numstatOutput } = await this.execFn(
        `git diff --numstat "${baseCommit}"...HEAD`,
        { cwd: worktreePath }
      );

      // Reset and parse numstat for accurate counts
      metrics.linesAdded = 0;
      metrics.linesRemoved = 0;

      for (const line of numstatOutput.split("\n")) {
        // Format: additions<tab>deletions<tab>filename
        const parts = line.split("\t");
        if (parts.length >= 2) {
          const additions = parseInt(parts[0], 10);
          const deletions = parseInt(parts[1], 10);
          if (!isNaN(additions)) metrics.linesAdded += additions;
          if (!isNaN(deletions)) metrics.linesRemoved += deletions;
        }
      }

      logger.info(
        `Collected code metrics: +${metrics.linesAdded}/-${metrics.linesRemoved} in ${metrics.filesChanged} files`
      );
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.warn(`Failed to collect code metrics: ${errorMsg}`);
    }

    return metrics;
  }

  /**
   * Run verification commands and collect results
   *
   * @param commands - Array of commands to run
   * @param options - Verification options
   * @returns Verification metrics
   */
  async runVerification(
    commands: string[],
    options: VerificationOptions
  ): Promise<VerificationMetrics> {
    const metrics: VerificationMetrics = {
      testsRun: 0,
      testsPassed: 0,
      testsFailed: 0,
      buildSuccess: true,
      commandResults: [],
    };

    const timeout = options.timeout ?? 120000; // 2 minutes default
    const continueOnError = options.continueOnError ?? true;

    for (const command of commands) {
      const startTime = Date.now();
      let exitCode = 0;
      let stdout = "";
      let stderr = "";

      try {
        const result = await Promise.race([
          this.execFn(command, { cwd: options.cwd }),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("Command timeout")), timeout)
          ),
        ]);

        stdout = result.stdout;
        stderr = result.stderr;
        exitCode = 0;
      } catch (error) {
        exitCode = 1;
        if (error instanceof Error) {
          // Node.js exec error includes exit code in a special property
          const execError = error as { code?: number; stdout?: string; stderr?: string };
          exitCode = execError.code ?? 1;
          stdout = execError.stdout ?? "";
          stderr = execError.stderr ?? error.message;
        }
      }

      const duration = Date.now() - startTime;

      metrics.commandResults?.push({
        command,
        exitCode,
        stdout,
        stderr,
        duration,
      });

      // Parse test results if this looks like a test command
      if (this.isTestCommand(command)) {
        const testResults = this.parseTestOutput(stdout + stderr);
        metrics.testsRun += testResults.total;
        metrics.testsPassed += testResults.passed;
        metrics.testsFailed += testResults.failed;
      }

      // Check for build commands
      if (this.isBuildCommand(command)) {
        if (exitCode !== 0) {
          metrics.buildSuccess = false;
        }
      }

      // Stop on first error if configured
      if (exitCode !== 0 && !continueOnError) {
        logger.warn(`Verification command failed: ${command}`);
        break;
      }
    }

    logger.info(
      `Verification complete: ${metrics.testsPassed}/${metrics.testsRun} tests passed, build: ${metrics.buildSuccess ? "OK" : "FAILED"}`
    );

    return metrics;
  }

  /**
   * Collect all metrics for a completed execution
   *
   * @param worktreePath - Path to the worktree
   * @param baseCommit - Base commit to diff against
   * @param timing - Timing metrics from execution
   * @param tokens - Optional token usage metrics
   * @param verificationCommands - Optional verification commands to run
   * @returns Complete benchmark metrics
   */
  async collectAll(
    worktreePath: string,
    baseCommit: string,
    timing: TimingMetrics,
    tokens?: TokenMetrics,
    verificationCommands?: string[]
  ): Promise<BenchmarkMetrics> {
    // Collect code metrics
    const code = await this.collectCodeMetrics(worktreePath, baseCommit);

    // Run verification if commands provided
    let verification: VerificationMetrics | undefined;
    if (verificationCommands && verificationCommands.length > 0) {
      verification = await this.runVerification(verificationCommands, {
        cwd: worktreePath,
      });
    }

    // Calculate cost if tokens are available
    let cost: number | undefined;
    if (tokens) {
      // Rough cost estimate (can be made more accurate per-model)
      cost = this.estimateCost(tokens);
    }

    return {
      timing,
      tokens,
      code,
      verification,
      cost,
    };
  }

  /**
   * Check if a command looks like a test command
   */
  private isTestCommand(command: string): boolean {
    const testPatterns = [
      /\btest\b/i,
      /\bmocha\b/i,
      /\bjest\b/i,
      /\bvitest\b/i,
      /\bpytest\b/i,
      /\bcargo test\b/i,
      /\bgo test\b/i,
    ];
    return testPatterns.some((pattern) => pattern.test(command));
  }

  /**
   * Check if a command looks like a build command
   */
  private isBuildCommand(command: string): boolean {
    const buildPatterns = [
      /\bbuild\b/i,
      /\bcompile\b/i,
      /\btsc\b/,
      /\bcargo build\b/i,
      /\bgo build\b/i,
      /\bmake\b/,
    ];
    return buildPatterns.some((pattern) => pattern.test(command));
  }

  /**
   * Parse test output to extract test counts
   */
  private parseTestOutput(output: string): {
    total: number;
    passed: number;
    failed: number;
  } {
    const result = { total: 0, passed: 0, failed: 0 };

    // Try to parse common test output formats

    // Mocha/Jest format: "X passing, Y failing"
    const mochaMatch = output.match(/(\d+)\s+passing/);
    if (mochaMatch) {
      result.passed = parseInt(mochaMatch[1], 10);
    }
    const mochaFailMatch = output.match(/(\d+)\s+failing/);
    if (mochaFailMatch) {
      result.failed = parseInt(mochaFailMatch[1], 10);
    }

    // Jest format: "Tests: X passed, Y failed, Z total"
    const jestMatch = output.match(
      /Tests:\s*(\d+)\s*passed(?:,\s*(\d+)\s*failed)?(?:,\s*(\d+)\s*total)?/i
    );
    if (jestMatch) {
      result.passed = parseInt(jestMatch[1], 10);
      if (jestMatch[2]) result.failed = parseInt(jestMatch[2], 10);
      if (jestMatch[3]) result.total = parseInt(jestMatch[3], 10);
    }

    // Vitest format: "X tests passed | Y tests failed"
    const vitestMatch = output.match(/(\d+)\s+tests?\s+passed/i);
    if (vitestMatch) {
      result.passed = parseInt(vitestMatch[1], 10);
    }
    const vitestFailMatch = output.match(/(\d+)\s+tests?\s+failed/i);
    if (vitestFailMatch) {
      result.failed = parseInt(vitestFailMatch[1], 10);
    }

    // If we didn't get a total, calculate it
    if (result.total === 0) {
      result.total = result.passed + result.failed;
    }

    return result;
  }

  /**
   * Estimate cost based on token usage
   * This is a rough estimate - actual costs vary by model
   */
  private estimateCost(tokens: TokenMetrics): number {
    // Average cost estimation ($/1M tokens)
    // These are rough averages across providers
    const promptCostPer1M = 3.0; // $3 per million prompt tokens
    const completionCostPer1M = 15.0; // $15 per million completion tokens

    const promptCost = (tokens.prompt / 1_000_000) * promptCostPer1M;
    const completionCost = (tokens.completion / 1_000_000) * completionCostPer1M;

    return promptCost + completionCost;
  }

  /**
   * Create timing metrics from start and end times
   */
  static createTimingMetrics(
    startedAt: number,
    completedAt: number,
    timeToFirstOutput?: number
  ): TimingMetrics {
    return {
      startedAt,
      completedAt,
      duration: completedAt - startedAt,
      timeToFirstOutput,
    };
  }
}
