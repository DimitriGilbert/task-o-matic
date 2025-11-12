# PRD Processing

Parse Product Requirements Documents into actionable tasks and rework PRDs based on feedback.

## Commands Overview

```bash
projpoc prd [options] [command]

Manage PRDs and generate tasks

Options:
  -h, --help  display help for command

Commands:
  parse       Parse a PRD file into structured tasks
  rework      Rework a PRD based on user feedback
```

## Parse PRD

Convert a Product Requirements Document into structured, actionable tasks using AI.

```bash
projpoc prd parse [options]
```

**Required Options:**
- `--file <path>` - Path to PRD file

**Optional Options:**
- `--project-id <id>` - Project ID to assign tasks (uses default if not specified)
- `--stream` - Enable real-time streaming output for AI operations

**Examples:**

```bash
# Parse PRD and assign to default project
projpoc prd parse --file requirements.md

# Parse PRD for specific project
projpoc prd parse --file user-auth-prd.md --project-id jqulb4hnx

# Parse PRD from different directory
projpoc prd parse --file docs/product-requirements.md

# Parse PRD with absolute path
projpoc prd parse --file /home/user/projects/feature-prd.md

# Parse PRD with streaming output
projpoc prd parse --file requirements.md --stream
```

**Example Output:**
```
🤖 Parsing PRD with AI...
✓ Parsed PRD successfully
Summary: User authentication system with social login and profile management
Estimated Duration: 2-3 weeks
Confidence: 85.0%

Creating 6 tasks...
✓ Created 6 tasks from PRD

Created tasks:
1. Design authentication database schema
   Create tables for users, sessions, and OAuth providers
   Effort: medium

2. Implement JWT token service
   Build secure token generation and validation
   Effort: medium

3. Create login and registration API endpoints
   RESTful endpoints for user authentication
   Effort: large

4. Build authentication UI components
   React components for login, register, and profile forms
   Effort: large

5. Implement OAuth integration
   Add Google and GitHub OAuth providers
   Effort: medium

6. Add email verification system
   Send verification emails and handle confirmation
   Effort: small
```

## Rework PRD

Improve an existing PRD based on user feedback using AI.

```bash
projpoc prd rework [options]
```

**Required Options:**
- `--file <path>` - Path to PRD file
- `--feedback <feedback>` - User feedback for improvements

**Optional Options:**
- `--output <path>` - Output file path (default: overwrite original)
- `--stream` - Enable real-time streaming output for AI operations

**Examples:**

```bash
# Rework PRD with feedback
projpoc prd rework \
  --file requirements.md \
  --feedback "Add more technical specifications and API details"

# Rework and save to new file
projpoc prd rework \
  --file requirements.md \
  --feedback "Include security considerations and testing requirements" \
  --output requirements-v2.md

# Rework with comprehensive feedback
projpoc prd rework \
  --file feature-prd.md \
  --feedback "Add performance requirements, scalability considerations, and detailed user stories for each feature"

# Rework with streaming output
projpoc prd rework \
  --file requirements.md \
  --feedback "Include security considerations and testing requirements" \
  --stream
```

**Example Output:**
```
🤖 Reworking PRD with AI...
✓ PRD improved and saved to requirements.md
Feedback applied: Add more technical specifications and API details
```

## PRD Format Guidelines

### Effective PRD Structure

```markdown
# User Authentication System

## Overview
Add user authentication to the web application with support for email/password and social login.

## Features
### User Registration
- Email and password registration
- Email verification
- Profile creation

### User Login
- Email/password login
- Remember me functionality
- Password reset

### Social Login
- Google OAuth integration
- GitHub OAuth integration
- Account linking

### User Profile
- Profile management
- Avatar upload
- Account settings

## Technical Requirements
- Use JWT tokens for authentication
- Implement secure password hashing
- Support session management
- Include rate limiting

## Non-Functional Requirements
- Response time < 200ms for auth operations
- Support 10,000 concurrent users
- 99.9% uptime
- GDPR compliance

## Success Criteria
- Users can register and login successfully
- Social login works seamlessly
- Profile management is intuitive
- Security audit passes
```

### What Makes a Good PRD

1. **Clear Objectives**: Specific, measurable goals
2. **User Stories**: Who, what, and why
3. **Technical Specs**: Implementation requirements
4. **Success Criteria**: How to measure completion
5. **Constraints**: Technical and business limitations
6. **Dependencies**: External systems or requirements

