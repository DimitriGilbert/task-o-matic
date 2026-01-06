import {
  PRD_PARSING_PROMPT,
  PRD_PARSING_SYSTEM_PROMPT,
  TASK_BREAKDOWN_PROMPT,
  TASK_BREAKDOWN_SYSTEM_PROMPT,
  TASK_ENHANCEMENT_PROMPT,
  TASK_ENHANCEMENT_SYSTEM_PROMPT,
  PRD_REWORK_PROMPT,
  PRD_REWORK_SYSTEM_PROMPT,
  DOCUMENTATION_DETECTION_PROMPT,
  TASK_PLANNING_PROMPT,
  TASK_PLANNING_SYSTEM_PROMPT,
  TASK_EXECUTION_PROMPT,
  TASK_EXECUTION_SYSTEM_PROMPT,
  PRD_QUESTION_PROMPT,
  PRD_QUESTION_SYSTEM_PROMPT,
  DOCUMENTATION_RECAP_PROMPT,
  DOCUMENTATION_RECAP_SYSTEM_PROMPT,
  PRD_QUESTION_ANSWER_PROMPT,
  PRD_QUESTION_ANSWER_SYSTEM_PROMPT,
  PROJECT_INIT_SUGGESTION_PROMPT,
  PROJECT_INIT_SUGGESTION_SYSTEM_PROMPT,
  PRD_IMPROVEMENT_PROMPT,
  PRD_IMPROVEMENT_SYSTEM_PROMPT,
  TASK_PRIORITIZATION_PROMPT,
  TASK_PRIORITIZATION_SYSTEM_PROMPT,
  TASK_SPLITTING_ASSISTANCE_PROMPT,
  TASK_SPLITTING_ASSISTANCE_SYSTEM_PROMPT,
  PRD_SUGGEST_STACK_PROMPT,
  PRD_SUGGEST_STACK_SYSTEM_PROMPT,
} from "../prompts";

export interface PromptMetadata {
  name: string;
  description: string;
  type: "system" | "user";
  requiredVariables: string[];
  optionalVariables: string[];
  promptText: string;
}

