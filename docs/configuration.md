# Configuration

Manage CLI configuration including AI providers and project settings. Configuration is stored locally in each project's `.task-o-matic/` directory.

## Commands Overview

```bash
task-o-matic config [options] [command]

Manage CLI configuration

Options:
  -h, --help                                    display help for command

Commands:
  set-ai-provider [options] <provider> <model>  Set AI provider configuration
  show-ai                                       Show current AI configuration
  show                                          Show current configuration
```

## AI Provider Configuration

### Set AI Provider

Configure the AI provider and model to use for all AI operations.

```bash
task-o-matic config set-ai-provider [options] <provider> <model>
```

**Arguments:**

- `<provider>` - AI provider (`openai`, `anthropic`, `openrouter`, `custom`)
- `<model>` - Model name (e.g., `gpt-4`, `claude-3.5-sonnet`)

**Options:**

- `--api-key <key>` - API key (optional, can use environment variable)
- `--base-url <url>` - Base URL for custom provider
- `--max-tokens <number>` - Maximum tokens (default: 4000)
- `--temperature <number>` - Temperature 0.0-1.0 (default: 0.7)

**Examples:**

```bash
# Configure Anthropic Claude
task-o-matic config set-ai-provider anthropic claude-3.5-sonnet

# Configure OpenAI GPT-4
task-o-matic config set-ai-provider openai gpt-4 --temperature 0.5

# Configure custom provider
task-o-matic config set-ai-provider custom llama-3-70b \
  --base-url https://api.together.xyz/v1 \
  --api-key your-together-key

# Configure OpenRouter for Claude access
task-o-matic config set-ai-provider openrouter anthropic/claude-3.5-sonnet \
  --max-tokens 8000 --temperature 0.3
```

### Show AI Configuration

Display current AI provider settings.

```bash
task-o-matic config show-ai
```

**Example Output:**

```
AI Configuration:
Provider: anthropic
Model: claude-3.5-sonnet
API Key: ***
Base URL: Default
Max Tokens: 4000
Temperature: 0.7
```

### Show Current Configuration

Display all current configuration including project directory.

```bash
task-o-matic config show
```

**Example Output:**

```
Current configuration:
Project Directory: /path/to/your/project/.task-o-matic
AI Provider: anthropic:claude-3.5-sonnet
```

## Environment Variables

You can use environment variables instead of setting configuration:

### AI Provider API Keys

```bash
export OPENAI_API_KEY="your_openai_key"
export ANTHROPIC_API_KEY="your_anthropic_key"
export OPENROUTER_API_KEY="your_openrouter_key"
export CUSTOM_API_KEY="your_custom_key"
export CUSTOM_API_URL="https://api.custom.com/v1"
```

### Default AI Configuration

```bash
export AI_PROVIDER="openrouter"
export AI_MODEL="anthropic/claude-3.5-sonnet"
export AI_MAX_TOKENS="4000"
export AI_TEMPERATURE="0.7"
```

## Configuration File

Configuration is stored in `.task-o-matic/config.json` in your project directory:

```json
{
  "ai": {
    "provider": "anthropic",
    "model": "claude-3.5-sonnet",
    "maxTokens": 4000,
    "temperature": 0.7
  }
}
```

## AI Provider Details

### OpenAI

- **Models**: `gpt-4`, `gpt-4-turbo`, `gpt-3.5-turbo`
- **API Key**: `OPENAI_API_KEY`
- **Best for**: General task enhancement, simple breakdowns

### Anthropic

- **Models**: `claude-3.5-sonnet`, `claude-3-opus`, `claude-3-haiku`
- **API Key**: `ANTHROPIC_API_KEY`
- **Best for**: Complex PRD parsing, detailed task breakdown

### OpenRouter

- **Models**: Access to multiple providers
- **API Key**: `OPENROUTER_API_KEY`
- **Best for**: Cost optimization, model variety

### Custom

- **Models**: Any OpenAI-compatible model
- **API Key**: `CUSTOM_API_KEY`
- **Base URL**: `CUSTOM_API_URL`
- **Best for**: Local models, specialized providers

## Configuration Best Practices

1. **Use Environment Variables** for API keys (more secure)
2. **Choose Appropriate Models**:
   - Use `claude-3-haiku` for simple enhancements
   - Use `claude-3.5-sonnet` for complex PRD parsing
   - Use `gpt-3.5-turbo` for cost-effective operations
3. **Adjust Temperature**:
   - `0.0-0.3` for structured parsing
   - `0.4-0.7` for creative enhancement
   - `0.8-1.0` for brainstorming

## Troubleshooting

### API Key Issues

```bash
# Check if API key is set
task-o-matic config show-ai

# Test with environment variable
export ANTHROPIC_API_KEY="your-key"
task-o-matic tasks create --title "Test" --ai-enhance
```

### Model Not Found

```bash
# Verify model name for provider
task-o-matic config set-ai-provider anthropic claude-3-5-sonnet  # Correct
task-o-matic config set-ai-provider anthropic claude-3.5-sonnet   # Incorrect
```

### Project Not Initialized

```bash
# Initialize task-o-matic in your project
task-o-matic init init

# Then configure AI
task-o-matic config set-ai-provider anthropic claude-3.5-sonnet
```
