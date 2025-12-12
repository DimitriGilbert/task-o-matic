# VAULT-TEC CONFIGURATION MANAGEMENT SYSTEM
## LUCK ATTRIBUTE - OPTIMAL SYSTEM FORTUNE

> *"The luck of the vault dweller is not chance, but preparation. With proper configuration, fortune favors the prepared."* - Vault-Tec Operations Manual

---

## 🎲 UNDERSTANDING LUCK IN THE WASTELAND

In the S.P.E.C.I.A.L. system, **Luck** represents the fortunate setup that makes everything work optimally. The Configuration Management system is your vault's luck modifier - ensuring your AI companions, task systems, and project infrastructure operate with maximum efficiency and minimal radiation exposure.

### The Fortune of Proper Configuration

A well-configured system provides:
- **+5 to AI Response Quality** - Optimal model selection and parameters
- **+3 to System Stability** - Validated configuration prevents crashes  
- **+2 to Developer Happiness** - Sensible defaults reduce manual tweaking
- **+1 to Project Success** - Proper setup from the start

---

## ⚙️ VAULT-TEC CONFIGMANAGER CLASS

The `ConfigManager` is your personal vault technician, managing all system configuration with atomic precision and radiation-hardened reliability.

### Constructor: Initializing Your Vault

```typescript
import { ConfigManager, createDefaultConfigCallbacks } from 'task-o-matic/config';

// Standard vault setup - uses default file system
const configManager = new ConfigManager();

// Custom vault location - for multiple vault management
const customManager = new ConfigManager(
  undefined, // Use default callbacks
  '/path/to/my/vault' // Custom working directory
);

// Advanced vault - custom storage callbacks (for cloud vaults)
const cloudManager = new ConfigManager({
  read: async (key) => await cloudStorage.get(key),
  write: async (key, value) => await cloudStorage.set(key, value),
  getEnv: (key) => process.env[key]
});
```

**VAULT-TEC SAFETY WARNING**: Always ensure your vault is properly initialized before accessing configuration. Failure to do so may result in radiation exposure (runtime errors).

### Core Methods: Vault Operations

#### `load(): Promise<Config>`
Loads configuration from your vault's storage system, merging defaults, environment variables, and vault-specific settings.

```typescript
// Load your vault configuration
const config = await configManager.load();

console.log('Vault AI Provider:', config.ai.provider);
console.log('Vault Model:', config.ai.model);
console.log('Vault Directory:', configManager.getWorkingDirectory());
```

**Configuration Loading Priority** (Fortune favors the prepared):
1. **Vault Defaults** - Base radiation-hardened settings
2. **Environment Variables** - External atmospheric conditions  
3. **Vault Config File** - Local vault customization
4. **Validation** - Radiation screening for safety

#### `getConfig(): Config`
Retrieves the current configuration. **MUST** call `load()` first, or face the wrath of the overseer!

```typescript
// ❌ WRONG - This will cause a vault breach!
const config = configManager.getConfig(); // Throws error!

// ✅ CORRECT - Proper vault protocol
await configManager.load();
const config = configManager.getConfig(); // Safe and sound
```

#### `save(): Promise<void>`
Persists your vault configuration to storage for future generations.

```typescript
// Modify your vault settings
await configManager.setAIConfig({
  temperature: 0.8,
  maxTokens: 65536
});

// Save to vault archives
await configManager.save();
```

#### `setAIConfig(partial: Partial<AIConfig>): Promise<void>`
Updates AI configuration with radiation-hardened validation.

```typescript
// Upgrade your AI companion
await configManager.setAIConfig({
  provider: 'anthropic',
  model: 'claude-sonnet-4.5',
  temperature: 0.7,
  maxTokens: 32768
});
```

#### `setWorkingDirectory(dir: string): void`
Relocates your vault to a new location.

```typescript
// Move to a new vault location
configManager.setWorkingDirectory('/new/vault/location');
// Note: This invalidates current config - call load() again
```

---

## 🛡️ RADIATION VALIDATION SYSTEM

All configuration passes through Vault-Tec's patented radiation screening process using Zod schemas. No contaminated config enters the vault!

### AI Configuration Schema

