import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import chalk from "chalk";
import { exec } from "child_process";
import { promisify } from "util";
import type { CliDependencyLevel } from "../../types";

const execAsync = promisify(exec);

export interface CliBootstrapOptions {
  projectName: string;
  projectPath: string;
  dependencyLevel: CliDependencyLevel;
  packageManager: "npm" | "pnpm" | "bun";
  runtime: "node" | "bun";
  typescript: boolean;
}

export async function bootstrapCliProject(
  options: CliBootstrapOptions
): Promise<{ success: boolean; message: string }> {
  try {
    console.log(chalk.blue(`\n🚀 Bootstrapping CLI project: ${options.projectName}`));

    // Create project directory
    if (!existsSync(options.projectPath)) {
      mkdirSync(options.projectPath, { recursive: true });
      console.log(chalk.green(`  ✓ Created project directory`));
    }

    // Create directory structure
    const dirs = [
      "src/cli",
      "src/commands",
      "src/types",
    ];

    // Add services dir for standard+
    if (options.dependencyLevel !== "minimal") {
      dirs.push("src/services");
    }

    // Add test dir for full+
    if (options.dependencyLevel === "full" || options.dependencyLevel === "task-o-matic") {
      dirs.push("src/test");
    }

    dirs.forEach(dir => {
      const fullPath = join(options.projectPath, dir);
      mkdirSync(fullPath, { recursive: true });
    });
    console.log(chalk.green(`  ✓ Created directory structure`));

    // Generate files
    writeFileSync(
      join(options.projectPath, "package.json"),
      generatePackageJson(options)
    );
    console.log(chalk.green(`  ✓ Created package.json`));

    writeFileSync(
      join(options.projectPath, "tsconfig.json"),
      generateTsConfig(options.dependencyLevel === "full" || options.dependencyLevel === "task-o-matic")
    );
    console.log(chalk.green(`  ✓ Created tsconfig.json`));

    writeFileSync(
      join(options.projectPath, "src/cli/bin.ts"),
      generateBinTemplate(options.projectName)
    );
    console.log(chalk.green(`  ✓ Created src/cli/bin.ts`));

    writeFileSync(
      join(options.projectPath, "src/index.ts"),
      generateIndexTemplate(options.projectName)
    );
    console.log(chalk.green(`  ✓ Created src/index.ts`));

    writeFileSync(
      join(options.projectPath, "src/commands/index.ts"),
      generateCommandsIndexTemplate()
    );
    console.log(chalk.green(`  ✓ Created src/commands/index.ts`));

    writeFileSync(
      join(options.projectPath, "src/commands/example.ts"),
      generateExampleCommandTemplate()
    );
    console.log(chalk.green(`  ✓ Created src/commands/example.ts`));

    writeFileSync(
      join(options.projectPath, "src/types/index.ts"),
      generateTypesTemplate()
    );
    console.log(chalk.green(`  ✓ Created src/types/index.ts`));

    writeFileSync(
      join(options.projectPath, "README.md"),
      generateReadmeTemplate(options)
    );
    console.log(chalk.green(`  ✓ Created README.md`));

    writeFileSync(
      join(options.projectPath, ".gitignore"),
      generateGitignoreTemplate()
    );
    console.log(chalk.green(`  ✓ Created .gitignore`));

    // Install dependencies
    console.log(chalk.cyan(`\n  📦 Installing dependencies with ${options.packageManager}...`));
    const installCmd = options.packageManager === "npm" ? "npm install" :
                      options.packageManager === "pnpm" ? "pnpm install" :
                      "bun install";

    await execAsync(installCmd, { cwd: options.projectPath });
    console.log(chalk.green(`  ✓ Dependencies installed`));

    return {
      success: true,
      message: `CLI project "${options.projectName}" created successfully!`
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      message: `Failed to bootstrap CLI project: ${message}`
    };
  }
}

function generatePackageJson(options: CliBootstrapOptions): string {
  const deps = getBaseDependencies(options.dependencyLevel);
  const devDeps = getDevDependencies(options);
  const scripts = getScripts(options);

  const pkg = {
    name: options.projectName,
    version: "0.1.0",
    type: "module",
    main: "./dist/lib/index.js",
    types: "./dist/lib/index.d.ts",
    bin: {
      [options.projectName]: "./dist/cli/bin.js"
    },
    scripts,
    dependencies: deps,
    devDependencies: devDeps,
  };

  return JSON.stringify(pkg, null, 2);
}

function getBaseDependencies(level: CliDependencyLevel): Record<string, string> {
  const deps: Record<string, Record<string, string>> = {
    minimal: {
      commander: "latest",
      chalk: "latest"
    },
    standard: {
      commander: "latest",
      chalk: "latest",
      inquirer: "latest",
      dotenv: "latest"
    },
    full: {
      commander: "latest",
      chalk: "latest",
      inquirer: "latest",
      dotenv: "latest"
    },
    "task-o-matic": {
      commander: "latest",
      chalk: "latest",
      inquirer: "latest",
      dotenv: "latest",
      ai: "latest",
      "@ai-sdk/anthropic": "latest",
      "@ai-sdk/openai": "latest",
      zod: "latest"
    }
  };

  return deps[level];
}

