#!/usr/bin/env bun
/**
 * Test feature flags system
 * Demonstrates how feature flags control tool availability
 */

import { getFeatureFlags, isFeatureEnabled, getAvailableTools } from './src/utils/feature-flags.js'

const flags = getFeatureFlags()

console.log('📋 Feature Flags Report\n')
console.log('='.repeat(60))

// Show all flags
console.log('\n🚩 All Feature Flags:')
Object.entries(flags).forEach(([key, value]) => {
  const status = value ? '✅' : '❌'
  console.log(`  ${status} ${key}: ${value}`)
})

// Show available tools based on flags
console.log('\n🔧 Available Tools (Based on Feature Flags):')
const availableTools = getAvailableTools()
Object.entries(availableTools).forEach(([tool, enabled]) => {
  const status = enabled ? '✅' : '❌'
  console.log(`  ${status} ${tool}: ${enabled ? 'ENABLED' : 'DISABLED'}`)
})

// Test individual flags
console.log('\n🔍 Individual Flag Tests:')
console.log(`  isFeatureEnabled('ENABLE_BASH_TOOL'): ${isFeatureEnabled('ENABLE_BASH_TOOL')}`)
console.log(`  isFeatureEnabled('ENABLE_FILE_TOOLS'): ${isFeatureEnabled('ENABLE_FILE_TOOLS')}`)
console.log(`  isFeatureEnabled('DEBUG_MODE'): ${isFeatureEnabled('DEBUG_MODE')}`)
console.log(`  isFeatureEnabled('ENABLE_STREAMING'): ${isFeatureEnabled('ENABLE_STREAMING')}`)

// Show environment variables
console.log('\n🌍 Environment Variables (SAWCODE_* or unprefixed):')
const envVars = ['DEBUG_MODE', 'VERBOSE_LOGGING', 'ENABLE_BASH_TOOL', 'ENABLE_FILE_TOOLS']
envVars.forEach((envVar) => {
  const sawcodeEnv = `SAWCODE_${envVar}`
  const value = process.env[sawcodeEnv] || process.env[envVar] || 'not set'
  console.log(`  ${sawcodeEnv}: ${value}`)
})

console.log('\n' + '='.repeat(60))
console.log('✅ Feature flags system is operational\n')
