# Migration Guide

This release introduces significant architectural changes to support web applications and custom storage backends (databases, etc.). While we maintained backward compatibility for the CLI, advanced users who use the library programmatically may need to update their code.

## Breaking Changes

### 1. ConfigManager is now Async-Ready

If you access `configManager.getConfig()` or `configManager.getAIConfig()`, you must ensure the configuration is loaded first.

**Before:**

```typescript
import { configManager } from "task-o-matic";

// Config was loaded synchronously in constructor
const config = configManager.getConfig();
```

**After:**

```typescript
import { configManager } from "task-o-matic";

// You must await load() before accessing config
await configManager.load();
const config = configManager.getConfig();
```

### 2. FileSystemStorage Refactoring

`FileSystemStorage` now uses a callback system internally. If you were extending this class, internal methods have changed.

## New Features: Web App Support

You can now use `task-o-matic` in web applications by providing custom callbacks for storage, config, and context.

### Initialization

Use `initializeServices` to inject your custom adapters:

```typescript
import { initializeServices } from "task-o-matic";

await initializeServices({
  // 1. Storage Callbacks (Required for persistence)
  storageCallbacks: {
    read: async (key) => db.get(key),
    write: async (key, value) => db.set(key, value),
    delete: async (key) => db.delete(key),
    list: async (prefix) => db.listKeys(prefix),
    exists: async (key) => db.has(key),
  },

  // 2. Config Callbacks (Optional)
  configCallbacks: {
    read: async (key) => userConfig.get(key),
    write: async (key, value) => userConfig.set(key, value),
    getEnv: (key) => process.env[key],
  },

  // 3. Context Callbacks (Optional)
  contextCallbacks: {
    readFile: async (path) => projectFiles.read(path),
    fileExists: async (path) => projectFiles.exists(path),
    listFiles: async (dir) => projectFiles.list(dir),
    stat: async (path) => projectFiles.stat(path),
  },
});
```

### Using Services

After initialization, use the factory functions or exported singletons:

```typescript
import { TaskService, getStorage } from "task-o-matic";

const taskService = new TaskService();
// It will automatically use the storage you configured
```
