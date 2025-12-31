import {
  AIConfig,
  Task,
  AIPRDParseResult,
  DocumentationDetection,
  StreamingOptions,
  RetryConfig,
  TaskDocumentation,
} from "../../types";
import { BaseOperations } from "./base-operations";
import { PRDOperations } from "./prd-operations";
import { TaskOperations } from "./task-operations";
import { DocumentationOperations } from "./documentation-operations";

/**
 * Main AIOperations class that delegates to specialized operation classes.
 * This provides a unified API for all AI operations while keeping the implementation modular.
 */
export class AIOperations extends BaseOperations {
  private prdOps = new PRDOperations();
  private taskOps = new TaskOperations();
  private docOps = new DocumentationOperations();

  // PRD Operations - Delegated to PRDOperations

  async parsePRD(
    prdContent: string,
    config?: Partial<AIConfig>,
    promptOverride?: string,
    userMessage?: string,
    streamingOptions?: StreamingOptions,
    retryConfig?: Partial<RetryConfig>,
    workingDirectory?: string,
    enableFilesystemTools?: boolean
  ): Promise<AIPRDParseResult> {
    return this.prdOps.parsePRD(
      prdContent,
      config,
      promptOverride,
      userMessage,
      streamingOptions,
      retryConfig,
      workingDirectory,
      enableFilesystemTools
    );
  }

  // Task Operations - Delegated to TaskOperations

  async breakdownTask(
    task: Task,
    config?: Partial<AIConfig>,
    promptOverride?: string,
    userMessage?: string,
    streamingOptions?: StreamingOptions,
    retryConfig?: Partial<RetryConfig>,
    fullContent?: string,
    stackInfo?: string,
    existingSubtasks?: Task[],
    enableFilesystemTools?: boolean
  ): Promise<
    Array<{ title: string; content: string; estimatedEffort?: string }>
  > {
    return this.taskOps.breakdownTask(
      task,
      config,
      promptOverride,
      userMessage,
      streamingOptions,
      retryConfig,
      fullContent,
      stackInfo,
      existingSubtasks,
      enableFilesystemTools
    );
  }

  async enhanceTask(
    title: string,
    description?: string,
    config?: Partial<AIConfig>,
    promptOverride?: string,
    userMessage?: string,
    taskId?: string,
    streamingOptions?: StreamingOptions,
    retryConfig?: Partial<RetryConfig>
  ): Promise<string> {
    return this.taskOps.enhanceTask(
      title,
      description,
      config,
      promptOverride,
      userMessage,
      taskId,
      streamingOptions,
      retryConfig
    );
  }

  async reworkPRD(
    prdContent: string,
    feedback: string,
    config?: Partial<AIConfig>,
    promptOverride?: string,
    userMessage?: string,
    streamingOptions?: StreamingOptions,
    retryConfig?: Partial<RetryConfig>,
    workingDirectory?: string,
    enableFilesystemTools?: boolean
  ): Promise<string> {
    return this.prdOps.reworkPRD(
      prdContent,
      feedback,
      config,
      promptOverride,
      userMessage,
      streamingOptions,
      retryConfig,
      workingDirectory,
      enableFilesystemTools
    );
  }

  async generatePRDQuestions(
    prdContent: string,
    config?: Partial<AIConfig>,
    promptOverride?: string,
    userMessage?: string,
    streamingOptions?: StreamingOptions,
    retryConfig?: Partial<RetryConfig>,
    workingDirectory?: string,
    enableFilesystemTools?: boolean
  ): Promise<string[]> {
    return this.prdOps.generatePRDQuestions(
      prdContent,
      config,
      promptOverride,
      userMessage,
      streamingOptions,
      retryConfig,
      workingDirectory,
      enableFilesystemTools
    );
  }

