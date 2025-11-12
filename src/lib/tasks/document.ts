import {
  getAIOperations,
  getStorage,
  getContextBuilder,
} from "../../utils/ai-service-factory";
import { formatStackInfo } from "../../utils/stack-formatter";
import {
  Task,
  TaskDocumentation,
  StreamingOptions,
  DocumentationDetection,
  AIConfig,
} from "../../types";
import { DocumentTaskOptions } from "../../types/options";

const getExistingDocumentations = async () => {
  const tasks = await getStorage().getTasks();
  if (!tasks) {
    throw new Error(`no tasks`);
  }

  const documentations = tasks.map((task) => task.documentation);

  return documentations;
};

export async function documentTask(
  options: DocumentTaskOptions,
  streamingOptions?: StreamingOptions,
): Promise<{
  task: Task;
  analysis: DocumentationDetection | null;
  recap?: string;
  documentation?: TaskDocumentation;
}> {
  const task = await getStorage().getTask(options.taskId);
  if (!task) {
    throw new Error(`Task with ID ${options.taskId} not found`);
  }

  if (task.documentation && !options.force) {
    if (getContextBuilder().isDocumentationFresh(task.documentation)) {
      return {
        task,
        analysis: null,
        recap: task.documentation.recap,
        documentation: task.documentation,
      };
    }
  }
  // console.log("prout");

  const context = await getContextBuilder().buildContext(options.taskId);
  const stackInfo = formatStackInfo(context.stack);

  // Build AI config from options
  const analysisAIConfig: Partial<AIConfig> = {
    ...(options.aiProvider && {
      provider: options.aiProvider as
        | "openrouter"
        | "openai"
        | "anthropic"
        | "custom",
    }),
    ...(options.aiModel && { model: options.aiModel }),
    ...(options.aiKey && { apiKey: options.aiKey }),
    ...(options.aiProviderUrl && { baseURL: options.aiProviderUrl }),
    ...(options.aiReasoning && {
      reasoning: { maxTokens: parseInt(options.aiReasoning, 10) },
    }),
  };

  // Get full task content
  const fullContent = context.task.fullContent || task.description;

  if (!fullContent) {
    throw new Error("Task content is empty");
  }
  // console.log("prout2");

  // First analyze what documentation is needed
  const analysis = await getAIOperations().analyzeDocumentationNeeds(
    task.id,
    task.title,
    fullContent,
    stackInfo,
    streamingOptions,
    undefined,
    analysisAIConfig,
    // context.existingResearch,
    await getExistingDocumentations(),
  );
  // console.log("prout3");

  if (analysis.libraries.length > 0) {
    // Use actual files from analysis, no bullshit construction
    const files = analysis.files || [];

    // Build research object from actual libraries
    const research: Record<string, Array<{ query: string; doc: string }>> = {};
    for (const lib of analysis.libraries) {
      const sanitizedLibrary = getStorage().sanitizeForFilename(lib.name);
      const sanitizedQuery = getStorage().sanitizeForFilename(lib.searchQuery);
      const docFile = `docs/${sanitizedLibrary}/${sanitizedQuery}.md`;

      if (!research[lib.name]) {
        research[lib.name] = [];
      }
      research[lib.name].push({
        query: lib.searchQuery,
        doc: docFile,
      });
    }

    const documentation = {
      lastFetched: Date.now(),
      libraries: analysis.libraries.map(
        (lib: { context7Id: string }) => lib.context7Id,
      ),
      recap: await getAIOperations().generateDocumentationRecap(
        analysis.libraries,
        analysis.toolResults?.map((tr) => ({
          library: tr.toolName,
          content: JSON.stringify(tr.output),
        })) || [],
        streamingOptions,
      ),
      files,
      research,
    };

    await getStorage().updateTask(options.taskId, { documentation });
    return { task, analysis, documentation };
  }

  return { task, analysis };
}
