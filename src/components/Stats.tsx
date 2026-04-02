/**
 * Stats Dashboard
 *
 * Usage statistics with ASCII bar charts.
 * Based on Claude Code's Stats.tsx pattern.
 */

import React from 'react'
import { Box, Text } from 'ink'
import { Pane } from './design-system/Pane.js'
import { ProgressBar } from './design-system/ProgressBar.js'
import { Divider } from './design-system/Divider.js'
import { Tabs } from './design-system/Tabs.js'

export type StatEntry = {
  label: string
  value: number
  max?: number
  color?: string
  unit?: string
}

export type StatsData = {
  title: string
  entries: StatEntry[]
}

interface StatsProps {
  data: StatsData[]
  onClose?: () => void
}

function renderBarChart(entries: StatEntry[], maxWidth: number = 40): React.ReactNode {
  const maxVal = Math.max(...entries.map(e => e.value))

  return (
    <Box flexDirection="column">
      {entries.map((entry, i) => {
        const barWidth = Math.round((entry.value / maxVal) * maxWidth)
        const bar = '█'.repeat(barWidth)
        const displayVal = entry.unit ? `${entry.value}${entry.unit}` : `${entry.value}`

        return (
          <Box key={i} flexDirection="row">
            <Box width={20}>
              <Text>{entry.label}</Text>
            </Box>
            <Text color={(entry.color ?? 'cyan') as any}>{bar}</Text>
            <Text dimColor> {displayVal}</Text>
          </Box>
        )
      })}
    </Box>
  )
}

function renderStatTable(entries: StatEntry[]): React.ReactNode {
  return (
    <Box flexDirection="column">
      {entries.map((entry, i) => (
        <Box key={i} flexDirection="row">
          <Box width={25}>
            <Text>{entry.label}</Text>
          </Box>
          <ProgressBar
            value={entry.value}
            max={entry.max ?? 100}
            width={20}
            color={entry.color ?? 'cyan'}
            label={entry.unit ? `${entry.value}${entry.unit}` : `${entry.value}`}
          />
        </Box>
      ))}
    </Box>
  )
}

export const Stats: React.FC<StatsProps> = ({ data, onClose: _onClose }) => {
  const tabs = data.map((section) => ({
    label: section.title,
    content: (
      <Box flexDirection="column">
        {renderStatTable(section.entries)}
        <Box marginTop={1}>
          <Divider />
        </Box>
        <Box marginTop={1}>
          <Text bold>Chart:</Text>
        </Box>
        {renderBarChart(section.entries)}
      </Box>
    ),
  }))

  return (
    <Pane title="📊 Statistics" color="cyan">
      <Tabs tabs={tabs} />
    </Pane>
  )
}

/**
 * Simple stats display (non-tabbed).
 */
interface SimpleStatsProps {
  title?: string
  entries: StatEntry[]
  showChart?: boolean
}

export const SimpleStats: React.FC<SimpleStatsProps> = ({
  title,
  entries,
  showChart = false,
}) => {
  return (
    <Box flexDirection="column">
      {title && (
        <Box marginBottom={1}>
          <Text bold>{title}</Text>
        </Box>
      )}
      {renderStatTable(entries)}
      {showChart && (
        <Box marginTop={1} flexDirection="column">
          <Divider title="Chart" />
          {renderBarChart(entries)}
        </Box>
      )}
    </Box>
  )
}
