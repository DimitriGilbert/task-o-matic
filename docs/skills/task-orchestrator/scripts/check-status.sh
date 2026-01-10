#!/bin/bash
# Check task status and subtask completion
# Usage: ./check-status.sh <task-id>

TASK_ID="$1"

if [ -z "$TASK_ID" ]; then
    echo "Usage: $0 <task-id>"
    exit 1
fi

echo "=== Task Status ==="
npx task-o-matic tasks show --id "$TASK_ID"

echo ""
echo "=== Subtasks ==="
npx task-o-matic tasks subtasks --id "$TASK_ID" 2>/dev/null || echo "No subtasks"

echo ""
echo "=== Task Tree ==="
npx task-o-matic tasks tree --id "$TASK_ID"
