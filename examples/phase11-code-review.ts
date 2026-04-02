#!/usr/bin/env bun

/**
 * Phase 11: Code Review - Automated code analysis, suggestions, and compliance checking
 * 
 * This example demonstrates all Phase 11 capabilities:
 * - Code Review: Security and quality issue detection
 * - Suggestion Engine: Refactoring and best practice recommendations
 * - Compliance Checker: Code standards validation and scoring
 */

import { Agent } from '../src/index.js'
import { codeReviewerTool, suggestionEngineTool, complianceCheckerTool } from '../src/index.js'

// Example 1: Basic code review with security and quality checks
async function example1_SecurityAndQualityReview() {
  console.log('\n=== Example 1: Security & Quality Review ===\n')

  const agent = new Agent({ name: 'code-reviewer' })
  agent.addTool(codeReviewerTool)

  const problematicCode = `
function processUserData(id: string, sql: string) {
  // TODO: Add validation
  const query = "SELECT * FROM users WHERE id = '" + id + "'"
  eval("var result = " + sql)
  console.log(result)
  const apiKey = "sk-1234567890abcdef"
  return result
}
`

  const result = await agent.query(
    `Review this code for security and quality issues:\n\`\`\`typescript\n${problematicCode}\n\`\`\``
  )

  console.log('Review Result:', result.response)
}

// Example 2: Detailed code review with severity breakdown
async function example2_SeverityAnalysis() {
  console.log('\n=== Example 2: Severity Analysis ===\n')

  const agent = new Agent({ name: 'severity-checker' })
  agent.addTool(codeReviewerTool)

  const vulnerableCode = `
function authenticateUser(password: string) {
  if (password === "admin123") {
    eval("console.log('authenticated')")
    return true
  }
  console.log("Debug: checking password")
  // TODO: implement 2FA
  return false
}
`

  const result = await agent.query(
    `Analyze this code and categorize issues by severity:\n\`\`\`typescript\n${vulnerableCode}\n\`\`\``
  )

  console.log('Severity Analysis:', result.response)
}

// Example 3: Generating refactoring suggestions
async function example3_RefactoringSuggestions() {
  console.log('\n=== Example 3: Refactoring Suggestions ===\n')

  const agent = new Agent({ name: 'refactoring-engine' })
  agent.addTool(suggestionEngineTool)

  const improvableCode = `
function calculateTotal(items: any) {
  let total = 0
  for (let i = 0; i < items.length; i++) {
    total = total + items[i].price
  }
  return total
}

function findUser(users: any, id: string) {
  let found = null
  for (let i = 0; i < users.length; i++) {
    if (users[i].id === id) {
      found = users[i]
    }
  }
  if (found === null) {
    return null
  }
  return found
}
`

  const result = await agent.query(
    `Suggest refactoring improvements for this code:\n\`\`\`typescript\n${improvableCode}\n\`\`\``
  )

  console.log('Refactoring Suggestions:', result.response)
}

// Example 4: Best practices and modernization
async function example4_BestPractices() {
  console.log('\n=== Example 4: Best Practices ===\n')

  const agent = new Agent({ name: 'best-practices' })
  agent.addTool(suggestionEngineTool)

  const outdatedCode = `
export function handleRequest(data) {
  try {
    const result = processData(data)
    return result
  } catch (e) {
    console.error(e)
  }
}

function validateInput(email, age, name) {
  if (!email || !age || !name) return false
  return true
}

interface User {
  id: string
  name: string
  email: string
  phone: string
  address: string
}
`

  const result = await agent.query(
    `Identify best practice improvements and modernization opportunities:\n\`\`\`typescript\n${outdatedCode}\n\`\`\``
  )

  console.log('Best Practices:', result.response)
}

