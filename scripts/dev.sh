#!/usr/bin/env bash
# Development server with watch mode

set -e

echo "🚀 Starting SawCode development server..."
echo ""
echo "Commands:"
echo "  /help     - List available commands"
echo "  /tools    - Show available tools"
echo "  /history  - View conversation history"
echo "  /clear    - Clear history"
echo "  /exit     - Exit"
echo ""
echo "Press Ctrl+C or type /exit to quit"
echo "────────────────────────────────────────"
echo ""

# Launch TUI
bun src/cli.ts