  async answerPRDQuestions(
    prdContent: string,
    questions: string[],
    config?: Partial<AIConfig>,
    contextInfo?: {
      stackInfo?: string;
      projectDescription?: string;
    },
    streamingOptions?: StreamingOptions,
    retryConfig?: Partial<RetryConfig>
  ): Promise<Record<string, string>> {
    return this.prdOps.answerPRDQuestions(
      prdContent,
      questions,
      config,
      contextInfo,
      streamingOptions,
      retryConfig
    );
  }

  async generatePRD(
    description: string,
    config?: Partial<AIConfig>,
    promptOverride?: string,
    userMessage?: string,
    streamingOptions?: StreamingOptions,
    retryConfig?: Partial<RetryConfig>
  ): Promise<string> {
    return this.prdOps.generatePRD(
      description,
      config,
      promptOverride,
      userMessage,
      streamingOptions,
      retryConfig
    );
  }

  async combinePRDs(
    prds: string[],
    originalDescription: string,
    config?: Partial<AIConfig>,
    promptOverride?: string,
    userMessage?: string,
    streamingOptions?: StreamingOptions,
    retryConfig?: Partial<RetryConfig>
  ): Promise<string> {
    return this.prdOps.combinePRDs(
      prds,
      originalDescription,
      config,
      promptOverride,
      userMessage,
      streamingOptions,
      retryConfig
    );
  }

  // Documentation Operations - Delegated to DocumentationOperations

  async enhanceTaskWithDocumentation(
    taskId: string,
    taskTitle: string,
    taskDescription: string,
    stackInfo?: string,
    streamingOptions?: StreamingOptions,
    retryConfig?: Partial<RetryConfig>,
    config?: Partial<AIConfig>,
    existingResearch?: Record<string, Array<{ query: string; doc: string }>>
  ): Promise<string> {
    return this.docOps.enhanceTaskWithDocumentation(
      taskId,
      taskTitle,
      taskDescription,
      stackInfo,
      streamingOptions,
      retryConfig,
      config,
      existingResearch
    );
  }

  async analyzeDocumentationNeeds(
    taskId: string,
    taskTitle: string,
    taskDescription: string,
    stackInfo?: string,
    streamingOptions?: StreamingOptions,
    retryConfig?: Partial<RetryConfig>,
    config?: Partial<AIConfig>,
    existingResearch?: (TaskDocumentation | undefined)[]
  ): Promise<DocumentationDetection> {
    return this.docOps.analyzeDocumentationNeeds(
      taskId,
      taskTitle,
      taskDescription,
      stackInfo,
      streamingOptions,
      retryConfig,
      config,
      existingResearch
    );
  }

  async generateDocumentationRecap(
    libraries: Array<{ name: string; context7Id: string; reason: string }>,
    documentContents: Array<{ library: string; content: string }>,
    streamingOptions?: StreamingOptions,
    retryConfig?: Partial<RetryConfig>
  ): Promise<string> {
    return this.docOps.generateDocumentationRecap(
      libraries,
      documentContents,
      streamingOptions,
      retryConfig
    );
  }

  async planTask(
    taskContext: string,
    taskDetails: string,
    config?: Partial<AIConfig>,
    promptOverride?: string,
    userMessage?: string,
    streamingOptions?: StreamingOptions,
    retryConfig?: Partial<RetryConfig>
  ): Promise<string> {
    return this.taskOps.planTask(
      taskContext,
      taskDetails,
      config,
      promptOverride,
      userMessage,
      streamingOptions,
      retryConfig
    );
  }

  // Stack suggestion - Delegated to PRDOperations

  async suggestStack(
    prdContent: string,
    projectName?: string,
    config?: Partial<AIConfig>,
    promptOverride?: string,
    userMessage?: string,
    streamingOptions?: StreamingOptions,
    retryConfig?: Partial<RetryConfig>,
    workingDirectory?: string,
    enableFilesystemTools?: boolean
  ): Promise<{ config: import("../../types").BTSConfig; reasoning: string }> {
    return this.prdOps.suggestStack(
      prdContent,
      projectName,
      config,
      promptOverride,
      userMessage,
      streamingOptions,
      retryConfig,
      workingDirectory,
      enableFilesystemTools
    );
  }
}