```typescript
interface AIConfig {
  provider: "openai" | "anthropic" | "openrouter" | "custom";
  model: string;                    // Must not be empty
  apiKey?: string;                  // Optional API key
  baseURL?: string;                 // Custom endpoint URL
  maxTokens?: number;               // 1 - 1,000,000 tokens
  temperature?: number;             // 0.0 - 2.0 (creativity dial)
  context7Enabled?: boolean;        // Documentation retrieval
  reasoning?: {                     // Advanced reasoning settings
    maxTokens?: number;             // 1 - 100,000 reasoning tokens
  };
}
```

### Full Configuration Schema

```typescript
interface Config {
  ai: AIConfig;                     // AI companion settings
  workingDirectory?: string;        // Vault location override
}
```

### Validation Functions

#### `validateConfig(config: unknown): Config`
**Full radiation screening** - validates complete configuration object.

```typescript
import { validateConfig } from 'task-o-matic/config-validation';

const userInput = JSON.parse(userConfigString);
try {
  const validConfig = validateConfig(userInput);
  console.log('✅ Configuration passed radiation screening');
} catch (error) {
  console.log('☢️ Configuration contaminated:', error.message);
}
```

#### `validateAIConfig(config: unknown): AIConfig`
**AI-specific screening** - validates only AI configuration.

```typescript
import { validateAIConfig } from 'task-o-matic/config-validation';

const aiSettings = {
  provider: 'anthropic',
  model: 'claude-sonnet-4.5',
  temperature: 0.7
};

const validAI = validateAIConfig(aiSettings);
```

#### `validatePartialAIConfig(config: unknown): Partial<AIConfig>`
**Partial screening** - for updates and modifications.

```typescript
// Only validate what we're changing
const updates = { temperature: 0.9 };
const validUpdates = validatePartialAIConfig(updates);
```

#### Safe Validation (No Throwing)

```typescript
import { safeValidateConfig } from 'task-o-matic/config-validation';

const result = safeValidateConfig(userInput);
if (result.success) {
  console.log('Valid config:', result.data);
} else {
  console.log('Radiation detected:', result.errors);
  // result.errors = [{ path: 'ai.temperature', message: 'Must be between 0 and 2' }]
}
```

---

## 🎰 PROVIDER DEFAULTS - FORTUNE COOKIE SETTINGS

Vault-Tec provides pre-calibrated optimal settings for each AI provider. These represent the perfect balance of performance and radiation safety.

### OpenRouter (Default Provider)
```typescript
{
  provider: "openrouter",
  model: "z-ai/glm-4.6",
  maxTokens: 32768,
  temperature: 0.5
}
```

### Anthropic Claude
```typescript
{
  provider: "anthropic", 
  model: "claude-sonnet-4.5",
  maxTokens: 32768,
  temperature: 0.5
}
```

### OpenAI GPT
```typescript
{
  provider: "openai",
  model: "gpt-5", 
  maxTokens: 32768,
  temperature: 0.5
}
```

### Custom Provider
```typescript
{
  provider: "custom",
  model: "llama-3.3-70b",
  maxTokens: 32768, 
  temperature: 0.5
}
```

---

## 🌍 ENVIRONMENT VARIABLES - ATMOSPHERIC CONDITIONS

Configure your vault using atmospheric conditions (environment variables). These override defaults but are overridden by vault config files.

### AI Provider Settings
```bash
# Primary atmospheric conditions
export AI_PROVIDER=openrouter
export AI_MODEL=z-ai/glm-4.6
export AI_MAX_TOKENS=32768
export AI_TEMPERATURE=0.5

# API Keys - security clearance levels
export OPENROUTER_API_KEY=your-key-here
export ANTHROPIC_API_KEY=your-key-here
export OPENAI_API_KEY=your-key-here
export CUSTOM_API_KEY=your-key-here

# Custom provider atmosphere
export CUSTOM_API_URL=https://your-custom-endpoint.com
```

### Vault-Tec Pro Tip: Environment Priority

Environment variables are perfect for:
- **CI/CD pipelines** - Automated vault operations
- **Docker containers** - Portable vault environments  
- **Development overrides** - Temporary atmospheric changes
- **Security** - Keep API keys out of vault files

---

## 📁 VAULT STORAGE SYSTEM

Configuration is stored in the `.task-o-matic/` directory within your vault (working directory).

