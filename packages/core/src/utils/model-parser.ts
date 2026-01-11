import { isValidAIProvider } from "../lib/validation";

// Helper to parse model string ([provider:]model[;reasoning[=budget]])
export function parseModelString(modelStr: string): {
  provider?: string;
  model: string;
  reasoning?: string;
} {
  let processingStr = modelStr;
  let reasoning: string | undefined;

  // 1. Extract reasoning
  // Format: ;reasoning or ;reasoning=1000
  const reasoningMatch = processingStr.match(/;reasoning(?:=(\d+))?$/);
  if (reasoningMatch) {
    // If specific budget provided (group 1), use it.
    // Otherwise default to "2000" as requested.
    reasoning = reasoningMatch[1] ? reasoningMatch[1] : "2000";

    // Remove the reasoning suffix from the string
    processingStr = processingStr.substring(0, reasoningMatch.index);
  }

  // 2. Extract provider and model
  // We look for the first colon.
  const firstColonIndex = processingStr.indexOf(":");

  if (firstColonIndex === -1) {
    // No colon -> It's just a model name (provider inferred from env/defaults later)
    return {
      provider: undefined,
      model: processingStr,
      reasoning,
    };
  }

  // Has colon. Check if the part before is a valid provider.
  const potentialProvider = processingStr.substring(0, firstColonIndex);
  const potentialModel = processingStr.substring(firstColonIndex + 1);

  if (isValidAIProvider(potentialProvider)) {
    // It is a known provider
    return {
      provider: potentialProvider,
      model: potentialModel,
      reasoning,
    };
  }

  // Not a known provider. Treat the whole thing as the model name.
  // This handles cases like "google/gemini...:free" where "google/gemini..." isn't a provider key.
  // Or just "model:with:colons".
  return {
    provider: undefined,
    model: processingStr,
    reasoning,
  };
}