export class PromptRegistry {
  private static prompts: Map<string, PromptMetadata> = new Map([
    // PRD Parsing Prompts
    [
      "prd-parsing",
      {
        name: "prd-parsing",
        description: "Parse PRD into structured tasks with dependency analysis",
        type: "user",
        requiredVariables: ["PRD_CONTENT"],
        optionalVariables: ["STACK_INFO"],
        promptText: PRD_PARSING_PROMPT,
      },
    ],
    [
      "prd-parsing-system",
      {
        name: "prd-parsing-system",
        description: "System prompt for PRD parsing with task breakdown rules",
        type: "system",
        requiredVariables: [],
        optionalVariables: [],
        promptText: PRD_PARSING_SYSTEM_PROMPT,
      },
    ],

    // Task Enhancement Prompts
    [
      "task-enhancement",
      {
        name: "task-enhancement",
        description: "Enhance task description with Context7 documentation",
        type: "user",
        requiredVariables: ["TASK_TITLE"],
        optionalVariables: ["TASK_DESCRIPTION", "CONTEXT_INFO", "PRD_CONTENT"],
        promptText: TASK_ENHANCEMENT_PROMPT,
      },
    ],
    [
      "task-enhancement-system",
      {
        name: "task-enhancement-system",
        description:
          "System prompt for task enhancement with documentation integration",
        type: "system",
        requiredVariables: [],
        optionalVariables: [],
        promptText: TASK_ENHANCEMENT_SYSTEM_PROMPT,
      },
    ],

    // Task Breakdown Prompts
    [
      "task-breakdown",
      {
        name: "task-breakdown",
        description: "Break down complex tasks into smaller subtasks",
        type: "user",
        requiredVariables: ["TASK_TITLE"],
        optionalVariables: ["TASK_DESCRIPTION"],
        promptText: TASK_BREAKDOWN_PROMPT,
      },
    ],
    [
      "task-breakdown-system",
      {
        name: "task-breakdown-system",
        description: "System prompt for task breakdown methodology",
        type: "system",
        requiredVariables: [],
        optionalVariables: [],
        promptText: TASK_BREAKDOWN_SYSTEM_PROMPT,
      },
    ],

    // PRD Rework Prompts
    [
      "prd-rework",
      {
        name: "prd-rework",
        description: "Improve PRD based on user feedback",
        type: "user",
        requiredVariables: ["PRD_CONTENT", "USER_FEEDBACK"],
        optionalVariables: ["STACK_INFO"],
        promptText: PRD_REWORK_PROMPT,
      },
    ],
    [
      "prd-rework-system",
      {
        name: "prd-rework-system",
        description: "System prompt for PRD improvement and enhancement",
        type: "system",
        requiredVariables: [],
        optionalVariables: [],
        promptText: PRD_REWORK_SYSTEM_PROMPT,
      },
    ],

    // Documentation Detection Prompts
    [
      "documentation-detection",
      {
        name: "documentation-detection",
        description:
          "Analyze task and identify required documentation libraries",
        type: "user",
        requiredVariables: ["TASK_TITLE"],
        optionalVariables: ["TASK_DESCRIPTION", "STACK_INFO"],
        promptText: DOCUMENTATION_DETECTION_PROMPT,
      },
    ],

    // Task Planning Prompts
    [
      "task-planning",
      {
        name: "task-planning",
        description: "Create detailed implementation plan for task or subtask",
        type: "user",
        requiredVariables: ["TASK_CONTEXT", "TASK_DETAILS"],
        optionalVariables: [],
        promptText: TASK_PLANNING_PROMPT,
      },
    ],
    [
      "task-planning-system",
      {
        name: "task-planning-system",
        description: "System prompt for detailed task implementation planning",
        type: "system",
        requiredVariables: [],
        optionalVariables: [],
        promptText: TASK_PLANNING_SYSTEM_PROMPT,
      },
    ],

    // Task Execution Prompts
    [
      "task-execution",
      {
        name: "task-execution",
        description: "Execute task with full project context",
        type: "user",
        requiredVariables: ["TASK_PLAN", "STACK_INFO"],
        optionalVariables: [
          "RETRY_CONTEXT",
          "DOCUMENTATION_CONTEXT",
          "PRD_CONTENT",
        ],
        promptText: TASK_EXECUTION_PROMPT,
      },
    ],
    [
      "task-execution-system",
      {
        name: "task-execution-system",
        description: "System prompt for task execution",
        type: "system",
        requiredVariables: [],
        optionalVariables: [],
        promptText: TASK_EXECUTION_SYSTEM_PROMPT,
      },
    ],

    // PRD Question Prompts
    [
      "prd-question",
      {
        name: "prd-question",
        description: "Generate clarifying questions for PRD",
        type: "user",
        requiredVariables: ["PRD_CONTENT"],
        optionalVariables: ["STACK_INFO"],
        promptText: PRD_QUESTION_PROMPT,
      },
    ],
    [
      "prd-question-system",
      {
        name: "prd-question-system",
        description: "System prompt for PRD questioning",
        type: "system",
        requiredVariables: [],
        optionalVariables: [],
        promptText: PRD_QUESTION_SYSTEM_PROMPT,
      },
    ],

    // Documentation Recap Prompts
    [
      "documentation-recap",
      {
        name: "documentation-recap",
        description: "Create concise recap of fetched documentation",
        type: "user",
        requiredVariables: ["LIBRARIES_LIST", "DOCUMENTATION_CONTENTS"],
        optionalVariables: [],
        promptText: DOCUMENTATION_RECAP_PROMPT,
      },
    ],
    [
      "documentation-recap-system",
      {
        name: "documentation-recap-system",
        description: "System prompt for documentation recap",
        type: "system",
        requiredVariables: [],
        optionalVariables: [],
        promptText: DOCUMENTATION_RECAP_SYSTEM_PROMPT,
      },
    ],

    // PRD Question Answer Prompts
    [
      "prd-question-answer",
      {
        name: "prd-question-answer",
        description: "Answer questions about PRD",
        type: "user",
        requiredVariables: ["PRD_CONTENT", "QUESTIONS_TEXT"],
        optionalVariables: ["CONTEXT_TEXT"],
        promptText: PRD_QUESTION_ANSWER_PROMPT,
      },
    ],
    [
      "prd-question-answer-system",
      {
        name: "prd-question-answer-system",
        description: "System prompt for PRD question answering",
        type: "system",
        requiredVariables: [],
        optionalVariables: [],
        promptText: PRD_QUESTION_ANSWER_SYSTEM_PROMPT,
      },
    ],

    // Workflow Prompts
    [
      "project-init-suggestion",
      {
        name: "project-init-suggestion",
        description: "Suggest project initialization configuration",
        type: "user",
        requiredVariables: ["USER_DESCRIPTION"],
        optionalVariables: [],
        promptText: PROJECT_INIT_SUGGESTION_PROMPT,
      },
    ],
    [
      "project-init-suggestion-system",
      {
        name: "project-init-suggestion-system",
        description: "System prompt for project initialization",
        type: "system",
        requiredVariables: [],
        optionalVariables: [],
        promptText: PROJECT_INIT_SUGGESTION_SYSTEM_PROMPT,
      },
    ],
    [
      "prd-improvement",
      {
        name: "prd-improvement",
        description: "Improve PRD based on user feedback",
        type: "user",
        requiredVariables: ["CURRENT_PRD", "USER_FEEDBACK"],
        optionalVariables: [],
        promptText: PRD_IMPROVEMENT_PROMPT,
      },
    ],
    [
      "prd-improvement-system",
      {
        name: "prd-improvement-system",
        description: "System prompt for PRD improvement",
        type: "system",
        requiredVariables: [],
        optionalVariables: [],
        promptText: PRD_IMPROVEMENT_SYSTEM_PROMPT,
      },
    ],
    [
      "task-prioritization",
      {
        name: "task-prioritization",
        description: "Prioritize tasks based on user guidance",
        type: "user",
        requiredVariables: ["TASKS_DESCRIPTION", "USER_GUIDANCE"],
        optionalVariables: [],
        promptText: TASK_PRIORITIZATION_PROMPT,
      },
    ],
    [
      "task-prioritization-system",
      {
        name: "task-prioritization-system",
        description: "System prompt for task prioritization",
        type: "system",
        requiredVariables: [],
        optionalVariables: [],
        promptText: TASK_PRIORITIZATION_SYSTEM_PROMPT,
      },
    ],
    [
      "task-splitting-assistance",
      {
        name: "task-splitting-assistance",
        description: "Generate task splitting instructions",
        type: "user",
        requiredVariables: ["TASK_TITLE", "USER_GUIDANCE"],
        optionalVariables: ["TASK_CONTENT"],
        promptText: TASK_SPLITTING_ASSISTANCE_PROMPT,
      },
    ],
    [
      "task-splitting-assistance-system",
      {
        name: "task-splitting-assistance-system",
        description: "System prompt for task splitting assistance",
        type: "system",
        requiredVariables: [],
        optionalVariables: [],
        promptText: TASK_SPLITTING_ASSISTANCE_SYSTEM_PROMPT,
      },
    ],

    // PRD Stack Suggestion Prompts
    [
      "prd-suggest-stack",
      {
        name: "prd-suggest-stack",
        description: "Suggest technology stack based on PRD analysis",
        type: "user",
        requiredVariables: ["PRD_CONTENT"],
        optionalVariables: ["STACK_INFO", "PROJECT_NAME"],
        promptText: PRD_SUGGEST_STACK_PROMPT,
      },
    ],
    [
      "prd-suggest-stack-system",
      {
        name: "prd-suggest-stack-system",
        description: "System prompt for PRD stack suggestion",
        type: "system",
        requiredVariables: [],
        optionalVariables: [],
        promptText: PRD_SUGGEST_STACK_SYSTEM_PROMPT,
      },
    ],
  ]);