### Directory Structure
```
your-vault/
├── .task-o-matic/
│   ├── config.json          # Main vault configuration
│   ├── tasks/              # Task storage
│   ├── prd/                # PRD documents
│   ├── plans/              # Implementation plans
│   ├── docs/               # Cached documentation
│   └── logs/               # Vault operation logs
```

### Example Vault Configuration
```json
{
  "ai": {
    "provider": "anthropic",
    "model": "claude-sonnet-4.5", 
    "maxTokens": 32768,
    "temperature": 0.7,
    "context7Enabled": true,
    "reasoning": {
      "maxTokens": 50000
    }
  },
  "workingDirectory": "/path/to/my/vault"
}
```

---

## 🔧 PRACTICAL VAULT EXAMPLES

### Example 1: Basic Vault Setup
```typescript
import { ConfigManager } from 'task-o-matic/config';

// Initialize your vault
const configManager = new ConfigManager();

// Load radiation-screened configuration
await configManager.load();

// Access your AI companion settings
const aiConfig = configManager.getAIConfig();
console.log(`AI Provider: ${aiConfig.provider}`);
console.log(`Model: ${aiConfig.model}`);
console.log(`Temperature: ${aiConfig.temperature}`);
```

### Example 2: Multi-Vault Management
```typescript
import { ConfigManager, setupWorkingDirectory } from 'task-o-matic/config';

// Manage multiple vaults
const vault1 = new ConfigManager();
const vault2 = new ConfigManager();

// Setup vault locations
await setupWorkingDirectory('/projects/vault-alpha', vault1);
await setupWorkingDirectory('/projects/vault-beta', vault2);

// Each vault has independent configuration
console.log('Vault Alpha:', vault1.getConfig());
console.log('Vault Beta:', vault2.getConfig());
```

### Example 3: Dynamic AI Provider Switching
```typescript
// Switch AI providers based on task requirements
async function switchForTaskType(taskType: string) {
  const configManager = new ConfigManager();
  await configManager.load();

  switch (taskType) {
    case 'creative':
      await configManager.setAIConfig({
        provider: 'anthropic',
        temperature: 0.9,
        maxTokens: 65536
      });
      break;
    case 'technical':
      await configManager.setAIConfig({
        provider: 'openrouter',
        temperature: 0.2,
        maxTokens: 32768
      });
      break;
    case 'analysis':
      await configManager.setAIConfig({
        provider: 'openai',
        temperature: 0.1,
        reasoning: { maxTokens: 75000 }
      });
      break;
  }

  await configManager.save();
  console.log(`Switched to ${configManager.getAIConfig().provider} for ${taskType} tasks`);
}
```

### Example 4: Custom Storage Backend
```typescript
// Cloud-based vault storage
import { ConfigManager } from 'task-o-matic/config';

const cloudVault = new ConfigManager({
  read: async (key) => {
    const result = await s3Client.getObject({
      Bucket: 'my-vault-configs',
      Key: `config/${key}`
    });
    return result.Body.toString();
  },
  write: async (key, value) => {
    await s3Client.putObject({
      Bucket: 'my-vault-configs', 
      Key: `config/${key}`,
      Body: value
    });
  },
  getEnv: (key) => process.env[key]
});

await cloudVault.load();
```

---

## ⚠️ VAULT-TEC SAFETY WARNINGS

### Common Radiation Leaks (Errors)

#### 1. **Configuration Not Loaded Error**
```
Config not loaded. Call await configManager.load() first.
```
**Cause**: Accessing configuration before loading
**Treatment**: Always call `await configManager.load()` before `getConfig()`

#### 2. **Invalid Provider Error**
```
Provider must be one of: openai, anthropic, openrouter, custom
```
**Cause**: Using unsupported AI provider
**Treatment**: Use only supported providers

#### 3. **Temperature Range Error**
```
Temperature must be between 0 and 2
```
**Cause**: Setting temperature outside valid range
**Treatment**: Keep temperature between 0.0 (deterministic) and 2.0 (creative)

#### 4. **Token Limit Error**
```
Max tokens cannot exceed 1,000,000
```
**Cause**: Setting token limit too high
**Treatment**: Use reasonable token limits (typically 1K-64K)

### Vault Maintenance Tips

#### ✅ DO - Radiation-Safe Practices
- Always await `load()` before accessing config
- Validate user input with validation functions
- Use environment variables for API keys
- Set reasonable token limits
- Test configuration changes in development vaults first

