# Task-O-Matic Skills

This directory contains Claude skills for task-o-matic.

## Installing the Skill

### For Claude Code CLI Users

1. Copy the skill directory to your local skills folder:
   ```bash
   cp -r skills/task-o-matic ~/.claude/skills/task-o-matic
   ```

2. The skill will be automatically available in Claude Code.

### For Manual Installation

Create a symlink from your Claude skills directory to this location:

```bash
ln -s /path/to/task-o-matic/skills/task-o-matic ~/.claude/skills/task-o-matic
```

## Using the Skill

Once installed, you can invoke the skill by name:

```
/task-o-matic
```

Or by describing what you want to do with task-o-matic, and Claude will automatically use the skill.

## Skill Contents

- **SKILL.md** - Main skill file with quick reference and common workflows
- **REFERENCES.md** - Complete command reference for all CLI commands

## Development

When updating the skill:
1. Edit the files in this directory
2. Reload Claude Code or restart your session
3. The updated skill will be available immediately