// Example 5: Compliance checking with scoring
async function example5_ComplianceScoring() {
  console.log('\n=== Example 5: Compliance Scoring ===\n')

  const agent = new Agent({ name: 'compliance-checker' })
  agent.addTool(complianceCheckerTool)

  const mixedCode = `
import fs from 'fs'
import path from 'path'
import { someRemoteLib } from 'external-api'

const API_KEY = process.env.API_KEY
const tempCache = {}

function ProcessUserRequest(request: any) {
  const userData = request.data
  return userData
}

function calculateMetrics(data: any, config: any): any {
  let result = {}
  const unused = "never used"
  result.total = 0
  result.count = 0
  // Calculate metrics...
  return result
}

export { ProcessUserRequest }
`

  const result = await agent.query(
    `Check compliance and generate a compliance score for this code:\n\`\`\`typescript\n${mixedCode}\n\`\`\``
  )

  console.log('Compliance Report:', result.response)
}

// Example 6: Strict compliance checking
async function example6_StrictCompliance() {
  console.log('\n=== Example 6: Strict Compliance Mode ===\n')

  const agent = new Agent({ name: 'strict-checker' })
  agent.addTool(complianceCheckerTool)

  const codeToValidate = `
import * as crypto from 'crypto'

let globalState = null

function DoSomething(value) {
  return value * 2
}

class myUtilClass {
  my_internal_var = 0

  processData(input: any) {
    for (let x = 0; x < input.length; x++) {
      globalState = x
    }
  }
}

export const util = new myUtilClass()
`

  const result = await agent.query(
    `Run strict compliance check with all violations reported:\n\`\`\`typescript\n${codeToValidate}\n\`\`\``
  )

  console.log('Strict Compliance:', result.response)
}

// Example 7: End-to-end review workflow
async function example7_FullReviewWorkflow() {
  console.log('\n=== Example 7: Full Review Workflow ===\n')

  const agent = new Agent({ name: 'full-reviewer' })
  agent.addTool(codeReviewerTool)
  agent.addTool(suggestionEngineTool)
  agent.addTool(complianceCheckerTool)

  const productionCode = `
function handlePayment(amount: string, cardDetails: any) {
  if (eval("amount > 0")) {
    const query = "INSERT INTO payments VALUES ('" + cardDetails.number + "')"
    // TODO: Add fraud detection
    console.log("Processing:", cardDetails)
    return true
  }
  return false
}

interface PaymentProcessor {
  processPayment: (amount: any, card: any) => any
}

function run(processor: PaymentProcessor) {
  const result = processor.processPayment("100.00", {number: "1234567890"})
  console.error("Payment result:", result)
  return result
}
`

  const result = await agent.query(
    `Perform a complete code review including security checks, suggestions, and compliance scoring:\n\`\`\`typescript\n${productionCode}\n\`\`\``
  )

  console.log('Full Review Workflow:', result.response)
}

// Example 8: Configuration-based compliance checking
async function example8_ConfigurableCompliance() {
  console.log('\n=== Example 8: Configurable Compliance ===\n')

  const agent = new Agent({ name: 'configurable-checker' })
  agent.addTool(complianceCheckerTool)

  const dynamicCode = `
import { helper_func } from './helpers'

export function MyService(data) {
  const unused_var = "temp"
  const result = helper_func(data)
  // TODO: Handle edge cases
  return result
}
`

  const result = await agent.query(
    `Check compliance in relaxed mode (fewer strict rules):\n\`\`\`typescript\n${dynamicCode}\n\`\`\``
  )

  console.log('Configurable Compliance:', result.response)
}

// Main execution
async function main() {
  console.log('📋 Phase 11: Code Review Examples')
  console.log('='.repeat(50))

  try {
    await example1_SecurityAndQualityReview()
    await example2_SeverityAnalysis()
    await example3_RefactoringSuggestions()
    await example4_BestPractices()
    await example5_ComplianceScoring()
    await example6_StrictCompliance()
    await example7_FullReviewWorkflow()
    await example8_ConfigurableCompliance()

    console.log('\n' + '='.repeat(50))
    console.log('✅ All Phase 11 examples completed!')
  } catch (error) {
    console.error('Error running examples:', error)
    process.exit(1)
  }
}

main()
