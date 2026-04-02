/**
 * SawCode Components Library
 *
 * UI component library based on Claude Code's design system.
 * Provides reusable terminal UI components built on React/Ink.
 *
 * Usage:
 *   import { Pane, Dialog, Tabs, ThemeProvider, ProgressBar } from './components/index.js'
 */

// Design System
export {
  ThemeProvider,
  useTheme,
  useThemeColors,
  THEMES,
  Pane,
  Dialog,
  Tabs,
  ListItem,
  ProgressBar,
  Divider,
  StatusIcon,
  getStatusIcon,
  getStatusColor,
  Byline,
  KeyboardShortcutHint,
} from './design-system/index.js'

export type {
  ThemeName,
  ThemeColors,
  StatusType,
} from './design-system/index.js'

// Permissions
export {
  PermissionRequest,
  checkPermission,
} from './permissions/index.js'

export type {
  PermissionBehavior,
  ToolPermissionContext,
} from './permissions/index.js'

// Spinner Enhancements
export {
  ShimmerChar,
  GlimmerMessage,
  SpinnerGlyph,
} from './spinner/index.js'

export type { SpinnerStyle } from './spinner/index.js'

// Stats
export {
  Stats,
  SimpleStats,
} from './Stats.js'

export type {
  StatEntry,
  StatsData,
} from './Stats.js'
