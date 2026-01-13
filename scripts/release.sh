#!/bin/bash
set -e

# Release script for task-o-matic monorepo
# Architecture: Standard Monorepo (Core Lib + CLI Wrapper)

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
    # Bump versions using node
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
    echo "Running verification and build..."
    cd "$ROOT_DIR"
    # Ensure dependencies are installed
    bun install
    # Run tests
    bun run test
    echo ""
fi

# Publish core
echo "Publishing core@$NEW_CORE_VERSION..."
cd "$ROOT_DIR/packages/core"
bun run build # Ensure dist exists
if [ "$BETA" = true ]; then
    bun publish --tag beta
else
    bun publish
fi
echo ""

# Wait for core to be available on npm
echo "Waiting for core@$NEW_CORE_VERSION to be available on npm..."
# Note: npm registry can be slow. We wait up to 60s.
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

# CRITICAL: Replace workspace:* with actual version in CLI package.json before publishing
# This ensures npx installs the correct version of core from npm
echo "Setting CLI dependency to task-o-matic-core@$NEW_CORE_VERSION..."
node -e "
const p = require('$ROOT_DIR/packages/cli/package.json');
p.dependencies['task-o-matic-core'] = '$NEW_CORE_VERSION';
require('fs').writeFileSync('$ROOT_DIR/packages/cli/package.json', JSON.stringify(p, null, 2) + '\n');
"
echo ""

# Publish CLI
echo "Publishing cli@$NEW_CLI_VERSION..."
cd "$ROOT_DIR/packages/cli"
bun run build # Ensure dist exists
if [ "$BETA" = true ]; then
    npm publish --tag beta
else
    npm publish
fi
echo ""

# Restore workspace:* in CLI package.json after publishing
echo "Restoring workspace:* dependency..."
node -e "
const p = require('$ROOT_DIR/packages/cli/package.json');
p.dependencies['task-o-matic-core'] = 'workspace:*';
require('fs').writeFileSync('$ROOT_DIR/packages/cli/package.json', JSON.stringify(p, null, 2) + '\n');
"

echo "Release complete!"
echo "  task-o-matic-core@$NEW_CORE_VERSION"
echo "  task-o-matic@$NEW_CLI_VERSION"
