#!/usr/bin/env bash
# Generate bash completion for task-o-matic dynamically

set -euo pipefail

CLI_BIN="./packages/cli/dist/cli/bin.js"
OUTPUT_FILE="completions/task-o-matic.bash"

# Check if CLI is built
if [ ! -f "$CLI_BIN" ]; then
  echo "Error: CLI not built. Run 'bun run build' first."
  exit 1
fi

mkdir -p completions

echo "Generating dynamic bash completion..."

# Extract commands from help output
# Format: capture lines after "Commands:" until we hit "Options:" or end
# Each command is the first word on the line (after leading spaces)
# Only match lines that start with spaces followed by a letter (actual commands)
extract_commands() {
    local help_output="$1"
    echo "$help_output" | awk '/^Commands:$/ {in_commands=1; next} in_commands && /^(Options:|$)/ {exit} in_commands && /^  [a-z]/ {print $1}'
}

# Extract options from help output
extract_options() {
    local help_output="$1"
    # Extract long and short options like --option or -o
    echo "$help_output" | grep -oE '\-{1,2}[a-z-]+' | sort -u | tr '\n' ' ' | sed 's/  */ /g' | sed 's/^ *//;s/ *$//'
}

# Extract main commands
MAIN_HELP=$(node "$CLI_BIN" --help 2>/dev/null || true)
MAIN_COMMANDS=$(extract_commands "$MAIN_HELP")

cat > "$OUTPUT_FILE" << EOF
# Bash completion for task-o-matic
# Source this file or copy to /etc/bash_completion.d/
# Auto-generated - DO NOT EDIT MANUALLY

_task_o_matic() {
    local cur prev words cword
    _init_completion || return

    # Main commands (dynamically extracted)
    local main_commands="$MAIN_COMMANDS"

    # Handle main command completion
    if [[ \$cword -eq 1 ]]; then
        COMPREPLY=( \$(compgen -W "\$main_commands --help --version" -- "\$cur") )
        return
    fi

    # Handle subcommand completion for each main command
    case "\${words[1]}" in
EOF

# Extract subcommands for each main command
for cmd in $MAIN_COMMANDS; do
    echo "    Processing $cmd..." >&2
    
    # Try to get subcommands
    CMD_HELP=$(node "$CLI_BIN" "$cmd" --help 2>/dev/null || true)
    SUBCOMMANDS=$(extract_commands "$CMD_HELP")
    
    if [ -n "$SUBCOMMANDS" ]; then
        echo "        $cmd)" >> "$OUTPUT_FILE"
        echo "            local subcommands=\"$SUBCOMMANDS\"" >> "$OUTPUT_FILE"
        echo "            if [[ \$cword -eq 2 ]]; then" >> "$OUTPUT_FILE"
        echo "                COMPREPLY=( \$(compgen -W \"\$subcommands --help\" -- \"\$cur\") )" >> "$OUTPUT_FILE"
        echo "            else" >> "$OUTPUT_FILE"
        echo "                # Complete options for specific subcommands" >> "$OUTPUT_FILE"
        echo "                case \"\${words[2]}\" in" >> "$OUTPUT_FILE"
        
        # Extract options for each subcommand
        for subcmd in $SUBCOMMANDS; do
            SUBCMD_HELP=$(node "$CLI_BIN" "$cmd" "$subcmd" --help 2>/dev/null || true)
            OPTIONS=$(extract_options "$SUBCMD_HELP")
            if [ -n "$OPTIONS" ]; then
                echo "                    $subcmd)" >> "$OUTPUT_FILE"
                echo "                        COMPREPLY=( \$(compgen -W \"$OPTIONS --help\" -- \"\$cur\") )" >> "$OUTPUT_FILE"
                echo "                        ;;" >> "$OUTPUT_FILE"
            fi
        done
        
        echo "                    *)" >> "$OUTPUT_FILE"
        echo "                        COMPREPLY=( \$(compgen -W \"--help\" -- \"\$cur\") )" >> "$OUTPUT_FILE"
        echo "                        ;;" >> "$OUTPUT_FILE"
        echo "                esac" >> "$OUTPUT_FILE"
        echo "            fi" >> "$OUTPUT_FILE"
        echo "            ;;" >> "$OUTPUT_FILE"
    else
        echo "        $cmd)" >> "$OUTPUT_FILE"
        # Just complete options for the main command
        OPTIONS=$(extract_options "$CMD_HELP")
        if [ -n "$OPTIONS" ]; then
            echo "            COMPREPLY=( \$(compgen -W \"$OPTIONS --help\" -- \"\$cur\") )" >> "$OUTPUT_FILE"
        else
            echo "            COMPREPLY=( \$(compgen -W \"--help\" -- \"\$cur\") )" >> "$OUTPUT_FILE"
        fi
        echo "            ;;" >> "$OUTPUT_FILE"
    fi
done

cat >> "$OUTPUT_FILE" << 'EOF'
    esac
}

complete -F _task_o_matic task-o-matic
EOF

echo "✓ Bash completion generated: $OUTPUT_FILE"
echo ""
echo "To use the completion, add this to your ~/.bashrc:"
echo "  source $(pwd)/$OUTPUT_FILE"
