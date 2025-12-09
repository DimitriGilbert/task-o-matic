#!/usr/bin/env bash
# Generate comprehensive help documentation for all task-o-matic commands

set -euo pipefail

OUTPUT_FILE="docs/task-o-matic_help.md"
CLI_BIN="./dist/cli/bin.js"

# Check if CLI is built
if [ ! -f "$CLI_BIN" ]; then
  echo "Error: CLI not built. Run 'bun run build' first."
  exit 1
fi

echo "Generating help documentation..."

# Initialize output file
cat > "$OUTPUT_FILE" << 'EOF'
# Task-O-Matic CLI Help Reference

Auto-generated documentation for all task-o-matic commands.

## Table of Contents

- [Main Command](#main-command)
- [Tasks Commands](#tasks-commands)
- [PRD Commands](#prd-commands)
- [Config Commands](#config-commands)
- [Init Commands](#init-commands)

---

EOF

# Main help
echo "## Main Command" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo '```' >> "$OUTPUT_FILE"
node "$CLI_BIN" --help >> "$OUTPUT_FILE" 2>&1 || true
echo '```' >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Tasks commands
echo "## Tasks Commands" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

echo "### tasks --help" >> "$OUTPUT_FILE"
echo '```' >> "$OUTPUT_FILE"
node "$CLI_BIN" tasks --help >> "$OUTPUT_FILE" 2>&1 || true
echo '```' >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Individual task commands
TASK_COMMANDS=(
  "list"
  "create"
  "show"
  "update"
  "delete"
  "status"
  "get-next"
  "next"
  "tree"
  "enhance"
  "split"
  "plan"
  "get-plan"
  "list-plan"
  "delete-plan"
  "set-plan"
  "document"
  "get-documentation"
  "add-documentation"
  "execute"
  "execute-loop"
  "tag"
  "untag"
)

for cmd in "${TASK_COMMANDS[@]}"; do
  echo "### tasks $cmd --help" >> "$OUTPUT_FILE"
  echo '```' >> "$OUTPUT_FILE"
  node "$CLI_BIN" tasks "$cmd" --help >> "$OUTPUT_FILE" 2>&1 || true
  echo '```' >> "$OUTPUT_FILE"
  echo "" >> "$OUTPUT_FILE"
done

# PRD commands
echo "## PRD Commands" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

echo "### prd --help" >> "$OUTPUT_FILE"
echo '```' >> "$OUTPUT_FILE"
node "$CLI_BIN" prd --help >> "$OUTPUT_FILE" 2>&1 || true
echo '```' >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

PRD_COMMANDS=("parse" "rework" "ask")

for cmd in "${PRD_COMMANDS[@]}"; do
  echo "### prd $cmd --help" >> "$OUTPUT_FILE"
  echo '```' >> "$OUTPUT_FILE"
  node "$CLI_BIN" prd "$cmd" --help >> "$OUTPUT_FILE" 2>&1 || true
  echo '```' >> "$OUTPUT_FILE"
  echo "" >> "$OUTPUT_FILE"
done

# Config commands
echo "## Config Commands" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

echo "### config --help" >> "$OUTPUT_FILE"
echo '```' >> "$OUTPUT_FILE"
node "$CLI_BIN" config --help >> "$OUTPUT_FILE" 2>&1 || true
echo '```' >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

CONFIG_COMMANDS=("get" "set" "reset")

for cmd in "${CONFIG_COMMANDS[@]}"; do
  echo "### config $cmd --help" >> "$OUTPUT_FILE"
  echo '```' >> "$OUTPUT_FILE"
  node "$CLI_BIN" config "$cmd" --help >> "$OUTPUT_FILE" 2>&1 || true
  echo '```' >> "$OUTPUT_FILE"
  echo "" >> "$OUTPUT_FILE"
done

# Init commands
echo "## Init Commands" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

echo "### init --help" >> "$OUTPUT_FILE"
echo '```' >> "$OUTPUT_FILE"
node "$CLI_BIN" init --help >> "$OUTPUT_FILE" 2>&1 || true
echo '```' >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

echo "### init init --help" >> "$OUTPUT_FILE"
echo '```' >> "$OUTPUT_FILE"
node "$CLI_BIN" init init --help >> "$OUTPUT_FILE" 2>&1 || true
echo '```' >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

echo "✓ Help documentation generated: $OUTPUT_FILE"