## AI Parsing Capabilities

### Task Extraction
The AI parser identifies:
- **Frontend Tasks**: UI components, user interactions
- **Backend Tasks**: API endpoints, database changes
- **Integration Tasks**: Third-party services, APIs
- **Infrastructure Tasks**: Setup, configuration, deployment
- **Testing Tasks**: Unit tests, integration tests, E2E tests

### Effort Estimation
- **Small**: 2-4 hours (bug fixes, simple features)
- **Medium**: 1-2 days (moderate features, API integration)
- **Large**: 3-5 days (complex features, multiple components)

### Dependency Detection
AI identifies:
- Sequential dependencies (must be done in order)
- Parallel opportunities (can be done simultaneously)
- Blocking dependencies (one task blocks others)
- Technical dependencies (shared components, APIs)

## PRD Processing Workflows

### Workflow 1: New Feature Development

```bash
# 1. Create project for the feature
projpoc project create "User Authentication" \
  --description "Implement complete user authentication system"

# 2. Write comprehensive PRD
cat > auth-prd.md << 'EOF'
# User Authentication System

## Overview
Implement secure user authentication with email/password and social login options.

## Features
### Core Authentication
- User registration with email verification
- Secure login with password reset
- JWT-based session management

### Social Login
- Google OAuth integration
- GitHub OAuth integration
- Account linking functionality

### User Management
- Profile management
- Avatar upload
- Account settings and preferences

## Technical Requirements
- Use bcrypt for password hashing
- JWT tokens with refresh mechanism
- Rate limiting on auth endpoints
- Session management with Redis
- Email service integration

## Security Requirements
- Password strength validation
- CSRF protection
- XSS prevention
- Secure cookie handling
- GDPR compliance

## Success Criteria
- Complete authentication flow works
- Social login functions correctly
- Security audit passes
- Performance meets requirements (<200ms response time)
EOF

# 3. Parse PRD into tasks with streaming
projpoc prd parse --file auth-prd.md --stream

# 4. Review and organize tasks
projpoc tasks list

# 5. Break down complex tasks
projpoc tasks split --task-id <large-task-id>

# 6. Start implementation
projpoc tasks update --task-id <first-task-id> --status in-progress
```

### Workflow 2: Iterative PRD Improvement

```bash
# 1. Initial PRD parsing
projpoc prd parse --file initial-prd.md

# 2. Review generated tasks
projpoc tasks list

# 3. Identify gaps with streaming
projpoc prd rework \
  --file initial-prd.md \
  --feedback "Add detailed API specifications and error handling requirements" \
  --stream

# 4. Parse improved PRD
projpoc prd parse --file initial-prd.md --project-id <project-id>

# 5. Compare task sets
projpoc tasks list --project-id <project-id>
```

### Workflow 3: Multi-Phase Project

```bash
# 1. Phase 1 - Core functionality
cat > phase1-prd.md << 'EOF'
# E-commerce Platform - Phase 1

## Overview
Basic e-commerce functionality with product catalog and checkout.

## Features
- Product browsing and search
- Shopping cart management
- Basic checkout process
- User authentication

## Technical Requirements
- Next.js frontend
- Node.js backend
- PostgreSQL database
- Stripe payment integration
EOF

projpoc project create "E-commerce Phase 1"
projpoc prd parse --file phase1-prd.md

# 2. Phase 2 - Advanced features
cat > phase2-prd.md << 'EOF'
# E-commerce Platform - Phase 2

## Overview
Advanced e-commerce features including reviews, recommendations, and admin panel.

## Features
- Product reviews and ratings
- Product recommendations
- Admin dashboard
- Order management
- Inventory tracking
EOF

projpoc project create "E-commerce Phase 2"
projpoc prd parse --file phase2-prd.md
```

## Advanced PRD Processing

### Custom PRD Templates

Create reusable PRD templates:

