import { join } from "path";
import {
  existsSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  readdirSync,
} from "fs";
import { configManager } from "../config";
import { BenchmarkRun } from "./types";

export class BenchmarkStorage {
  private getBenchmarkDir(): string {
    const taskOMaticDir = configManager.getTaskOMaticDir();
    const benchmarkDir = join(taskOMaticDir, "benchmarks");
    if (!existsSync(benchmarkDir)) {
      mkdirSync(benchmarkDir, { recursive: true });
    }
    return benchmarkDir;
  }

  saveRun(run: BenchmarkRun): string {
    const dir = this.getBenchmarkDir();
    const runDir = join(dir, run.id);

    if (!existsSync(runDir)) {
      mkdirSync(runDir, { recursive: true });
    }

    // Save metadata
    writeFileSync(
      join(runDir, "metadata.json"),
      JSON.stringify(
        {
          id: run.id,
          timestamp: run.timestamp,
          command: run.command,
          config: run.config,
        },
        null,
        2
      )
    );

    // Save input
    writeFileSync(
      join(runDir, "input.json"),
      JSON.stringify(run.input, null, 2)
    );

    // Save results
    const resultsDir = join(runDir, "results");
    if (!existsSync(resultsDir)) {
      mkdirSync(resultsDir);
    }

    run.results.forEach((result) => {
      // Sanitize filename: replace : and / with -
      const filename = result.modelId.replace(/[:\/]/g, "-") + ".json";
      writeFileSync(
        join(resultsDir, filename),
        JSON.stringify(result, null, 2)
      );
    });

    return runDir;
  }

  getRun(id: string): BenchmarkRun | null {
    const dir = this.getBenchmarkDir();
    const runDir = join(dir, id);

    if (!existsSync(runDir)) {
      return null;
    }

    try {
      const metadata = JSON.parse(
        readFileSync(join(runDir, "metadata.json"), "utf-8")
      );
      const input = JSON.parse(
        readFileSync(join(runDir, "input.json"), "utf-8")
      );

      const resultsDir = join(runDir, "results");
      const results = [];

      if (existsSync(resultsDir)) {
        const files = readdirSync(resultsDir).filter((f) =>
          f.endsWith(".json")
        );
        for (const file of files) {
          results.push(
            JSON.parse(readFileSync(join(resultsDir, file), "utf-8"))
          );
        }
      }

      return {
        ...metadata,
        input,
        results,
      };
    } catch (error) {
      console.error(`Failed to load benchmark run ${id}:`, error);
      return null;
    }
  }

  listRuns(): Array<{ id: string; timestamp: number; command: string }> {
    const dir = this.getBenchmarkDir();
    if (!existsSync(dir)) return [];

    const runs = [];
    const entries = readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        try {
          const metadataPath = join(dir, entry.name, "metadata.json");
          if (existsSync(metadataPath)) {
            const metadata = JSON.parse(readFileSync(metadataPath, "utf-8"));
            runs.push({
              id: metadata.id,
              timestamp: metadata.timestamp,
              command: metadata.command,
            });
          }
        } catch (e) {
          // Skip invalid runs
        }
      }
    }

    return runs.sort((a, b) => b.timestamp - a.timestamp);
  }
}

export const benchmarkStorage = new BenchmarkStorage();
