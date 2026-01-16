#!/usr/bin/env bash
# Generate comprehensive help documentation for all task-o-matic commands (dynamic)

set -euo pipefail

OUTPUT_FILE="docs/task-o-matic_help.md"
CLI_BIN="./packages/cli/dist/cli/bin.js"

# Check if CLI is built
if [ ! -f "$CLI_BIN" ]; then
  echo "Error: CLI not built. Run 'bun run build' first."
  exit 1
fi

echo "Generating dynamic help documentation..."

# Function to extract commands from help output
extract_commands() {
    local help_output="$1"
    # Extract commands after "Commands:" section, before "Options:"
    # Pattern: capture lines after "Commands:" until we hit "Options:" or EOF
    # Each command is at the start of a line, followed by options in brackets
    # Only match lines that start with spaces followed by a letter (actual commands)
    # Output as space-separated list
    echo "$help_output" | awk '/^Commands:$/ { in_commands=1; next } in_commands && /^(Options:|$)/ { exit } in_commands && /^  [a-z]/ { printf "%s ", $1 }' | sed 's/ $//'
}

# Extract main commands first (for TOC)
MAIN_HELP=$(node "$CLI_BIN" --help 2>/dev/null || true)
MAIN_COMMANDS=$(extract_commands "$MAIN_HELP")

# First pass: identify commands with valid help output
VALID_COMMANDS=""
for cmd in $MAIN_COMMANDS; do
    CMD_HELP=$(node "$CLI_BIN" "$cmd" --help 2>/dev/null || true)
    if [ -n "$CMD_HELP" ]; then
        if [ -z "$VALID_COMMANDS" ]; then
            VALID_COMMANDS="$cmd"
        else
            VALID_COMMANDS="$VALID_COMMANDS $cmd"
        fi
    fi
done

# Initialize output file
cat > "$OUTPUT_FILE" << 'EOF'
# Task-O-Matic CLI Help Reference

Auto-generated documentation for all task-o-matic commands.

## Table of Contents

- [Main Command](#main-command)
EOF

# Add TOC links only for valid commands
for cmd in $VALID_COMMANDS; do
    # Ensure anchor is lowercased to match GitHub markdown behavior
    CMD_LOWER=$(echo "$cmd" | tr '[:upper:]' '[:lower:]')
    echo "- [$cmd Commands](#$CMD_LOWER-commands)" >> "$OUTPUT_FILE"
done
echo "" >> "$OUTPUT_FILE"
echo "---" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Main help
echo "## Main Command" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo '```' >> "$OUTPUT_FILE"
node "$CLI_BIN" --help >> "$OUTPUT_FILE" 2>&1 || true
echo '```' >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Generate docs for each valid command
for cmd in $VALID_COMMANDS; do
    echo "Processing $cmd..." >&2

    # Capitalize for section heading
    CMD_TITLE=$(echo "$cmd" | awk '{print toupper(substr($0,1,1)) substr($0,2)}')

    echo "## $CMD_TITLE Commands" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"

    # Main command help
    echo "### $cmd --help" >> "$OUTPUT_FILE"
    echo '```' >> "$OUTPUT_FILE"
    node "$CLI_BIN" "$cmd" --help >> "$OUTPUT_FILE" 2>&1 || true
    echo '```' >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"

    # Extract subcommands
    CMD_HELP=$(node "$CLI_BIN" "$cmd" --help 2>/dev/null || true)
    SUBCOMMANDS=$(extract_commands "$CMD_HELP")

    if [ -n "$SUBCOMMANDS" ]; then
        for subcmd in $SUBCOMMANDS; do
            echo "### $cmd $subcmd --help" >> "$OUTPUT_FILE"
            echo '```' >> "$OUTPUT_FILE"
            node "$CLI_BIN" "$cmd" "$subcmd" --help >> "$OUTPUT_FILE" 2>&1 || true
            echo '```' >> "$OUTPUT_FILE"
            echo "" >> "$OUTPUT_FILE"
        done
    fi

    echo "" >> "$OUTPUT_FILE"
done

echo "✓ Help documentation generated: $OUTPUT_FILE"
