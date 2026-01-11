import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import chalk from "chalk";
import { exec } from "child_process";
import { promisify } from "util";
import { randomBytes } from "crypto";

const execAsync = promisify(exec);

export interface MedusaBootstrapOptions {
  projectName: string;
  projectPath: string;
  packageManager: "npm" | "pnpm" | "bun";
  database?: "postgres" | "sqlite";
  skipDb?: boolean;
  skipInstall?: boolean;
  version?: string;
}

export async function bootstrapMedusaProject(
  options: MedusaBootstrapOptions
): Promise<{ success: boolean; message: string }> {
  try {
    console.log(
      chalk.blue(`\n🚀 Bootstrapping MedusaJS project: ${options.projectName}`)
    );

    // Create project directory
    if (!existsSync(options.projectPath)) {
      mkdirSync(options.projectPath, { recursive: true });
      console.log(chalk.green(`  ✓ Created project directory`));
    }

    // Build create-medusa-app command with correct package runner
    const versionFlag = options.version ? `@${options.version}` : "@latest";
    const dbFlag =
      options.database === "postgres"
        ? "--db-type postgres"
        : "--db-type sqlite";
    const skipInstallFlag = options.skipInstall ? "--skip-install" : "";

    // Respect package manager for the runner
    const packageRunner =
      options.packageManager === "npm"
        ? "npx"
        : options.packageManager === "pnpm"
        ? "pnpm dlx"
        : "bunx";

    // Use the project path as the target directory
    const createCmd = `${packageRunner} create-medusa-app${versionFlag} ${options.projectPath} ${dbFlag} ${skipInstallFlag} --skip-db --no-browser`;

    console.log(
      chalk.cyan(
        `\n  📦 Running create-medusa-app with ${options.packageManager}...`
      )
    );
    await execAsync(createCmd, { cwd: process.cwd() });
    console.log(chalk.green(`  ✓ MedusaJS project scaffolded`));

    // Generate environment file
    const envContent = generateEnvFile(options);
    writeFileSync(join(options.projectPath, ".env"), envContent);
    console.log(chalk.green(`  ✓ Created .env file`));

    // Generate README
    const readmeContent = generateReadme(options);
    writeFileSync(join(options.projectPath, "README.md"), readmeContent);
    console.log(chalk.green(`  ✓ Created README.md`));

    // Install dependencies if not skipped
    if (!options.skipInstall) {
      console.log(
        chalk.cyan(
          `\n  📦 Installing dependencies with ${options.packageManager}...`
        )
      );
      const installCmd =
        options.packageManager === "npm"
          ? "npm install"
          : options.packageManager === "pnpm"
          ? "pnpm install"
          : "bun install";

      await execAsync(installCmd, { cwd: options.projectPath });
      console.log(chalk.green(`  ✓ Dependencies installed`));
    }

    // Setup database if not skipped
    if (!options.skipDb) {
      console.log(chalk.cyan(`\n  🗄️  Setting up database...`));
      try {
        const packageRunner =
          options.packageManager === "npm"
            ? "npx"
            : options.packageManager === "pnpm"
            ? "pnpm dlx"
            : "bunx";
        await execAsync(`${packageRunner} medusa db:setup`, {
          cwd: options.projectPath,
        });
        console.log(chalk.green(`  ✓ Database setup complete`));
      } catch (error) {
        const packageRunner =
          options.packageManager === "npm"
            ? "npx"
            : options.packageManager === "pnpm"
            ? "pnpm dlx"
            : "bunx";
        console.log(
          chalk.yellow(
            `  ⚠️  Database setup skipped (run '${packageRunner} medusa db:setup' manually)`
          )
        );
      }
    }

    return {
      success: true,
      message: `MedusaJS project "${options.projectName}" created successfully!`,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      message: `Failed to bootstrap MedusaJS project: ${message}`,
    };
  }
}

function generateEnvFile(options: MedusaBootstrapOptions): string {
  const database = options.database || "sqlite";
  const databaseUrl =
    database === "postgres"
      ? "postgres://postgres:postgres@localhost:5432/medusa-store"
      : "sqlite://./medusa.db";

  // Generate secure random secrets
  const jwtSecret = randomBytes(32).toString("hex");
  const cookieSecret = randomBytes(32).toString("hex");

  return `# Database Configuration
DATABASE_URL=${databaseUrl}

# Authentication Secrets (auto-generated)
JWT_SECRET=${jwtSecret}
COOKIE_SECRET=${cookieSecret}

# CORS Configuration (adjust for your frontend)
STORE_CORS=http://localhost:8000
ADMIN_CORS=http://localhost:7001,http://localhost:7000

# Server Configuration
PORT=9000

# Redis (optional - uncomment for production)
# REDIS_URL=redis://localhost:6379

# Worker Mode (shared = single process, server = API only, worker = background jobs only)
WORKER_MODE=shared
`;
}

function generateReadme(options: MedusaBootstrapOptions): string {
  const database = options.database || "sqlite";

  return `# ${options.projectName}

MedusaJS e-commerce backend generated by task-o-matic

## Getting Started

### Prerequisites

${
  database === "postgres"
    ? `- PostgreSQL database running
- Update \`DATABASE_URL\` in \`.env\` with your database credentials`
    : `- SQLite (no additional setup required)`
}

### Installation

\`\`\`bash
${options.packageManager} install
\`\`\`

### Database Setup

\`\`\`bash
# Run migrations and seed data
${
  options.packageManager === "npm"
    ? "npx"
    : options.packageManager === "pnpm"
    ? "pnpm dlx"
    : "bunx"
} medusa db:setup
\`\`\`

### Development

\`\`\`bash
# Start development server
${options.packageManager} run dev

# The API will be available at http://localhost:9000
# Admin dashboard at http://localhost:9000/app
\`\`\`

### Build

\`\`\`bash
# Build for production
${options.packageManager} run build

# Start production server
${options.packageManager} start
\`\`\`

## Project Structure

- \`src/\` - Source code
  - \`src/admin/\` - Admin dashboard customizations
  - \`src/api/\` - API routes and middlewares
  - \`src/modules/\` - Custom modules
  - \`src/workflows/\` - Business logic workflows
  - \`src/subscribers/\` - Event subscribers
- \`medusa-config.ts\` - MedusaJS configuration
- \`.env\` - Environment variables

## Environment Variables

Key environment variables (see \`.env\` for full list):

- \`DATABASE_URL\` - Database connection string
- \`JWT_SECRET\` - Secret for JWT tokens
- \`COOKIE_SECRET\` - Secret for cookies
- \`STORE_CORS\` - Allowed origins for storefront
- \`ADMIN_CORS\` - Allowed origins for admin

## Documentation

- [MedusaJS Documentation](https://docs.medusajs.com)
- [API Reference](https://docs.medusajs.com/api)
- [Admin Guide](https://docs.medusajs.com/admin)

## Next Steps

1. Configure your database connection in \`.env\`
2. Run \`${
    options.packageManager === "npm"
      ? "npx"
      : options.packageManager === "pnpm"
      ? "pnpm dlx"
      : "bunx"
  } medusa db:setup\` to initialize the database
3. Start the development server with \`${options.packageManager} run dev\`
4. Access the admin dashboard at http://localhost:9000/app
5. Create your first admin user

---

Generated with [task-o-matic](https://github.com/DimitriGilbert/task-o-matic)
`;
}
