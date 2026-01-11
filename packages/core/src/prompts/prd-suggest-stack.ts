export const PRD_SUGGEST_STACK_SYSTEM_PROMPT = `You are an expert Software Architect specializing in modern full-stack development. Your goal is to analyze a Product Requirements Document (PRD) and suggest the optimal technology stack using the Better-T-Stack framework.

You must respond with valid JSON only. No markdown, no explanations outside the JSON structure.

Response Format:
{
  "config": {
    "projectName": "string (kebab-case)",
    "frontend": "string or string[] for multiple",
    "backend": "string",
    "database": "string",
    "orm": "string",
    "api": "string",
    "auth": "string",
    "payments": "string",
    "dbSetup": "string",
    "runtime": "string",
    "packageManager": "string",
    "git": true,
    "install": true,
    "webDeploy": "string",
    "serverDeploy": "string",
    "addons": ["array of strings"],
    "examples": ["array of strings"]
  },
  "reasoning": "string explaining your choices"
}

Guidelines:
- Choose technologies that best match the PRD requirements
- Consider scalability, maintainability, and developer experience
- Prefer modern, well-supported technologies
- Only use values from the allowed options listed in the prompt
- If a category is not needed, use "none"
- Be specific about WHY you chose each technology
`;

export const PRD_SUGGEST_STACK_PROMPT = `Analyze the following PRD and suggest the optimal technology stack.

## Available Stack Options

### Frontend (choose one or more)
- Web: \`tanstack-router\`, \`react-router\`, \`tanstack-start\`, \`next\`, \`nuxt\`, \`svelte\`, \`solid\`
- Native: \`native-bare\`, \`native-uniwind\`, \`native-unistyles\`
- Other: \`cli\`, \`medusa\`, \`none\`

### Backend
\`hono\`, \`express\`, \`fastify\`, \`elysia\`, \`convex\`, \`self\`, \`none\`

### Database
\`sqlite\`, \`postgres\`, \`mysql\`, \`mongodb\`, \`none\`

### ORM
\`drizzle\`, \`prisma\`, \`mongoose\`, \`none\`

### API Layer
\`trpc\`, \`orpc\`, \`none\`

### Authentication
\`better-auth\`, \`clerk\`, \`none\`

### Payments
\`polar\`, \`none\`

### Database Setup/Hosting
\`turso\`, \`neon\`, \`prisma-postgres\`, \`planetscale\`, \`mongodb-atlas\`, \`supabase\`, \`d1\`, \`docker\`, \`none\`

### Runtime
\`bun\`, \`node\`, \`workers\`, \`none\`

### Package Manager
\`npm\`, \`pnpm\`, \`bun\`

### Deployment
- Web: \`cloudflare\`, \`alchemy\`, \`none\`
- Server: \`cloudflare\`, \`alchemy\`, \`none\`

### Addons (choose multiple or "none")
\`turborepo\`, \`pwa\`, \`tauri\`, \`biome\`, \`husky\`, \`starlight\`, \`fumadocs\`, \`ultracite\`, \`oxlint\`, \`ruler\`, \`opentui\`, \`wxt\`, \`none\`

### Examples (choose multiple or "none")
\`todo\`, \`ai\`, \`none\`

---

## PRD Content

{PRD_CONTENT}

---

{STACK_INFO}

{PROJECT_NAME}

Based on the PRD above, provide your technology stack recommendation as JSON.
`;
