#!/usr/bin/env bash
# Build script for SawCode

set -e

echo "🔨 Building SawCode Agent..."

# Type checking
echo "✓ Type checking..."
bun run type-check

# Build TypeScript
echo "✓ Compiling TypeScript..."
bun run build

# Run tests
if [ "$1" = "--test" ]; then
  echo "✓ Running tests..."
  bun test
fi

echo "✅ Build complete!"
echo ""
echo "Quick start:"
echo "  bun src/cli.ts              # Launch interactive TUI"
echo "  bun src/cli.ts query \"...\"  # Run a query"
echo "  bun test                     # Run tests"
