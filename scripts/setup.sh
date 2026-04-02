#!/usr/bin/env bash
# Setup script for SawCode

set -e

echo "🎯 SawCode Setup"
echo "═══════════════════════════════════════"
echo ""

# Check Node/Bun
if ! command -v bun &> /dev/null; then
    echo "❌ Bun not found. Install from https://bun.sh"
    exit 1
fi

echo "✓ Bun $(bun --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
bun install

# Check .env
if [ ! -f .env ]; then
    echo ""
    echo "⚠️  Missing .env file"
    echo "Create a .env file with:"
    echo ""
    echo "ANTHROPIC_API_KEY=sk-ant-..."
    echo "CLAUDE_MODEL=claude-3-5-sonnet-20241022"
    echo ""
    echo "Get your API key from: https://console.anthropic.com/account/keys"
    exit 1
fi

# Build
echo "🔨 Building project..."
bun run build

echo ""
echo "✅ Setup complete!"
echo ""
echo "Getting started:"
echo "  bun src/cli.ts              # Launch interactive TUI"
echo "  bun src/cli.ts query \"test\"  # Run a quick query"
echo "  bun test                     # Run tests"
echo ""
