# AI Integration

Comprehensive guide to AI providers, prompt engineering, and advanced AI features in task-o-matic (2025 Edition).

## Supported AI Providers

### OpenRouter (🔥 DEFAULT PROVIDER)

- **Models**: `z-ai/glm-4.6`, `qwen/qwen3-max`, `anthropic/claude-sonnet-4.5`, `openai/gpt-5`
- **API Key**: `OPENROUTER_API_KEY`
- **Best For**: **Best value** - Claude 4.5 performance at 1/6th the cost
- **Strengths**: Cost optimization, model variety, competitive pricing
- **Pricing**: GLM-4.6 at $0.60/M input, $2.20/M output (vs Claude 4.5 at $3/M input, $15/M output)
- **Limitations**: Additional latency, dependency on third-party service

### Anthropic

- **Models**: `claude-sonnet-4.5`, `claude-4-opus`, `claude-4-haiku`
- **API Key**: `ANTHROPIC_API_KEY`
- **Best For**: Complex PRD parsing, detailed task breakdown, nuanced requirements
- **Strengths**: Superior reasoning, detailed analysis, better for complex tasks
- **Pricing**: Claude Sonnet 4.5 at $3/M input, $15/M output
- **Limitations**: Higher cost, slower response times

### OpenAI

- **Models**: `gpt-5`, `gpt-4-turbo`, `gpt-4o`
- **API Key**: `OPENAI_API_KEY`
- **Best For**: General task enhancement, simple breakdowns
- **Strengths**: Fast response times, good for structured tasks
- **Pricing**: GPT-5 at $15/M input, $120/M output
- **Limitations**: Expensive, less detailed reasoning compared to Claude

### Custom

- **Models**: Any OpenAI-compatible API endpoint (local models, etc.)
- **API Key**: `CUSTOM_API_KEY`
- **Base URL**: `CUSTOM_API_URL`
- **Best For**: Local models, specialized providers, self-hosted solutions
- **Strengths**: Full control, privacy, potential cost savings
- **Limitations**: Requires setup and maintenance

## Configuration

### Environment Variables (🔥 RECOMMENDED FOR 2025)

```bash
# Set provider and model via environment variables
export AI_PROVIDER=openrouter
export AI_MODEL=z-ai/glm-4.6
export AI_MAX_TOKENS=32768
export AI_TEMPERATURE=0.5

# API keys
export OPENROUTER_API_KEY=your-openrouter-key
export ANTHROPIC_API_KEY=your-anthropic-key
export OPENAI_API_KEY=your-openai-key

# Custom provider
export CUSTOM_API_KEY=your-custom-key
export CUSTOM_API_URL=https://api.together.xyz/v1
```

### Basic Setup

```bash
# Configure OpenRouter (DEFAULT - best value)
projpoc config set-ai-provider openrouter z-ai/glm-4.6

# Configure Anthropic (premium quality)
projpoc config set-ai-provider anthropic claude-sonnet-4.5

# Configure OpenAI (latest 2025 model)
projpoc config set-ai-provider openai gpt-5

# Configure custom provider
projpoc config set-ai-provider custom llama-3.3-70b \
  --base-url https://api.together.xyz/v1 \
  --api-key your-together-key
```

### Advanced Configuration

```bash
# Fine-tune parameters (32K minimum for 2025)
projpoc config set-ai-provider openrouter z-ai/glm-4.6 \
  --max-tokens 32768 \
  --temperature 0.3

# High creativity for brainstorming
projpoc config set-ai-provider anthropic claude-sonnet-4.5 \
  --temperature 0.8 \
  --max-tokens 32768

# Fast responses for simple tasks
projpoc config set-ai-provider openrouter qwen/qwen3-max \
  --temperature 0.2 \
  --max-tokens 32768
```

## Model Recommendations by Use Case (2025 Edition)

### PRD Parsing

- **Best Value**: `z-ai/glm-4.6` - Claude 4.5 performance at 1/6th the cost
- **Premium**: `claude-sonnet-4.5` - Superior understanding of complex requirements
- **Latest**: `gpt-5` - Good balance of speed and quality
- **Budget**: `qwen/qwen3-max` - Faster, cheaper for simple PRDs

```bash
# Best value (recommended)
export AI_PROVIDER=openrouter
export AI_MODEL=z-ai/glm-4.6
export AI_MAX_TOKENS=32768
export AI_TEMPERATURE=0.3

# Premium quality
projpoc config set-ai-provider anthropic claude-sonnet-4.5 \
  --temperature 0.3 \
  --max-tokens 32768
```

