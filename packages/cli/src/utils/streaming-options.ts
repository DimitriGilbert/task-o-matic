import chalk from "chalk";
import { StreamingOptions } from "task-o-matic-core";

export function createStreamingOptions(
  enabled: boolean = false,
  operation: string = "operation"
): StreamingOptions | undefined {
  if (!enabled) {
    return undefined;
  }

  return {
    enabled: true,
    onChunk: (chunk: string) => {
      // Write streaming output without newline for real-time effect
      process.stdout.write(chunk);
    },
    onFinish: ({ finishReason }) => {
      if (
        finishReason &&
        finishReason !== "stop" &&
        finishReason !== "tool-calls"
      ) {
        console.log(
          chalk.yellow(`\n⚠️ ${operation} finished: ${finishReason}`)
        );
      } else {
        console.log(chalk.green(`\n✓ ${operation} complete`));
      }
    },
    onError: (error) => {
      console.log(
        chalk.red(
          `\n❌ ${operation} error: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        )
      );
    },
    onReasoning: (text: string) => {
      process.stdout.write(chalk.magenta(text));
    },
  };
}

export function createStreamingOptionsWithCustomHandlers(
  enabled: boolean = false,
  customHandlers?: {
    onChunk?: (chunk: string) => void;
    onFinish?: (result: { finishReason?: string }) => void;
    onError?: (error: unknown) => void;
  }
): StreamingOptions | undefined {
  if (!enabled) {
    return undefined;
  }

  return {
    enabled: true,
    onChunk:
      customHandlers?.onChunk ||
      ((chunk: string) => {
        process.stdout.write(chunk);
      }),
    onFinish:
      customHandlers?.onFinish ||
      (({ finishReason }) => {
        if (
          finishReason &&
          finishReason !== "stop" &&
          finishReason !== "tool-calls"
        ) {
          console.log(chalk.yellow(`\n⚠️ Operation finished: ${finishReason}`));
        } else {
          console.log(chalk.green("\n✓ Operation complete"));
        }
      }),
    onError:
      customHandlers?.onError ||
      ((error) => {
        console.log(
          chalk.red(
            `\n❌ Operation error: ${
              error instanceof Error ? error.message : "Unknown error"
            }`
          )
        );
      }),
    onReasoning: (text: string) => {
      process.stdout.write(chalk.magenta(text));
    },
  };
}
