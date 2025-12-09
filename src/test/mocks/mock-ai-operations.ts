import { Task, StreamingOptions, TaskAIMetadata, AIConfig } from "../../types";
import { AIOptions } from "../../utils/ai-config-builder";

export class MockAIOperations {
  async enhanceTaskWithDocumentation(
    taskId: string,
    title: string,
    description: string,
    stackInfo: string,
    streamingOptions?: StreamingOptions,
    retryConfig?: any,
    aiConfig?: AIConfig,
    existingResearch?: any
  ): Promise<string> {
    return `${description}\n\n🤖 Enhanced with AI documentation for ${title}`;
  }

  async breakdownTask(
    task: Task,
    aiConfig: AIConfig,
    promptOverride?: string,
    messageOverride?: string,
    streamingOptions?: StreamingOptions,
    retryConfig?: any,
    fullContent?: string,
    stackInfo?: string,
    existingSubtasks?: Task[],
    enableFilesystemTools?: boolean
  ): Promise<Task[]> {
    return [
      {
        id: `${task.id}.1`,
        title: `Subtask 1: ${task.title}`,
        description: `First subtask for ${task.title}`,
        content: `Content for subtask 1`,
        status: "todo",
        estimatedEffort: "small",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: `${task.id}.2`,
        title: `Subtask 2: ${task.title}`,
        description: `Second subtask for ${task.title}`,
        content: `Content for subtask 2`,
        status: "todo",
        estimatedEffort: "medium",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ];
  }

  async planTask(
    taskContext: string,
    taskDetails: string,
    aiConfig: AIConfig,
    promptOverride?: string,
    messageOverride?: string,
    streamingOptions?: StreamingOptions
  ): Promise<string> {
    return `# Implementation Plan for ${
      taskContext.split("\n")[0]
    }\n\n1. Analyze requirements\n2. Implement core functionality\n3. Write tests\n4. Review and refactor`;
  }

  async analyzeDocumentationNeeds(
    taskId: string,
    title: string,
    content: string,
    stackInfo: string,
    streamingOptions?: StreamingOptions,
    retryConfig?: any,
    aiConfig?: AIConfig,
    existingDocumentations?: string[]
  ): Promise<any> {
    return {
      libraries: [
        {
          name: "react",
          context7Id: "/facebook/react",
          reason: "Task involves React development",
          searchQuery: "React hooks best practices",
        },
      ],
      confidence: 0.9,
      files: ["src/components/TaskComponent.tsx"],
    };
  }

  async generateDocumentationRecap(
    libraries: any[],
    toolResults: any[],
    streamingOptions?: StreamingOptions
  ): Promise<string> {
    return `## Documentation Recap\n\n${libraries
      .map((lib) => `- ${lib.name}: ${lib.reason}`)
      .join("\n")}`;
  }

  async parsePRD(
    prdContent: string,
    aiConfig: AIConfig,
    promptOverride?: string,
    messageOverride?: string,
    streamingOptions?: StreamingOptions,
    retryConfig?: any,
    workingDirectory?: string,
    enableFilesystemTools?: boolean
  ): Promise<any> {
    return {
      tasks: [
        {
          id: "1",
          title: "Implement user authentication",
          description: "Add login/logout functionality",
          content: "Full authentication implementation",
          estimatedEffort: "medium",
          dependencies: [],
          tags: ["auth", "backend"],
        },
        {
          id: "2",
          title: "Create task management UI",
          description: "Build React components for task management",
          content: "Task list, create, edit, delete components",
          estimatedEffort: "large",
          dependencies: ["1"],
          tags: ["ui", "frontend"],
        },
      ],
      summary: "PRD for task management application",
      estimatedDuration: "2 weeks",
      confidence: 0.95,
    };
  }

  async generatePRDQuestions(
    prdContent: string,
    aiConfig: AIConfig,
    promptOverride?: string,
    messageOverride?: string,
    streamingOptions?: StreamingOptions,
    retryConfig?: any,
    workingDirectory?: string,
    enableFilesystemTools?: boolean
  ): Promise<string[]> {
    return [
      "What authentication providers should be supported?",
      "Should the task management support real-time collaboration?",
      "What are the expected performance requirements?",
    ];
  }

  async reworkPRD(
    prdContent: string,
    feedback: string,
    aiConfig: AIConfig,
    promptOverride?: string,
    messageOverride?: string,
    streamingOptions?: StreamingOptions,
    retryConfig?: any,
    workingDirectory?: string,
    enableFilesystemTools?: boolean
  ): Promise<string> {
    return `${prdContent}\n\n## Improvements Based on Feedback\n\n${feedback}`;
  }

  async answerPRDQuestions(
    prdContent: string,
    questions: string[],
    aiConfig: AIConfig,
    context: any,
    streamingOptions?: StreamingOptions
  ): Promise<Record<string, string>> {
    const answers: Record<string, string> = {};
    questions.forEach((question) => {
      answers[question] = `AI-generated answer for: ${question}`;
    });
    return answers;
  }

  async generatePRD(
    description: string,
    aiConfig: AIConfig,
    promptOverride?: string,
    messageOverride?: string,
    streamingOptions?: StreamingOptions
  ): Promise<string> {
    return `# Product Requirements Document\n\n## Overview\n${description}\n\n## Features\n- User authentication\n- Task management\n- Real-time collaboration\n\n## Technical Requirements\n- React frontend\n- Node.js backend\n- PostgreSQL database`;
  }

  async combinePRDs(
    prds: string[],
    originalDescription: string,
    aiConfig: AIConfig,
    promptOverride?: string,
    messageOverride?: string,
    streamingOptions?: StreamingOptions
  ): Promise<string> {
    return `# Master PRD\n\n${prds
      .map((prd, index) => `## PRD ${index + 1}\n\n${prd}`)
      .join("\n\n")}`;
  }
}