### Task Enhancement

- **Best Value**: `z-ai/glm-4.6` - Detailed, actionable enhancements
- **Fast**: `qwen/qwen3-max` - Quick improvements for simple tasks
- **Premium**: `claude-sonnet-4.5` - Best quality enhancements
- **Latest**: `gpt-5` - Good speed with decent quality

```bash
# Best value (recommended)
projpoc config set-ai-provider openrouter z-ai/glm-4.6 \
  --temperature 0.5 \
  --max-tokens 32768
```

### Task Breakdown

- **Best Value**: `z-ai/glm-4.6` - Excellent at logical decomposition
- **Premium**: `claude-sonnet-4.5` - Best for complex technical tasks
- **Alternative**: `gpt-5` - Good for technical tasks
- **Simple**: `qwen/qwen3-max` - For straightforward breakdowns

```bash
projpoc config set-ai-provider openrouter z-ai/glm-4.6 \
  --temperature 0.3 \
  --max-tokens 32768
```

### PRD Rework

- **Best Value**: `z-ai/glm-4.6` - Nuanced understanding of feedback
- **Premium**: `claude-sonnet-4.5` - Best for complex rework requirements
- **Latest**: `gpt-5` - Fast improvements
- **Creative**: `qwen/qwen3-max` - Good for creative rework

```bash
projpoc config set-ai-provider openrouter z-ai/glm-4.6 \
  --temperature 0.4 \
  --max-tokens 32768
```

## Temperature Settings

### Temperature Guidelines

- **0.0-0.3**: Structured parsing, predictable output, technical tasks
- **0.4-0.6**: Creative enhancement, balanced output
- **0.7-1.0**: Brainstorming, creative tasks, exploration

### Use Case Examples

```bash
# Structured PRD parsing (low temperature)
projpoc config set-ai-provider anthropic claude-3.5-sonnet --temperature 0.2

# Task enhancement (medium temperature)
projpoc config set-ai-provider anthropic claude-3.5-sonnet --temperature 0.5

# Creative brainstorming (high temperature)
projpoc config set-ai-provider anthropic claude-3-opus --temperature 0.8
```

## Prompt Engineering

### Built-in Prompt Templates

The CLI uses structured prompt templates for consistent results:

#### PRD Parsing Template

```text
You are a project manager assistant. Parse the following PRD and extract actionable tasks.

For each task, provide:
- Title (clear and actionable)
- Description (what needs to be done)
- Estimated effort (small/medium/large)
- Dependencies (if any)

Format your response as JSON:
{
  "tasks": [...],
  "summary": "Brief summary of the project",
  "estimatedDuration": "Estimated project duration",
  "confidence": 0.8
}

PRD to parse:
{PRD_CONTENT}
```

#### Task Breakdown Template

```text
You are a project management expert. Break down the following task into smaller, actionable subtasks.

Each subtask should:
- Be specific and measurable
- Take no more than 1-2 days to complete
- Have clear acceptance criteria

Format your response as JSON:
{
  "subtasks": [...]
}

Task to break down:
{TASK_TITLE}
{TASK_DESCRIPTION}
```

#### Task Enhancement Template

```text
Enhance this task for better clarity and actionability:

Title: {TASK_TITLE}
Description: {TASK_DESCRIPTION}

Provide an improved description that:
- Clearly states what needs to be done
- Includes specific acceptance criteria
- Is detailed enough for a developer to start work
- Identifies potential edge cases or considerations
- Suggests implementation approach if helpful
- Defines what "done" looks like
```

### Custom Prompt Engineering

While the CLI uses built-in templates, you can influence AI output through:

#### 1. Task Title Quality

```bash
# Good titles for better AI enhancement
projpoc tasks create --title "Implement OAuth authentication with Google and GitHub" --ai-enhance
projpoc tasks create --title "Design responsive navigation component with mobile menu" --ai-enhance

# Poor titles (less effective enhancement)
projpoc tasks create --title "Auth stuff" --ai-enhance
projpoc tasks create --title "Fix nav" --ai-enhance
```

#### 2. Initial Description Quality

```bash
# Provide context for better enhancement
projpoc tasks create \
  --title "Payment system" \
  --description "Need to add payments to our e-commerce site" \
  --ai-enhance

# Results in detailed enhancement with:
# - Payment gateway options
# - Security considerations
# - Error handling
# - Testing requirements
```

#### 3. PRD Quality

