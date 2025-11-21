import { benchmarkRunner } from "../lib/benchmark/runner";
import { benchmarkStorage } from "../lib/benchmark/storage";
import {
  BenchmarkConfig,
  BenchmarkRun,
  BenchmarkProgressEvent,
} from "../lib/benchmark/types";

export class BenchmarkService {
  async runBenchmark(
    operationId: string,
    input: any,
    config: BenchmarkConfig,
    onProgress?: (event: BenchmarkProgressEvent) => void
  ): Promise<BenchmarkRun> {
    return await benchmarkRunner.run(operationId, input, config, onProgress);
  }

  getRun(id: string): BenchmarkRun | null {
    return benchmarkStorage.getRun(id);
  }

  listRuns(): Array<{ id: string; timestamp: number; command: string }> {
    return benchmarkStorage.listRuns();
  }
}

export const benchmarkService = new BenchmarkService();