```bash
# API Feature Template
cat > api-feature-template.md << 'EOF'
# [Feature Name]

## Overview
[Brief description of the feature]

## API Endpoints
### [Endpoint 1]
- Method: GET/POST/PUT/DELETE
- Path: /api/[path]
- Description: [What it does]
- Request: [Request format]
- Response: [Response format]
- Authentication: [Required/Optional]

### [Endpoint 2]
[Same structure as above]

## Database Changes
- New tables: [List]
- Modified tables: [List]
- Indexes: [List]

## Business Logic
- [Core business rules]
- [Validation requirements]
- [Error handling]

## Integration Points
- [External services]
- [Internal APIs]
- [Third-party dependencies]

## Testing Requirements
- Unit tests: [Coverage requirements]
- Integration tests: [Scenarios]
- Performance tests: [Requirements]

## Success Criteria
- [Measurable outcomes]
- [Performance benchmarks]
- [Quality gates]
EOF

# Use template
cp api-feature-template.md user-management-prd.md
# Edit the file with specific details
projpoc prd parse --file user-management-prd.md
```

### PRD Quality Assessment

```bash
# Parse PRD and check confidence
projpoc prd parse --file prd.md

# Low confidence indicates:
# - Unclear requirements
# - Missing technical details
# - Ambiguous success criteria
# - Incomplete feature descriptions

# Improve with specific feedback
projpoc prd rework \
  --file prd.md \
  --feedback "Add specific API endpoints, database schema, and measurable success criteria"
```

### Batch PRD Processing

```bash
# Process multiple PRDs
for prd in features/*.md; do
  echo "Processing $prd..."
  projpoc prd parse --file "$prd"
done

# Create projects for each PRD
for prd in features/*.md; do
  basename=$(basename "$prd" .md)
  projpoc project create "$basename"
  projpoc prd parse --file "$prd" --project-id "$(projpoc project list --raw | jq -r ".[] | select(.name==\"$basename\") | .id")"
done
```

## Integration with Development Workflow

### Git Workflow Integration

```bash
# 1. Create feature branch
git checkout -b feature/user-authentication

# 2. Process PRD
projpoc prd parse --file user-auth-prd.md

# 3. Create commits for each task
projpoc tasks list --status todo --raw | jq -r '.[].id' | while read task_id; do
  task_title=$(projpoc tasks show --task-id $task_id | grep "Title:" | cut -d' ' -f2-)
  echo "Starting work on: $task_title"
  
  # Create feature branch for task
  git checkout -b "task/$(echo $task_title | tr '[:upper:]' '[:lower:]' | tr ' ' '-')"
  
  # Work on task...
  
  # Commit when done
  git add .
  git commit -m "feat: $task_title"
  projpoc tasks update --task-id $task_id --status completed
  git checkout main
done
```

### Sprint Planning

```bash
# 1. Parse all PRDs for sprint
projpoc prd parse --file sprint1-features.md

# 2. Review effort estimates
projpoc tasks list --raw | jq '.[] | {title: .title, effort: .estimatedEffort}'

# 3. Plan sprint capacity
echo "Sprint capacity: 40 hours"
echo "Current tasks:"
projpoc tasks list --raw | jq '.[] | select(.estimatedEffort=="large") | .title' | wc -l
echo "Large tasks (3-5 days each):"

# 4. Break down large tasks if needed
projpoc tasks list --raw | jq -r '.[] | select(.estimatedEffort=="large") | .id' | while read task_id; do
  projpoc tasks split --task-id $task_id
done
```

## Troubleshooting

### PRD Parsing Issues

```bash
# Check PRD file exists
ls -la requirements.md

# Test with simple PRD
cat > test-prd.md << 'EOF'
# Simple Test Feature

## Overview
Add a simple login page.

## Features
- Email input field
- Password input field
- Submit button

## Requirements
- Validate email format
- Password minimum 8 characters
- Show error messages
EOF

projpoc prd parse --file test-prd.md
```

### AI Configuration Issues

```bash
# Check AI provider setup
projpoc config show-ai

# Test AI with simple task
projpoc tasks create --title "Test AI" --ai-enhance

# Switch providers if needed
projpoc config set-ai-provider anthropic claude-3-5-sonnet
```

### Task Generation Issues

```bash
# Check generated tasks
projpoc tasks list --raw

# Verify task structure
projpoc tasks show --task-id <task-id>

# Check project assignment
projpoc tasks list --project-id <project-id>
```

### File Permission Issues

```bash
# Check file permissions
ls -la requirements.md

# Fix permissions if needed
chmod 644 requirements.md

# Check output directory
ls -la ~/.projpoc/tasks/
```