```markdown
# High-quality PRD for better parsing

# User Authentication System

## Overview

Implement secure user authentication with email/password and social login.

## Features

### Core Authentication

- User registration with email verification
- Secure login with password reset
- JWT-based session management

### Social Login

- Google OAuth integration
- GitHub OAuth integration
- Account linking functionality

## Technical Requirements

- Use bcrypt for password hashing
- JWT tokens with refresh mechanism
- Rate limiting on auth endpoints
- Session management with Redis

## Security Requirements

- Password strength validation
- CSRF protection
- XSS prevention
- GDPR compliance

## Success Criteria

- Complete authentication flow works
- Social login functions correctly
- Security audit passes
- Performance <200ms response time
```

## Streaming AI Responses

### Real-time Output

All AI-powered commands support streaming output for immediate feedback:

```bash
# Task creation with streaming
projpoc tasks create --title "Implement user auth" --ai-enhance --stream

# PRD parsing with streaming
projpoc prd parse --file requirements.md --stream

# Task enhancement with streaming
projpoc tasks enhance --task-id abc123 --stream

# Documentation analysis with streaming
projpoc tasks document --task-id abc123 --stream
```

### Streaming Benefits

- **Immediate Feedback**: See AI responses as they generate
- **Early Termination**: Stop operations if they're going wrong
- **Better Debugging**: Watch AI reasoning process unfold
- **Interactive Experience**: More engaging than waiting for complete responses

### Streaming vs Non-Streaming

```bash
# Traditional - waits for complete response
projpoc tasks create --title "Add auth" --ai-enhance
# Output: ✓ Task enhanced with AI (after waiting)

# Streaming - shows real-time generation
projpoc tasks create --title "Add auth" --ai-enhance --stream
# Output: 🤖 AI Enhancement in progress...
#         Analyzing requirements and breaking down task...
#         1. Database schema design...
#         2. Authentication service...
#         ✓ Enhancement complete
```

### Performance Considerations

- **Network**: Streaming uses slightly more bandwidth due to chunked responses
- **Memory**: Lower memory usage as responses are processed incrementally
- **User Experience**: Better for long-running AI operations
- **Automation**: Skip streaming for scripts where human monitoring isn't needed

## Advanced AI Features

### Multi-Provider Strategy

Use different providers for different tasks:

```bash
# Use Claude for complex PRD parsing
projpoc config set-ai-provider anthropic claude-3.5-sonnet
projpoc prd parse --file complex-requirements.md

# Switch to GPT-4 for faster task enhancement
projpoc config set-ai-provider openai gpt-4
projpoc tasks create --title "Simple bug fix" --ai-enhance

# Use Haiku for quick task breakdowns
projpoc config set-ai-provider anthropic claude-3-haiku
projpoc tasks split --task-id <simple-task-id>
```

### Cost Optimization

```bash
# Budget-friendly configuration
projpoc config set-ai-provider openrouter anthropic/claude-3.5-sonnet

# Use cheaper models for simple tasks
projpoc config set-ai-provider anthropic claude-3-haiku \
  --temperature 0.2 \
  --max-tokens 2000

# Reserve expensive models for complex tasks
projpoc config set-ai-provider anthropic claude-3.5-sonnet \
  --temperature 0.3 \
  --max-tokens 8000
```

### Performance Tuning

```bash
# Fast responses for simple operations
projpoc config set-ai-provider anthropic claude-3-haiku \
  --max-tokens 1000 \
  --temperature 0.1

# Balanced for general use
projpoc config set-ai-provider anthropic claude-3.5-sonnet \
  --max-tokens 4000 \
  --temperature 0.3

# High quality for complex tasks
projpoc config set-ai-provider anthropic claude-3-opus \
  --max-tokens 8000 \
  --temperature 0.4
```

## Environment Setup

### Development Environment

```bash
# Set up environment variables (2025 standards)
export AI_PROVIDER="openrouter"
export AI_MODEL="z-ai/glm-4.6"
export AI_MAX_TOKENS="32768"
export AI_TEMPERATURE="0.5"

# API keys
export OPENROUTER_API_KEY="your_openrouter_key"
export ANTHROPIC_API_KEY="your_anthropic_key"
export OPENAI_API_KEY="your_openai_key"
```

### Production Environment

```bash
# Use environment variables for security
# Never commit API keys to version control

# .env file (2025 standards)
AI_PROVIDER=openrouter
AI_MODEL=z-ai/glm-4.6
AI_MAX_TOKENS=32768
AI_TEMPERATURE=0.5
OPENROUTER_API_KEY=sk-or-v1-...
ANTHROPIC_API_KEY=sk-ant-api03-...
OPENAI_API_KEY=sk-...

# Load environment variables
source .env

# CLI will automatically use environment variables
projpoc config show-ai  # Verify configuration
```

