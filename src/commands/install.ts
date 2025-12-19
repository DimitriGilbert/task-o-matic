import { Command } from "commander";
import chalk from "chalk";
import { existsSync, mkdirSync, readFileSync, writeFileSync, appendFileSync } from "fs";
import { dirname, resolve, join } from "path";

export const installCommand = new Command("install")
  .description("Install task-o-matic documentation and agent guides into current project")
  .argument("<target>", "Installation target: doc, claude, or agents")
  .option("--force", "Overwrite existing files", false)
  .action(async (target, options) => {
    try {
      // Validate target
      const validTargets = ["doc", "claude", "agents"];
      if (!validTargets.includes(target)) {
        console.error(chalk.red(`Invalid target: ${target}`));
        console.error(chalk.yellow(`Valid targets: ${validTargets.join(", ")}`));
        process.exit(1);
      }

      // Get package docs directory
      const packageDocsDir = getPackageDocsDir();
      const currentDir = process.cwd();

      // Execute based on target
      switch (target) {
        case "doc":
          await installDoc(packageDocsDir, currentDir, options.force);
          break;
        case "claude":
          await installClaude(packageDocsDir, currentDir, options.force);
          break;
        case "agents":
          await installAgents(packageDocsDir, currentDir, options.force);
          break;
      }
    } catch (error) {
      console.error(chalk.red("Install failed:"), error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

function getPackageDocsDir(): string {
  // Try multiple approaches to find the docs directory
  let docsPath = resolve(__dirname, "../../docs");

  // Check if we're in development (running from src/)
  if (!existsSync(docsPath)) {
    docsPath = resolve(process.cwd(), "docs");
  }

  // Check if we're installed as a dependency
  if (!existsSync(docsPath)) {
    try {
      docsPath = require.resolve("task-o-matic/docs");
    } catch (e) {
      // Ignore if not found
    }
  }

  return docsPath;
}

async function installDoc(packageDocsDir: string, currentDir: string, force: boolean) {
  console.log(chalk.blue("Installing task-o-matic help documentation..."));

  const sourceFile = join(packageDocsDir, "task-o-matic_help.md");
  const targetDir = join(currentDir, "docs");
  const targetFile = join(targetDir, "task-o-matic_help.md");

  // Check if source file exists
  if (!existsSync(sourceFile)) {
    throw new Error(`Source file not found: ${sourceFile}`);
  }

  // Check if target already exists
  if (existsSync(targetFile) && !force) {
    console.error(chalk.red("docs/task-o-matic_help.md already exists"));
    console.log(chalk.yellow("Use --force to overwrite"));
    return;
  }

  // Create docs directory if it doesn't exist
  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true });
    console.log(chalk.green(`✓ Created directory: docs/`));
  }

  // Copy the file
  const content = readFileSync(sourceFile, "utf-8");
  writeFileSync(targetFile, content, "utf-8");

  console.log(chalk.green(`✓ Installed help documentation to docs/task-o-matic_help.md`));
}

async function installClaude(packageDocsDir: string, currentDir: string, force: boolean) {
  console.log(chalk.blue("Installing Claude agent guide..."));

  const sourceFile = join(packageDocsDir, "agents", "cli.md");
  const targetFile = join(currentDir, "CLAUDE.md");

  // Check if source file exists
  if (!existsSync(sourceFile)) {
    throw new Error(`Source file not found: ${sourceFile}`);
  }

  // Check if target exists
  if (!existsSync(targetFile)) {
    console.error(chalk.red("CLAUDE.md not found in current directory"));
    console.log(chalk.yellow("Create a CLAUDE.md file first, then run this command"));
    return;
  }

  // Check if content already exists
  const existingContent = readFileSync(targetFile, "utf-8");
  const newContent = readFileSync(sourceFile, "utf-8");

  if (existingContent.includes(newContent.trim()) && !force) {
    console.log(chalk.yellow("✓ Claude agent guide already present in CLAUDE.md"));
    return;
  }

  // Append the content with proper formatting
  const separator = "\n\n---\n\n";
  const header = "\n\n# Task-o-matic CLI Agent Guide\n\n";
  const contentToAppend = header + newContent + separator;

  appendFileSync(targetFile, contentToAppend, "utf-8");

  console.log(chalk.green(`✓ Added Claude agent guide to CLAUDE.md`));
}

async function installAgents(packageDocsDir: string, currentDir: string, force: boolean) {
  console.log(chalk.blue("Installing agents guide..."));

  const sourceFile = join(packageDocsDir, "agents", "cli.md");
  const targetFile = join(currentDir, "AGENTS.md");

  // Check if source file exists
  if (!existsSync(sourceFile)) {
    throw new Error(`Source file not found: ${sourceFile}`);
  }

  let existingContent = "";
  const fileExists = existsSync(targetFile);

  if (fileExists) {
    existingContent = readFileSync(targetFile, "utf-8");
  } else {
    // Create AGENTS.md with basic header
    existingContent = "# AGENTS.md\n\nThis file contains agent integration guides.\n";
  }

  const newContent = readFileSync(sourceFile, "utf-8");

  // Check if content already exists
  if (existingContent.includes(newContent.trim()) && !force) {
    console.log(chalk.yellow("✓ Agent guide already present in AGENTS.md"));
    return;
  }

  // Append the content with proper formatting
  const separator = "\n\n---\n\n";
  const header = "\n\n# Task-o-matic CLI Agent Guide\n\n";
  const contentToAppend = header + newContent + separator;

  if (fileExists) {
    appendFileSync(targetFile, contentToAppend, "utf-8");
  } else {
    writeFileSync(targetFile, existingContent + contentToAppend, "utf-8");
  }

  console.log(chalk.green(`✓ Added agent guide to AGENTS.md`));
}