  static getPrompt(name: string): PromptMetadata | undefined {
    return this.prompts.get(name);
  }

  static getAllPrompts(): PromptMetadata[] {
    return Array.from(this.prompts.values());
  }

  static getPromptsByType(type: "system" | "user"): PromptMetadata[] {
    return Array.from(this.prompts.values()).filter(
      (prompt) => prompt.type === type
    );
  }

  static hasPrompt(name: string): boolean {
    return this.prompts.has(name);
  }

  static listPrompts(): string {
    const prompts = this.getAllPrompts();
    let output = "Available prompts:\n\n";

    // Group by type
    const systemPrompts = prompts.filter((p) => p.type === "system");
    const userPrompts = prompts.filter((p) => p.type === "user");

    if (systemPrompts.length > 0) {
      output += "System Prompts:\n";
      systemPrompts.forEach((prompt) => {
        output += `  ${prompt.name}\n`;
        output += `    ${prompt.description}\n`;
        if (prompt.requiredVariables.length > 0) {
          output += `    Required variables: ${prompt.requiredVariables.join(
            ", "
          )}\n`;
        }
        if (prompt.optionalVariables.length > 0) {
          output += `    Optional variables: ${prompt.optionalVariables.join(
            ", "
          )}\n`;
        }
        output += "\n";
      });
    }

    if (userPrompts.length > 0) {
      output += "User Prompts:\n";
      userPrompts.forEach((prompt) => {
        output += `  ${prompt.name}\n`;
        output += `    ${prompt.description}\n`;
        if (prompt.requiredVariables.length > 0) {
          output += `    Required variables: ${prompt.requiredVariables.join(
            ", "
          )}\n`;
        }
        if (prompt.optionalVariables.length > 0) {
          output += `    Optional variables: ${prompt.optionalVariables.join(
            ", "
          )}\n`;
        }
        output += "\n";
      });
    }

    return output;
  }

  static validatePrompt(
    name: string,
    variables: Record<string, string>
  ): {
    valid: boolean;
    missingRequired: string[];
    missingOptional: string[];
  } {
    const prompt = this.getPrompt(name);
    if (!prompt) {
      return {
        valid: false,
        missingRequired: [],
        missingOptional: [],
      };
    }

    const missingRequired = prompt.requiredVariables.filter(
      (variable) => !variables[variable]
    );
    const missingOptional = prompt.optionalVariables.filter(
      (variable) => !variables[variable]
    );

    return {
      valid: missingRequired.length === 0,
      missingRequired,
      missingOptional,
    };
  }
}
