#!/usr/bin/env bun
/**
 * Feature Flags Configuration Guide
 * ================================
 * 
 * This script demonstrates how to enable/disable tools using feature flags
 */

import { getFeatureFlags, getAvailableTools } from './src/utils/feature-flags.js'

console.log('🚀 SawCode Feature Flags Guide\n')
console.log('=' .repeat(70))

console.log('\n📋 FEATURE FLAGS OVERVIEW\n')
console.log('Feature flags control which tools are available in the agent.')
console.log('Set via environment variables with SAWCODE_ prefix.\n')

// Show current state
console.log('🔍 Current Environment State:')
console.log('---')
const flags = getFeatureFlags()
const tools = getAvailableTools()

console.log('\nFlag Status:')
Object.entries(flags).slice(0, 5).forEach(([key, value]) => {
  console.log(`  ${value ? '✅' : '❌'} ${key}`)
})
console.log('  ... and 8 more flags\n')

console.log('Available Tools:')
Object.entries(tools).forEach(([tool, enabled]) => {
  console.log(`  ${enabled ? '✅' : '❌'} ${tool}`)
})

console.log('\n' + '=' .repeat(70))
console.log('\n📖 USAGE EXAMPLES\n')

console.log('1. Enable all tools (default):')
console.log('   $ bun src/cli.ts tools  # Shows all 5 tools')

console.log('\n2. Disable file tools:')
console.log('   $ SAWCODE_ENABLE_FILE_TOOLS=false bun src/cli.ts tools')
console.log('   # Shows only: bash, webfetch')

console.log('\n3. Disable bash tool:')
console.log('   $ SAWCODE_ENABLE_BASH_TOOL=false bun src/cli.ts tools')
console.log('   # Shows: webfetch, fileread, filewrite, listdir')

console.log('\n4. Disable webfetch:')
console.log('   $ SAWCODE_ENABLE_WEBFETCH_TOOL=false bun src/cli.ts tools')
console.log('   # Shows: bash, fileread, filewrite, listdir')

console.log('\n5. Enable debug mode logging:')
console.log('   $ SAWCODE_DEBUG_MODE=true bun src/cli.ts query "your query"')

console.log('\n6. Verbose logging:')
console.log('   $ SAWCODE_VERBOSE_LOGGING=true bun src/cli.ts query "your query"')

console.log('\n' + '=' .repeat(70))
console.log('\n🎯 QUICK REFERENCE\n')

console.log('Tool-related flags:')
console.log('  SAWCODE_ENABLE_BASH_TOOL           (execute shell commands)')
console.log('  SAWCODE_ENABLE_WEBFETCH_TOOL       (fetch HTTP URLs)')
console.log('  SAWCODE_ENABLE_FILE_TOOLS          (read/write/listdir)')
console.log('  SAWCODE_ENABLE_GREP_TOOL           (text search - future)')
console.log('  SAWCODE_ENABLE_WEB_SEARCH_TOOL     (web search - future)')

console.log('\nExecution flags:')
console.log('  SAWCODE_ENABLE_STREAMING           (stream responses)')
console.log('  SAWCODE_ENABLE_MULTI_TURN          (multi-turn conversations)')
console.log('  SAWCODE_ENABLE_CACHING             (cache responses)')

console.log('\nSystem flags:')
console.log('  SAWCODE_ADVANCED_ERRORS            (advanced error handling)')
console.log('  SAWCODE_FEATURE_FLAGS              (feature flag system)')
console.log('  SAWCODE_STRUCTURED_LOGGING         (structured logging)')
console.log('  SAWCODE_DEBUG_MODE                 (debug output)')
console.log('  SAWCODE_VERBOSE_LOGGING            (verbose logs)')

console.log('\n' + '=' .repeat(70))
console.log('\n💡 NOTES\n')

console.log('• Flags accept: true, false, yes, no, 1, 0, on, off')
console.log('• Can use both SAWCODE_* or unprefixed versions')
console.log('• Flags are read at agent initialization')
console.log('• Feature flags system is ALWAYS available')
console.log('• Use getFeatureFlags() in code to check at runtime')

console.log('\n✅ Ready to use feature flags!\n')
