#!/bin/bash
set -e

# Release script for task-o-matic monorepo
# Ensures core is published and available before publishing CLI

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

# Parse arguments
BETA=false
SKIP_VERIFY=false
SKIP_BUMP=false
BUMP_TYPE="patch"

while [[ $# -gt 0 ]]; do
    case $1 in
        --beta)
            BETA=true
            BUMP_TYPE="prerelease"
            shift
            ;;
        --minor)
            BUMP_TYPE="minor"
            shift
            ;;
        --major)
            BUMP_TYPE="major"
            shift
            ;;
        --patch)
            BUMP_TYPE="patch"
            shift
            ;;
        --skip-verify)
            SKIP_VERIFY=true
            shift
            ;;
        --skip-bump)
            SKIP_BUMP=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Get current versions
CORE_VERSION=$(node -p "require('$ROOT_DIR/packages/core/package.json').version")
CLI_VERSION=$(node -p "require('$ROOT_DIR/packages/cli/package.json').version")

echo "Current versions:"
echo "  core: $CORE_VERSION"
echo "  cli:  $CLI_VERSION"
echo ""

if [ "$SKIP_BUMP" = true ]; then
    echo "Skipping version bump (--skip-bump)"
    NEW_CORE_VERSION="$CORE_VERSION"
    NEW_CLI_VERSION="$CLI_VERSION"
else
    # Bump versions using node to avoid npm workspace: protocol issues
    echo "Bumping versions ($BUMP_TYPE)..."

    bump_version() {
        local pkg_path="$1"
        local current="$2"
        local is_beta="$3"
        local bump="$4"
        
        if [ "$is_beta" = true ]; then
            if [[ "$current" == *"-beta"* ]]; then
                # Already beta, increment beta number
                local base="${current%-beta.*}"
                local beta_num="${current##*-beta.}"
                local new_beta=$((beta_num + 1))
                echo "${base}-beta.${new_beta}"
            else
                # First beta
                echo "${current}-beta.0"
            fi
        else
            # Parse semver
            local major minor patch
            IFS='.' read -r major minor patch <<< "${current%%-*}"
            case "$bump" in
                major) echo "$((major + 1)).0.0" ;;
                minor) echo "${major}.$((minor + 1)).0" ;;
                patch) echo "${major}.${minor}.$((patch + 1))" ;;
            esac
        fi
    }

    NEW_CORE_VERSION=$(bump_version "$ROOT_DIR/packages/core" "$CORE_VERSION" "$BETA" "$BUMP_TYPE")
    NEW_CLI_VERSION=$(bump_version "$ROOT_DIR/packages/cli" "$CLI_VERSION" "$BETA" "$BUMP_TYPE")

    # Update package.json files directly
    node -e "const p=require('$ROOT_DIR/packages/core/package.json'); p.version='$NEW_CORE_VERSION'; require('fs').writeFileSync('$ROOT_DIR/packages/core/package.json', JSON.stringify(p, null, 2) + '\n')"
    node -e "const p=require('$ROOT_DIR/packages/cli/package.json'); p.version='$NEW_CLI_VERSION'; require('fs').writeFileSync('$ROOT_DIR/packages/cli/package.json', JSON.stringify(p, null, 2) + '\n')"
fi

echo "New versions:"
echo "  core: $NEW_CORE_VERSION"
echo "  cli:  $NEW_CLI_VERSION"
echo ""

# Verify/build
if [ "$SKIP_VERIFY" = false ]; then
    echo "Running verification..."
    cd "$ROOT_DIR"
    bun run verify-work
    echo ""
fi

# Reinstall to update workspace: references in lockfile
echo "Updating workspace dependencies..."
cd "$ROOT_DIR"
bun install
echo ""

# Publish core
echo "Publishing core@$NEW_CORE_VERSION..."
cd "$ROOT_DIR/packages/core"
if [ "$BETA" = true ]; then
    bun publish --tag beta
else
    bun publish
fi
echo ""

# Wait for core to be available on npm
echo "Waiting for core@$NEW_CORE_VERSION to be available on npm..."
MAX_ATTEMPTS=30
ATTEMPT=0
while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    ATTEMPT=$((ATTEMPT + 1))
    
    # Check if version exists on npm
    AVAILABLE=$(npm view "task-o-matic-core@$NEW_CORE_VERSION" version 2>/dev/null || echo "")
    
    if [ "$AVAILABLE" = "$NEW_CORE_VERSION" ]; then
        echo "Core@$NEW_CORE_VERSION is available on npm!"
        break
    fi
    
    if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
        echo "ERROR: Timeout waiting for core@$NEW_CORE_VERSION to be available on npm"
        echo "CLI was NOT published. You may need to publish it manually after core propagates."
        exit 1
    fi
    
    echo "  Attempt $ATTEMPT/$MAX_ATTEMPTS - not yet available, waiting 2s..."
    sleep 2
done
echo ""

# Publish CLI
echo "Publishing cli@$NEW_CLI_VERSION..."
cd "$ROOT_DIR/packages/cli"
if [ "$BETA" = true ]; then
    bun publish --tag beta
else
    bun publish
fi
echo ""

echo "Release complete!"
echo "  task-o-matic-core@$NEW_CORE_VERSION"
echo "  task-o-matic@$NEW_CLI_VERSION"
