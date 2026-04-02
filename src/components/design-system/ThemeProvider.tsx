/**
 * Design System - Theme Provider
 *
 * Centralized theme management with context.
 * Supports light/dark/auto modes with theme preview.
 */

import React, { createContext, useContext, useState, useCallback } from 'react'

export type ThemeName = 'auto' | 'light' | 'dark' | 'high-contrast'

export type ThemeColors = {
  primary: string
  secondary: string
  success: string
  warning: string
  error: string
  info: string
  muted: string
  accent: string
  background: string
  foreground: string
  border: string
}

const THEMES: Record<ThemeName, ThemeColors> = {
  auto: {
    primary: 'cyan',
    secondary: 'gray',
    success: 'green',
    warning: 'yellow',
    error: 'red',
    info: 'blue',
    muted: 'gray',
    accent: 'magenta',
    background: 'black',
    foreground: 'white',
    border: 'gray',
  },
  light: {
    primary: 'blue',
    secondary: 'gray',
    success: 'green',
    warning: 'yellow',
    error: 'red',
    info: 'cyan',
    muted: 'gray',
    accent: 'magenta',
    background: 'white',
    foreground: 'black',
    border: 'gray',
  },
  dark: {
    primary: 'cyan',
    secondary: 'gray',
    success: 'green',
    warning: 'yellow',
    error: 'red',
    info: 'blue',
    muted: 'gray',
    accent: 'magenta',
    background: 'black',
    foreground: 'white',
    border: 'gray',
  },
  'high-contrast': {
    primary: 'white',
    secondary: 'gray',
    success: 'green',
    warning: 'yellow',
    error: 'red',
    info: 'cyan',
    muted: 'gray',
    accent: 'magenta',
    background: 'black',
    foreground: 'white',
    border: 'white',
  },
}

interface ThemeContextValue {
  theme: ThemeName
  colors: ThemeColors
  setTheme: (theme: ThemeName) => void
  previewTheme: (theme: ThemeName) => void
  cancelPreview: () => void
  savePreview: () => void
  isPreviewing: boolean
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'auto',
  colors: THEMES.auto,
  setTheme: () => {},
  previewTheme: () => {},
  cancelPreview: () => {},
  savePreview: () => {},
  isPreviewing: false,
})

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext)
}

export function useThemeColors(): ThemeColors {
  return useContext(ThemeContext).colors
}

interface ThemeProviderProps {
  children: React.ReactNode
  initialTheme?: ThemeName
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  initialTheme = 'auto',
}) => {
  const [theme, setTheme] = useState<ThemeName>(initialTheme)
  const [previewTheme, setPreviewTheme] = useState<ThemeName | null>(null)

  const activeTheme = previewTheme ?? theme
  const colors = THEMES[activeTheme] ?? THEMES.auto

  const handlePreviewTheme = useCallback((t: ThemeName) => {
    setPreviewTheme(t)
  }, [])

  const handleCancelPreview = useCallback(() => {
    setPreviewTheme(null)
  }, [])

  const handleSavePreview = useCallback(() => {
    if (previewTheme) {
      setTheme(previewTheme)
      setPreviewTheme(null)
    }
  }, [previewTheme])

  return (
    <ThemeContext.Provider
      value={{
        theme,
        colors,
        setTheme,
        previewTheme: handlePreviewTheme,
        cancelPreview: handleCancelPreview,
        savePreview: handleSavePreview,
        isPreviewing: previewTheme !== null,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export { THEMES }
