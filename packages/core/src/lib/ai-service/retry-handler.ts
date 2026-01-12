import { RetryConfig } from "../../types";
import { logger } from "../logger";

export class RetryHandler {
  private getRetryConfig(): RetryConfig {
    return {
      maxAttempts: parseInt(process.env.AI_MAX_RETRY_ATTEMPTS || "3", 10),
      baseDelay: parseInt(process.env.AI_RETRY_BASE_DELAY || "1000", 10),
      maxDelay: parseInt(process.env.AI_RETRY_MAX_DELAY || "10000", 10),
      backoffFactor: parseFloat(process.env.AI_RETRY_BACKOFF_FACTOR || "2"),
      retryableErrors: [
        "ECONNRESET",
        "ENOTFOUND",
        "ECONNREFUSED",
        "ETIMEDOUT",
        "NETWORK_ERROR",
        "RATE_LIMIT",
        "TEMPORARY_FAILURE",
        "INTERNAL_ERROR",
      ],
    };
  }

  private shouldRetryError(error: unknown, retryableErrors: string[]): boolean {
    if (!error) return false;

    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorName = error instanceof Error ? error.name : "";

    return retryableErrors.some(
      (retryableError) =>
        errorMessage.toUpperCase().includes(retryableError) ||
        errorName.toUpperCase().includes(retryableError)
    );
  }

  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async executeWithRetry<T>(
    operation: () => Promise<T>,
    retryConfig?: Partial<RetryConfig>,
    operationName: string = "AI operation"
  ): Promise<T> {
    const finalRetryConfig = { ...this.getRetryConfig(), ...retryConfig };
    const {
      maxAttempts = 3,
      baseDelay = 1000,
      maxDelay = 10000,
      backoffFactor = 2,
      retryableErrors = [],
    } = finalRetryConfig;

    let lastError: unknown;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        // Don't retry on the last attempt
        if (attempt === maxAttempts) {
          break;
        }

        // Check if error is retryable
        if (!this.shouldRetryError(error, retryableErrors)) {
          break;
        }

        // Calculate delay with exponential backoff
        const delayMs = Math.min(
          baseDelay * Math.pow(backoffFactor, attempt - 1),
          maxDelay
        );

        logger.warn(
          `${operationName} failed (attempt ${attempt}/${maxAttempts}), retrying in ${delayMs}ms: ${error}`
        );
        await this.delay(delayMs);
      }
    }

    // Throw the original error - NO rebuilding bullshit
    throw lastError;
  }
}