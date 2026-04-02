/**
 * Phase 18: AI-Powered Features Examples
 * Demonstrates code generation, semantic search, diagnostics, and optimizations
 */

import { Agent, semanticSearchTool, diagnosticEngineTool, optimizationSuggesterTool } from '../src/index.js'

/**
 * Example 1: Generate Code from Intent
 */
async function example1_CodeGeneration() {
  console.log('\n📝 Example 1: Generate Code from Intent\n')
  console.log('=' .repeat(60))

  const agent = new Agent({
    model: 'qwen3-coder-next:cloud',
    tools: [],
  })

  const response = await agent.query(`
    Generate TypeScript code for a function that:
    1. Takes an array of numbers
    2. Returns the sum of all even numbers
    3. Handles empty arrays
    4. Uses functional programming style
  `)

  console.log(response.response)
}

/**
 * Example 2: Semantic Search for Patterns
 */
async function example2_SemanticSearch() {
  console.log('\n🔍 Example 2: Semantic Search for Code Patterns\n')
  console.log('='.repeat(60))

  const agent = new Agent({
    model: 'qwen3-coder-next:cloud',
    tools: [semanticSearchTool],
  })

  const response = await agent.query(`
    Search for code patterns related to "retrying failed operations".
    I need something that can automatically retry a function with exponential backoff.
  `)

  console.log(response.response)
}

/**
 * Example 3: Diagnose Code Issues
 */
async function example3_DiagnosticAnalysis() {
  console.log('\n🔎 Example 3: Diagnostic Analysis of Code\n')
  console.log('='.repeat(60))

  const problematicCode = `
    async function processUsers(users) {
      const results = []
      for (const user of users) {
        const response = await fetch('https://api.example.com/validate', {
          method: 'POST',
          body: JSON.stringify(user)
        })
        const json = await response.json()
        results.push(json)
      }
      return results
    }
  `

  const agent = new Agent({
    model: 'qwen3-coder-next:cloud',
    tools: [diagnosticEngineTool],
  })

  const response = await agent.query(`
    Analyze this code for issues:
    ${problematicCode}
    
    Focus on performance and correctness. Include explanations and fixes.
  `)

  console.log(response.response)
}

/**
 * Example 4: Suggest Optimizations
 */
async function example4_OptimizationSuggestions() {
  console.log('\n⚡ Example 4: Optimization Suggestions\n')
  console.log('='.repeat(60))

  const codeToOptimize = `
    function findDuplicates(array) {
      const duplicates = []
      for (const item of array) {
        if (JSON.stringify(array).includes(JSON.stringify(item))) {
          duplicates.push(item)
        }
      }
      return duplicates
    }
  `

  const agent = new Agent({
    model: 'qwen3-coder-next:cloud',
    tools: [optimizationSuggesterTool],
  })

  const response = await agent.query(`
    Suggest optimizations for this code:
    ${codeToOptimize}
    
    Focus on speed and memory efficiency. Show before/after examples.
  `)

  console.log(response.response)
}

/**
 * Example 5: Complete Workflow - From Intent to Optimized Code
 */
async function example5_CompleteWorkflow() {
  console.log('\n🚀 Example 5: Complete Workflow\n')
  console.log('='.repeat(60))

  console.log('\n📝 Step 1: Generate initial code\n')
  let agent = new Agent({
    model: 'qwen3-coder-next:cloud',
    tools: [],
  })

  const generatedCode = await agent.query(`
    Generate TypeScript code for a cache manager that:
    - Stores key-value pairs with TTL
    - Auto-removes expired entries
    - Limits maximum size to 1000 items
    - Production-ready with error handling
  `)
  console.log(generatedCode.response)

  console.log('\n🔎 Step 2: Analyze generated code\n')
  agent = new Agent({
    model: 'qwen3-coder-next:cloud',
    tools: [diagnosticEngineTool],
  })

  const analyzed = await agent.query(`
    Analyze this code for any issues:
    ${generatedCode.response}
    
    Focus on correctness and security.
  `)
  console.log(analyzed.response)

  console.log('\n⚡ Step 3: Suggest optimizations\n')
  agent = new Agent({
    model: 'qwen3-coder-next:cloud',
    tools: [optimizationSuggesterTool],
  })

  const optimized = await agent.query(`
    Suggest optimizations for this cache manager code:
    ${generatedCode.response}
    
    Focus on speed and memory efficiency.
  `)
  console.log(optimized.response)
}

