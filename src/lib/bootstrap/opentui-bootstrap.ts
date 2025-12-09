import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import chalk from "chalk";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export interface OpenTuiBootstrapOptions {
  projectName: string;
  projectPath: string;
  framework: "solid" | "vue" | "react";
  packageManager: "npm" | "pnpm" | "bun";
}

export async function bootstrapOpenTuiProject(
  options: OpenTuiBootstrapOptions
): Promise<{ success: boolean; message: string }> {
  try {
    console.log(chalk.blue(`\n🚀 Bootstrapping OpenTUI project: ${options.projectName}`));

    // Warn if not using Bun
    if (options.packageManager !== "bun") {
      console.log(chalk.yellow(`  ⚠️  OpenTUI works best with Bun. Consider using --package-manager bun`));
    }

    // Create project directory
    if (!existsSync(options.projectPath)) {
      mkdirSync(options.projectPath, { recursive: true });
      console.log(chalk.green(`  ✓ Created project directory`));
    }

    // Create directory structure
    const dirs = ["src", "src/components"];

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
      generateTsConfig()
    );
    console.log(chalk.green(`  ✓ Created tsconfig.json`));

    writeFileSync(
      join(options.projectPath, "build.ts"),
      generateBuildScriptTemplate(options.framework)
    );
    console.log(chalk.green(`  ✓ Created build.ts`));

    // Generate framework-specific files
    const extension = options.framework === "vue" ? "vue" : "tsx";
    const indexContent = getFrameworkIndexTemplate(options.framework);
    const appContent = getFrameworkAppTemplate(options.framework);

    writeFileSync(
      join(options.projectPath, "src/index.ts"),
      indexContent
    );
    console.log(chalk.green(`  ✓ Created src/index.ts`));

    writeFileSync(
      join(options.projectPath, `src/App.${extension}`),
      appContent
    );
    console.log(chalk.green(`  ✓ Created src/App.${extension}`));

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
      message: `OpenTUI project "${options.projectName}" created successfully!`
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      message: `Failed to bootstrap OpenTUI project: ${message}`
    };
  }
}

function generatePackageJson(options: OpenTuiBootstrapOptions): string {
  const frameworkDeps = getFrameworkDependencies(options.framework);
  const frameworkDevDeps = getFrameworkDevDependencies(options.framework);

  const pkg = {
    name: options.projectName,
    version: "0.1.0",
    type: "module",
    scripts: {
      build: "bun run build.ts",
      dev: "bun run --watch src/index.ts",
      start: "bun run dist/index.js"
    },
    dependencies: {
      "@opentui/core": "latest",
      ...frameworkDeps
    },
    devDependencies: {
      typescript: "latest",
      "@types/node": "latest",
      ...frameworkDevDeps
    }
  };

  return JSON.stringify(pkg, null, 2);
}

function getFrameworkDependencies(framework: "solid" | "vue" | "react"): Record<string, string> {
  const deps: Record<string, Record<string, string>> = {
    solid: {
      "@opentui/solid": "latest",
      "solid-js": "latest"
    },
    vue: {
      "@opentui/vue": "latest",
      vue: "latest"
    },
    react: {
      "@opentui/react": "latest",
      react: "latest"
    }
  };

  return deps[framework];
}

function getFrameworkDevDependencies(framework: "solid" | "vue" | "react"): Record<string, string> {
  const devDeps: Record<string, Record<string, string>> = {
    solid: {
      "bun-plugin-solid": "latest"
    },
    vue: {
      "bun-plugin-vue3": "latest"
    },
    react: {}
  };

  return devDeps[framework];
}

function generateTsConfig(): string {
  const config = {
    compilerOptions: {
      target: "ES2022",
      module: "ESNext",
      moduleResolution: "bundler",
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      jsx: "preserve",
      jsxImportSource: "solid-js",
      types: ["bun-types"]
    },
    include: ["src/**/*", "build.ts"],
    exclude: ["node_modules", "dist"]
  };

  return JSON.stringify(config, null, 2);
}

