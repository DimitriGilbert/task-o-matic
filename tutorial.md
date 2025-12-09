# Task-o-Matic: Because Your Todo List Wasn't Pretentious Enough

*Or: How I learned to stop worrying and love the AI-powered task manager*

---

You know what the world needs? Another task management tool. I know, I know—between Notion, Todoist, Asana, Monday.com, and that crumpled sticky note on your monitor, you're spoiled for choice. But hear me out: what if your task manager lived in your terminal, talked to AI, and judged your life choices in TypeScript?

Welcome to **task-o-matic**, the CLI tool that makes you feel productive while simultaneously exposing your complete inability to estimate how long anything takes. *Chef's kiss*.

## Why This Exists (A Philosophical Interlude)

Picture this: You're a developer. You have tasks. Lots of tasks. Some are in JIRA, some in GitHub Issues, some in Slack threads you'll never find again, and one is tattooed on your forearm after a particularly stressful sprint.

What you need isn't another web app with a "freemium" pricing model that costs more than your gym membership (the gym membership you don't use because you're too busy managing tasks). You need something that:

1. Lives where you already live (the terminal)
2. Speaks your language (TypeScript, or JavaScript if you're feeling rebellant)
3. Doesn't judge you for having 47 TODO comments in your codebase
4. Uses AI, because it's 2025 and apparently everything needs AI now

Enter task-o-matic: the tool that's too smart for its own good and knows it.

---

## Part 1: Getting Started (The Easy Bit)

### Installation

```bash
# Clone the repository (obviously)
git clone https://github.com/yourusername/task-o-matic.git
cd task-o-matic

# Install dependencies with bun (because npm is so 2023)
bun install

# Build the thing
bun run build
```

Voilà! You now have a CLI tool that does... well, we'll get to that.

### Your First Task (Baby Steps)

Let's create a task. Nothing fancy—just enough to feel like we're accomplishing something before lunch.

```bash
# Create a task the boring way
task-o-matic create --title "Fix that bug" --content "You know the one"

# Create a task with AI enhancement (fancy!)
task-o-matic create \
  --title "Implement dark mode" \
  --content "Because apparently light mode is violence" \
  --ai-enhance
```

When you add `--ai-enhance`, task-o-matic calls an AI model (OpenAI, Anthropic, or whatever you've configured) to expand your vague task description into something your PM might actually approve.

**What just happened?**

1. Task-o-matic read your half-baked idea
2. Called an AI to make it sound professional
3. Saved it in `.task-o-matic/tasks/` as JSON
4. Made you feel like you've done work today

*Magnifique*.

---

## Part 2: The AI Sorcery (Where It Gets Interesting)

### Understanding AI Enhancement

Here's where task-o-matic differentiates itself from your garden-variety todo app. It doesn't just store your tasks—it *understands* them. Well, as much as an AI can understand anything, which is to say: barely, but impressively.

**Example time:**

```bash
# Your input (lazy)
task-o-matic create --title "Add auth" --ai-enhance

# AI output (try-hard)
Task: Implement User Authentication System

Description:
- Implement JWT-based authentication with secure token storage
- Create login/logout endpoints with rate limiting
- Add middleware for protected routes
- Implement password hashing with bcrypt
- Add refresh token mechanism
- Create user session management
- Add "Remember Me" functionality

Estimated Effort: Large
Dependencies: [database setup, security audit]
```

Notice how it turned your lazy two-word description into a comprehensive implementation plan? That's because the AI has access to your project context:

- Your codebase structure (via filesystem inspection)
- Your existing tasks (to understand dependencies)
- Your tech stack configuration (if you've set it up)
- Your README, if it exists (and isn't just "TODO: Write README")

### Context Building: The Secret Sauce

The real magic happens in `src/lib/context-builder.ts`. This class is basically a nosy neighbor who reads all your files and gossips to the AI about your project.

```typescript
const context = await contextBuilder.buildContextForNewTask(
  "Add auth",
  "You know, authentication stuff"
);

// Context includes:
// - Your project structure
// - Related files and their contents
// - Existing tasks that might be relevant
// - Your tech stack (Next.js? Express? Vue? React? All of the above because you can't make decisions?)
```

The AI then uses this context to generate tasks that actually make sense for *your* project. Not generic boilerplate, but "Oh, I see you're using Prisma and Express, let me suggest an implementation that works with those."

It's like having a tech lead who's actually read your codebase. Rare, I know.

---

## Part 3: The Task Hierarchy (Because Complexity is Inevitable)

### Splitting Tasks Like a Pro

You know that one task that seemed simple when you wrote it? "Implement auth"—how hard could it be? (Narrator: *It was hard.*)

Task-o-matic can split tasks into subtasks automatically:

```bash
# Split a task into manageable chunks
task-o-matic split task-123 --subtask-count 5

# Let AI decide how to split it
task-o-matic split task-123 --ai-split
```

The AI analyzes your task and breaks it down like a French chef breaking down a chicken—surgically precise, slightly unsettling to watch.

**Example breakdown:**

```
Parent: Implement Authentication System (task-123)
├─ Subtask 1: Set up Passport.js configuration (task-123.1)
├─ Subtask 2: Create user model and database schema (task-123.2)
├─ Subtask 3: Implement login endpoint with JWT (task-123.3)
├─ Subtask 4: Add authentication middleware (task-123.4)
└─ Subtask 5: Create protected route examples (task-123.5)
```

Each subtask gets:
- A clear scope (no more "implement everything")
- Proper dependencies (can't do subtask 4 without subtask 2)
- Context from the parent task
- An ID that makes sense (hierarchical like `1.2.3`, not random UUIDs that require a PhD to remember)

### Dependencies: The Web of Lies

Tasks can depend on other tasks. Because in real life, nothing happens in isolation (except your social life during crunch time).

```bash
# Create a task with dependencies
task-o-matic create \
  --title "Write integration tests" \
  --dependencies task-123.3,task-123.4

# Try to mark a task complete before its dependencies
task-o-matic update task-999 --status completed
# Error: Cannot complete task-999 because task-123 is not completed
```

Task-o-matic validates dependencies to prevent you from:
1. Creating circular dependencies (task A depends on task B which depends on task A—*très philosophique*)
2. Marking tasks complete before their dependencies
3. Living in denial about how much work is actually left

It's like having a project manager who actually understands critical paths. Annoying? Yes. Necessary? Also yes.

---

## Part 4: PRD Parsing (Or: Turning Requirements into Reality)

### The Product Requirements Document

Ah, the PRD. That sacred document written by product managers who have *strong opinions* about button colors but couldn't tell you what an API is if their quarterly bonus depended on it.

Task-o-matic can parse PRDs and turn them into actionable tasks. Watch:

```bash
# Parse a PRD into tasks
task-o-matic prd parse requirements.md --output tasks.json

# AI analyzes the PRD and generates tasks
task-o-matic prd parse requirements.md --ai-enhance --create-tasks
```

**What happens behind the scenes:**

1. **PRD Analysis**: The AI reads your PRD (all 47 pages of it, including the section about "brand synergy")
2. **Feature Extraction**: Identifies actual features buried under corporate jargon
3. **Task Generation**: Creates tasks with:
   - Clear acceptance criteria (not "make it pop")
   - Effort estimates (realistic ones, not your PM's fantasy timeline)
   - Dependencies between features
4. **Validation**: Checks if tasks make sense given your tech stack

**Example:**

```markdown
# Input PRD (requirements.md)
## User Authentication
Users should be able to log in securely. We need social login (Google, GitHub) and traditional email/password. Passwords must be secure. Add 2FA because security is important.

## User Profile
Users need profiles with avatar, bio, and preferences. They should be able to edit their information. Make it look nice.
```

```bash
task-o-matic prd parse requirements.md --ai-enhance --create-tasks
```

**Generated tasks:**

```
1. Implement OAuth integration
   ├─ 1.1 Set up Google OAuth
   ├─ 1.2 Set up GitHub OAuth
   └─ 1.3 Create OAuth callback handlers

2. Implement email/password authentication
   ├─ 2.1 Create user registration endpoint
   ├─ 2.2 Implement password hashing (bcrypt)
   ├─ 2.3 Create login endpoint with JWT
   └─ 2.4 Add password reset flow

3. Implement two-factor authentication
   ├─ 3.1 Integrate TOTP library
   ├─ 3.2 Create 2FA setup endpoint
   └─ 3.3 Add 2FA verification to login

4. Create user profile system
   ├─ 4.1 Design profile data model
   ├─ 4.2 Create profile CRUD endpoints
   ├─ 4.3 Implement avatar upload
   └─ 4.4 Build profile edit UI

Dependencies:
- Task 3 depends on Task 2 (can't add 2FA without basic auth)
- Task 4 depends on Task 1 and 2 (need auth before profiles)
```

The AI doesn't just extract text—it *understands* the requirements and creates a coherent implementation plan. It's like having a tech lead who reads PRDs instead of skimming them during standup.

### Reworking PRDs (Because Requirements Change)

Your PM just Slacked you: "Actually, we need to support passwordless login too."

*Sigh.*

```bash
# Update the PRD with new requirements
echo "Add passwordless login (magic links)" >> requirements.md

# Rework the task breakdown
task-o-matic prd rework requirements.md --update-tasks
```

Task-o-matic analyzes the changes, figures out which tasks are affected, and updates your task tree accordingly. It's like git, but for requirements (and actually useful).

---

## Part 5: Documentation Generation (Because Comments are Lies)

### Auto-Documenting Your Tasks

You know what's worse than writing code? Writing documentation about the code. Task-o-matic can generate documentation from your tasks automatically:

```bash
# Generate docs for a specific task
task-o-matic document task-123 --output docs/auth-system.md

# Generate comprehensive project docs
task-o-matic document --all --output-dir docs/
```

**Generated documentation includes:**

- **Implementation overview** (what the task actually does)
- **Technical decisions** (why you chose this approach over 47 alternatives)
- **Code examples** (actual code, not pseudocode written by a PM)
- **Testing strategy** (how to verify it works)
- **Edge cases** (the stuff you'll forget about until prod breaks)

**Example output:**

```markdown
# Authentication System Implementation

## Overview
JWT-based authentication with refresh tokens and 2FA support.

## Architecture Decisions

### Why JWT?
- Stateless authentication (no session storage)
- Easy to scale horizontally
- Works well with microservices
- Industry standard (for better or worse)

### Security Measures
1. **Token Storage**: HttpOnly cookies (not localStorage, because XSS is a thing)
2. **Password Hashing**: bcrypt with cost factor 12
3. **Rate Limiting**: 5 failed attempts = 15-minute lockout
4. **HTTPS Only**: Because this isn't 2010

## Implementation

### Login Endpoint
\`\`\`typescript
router.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  // Rate limiting check
  if (await rateLimiter.isLocked(email)) {
    return res.status(429).json({ error: 'Too many attempts' });
  }

  // Verify credentials
  const user = await User.findByEmail(email);
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    await rateLimiter.recordFailure(email);
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Generate tokens
  const accessToken = jwt.sign({ userId: user.id }, SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ userId: user.id }, REFRESH_SECRET, { expiresIn: '7d' });

  // Set HttpOnly cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
  });

  res.json({ accessToken });
});
\`\`\`

## Testing
\`\`\`bash
npm test -- auth.test.ts
\`\`\`

Test coverage: 94% (the missing 6% is error cases we're pretending don't exist)
```

The AI generates this by:
1. Reading your task description
2. Analyzing related code (if it exists)
3. Understanding your tech stack
4. Consulting its vast knowledge of best practices
5. Making educated guesses about your implementation (usually accurate, occasionally hilarious)

---

## Part 6: The Workflow System (Advanced Sorcery)

### End-to-End Project Initialization

For when you want to go from "idea" to "project structure" without manually creating 47 tasks:

```bash
# Initialize a new project workflow
task-o-matic workflow init \
  --name "E-commerce Platform" \
  --description "Build an online store with payment processing" \
  --stack "next.js,prisma,stripe"

# Workflow stages:
# 1. Analyze requirements
# 2. Generate project structure
# 3. Create comprehensive task breakdown
# 4. Set up dependencies
# 5. Initialize Better-T-Stack (optional)
```

The workflow system orchestrates multiple AI calls to:
- Generate a complete PRD from your description
- Break it into features and tasks
- Set up your project structure
- Configure your tech stack
- Create implementation plans

It's like having a senior engineer spend a weekend planning your project, except it takes 3 minutes and doesn't require coffee.

### Benchmark Mode (For the Perfectionists)

Want to see which AI model is best at generating tasks? (Spoiler: they're all good, just expensive in different ways)

```bash
# Compare AI models for task generation
task-o-matic workflow benchmark \
  --prompt "Create a task for implementing webhooks" \
  --models "gpt-4o,claude-sonnet-4.5,gpt-4o-mini"

# Results:
# GPT-4o: 2.3s, 847 tokens, $0.03, quality: 9/10
# Claude Sonnet 4.5: 1.8s, 923 tokens, $0.04, quality: 9.5/10
# GPT-4o-mini: 0.9s, 756 tokens, $0.005, quality: 7/10
```

The benchmark evaluates:
- **Speed**: Time to first token (because waiting is suffering)
- **Quality**: Task comprehensiveness (subjective, but we try)
- **Cost**: How much your OpenAI bill will hurt
- **Context usage**: Token efficiency (important for large projects)

---

## Part 7: AI Configuration (The Boring But Necessary Bit)

### Setting Up AI Providers

Task-o-matic supports multiple AI providers because vendor lock-in is *so* enterprise:

```bash
# Configure OpenAI
task-o-matic config set-ai --provider openai --api-key sk-your-key-here

# Configure Anthropic (Claude)
task-o-matic config set-ai --provider anthropic --api-key sk-ant-your-key-here

# Configure OpenRouter (for the adventurous)
task-o-matic config set-ai --provider openrouter --api-key sk-or-your-key-here

# Or use environment variables (for the security-conscious)
export OPENAI_API_KEY=sk-your-key-here
export ANTHROPIC_API_KEY=sk-ant-your-key-here
```

**Model Selection:**

```bash
# Use a specific model
task-o-matic create --title "Task" --model gpt-4o

# Use a faster (cheaper) model
task-o-matic create --title "Simple task" --model gpt-4o-mini

# Use Claude for nuanced understanding
task-o-matic create --title "Complex feature" --model claude-sonnet-4.5
```

**Pro tips:**

- Use `gpt-4o-mini` for simple tasks (fast, cheap, good enough)
- Use `claude-sonnet-4.5` for complex planning (thoughtful, thorough, expensive)
- Use `gpt-4o` for balanced quality/cost (the goldilocks option)
- Check your API bill regularly (ignorance is not bliss)

### Configuration Files

All settings live in `.task-o-matic/config.json`:

```json
{
  "aiProvider": "anthropic",
  "model": "claude-sonnet-4.5",
  "temperature": 0.7,
  "maxTokens": 4000,
  "projectName": "My Awesome Project",
  "techStack": ["typescript", "next.js", "prisma", "tailwind"]
}
```

Edit manually or use CLI commands. Task-o-matic doesn't judge (much).

---

## Part 8: Integration & Extensibility (For the Power Users)

### Using as a Library

Task-o-matic isn't just a CLI—it's a library you can integrate into your own tools:

```typescript
import { TaskService, createTaskService } from 'task-o-matic/lib';

// Initialize the service
const taskService = createTaskService();

// Create a task programmatically
const result = await taskService.createTask({
  title: "Implement feature X",
  content: "Build the thing",
  tags: ["backend", "api"],
  aiOptions: {
    enhanceContent: true,
    generateDocs: true,
  },
});

console.log(`Created task: ${result.task.id}`);
console.log(`AI used ${result.metadata.tokenUsage.total} tokens`);
console.log(`Cost: $${estimateCost(result.metadata)}`);
```

**Common Integration Patterns:**

**1. CI/CD Integration**

```typescript
// Generate tasks from GitHub issues
import { Octokit } from '@octokit/rest';
import { TaskService } from 'task-o-matic/lib';

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
const taskService = createTaskService();

async function syncGitHubIssues() {
  const { data: issues } = await octokit.issues.listForRepo({
    owner: 'yourorg',
    repo: 'yourrepo',
    state: 'open',
  });

  for (const issue of issues) {
    await taskService.createTask({
      title: issue.title,
      content: issue.body || '',
      tags: issue.labels.map(l => l.name),
      metadata: {
        githubIssueId: issue.number,
        githubUrl: issue.html_url,
      },
    });
  }
}
```

**2. Webhook Handler**

```typescript
// Auto-create tasks from Slack messages
import express from 'express';
import { TaskService } from 'task-o-matic/lib';

const app = express();
const taskService = createTaskService();

app.post('/slack/events', async (req, res) => {
  const { event } = req.body;

  if (event.type === 'app_mention') {
    const taskContent = event.text.replace(/<@[A-Z0-9]+>/g, '').trim();

    const result = await taskService.createTask({
      title: `Task from Slack: ${event.user}`,
      content: taskContent,
      aiOptions: { enhanceContent: true },
    });

    // Reply in Slack
    await slack.chat.postMessage({
      channel: event.channel,
      text: `Created task: ${result.task.id}\n${result.task.content}`,
    });
  }

  res.json({ ok: true });
});
```

**3. VS Code Extension**

```typescript
// Create tasks from TODO comments
import * as vscode from 'vscode';
import { TaskService } from 'task-o-matic/lib';

async function extractTodosFromWorkspace() {
  const taskService = createTaskService();
  const files = await vscode.workspace.findFiles('**/*.{ts,js,tsx,jsx}');

  for (const file of files) {
    const content = await vscode.workspace.fs.readFile(file);
    const text = content.toString();

    const todoRegex = /\/\/ TODO: (.+)/g;
    let match;

    while ((match = todoRegex.exec(text)) !== null) {
      await taskService.createTask({
        title: match[1],
        content: `Found in ${file.fsPath}`,
        tags: ['todo', 'code-comment'],
      });
    }
  }

  vscode.window.showInformationMessage('Todos extracted!');
}
```

### MCP Server Integration

Task-o-matic includes an MCP (Model Context Protocol) server that exposes task management capabilities to AI models:

```bash
# Start the MCP server
task-o-matic mcp start --port 3000

# Now AI tools (like Claude Desktop) can:
# - Read your tasks
# - Create new tasks
# - Update task status
# - Generate implementation plans
```

**Use case:** Connect Claude Desktop to task-o-matic's MCP server, and Claude can directly manage your tasks during conversations:

```
You: "I need to implement authentication"
Claude: "Let me create a task for that..."
         *[calls MCP tool: create_task]*
         "Created task-456: Implement authentication system
          Would you like me to break this down into subtasks?"
```

It's like having an AI assistant with actual access to your project management system. Powerful, slightly scary, definitely cool.

---

## Part 9: Tips, Tricks, and Gotchas

### The Do's

**DO: Use meaningful task titles**
```bash
# Good
task-o-matic create --title "Implement JWT refresh token rotation"

# Bad
task-o-matic create --title "Fix stuff"
```

**DO: Add context to tasks**
```bash
# The more context, the better AI suggestions
task-o-matic create \
  --title "Optimize database queries" \
  --content "Users are seeing 5s load times on the dashboard.
             Main culprit seems to be the N+1 query on user_posts table.
             Consider eager loading or adding indices."
```

**DO: Tag your tasks**
```bash
# Tags help with organization and filtering
task-o-matic create --title "Fix auth bug" --tags backend,urgent,security
```

**DO: Use dependencies**
```bash
# Express relationships between tasks
task-o-matic create \
  --title "Add integration tests" \
  --dependencies task-123,task-124
```

### The Don'ts

**DON'T: Create circular dependencies**
```bash
# This will fail (as it should)
task-o-matic update task-1 --dependencies task-2
task-o-matic update task-2 --dependencies task-1
# Error: Circular dependency detected
```

**DON'T: Ignore AI suggestions blindly**
```bash
# AI output should be reviewed, not blindly accepted
# Sometimes AI suggests overly complex solutions
# Other times it suggests using deprecated libraries
# Always verify before implementing
```

**DON'T: Store secrets in task content**
```bash
# Bad idea
task-o-matic create --title "Fix prod" --content "DB password: hunter2"

# Task data is stored in plaintext JSON files
# Use environment variables for secrets
```

**DON'T: Forget to commit your tasks**
```bash
# Tasks are stored in .task-o-matic/
# Add to git if you want to share with team

git add .task-o-matic/
git commit -m "Add task breakdown for auth feature"
```

### Common Pitfalls

**1. Token Limits**

AI models have token limits. If your project context is huge, you might hit limits:

```bash
# Reduce context size
task-o-matic create --title "Task" --no-context

# Or use a model with larger context window
task-o-matic create --title "Task" --model claude-sonnet-4.5
```

**2. API Costs**

AI calls cost money. Monitor usage:

```bash
# Check token usage for a task
task-o-matic info task-123 --show-metrics

# Tokens used: 2,847 (prompt: 2,103, completion: 744)
# Estimated cost: $0.04
```

**3. Race Conditions**

Don't run multiple task-o-matic commands simultaneously on the same project:

```bash
# Bad: concurrent operations can corrupt tasks.json
task-o-matic create --title "Task 1" &
task-o-matic create --title "Task 2" &

# Good: run sequentially
task-o-matic create --title "Task 1"
task-o-matic create --title "Task 2"
```

*(Note: This is a known issue. See code_review.md section 2.1 for details)*

---

## Part 10: Real-World Workflow Example

Let's put it all together with a realistic scenario: building a feature from scratch.

### Scenario: Adding Stripe Payment Integration

**Step 1: Create the parent task**

```bash
task-o-matic create \
  --title "Implement Stripe payment integration" \
  --content "Add subscription billing with Stripe. Support monthly/yearly plans." \
  --tags backend,payments,stripe \
  --ai-enhance
```

**AI Output:**
```
Task: Implement Stripe Payment Integration

Description:
Add Stripe subscription billing system with support for monthly and yearly plans.
Include webhook handlers for payment events, subscription management endpoints,
and secure payment processing flow.

Key Requirements:
- Stripe API integration (use latest SDK)
- Subscription plan management (create, update, cancel)
- Webhook endpoint for Stripe events
- Payment method management
- Invoice generation and retrieval
- Error handling and retry logic
- PCI compliance considerations

Estimated Effort: Large
Dependencies: [user authentication, database models]
```

**Step 2: Split into subtasks**

```bash
task-o-matic split task-789 --ai-split
```

**AI generates breakdown:**

```
task-789: Implement Stripe Payment Integration
├─ task-789.1: Set up Stripe SDK and configuration
│  ├─ Install Stripe SDK
│  ├─ Configure API keys (test/prod)
│  └─ Create Stripe client wrapper
│
├─ task-789.2: Create subscription plan models
│  ├─ Define database schema for plans
│  ├─ Create migration files
│  └─ Implement plan CRUD operations
│
├─ task-789.3: Implement checkout flow
│  ├─ Create checkout session endpoint
│  ├─ Handle payment method collection
│  └─ Implement success/cancel redirect handlers
│
├─ task-789.4: Build webhook handler
│  ├─ Set up webhook endpoint
│  ├─ Verify webhook signatures
│  ├─ Handle subscription events (created, updated, deleted)
│  └─ Handle payment events (succeeded, failed)
│
├─ task-789.5: Add subscription management endpoints
│  ├─ Get current subscription
│  ├─ Update subscription plan
│  ├─ Cancel subscription
│  └─ Retrieve invoices
│
└─ task-789.6: Write integration tests
   ├─ Mock Stripe API responses
   ├─ Test checkout flow
   ├─ Test webhook handling
   └─ Test subscription lifecycle

Dependencies:
- task-789.2 must complete before task-789.3
- task-789.1 must complete before task-789.4
- task-789.5 depends on task-789.3 and task-789.4
```

**Step 3: Generate implementation plan**

```bash
task-o-matic plan task-789.1 --output plans/stripe-setup.md
```

**AI generates detailed plan:**

```markdown
# Implementation Plan: Stripe SDK Setup

## Step 1: Install Dependencies

\`\`\`bash
npm install stripe @stripe/stripe-js
npm install -D @types/stripe
\`\`\`

## Step 2: Environment Configuration

Create `.env.local`:

\`\`\`env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
\`\`\`

## Step 3: Create Stripe Client

\`\`\`typescript
// lib/stripe.ts
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is required');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
  typescript: true,
});
\`\`\`

## Step 4: Test Connection

\`\`\`typescript
// Test by fetching account info
const account = await stripe.account.retrieve();
console.log('Stripe account:', account.id);
\`\`\`

## Verification Checklist
- [ ] Dependencies installed
- [ ] Environment variables configured
- [ ] Client initialized successfully
- [ ] Test connection works

Estimated Time: 30 minutes
\`\`\`

**Step 4: Implement first subtask**

```bash
# Start working on it
task-o-matic update task-789.1 --status in-progress

# Follow the plan, write code...
# (the actual work - no AI can save you here, désolé)

# Mark complete when done
task-o-matic update task-789.1 --status completed
```

**Step 5: Generate documentation**

```bash
task-o-matic document task-789 --output docs/stripe-integration.md
```

**AI generates comprehensive docs:**

```markdown
# Stripe Payment Integration Documentation

## Overview
Full Stripe subscription billing system with webhook handling and subscription management.

## Architecture

### Components
1. **Stripe Client** (`lib/stripe.ts`): Singleton Stripe instance
2. **Webhook Handler** (`api/webhooks/stripe.ts`): Processes Stripe events
3. **Subscription Service** (`lib/subscription-service.ts`): Business logic layer
4. **Database Models** (`prisma/schema.prisma`): Data persistence

### Data Flow
\`\`\`
User clicks "Subscribe"
  ↓
Frontend calls /api/checkout
  ↓
Backend creates Stripe checkout session
  ↓
User completes payment on Stripe
  ↓
Stripe sends webhook to /api/webhooks/stripe
  ↓
Webhook handler updates database
  ↓
User subscription activated
\`\`\`

## API Endpoints

### POST /api/checkout
Creates a Stripe checkout session.

**Request:**
\`\`\`json
{
  "priceId": "price_1234567890",
  "userId": "user_123"
}
\`\`\`

**Response:**
\`\`\`json
{
  "sessionId": "cs_test_1234567890",
  "url": "https://checkout.stripe.com/..."
}
\`\`\`

### POST /api/webhooks/stripe
Handles Stripe webhook events.

**Supported Events:**
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

## Security Considerations

1. **Webhook Signature Verification**: Always verify webhook signatures
2. **API Key Storage**: Store keys in environment variables, never commit
3. **HTTPS Only**: Stripe requires HTTPS in production
4. **Idempotency**: Handle duplicate webhook deliveries

## Testing

### Unit Tests
\`\`\`bash
npm test -- stripe.test.ts
\`\`\`

### Integration Tests
Use Stripe test mode and mock webhooks:
\`\`\`bash
stripe trigger customer.subscription.created
\`\`\`

## Troubleshooting

**Issue: Webhook not receiving events**
- Verify webhook endpoint is publicly accessible
- Check webhook secret matches Stripe dashboard
- Inspect Stripe dashboard webhook logs

**Issue: Payment fails silently**
- Check Stripe dashboard for error details
- Verify card is valid test card
- Ensure test mode keys are used

## Cost Estimation
- Stripe fee: 2.9% + $0.30 per transaction
- Average subscription: $10/month
- Cost per transaction: $0.59
- Net revenue: $9.41

---

*Generated by task-o-matic on 2025-12-09*
```

**Step 6: Repeat for remaining subtasks**

Work through each subtask systematically:

```bash
# Check what's left
task-o-matic list --parent task-789 --status todo

# Pick next task
task-o-matic update task-789.2 --status in-progress

# Generate plan if needed
task-o-matic plan task-789.2

# Work on it...

# Mark complete
task-o-matic update task-789.2 --status completed

# Repeat until done
```

**Step 7: Final validation**

```bash
# Ensure all subtasks are complete
task-o-matic list --parent task-789 --status completed

# Run tests
npm test

# Mark parent task complete
task-o-matic update task-789 --status completed

# Generate final documentation
task-o-matic document task-789 --output docs/stripe-final.md
```

**Result:** You've implemented a complex feature with:
- ✅ Clear task breakdown
- ✅ Detailed implementation plans
- ✅ Comprehensive documentation
- ✅ Tracked progress
- ✅ Historical record of decisions

And you didn't have to attend a single standup meeting. *Chef's kiss*.

---

## Conclusion: Why You Should (Maybe) Use This

Look, I'll be honest with you (because I'm French, and we don't do fake enthusiasm). Task-o-matic isn't going to revolutionize your life. You'll still procrastinate, still underestimate tasks, still have that one bug that takes three days to find and one line to fix.

But here's what it *will* do:

1. **Reduce cognitive load**: Offload task planning to AI while you focus on actual work
2. **Maintain context**: Keep track of why you made decisions (useful when you forget three weeks later)
3. **Improve consistency**: Generate tasks and docs that follow patterns and best practices
4. **Speed up onboarding**: New team members can read task history and understand the project
5. **Make you look organized**: Even if you're screaming internally, your task list will be *immaculate*

### When to Use Task-o-Matic

**Good fit:**
- Complex projects with lots of moving parts
- Teams that need clear task breakdown and planning
- Projects where documentation actually matters
- When you want AI assistance without leaving the terminal

**Bad fit:**
- Simple todo lists ("buy milk", "call mom")
- Projects where AI costs outweigh benefits
- Teams that prefer visual tools (sorry, no Kanban board here)
- If you enjoy manually writing task descriptions (weirdo)

### The Bottom Line

Task-o-matic is a tool for developers who:
- Live in the terminal
- Want AI assistance that's actually useful
- Care about documentation (rare breed, I know)
- Understand that planning ≠ procrastination

If that's you, give it a try. If not, there's always that sticky note on your monitor.

---

## Appendix: Cheat Sheet

**Essential Commands:**

```bash
# Task Management
task-o-matic create --title "..." [--ai-enhance]
task-o-matic list [--status todo|in-progress|completed]
task-o-matic update <id> --status <status>
task-o-matic delete <id>
task-o-matic info <id>

# Task Breakdown
task-o-matic split <id> [--ai-split]
task-o-matic plan <id>

# PRD Operations
task-o-matic prd parse <file> [--ai-enhance]
task-o-matic prd generate [--output file]
task-o-matic prd rework <file>

# Documentation
task-o-matic document <id> [--output file]

# Configuration
task-o-matic config set-ai --provider <provider> --api-key <key>
task-o-matic config show

# Workflow
task-o-matic workflow init --name "..." --stack "..."
task-o-matic workflow benchmark --prompt "..."
```

**Useful Flags:**

```bash
--ai-enhance          # Use AI to enhance content
--model <model>       # Specify AI model
--tags <tag1,tag2>    # Add tags
--dependencies <ids>  # Set dependencies
--status <status>     # Set task status
--output <file>       # Output to file
--dry-run            # Preview without executing
```

**Environment Variables:**

```bash
OPENAI_API_KEY        # OpenAI API key
ANTHROPIC_API_KEY     # Anthropic API key
OPENROUTER_API_KEY    # OpenRouter API key
```

---

## Further Reading

- **Code Review**: See `code_review.md` for detailed analysis (spoiler: we have bugs)
- **Architecture**: Check `CLAUDE.md` for project structure
- **API Reference**: Run `task-o-matic --help` for command details
- **Source Code**: Read it, it's TypeScript, you'll figure it out

---

*Written by a human, enhanced by AI, reviewed by caffeine.*

*Last updated: 2025-12-09*

*Questions? Complaints? Existential crises? Open an issue on GitHub.*

**Now go forth and manage those tasks like the organized developer you're pretending to be.** 🎭
