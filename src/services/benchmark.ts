import { benchmarkRunner } from "../lib/benchmark/runner";
import { benchmarkStorage } from "../lib/benchmark/storage";
import { BenchmarkConfig, BenchmarkRun } from "../lib/benchmark/types";

export class BenchmarkService {
  async runBenchmark(
    operationId: string,
    input: any,
    config: BenchmarkConfig
  ): Promise<BenchmarkRun> {
    return await benchmarkRunner.run(operationId, input, config);
  }

  getRun(id: string): BenchmarkRun | null {
    return benchmarkStorage.getRun(id);
  }

  listRuns(): Array<{ id: string; timestamp: number; command: string }> {
    return benchmarkStorage.listRuns();
  }
}

export const benchmarkService = new BenchmarkService();