function generateBuildScriptTemplate(framework: "solid" | "vue" | "react"): string {
  const plugins: Record<string, string> = {
    solid: `import { pluginSolid } from "bun-plugin-solid";`,
    vue: `import { pluginVue3 } from "bun-plugin-vue3";`,
    react: ``
  };

  const pluginArray: Record<string, string> = {
    solid: `plugins: [pluginSolid()]`,
    vue: `plugins: [pluginVue3()]`,
    react: `plugins: []`
  };

  return `${plugins[framework] ? plugins[framework] + "\n\n" : ""}const result = await Bun.build({
  entrypoints: ["./src/index.ts"],
  outdir: "./dist",
  target: "bun",
  ${pluginArray[framework]},
});

if (!result.success) {
  console.error("Build failed");
  for (const message of result.logs) {
    console.error(message);
  }
  process.exit(1);
}

console.log("Build successful!");
`;
}

function getFrameworkIndexTemplate(framework: "solid" | "vue" | "react"): string {
  const templates: Record<string, string> = {
    solid: `import { createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/solid";
import { App } from "./App";

const renderer = await createCliRenderer({
  exitOnCtrlC: true,
  targetFps: 60,
});

renderer.start();
createRoot(renderer).render(() => <App />);
`,
    vue: `import { createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/vue";
import App from "./App.vue";

const renderer = await createCliRenderer({
  exitOnCtrlC: true,
  targetFps: 60,
});

renderer.start();
createRoot(renderer).render(App);
`,
    react: `import { createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";
import { App } from "./App";

const renderer = await createCliRenderer({
  exitOnCtrlC: true,
  targetFps: 60,
});

renderer.start();
createRoot(renderer).render(<App />);
`
  };

  return templates[framework];
}

function getFrameworkAppTemplate(framework: "solid" | "vue" | "react"): string {
  const templates: Record<string, string> = {
    solid: `import { TextRenderable } from "@opentui/core";

export function App() {
  return (
    <TextRenderable
      content="Hello from OpenTUI with Solid!"
      fg="#00FF00"
      position="absolute"
      left={10}
      top={5}
    />
  );
}
`,
    vue: `<script setup lang="ts">
</script>

<template>
  <textRenderable
    content="Hello from OpenTUI with Vue!"
    :style="{ fg: '#00FF00', position: 'absolute', left: 10, top: 5 }"
  />
</template>
`,
    react: `import { TextRenderable } from "@opentui/core";

export function App() {
  return (
    <TextRenderable
      content="Hello from OpenTUI with React!"
      fg="#00FF00"
      position="absolute"
      left={10}
      top={5}
    />
  );
}
`
  };

  return templates[framework];
}

function generateReadmeTemplate(options: OpenTuiBootstrapOptions): string {
  return `# ${options.projectName}

Terminal User Interface (TUI) application built with OpenTUI and ${options.framework === "solid" ? "Solid.js" : options.framework === "vue" ? "Vue.js" : "React"}

Generated by task-o-matic

## Installation

\`\`\`bash
${options.packageManager} install
\`\`\`

## Development

\`\`\`bash
# Run in development mode with watch
${options.packageManager} run dev

# Build the project
${options.packageManager} run build

# Run the built TUI app
${options.packageManager} start
\`\`\`

## Project Structure

- \`src/index.ts\` - Application entry point
- \`src/App.${options.framework === "vue" ? "vue" : "tsx"}\` - Main TUI component
- \`src/components/\` - Reusable TUI components
- \`build.ts\` - Bun build configuration

## Technologies

- **OpenTUI** - Terminal UI framework
- **${options.framework === "solid" ? "Solid.js" : options.framework === "vue" ? "Vue.js" : "React"}** - Component framework
- **TypeScript** - Type-safe development
- **Bun** - Fast JavaScript runtime and bundler

## Controls

- \`Ctrl+C\` - Exit the application

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
bun-debug.log*

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
