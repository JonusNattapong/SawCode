/**
 * Design System - Tabs
 *
 * Tabbed interface with keyboard navigation.
 * Supports arrow key navigation and controlled/uncontrolled modes.
 */

import React, { useState, useCallback } from 'react'
import { Box, Text, useInput } from 'ink'
import { useThemeColors } from './ThemeProvider.js'

interface TabItem {
  label: string
  content: React.ReactNode
}

interface TabsProps {
  tabs: TabItem[]
  defaultTab?: number
  selectedTab?: number
  onTabChange?: (index: number) => void
  color?: string
  title?: string
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultTab = 0,
  selectedTab,
  onTabChange,
  color,
  title,
}) => {
  const colors = useThemeColors()
  const accentColor = color ?? colors.primary
  const [internalTab, setInternalTab] = useState(defaultTab)

  const activeTab = selectedTab ?? internalTab

  const handleTabChange = useCallback(
    (index: number) => {
      if (onTabChange) {
        onTabChange(index)
      } else {
        setInternalTab(index)
      }
    },
    [onTabChange],
  )

  useInput(
    useCallback(
      (input, key) => {
        if (key.leftArrow || input === 'h') {
          handleTabChange(Math.max(0, activeTab - 1))
        }
        if (key.rightArrow || input === 'l') {
          handleTabChange(Math.min(tabs.length - 1, activeTab + 1))
        }
        // Number keys for quick switching
        const num = parseInt(input)
        if (num >= 1 && num <= tabs.length) {
          handleTabChange(num - 1)
        }
      },
      [activeTab, tabs.length, handleTabChange],
    ),
  )

  return (
    <Box flexDirection="column" width="100%">
      {title && (
        <Box marginBottom={1}>
          <Text bold>{title}</Text>
        </Box>
      )}

      {/* Tab bar */}
      <Box flexDirection="row" gap={1}>
        {tabs.map((tab, i) => (
          <Text
            key={i}
            bold={i === activeTab}
            color={i === activeTab ? (accentColor as any) : 'gray'}
            inverse={i === activeTab}
          >
            {i === activeTab ? ` ${tab.label} ` : ` ${tab.label} `}
          </Text>
        ))}
      </Box>

      {/* Tab content */}
      <Box flexDirection="column" marginTop={1} paddingX={1}>
        {tabs[activeTab]?.content}
      </Box>

      {/* Navigation hint */}
      <Box marginTop={1}>
        <Text dimColor>
          ← → to switch tabs · {tabs.map((_, i) => `${i + 1}`).join('/')} for quick switch
        </Text>
      </Box>
    </Box>
  )
}
