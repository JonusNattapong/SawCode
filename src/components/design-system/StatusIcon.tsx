/**
 * Design System - StatusIcon
 *
 * Status indicator icons for terminal display.
 */

import React from 'react'
import { Text } from 'ink'

export type StatusType = 'success' | 'error' | 'warning' | 'info' | 'loading' | 'pending' | 'neutral'

interface StatusIconProps {
  status: StatusType
  label?: string
}

const STATUS_CONFIG: Record<StatusType, { icon: string; color: string }> = {
  success: { icon: '✓', color: 'green' },
  error: { icon: '✗', color: 'red' },
  warning: { icon: '⚠', color: 'yellow' },
  info: { icon: 'ℹ', color: 'blue' },
  loading: { icon: '⠋', color: 'cyan' },
  pending: { icon: '○', color: 'gray' },
  neutral: { icon: '·', color: 'gray' },
}

export const StatusIcon: React.FC<StatusIconProps> = ({ status, label }) => {
  const config = STATUS_CONFIG[status]

  return (
    <Text>
      <Text color={config.color as any}>{config.icon}</Text>
      {label && <Text> {label}</Text>}
    </Text>
  )
}

export function getStatusIcon(status: StatusType): string {
  return STATUS_CONFIG[status].icon
}

export function getStatusColor(status: StatusType): string {
  return STATUS_CONFIG[status].color
}