#### ❌ DON'T - Radiation Hazards  
- Access `getConfig()` without loading first
- Hardcode API keys in configuration files
- Set temperature to extreme values (>1.5)
- Ignore validation errors
- Use infinite token limits

---

## 🔍 TROUBLESHOOTING GUIDE

### Problem: Configuration Not Persisting
**Symptoms**: Changes disappear after restart
**Diagnosis**: 
```typescript
// Check if save() was called
await configManager.setAIConfig({ temperature: 0.8 });
await configManager.save(); // This line is crucial!
```

### Problem: Environment Variables Not Working
**Symptoms**: API keys from env vars not being used
**Diagnosis**:
```bash
# Check environment variables are set
echo $OPENROUTER_API_KEY
echo $AI_PROVIDER

# Verify .env file location (should be in working directory)
ls -la .env
```

### Problem: Validation Errors on Load
**Symptoms**: Config file fails validation
**Diagnosis**:
```typescript
import { safeValidateConfig } from 'task-o-matic/config-validation';

// Check what's wrong with your config
const result = safeValidateConfig(yourConfig);
if (!result.success) {
  console.log('Radiation detected:', result.errors);
}
```

### Problem: Multiple Vault Confusion
**Symptoms**: Wrong configuration being used
**Diagnosis**:
```typescript
// Check which vault you're in
console.log('Current vault:', configManager.getWorkingDirectory());
console.log('Config file:', configManager.getConfigFilePath());
```

---

## 🎯 OPTIMIZATION TIPS - MAXIMIZING LUCK

### Performance Optimization
```typescript
// Cache configuration for frequent access
let cachedConfig: Config | null = null;

async function getOptimizedConfig() {
  if (!cachedConfig) {
    cachedConfig = await configManager.load();
  }
  return cachedConfig;
}
```

### Memory Optimization
```typescript
// Use partial updates to minimize validation overhead
await configManager.setAIConfig({ temperature: 0.7 }); // Only validates temperature
// vs
await configManager.setAIConfig(configManager.getAIConfig()); // Validates everything
```

### Security Optimization
```typescript
// Never log full config with API keys
const safeConfig = {
  ...configManager.getConfig(),
  ai: {
    ...configManager.getAIConfig(),
    apiKey: configManager.getAIConfig().apiKey ? '[REDACTED]' : undefined
  }
};
console.log('Safe config:', safeConfig);
```

---

## 📋 QUICK REFERENCE - VAULT-TEC CHEAT SHEET

### Essential Imports
```typescript
import { 
  ConfigManager, 
  createDefaultConfigCallbacks,
  setupWorkingDirectory 
} from 'task-o-matic/config';

import {
  validateConfig,
  validateAIConfig,
  validatePartialAIConfig,
  safeValidateConfig
} from 'task-o-matic/config-validation';
```

### Basic Usage Pattern
```typescript
// 1. Initialize vault
const configManager = new ConfigManager();

// 2. Load configuration
await configManager.load();

// 3. Use configuration
const aiConfig = configManager.getAIConfig();

// 4. Update if needed
await configManager.setAIConfig({ temperature: 0.8 });

// 5. Save changes
await configManager.save();
```

### Validation Pattern
```typescript
// Safe validation for user input
const result = safeValidateConfig(userInput);
if (!result.success) {
  console.error('Configuration radiation detected:', result.errors);
  return;
}
// Use result.data safely
```

---

## 🏁 CONCLUSION - FORTUNE FAVORS THE PREPARED

The Configuration Management system is your vault's **Luck** attribute - the difference between a well-oiled machine and a radioactive disaster. By following Vault-Tec's guidelines and using the proper radiation screening procedures, you ensure your AI companions operate at peak efficiency.

Remember: **A well-configured vault is a lucky vault!**

---

*Vault-Tec Configuration Management System - Version 2077*
*For authorized vault personnel only*
*© Vault-Tec Corporation - Building a Better Tomorrow, Underground*

---

## 🔧 OPEN QUESTIONS / TODO

- [ ] Investigate configuration hot-reloading for running vaults
- [ ] Add configuration templates for common vault types
- [ ] Implement configuration migration system for version upgrades
- [ ] Add configuration backup/restore functionality
- [ ] Explore configuration encryption for sensitive vault data