/**
 * Example 6: Security Analysis Workflow
 */
async function example6_SecurityAnalysis() {
  console.log('\n🔐 Example 6: Security Analysis\n')
  console.log('='.repeat(60))

  const unsafeCode = `
    async function handleUserInput(data) {
      const user = JSON.parse(data)
      document.getElementById('output').innerHTML = user.name
      const fn = Function(user.script)
      fn()
      return user
    }
  `

  const agent = new Agent({
    model: 'qwen3-coder-next:cloud',
    tools: [diagnosticEngineTool],
  })

  const response = await agent.query(`
    Analyze this code for security vulnerabilities:
    ${unsafeCode}
    
    Focus on security issues and provide fixes.
  `)

  console.log(response.response)
}

/**
 * Example 7: Search for Similar Patterns
 */
async function example7_FindSimilarPatterns() {
  console.log('\n🔗 Example 7: Find Similar Code Patterns\n')
  console.log('='.repeat(60))

  const agent = new Agent({
    model: 'qwen3-coder-next:cloud',
    tools: [semanticSearchTool],
  })

  const response = await agent.query(`
    I'm looking for TypeScript patterns that handle:
    - Managing concurrent operations
    - Limiting parallel execution to 5 concurrent tasks
    - Queuing operations that exceed the limit
    
    Search for similar patterns and implementations.
  `)

  console.log(response.response)
}

/**
 * Example 8: Generate Tests from Code
 */
async function example8_GenerateTests() {
  console.log('\n✅ Example 8: Generate Tests from Code\n')
  console.log('='.repeat(60))

  const sourceCode = `
    export function calculateTotal(items: Array<{ quantity: number; price: number }>) {
      return items.reduce((sum, item) => sum + (item.quantity * item.price), 0)
    }
  `

  const agent = new Agent({
    model: 'qwen3-coder-next:cloud',
    tools: [],
  })

  const response = await agent.query(`
    Generate comprehensive test cases for this function:
    ${sourceCode}
    
    Include unit tests, edge cases, and error scenarios. Use Bun test syntax.
  `)

  console.log(response.response)
}

/**
 * Main runner
 */
async function main() {
  console.log('\n🎯 Phase 18: AI-Powered Features Examples\n')
  console.log('='.repeat(60))

  const examples = [
    { name: 'Code Generation', fn: example1_CodeGeneration },
    { name: 'Semantic Search', fn: example2_SemanticSearch },
    { name: 'Diagnostic Analysis', fn: example3_DiagnosticAnalysis },
    { name: 'Optimization Suggestions', fn: example4_OptimizationSuggestions },
    { name: 'Complete Workflow', fn: example5_CompleteWorkflow },
    { name: 'Security Analysis', fn: example6_SecurityAnalysis },
    { name: 'Find Similar Patterns', fn: example7_FindSimilarPatterns },
    { name: 'Generate Tests', fn: example8_GenerateTests },
  ]

  console.log('\nAvailable Examples:\n')
  examples.forEach((ex, i) => {
    console.log(`${i + 1}. ${ex.name}`)
  })

  // Run all examples
  for (const example of examples) {
    try {
      await example.fn()
    } catch (error) {
      console.error(`Error in ${example.name}:`, error)
    }
    console.log('\n')
  }

  console.log('✨ Phase 18 Examples Complete!\n')
}

// Run if executed directly
if (import.meta.main) {
  main().catch(console.error)
}
