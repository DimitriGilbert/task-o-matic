
import chalk from "chalk";
import { DocumentationDetection } from "../../types";

export function displayEnhancementResult(streamEnabled: boolean): void {
  if (!streamEnabled) {
    console.log(chalk.green("✓ Task enhanced with Context7 documentation"));
  }
}

export function displayDocumentationAnalysis(
  analysis: DocumentationDetection,
): void {
  console.log(chalk.cyan(`
Documentation analysis complete:`));

  if (analysis.libraries.length > 0) {
    console.log(chalk.blue(`Libraries identified:`));
    analysis.libraries.forEach((lib) => {
      console.log(`  • ${lib.name} (${lib.context7Id})`);
      console.log(`    Search Query: "${lib.searchQuery}"`);
      console.log(`    Reason: ${lib.reason}`);
    });

    console.log(chalk.green(`✓ Documentation analysis saved to task`));
  } else {
    console.log(chalk.yellow("No specific documentation needs identified."));
  }
}

export function displayResearchSummary(documentation: any): void {
  if (documentation?.research) {
    console.log(chalk.cyan(`
📚 Research Summary:`));
    Object.entries(documentation.research).forEach(
      ([lib, entries]: [string, any]) => {
        console.log(`  • ${lib}: ${entries.length} queries cached`);
        entries.forEach((entry: any, index: number) => {
          console.log(`    ${index + 1}. Query: "${entry.query}"`);
          console.log(`       Cache: ${entry.cache}`);
          console.log(`       Doc: ${entry.doc}`);
        });
      },
    );
  }
}