### CI/CD Integration

```bash
# GitHub Actions example
- name: Configure AI Provider
  run: |
    projpoc config set-ai-provider anthropic claude-3.5-sonnet
    projpoc prd parse --file requirements.md

# Docker example
ENV ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
ENV AI_PROVIDER=anthropic
ENV AI_MODEL=claude-3.5-sonnet
RUN projpoc config set-ai-provider $AI_PROVIDER $AI_MODEL
```

## Troubleshooting

### Common Issues

#### API Key Problems

```bash
# Check if API key is set
projpoc config show-ai

# Test with environment variable
export ANTHROPIC_API_KEY="your-key"
projpoc tasks create --title "Test" --ai-enhance

# Verify key format
echo $ANTHROPIC_API_KEY | head -c 20
```

#### Model Not Found

```bash
# Verify model name
projpoc config set-ai-provider anthropic claude-3-5-sonnet  # Correct
projpoc config set-ai-provider anthropic claude-3.5-sonnet   # Incorrect

# Check available models for provider
# Anthropic: claude-3-5-sonnet, claude-3-opus, claude-3-haiku
# OpenAI: gpt-4, gpt-4-turbo, gpt-3.5-turbo
```

#### Rate Limiting

```bash
# Switch to faster provider
projpoc config set-ai-provider anthropic claude-3-haiku

# Reduce token usage
projpoc config set-ai-provider anthropic claude-3.5-sonnet \
  --max-tokens 2000

# Use OpenRouter for better rate limits
projpoc config set-ai-provider openrouter anthropic/claude-3.5-sonnet
```

#### Poor AI Output

```bash
# Lower temperature for more structured output
projpoc config set-ai-provider anthropic claude-3.5-sonnet \
  --temperature 0.2

# Increase max tokens for complex tasks
projpoc config set-ai-provider anthropic claude-3.5-sonnet \
  --max-tokens 8000

# Switch to higher-quality model
projpoc config set-ai-provider anthropic claude-3-opus
```

### Debugging AI Responses

```bash
# Test with simple task
projpoc tasks create --title "Simple test task" --ai-enhance

# Check AI configuration
projpoc config show-ai

# Test different providers
projpoc config set-ai-provider openai gpt-4
projpoc tasks create --title "Test with OpenAI" --ai-enhance

# Verify environment variables
echo "ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY:0:10}..."
echo "OPENAI_API_KEY: ${OPENAI_API_KEY:0:10}..."
```

### Performance Optimization

```bash
# Use faster model for simple tasks
projpoc config set-ai-provider anthropic claude-3-haiku

# Reduce max tokens
projpoc config set-ai-provider anthropic claude-3.5-sonnet \
  --max-tokens 2000

# Batch operations to reduce API calls
projpoc prd parse --file large-prd.md  # One call vs many task creations
```

## Best Practices

### 1. Choose the Right Model (2025 Standards)

- **GLM-4.6 (OpenRouter)**: Best value - Claude 4.5 performance at 1/6th the cost
- **Claude Sonnet 4.5**: Premium quality for complex tasks
- **Qwen3 Max**: Fast and cost-effective for simple tasks  
- **GPT-5**: Latest 2025 model with good balance of speed and quality

### 2. Optimize Parameters

- **Temperature 0.2-0.3**: Structured tasks, parsing
- **Temperature 0.4-0.6**: Creative enhancement  
- **Temperature 0.7-0.8**: Brainstorming, exploration
- **Token Limits**: 32K minimum for 2025 standards

### 3. Manage Costs (2025 Optimization)

- **GLM-4.6**: Best value at $0.60/M input vs Claude 4.5 at $3/M input
- **Qwen3 Max**: Good performance at $1.60/M input
- **Batch operations** when possible
- **Monitor token usage** with 32K context windows
- **Use OpenRouter** for cost optimization and model variety

### 4. Ensure Quality

- Provide high-quality input (good PRDs, task titles)
- Review AI-generated content
- Use appropriate temperature settings
- Choose models based on task complexity

### 5. Security

- Use environment variables for API keys
- Never commit keys to version control
- Rotate keys regularly
- Monitor usage for anomalies

## Future AI Features

### Planned Enhancements

- Custom prompt templates
- Multi-model comparison
- AI provider failover
- Cost tracking and budgeting
- Response quality scoring
- Custom fine-tuning support

### Experimental Features

- Local model integration
- Vision capabilities for diagram parsing
- Code generation for tasks
- Automated testing suggestions
- Performance optimization recommendations