function getDevDependencies(options: CliBootstrapOptions): Record<string, string> {
  const devDeps: Record<string, string> = {
    typescript: "latest",
    "@types/node": "latest",
  };

  if (options.dependencyLevel === "full" || options.dependencyLevel === "task-o-matic") {
    devDeps.mocha = "latest";
    devDeps.tsx = "latest";
    devDeps["@types/mocha"] = "latest";
  }

  return devDeps;
}

function getScripts(options: CliBootstrapOptions): Record<string, string> {
  const scripts: Record<string, string> = {
    build: "rm -rf dist && tsc",
    "build:watch": "tsc --watch",
    dev: "tsx src/cli/bin.ts",
    start: "node dist/cli/bin.js",
    "check-types": "tsc --noEmit"
  };

  if (options.dependencyLevel === "full" || options.dependencyLevel === "task-o-matic") {
    scripts.test = "mocha -r tsx/cjs src/test/**/*.test.ts";
  }

  return scripts;
}

function generateBinTemplate(projectName: string): string {
  return `#!/usr/bin/env node
import { runCLI } from "../index.js";

runCLI().catch((error) => {
  console.error(error);
  process.exit(1);
});
`;
}

function generateIndexTemplate(projectName: string): string {
  return `import { Command } from "commander";
import chalk from "chalk";
import { exampleCommand } from "./commands/example.js";

const program = new Command();

program
  .name("${projectName}")
  .description("CLI application generated by task-o-matic")
  .version("0.1.0");

program.addCommand(exampleCommand);

program.action(() => {
  console.log(chalk.blue("Welcome to ${projectName}!"));
  console.log(chalk.gray("Run with --help to see available commands"));
});

export const runCLI = async () => {
  await program.parseAsync(process.argv);
};
`;
}

function generateCommandsIndexTemplate(): string {
  return `export * from "./example.js";
`;
}

function generateExampleCommandTemplate(): string {
  return `import { Command } from "commander";
import chalk from "chalk";

export const exampleCommand = new Command("hello")
  .description("Example command that greets the user")
  .argument("[name]", "Name to greet", "World")
  .action((name: string) => {
    console.log(chalk.green(\`Hello, \${name}!\`));
  });
`;
}

function generateTypesTemplate(): string {
  return `// Add your custom types here

export interface ExampleType {
  name: string;
  value: number;
}
`;
}

function generateTsConfig(strict: boolean): string {
  const config = {
    compilerOptions: {
      target: "ES2022",
      module: "ESNext",
      moduleResolution: "bundler",
      strict: strict,
      esModuleInterop: true,
      skipLibCheck: true,
      declaration: true,
      declarationMap: true,
      outDir: "dist",
      rootDir: "src",
    },
    include: ["src/**/*"],
    exclude: ["node_modules", "dist"]
  };

  return JSON.stringify(config, null, 2);
}

function generateReadmeTemplate(options: CliBootstrapOptions): string {
  return `# ${options.projectName}

CLI application generated by task-o-matic

## Installation

\`\`\`bash
${options.packageManager} install
\`\`\`

## Development

\`\`\`bash
# Run in development mode
${options.packageManager} run dev

# Build the project
${options.packageManager} run build

# Run the built CLI
${options.packageManager} start
\`\`\`

## Usage

\`\`\`bash
${options.projectName} --help
${options.projectName} hello World
\`\`\`

## Project Structure

- \`src/cli/bin.ts\` - CLI entry point
- \`src/index.ts\` - Main CLI setup with Commander.js
- \`src/commands/\` - Command implementations
- \`src/types/\` - TypeScript type definitions
${options.dependencyLevel !== "minimal" ? "- `src/services/` - Business logic services\n" : ""}${(options.dependencyLevel === "full" || options.dependencyLevel === "task-o-matic") ? "- `src/test/` - Test files\n" : ""}
## Dependencies

This project uses:
- **Commander.js** - CLI framework
- **Chalk** - Terminal string styling
${options.dependencyLevel !== "minimal" ? "- **Inquirer** - Interactive CLI prompts\n- **Dotenv** - Environment variable management\n" : ""}${options.dependencyLevel === "task-o-matic" ? "- **Vercel AI SDK** - AI integration\n- **Zod** - Runtime type validation\n" : ""}
## Scripts

- \`${options.packageManager} run build\` - Build the TypeScript project
- \`${options.packageManager} run dev\` - Run in development mode with tsx
- \`${options.packageManager} start\` - Run the built CLI
- \`${options.packageManager} run check-types\` - Type check without compilation
${(options.dependencyLevel === "full" || options.dependencyLevel === "task-o-matic") ? `- \`${options.packageManager} test\` - Run tests with Mocha\n` : ""}
---

Generated with [task-o-matic](https://github.com/anthropics/task-o-matic)
`;
}

function generateGitignoreTemplate(): string {
  return `# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Production
dist/
build/

# Misc
.DS_Store
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# IDEs
.idea/
.vscode/
*.swp
*.swo
*~

# TypeScript
*.tsbuildinfo
`;
}
