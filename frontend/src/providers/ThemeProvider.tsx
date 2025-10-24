import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'

import { CssBaseline } from '@mui/material'
import {
  createTheme,
  ThemeProvider as MuiThemeProvider,
} from '@mui/material/styles'
import { ReactNode } from 'react'

import { colors, darkModeOverrides, lightModeOverrides } from '../lib/colors'
import { useModeStore } from '../store/theme'

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: colors.primary,
    secondary: colors.secondary,
    error: colors.error,
    warning: colors.warning,
    info: colors.info,
    success: colors.success,
    neutral: colors.neutral,
    grey: colors.neutral,
    background: {
      default: lightModeOverrides.background.body,
      paper: lightModeOverrides.background.surface,
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
})

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: colors.primary,
    secondary: colors.secondary,
    error: colors.error,
    warning: colors.warning,
    info: colors.info,
    success: colors.success,
    neutral: colors.neutral,
    grey: colors.neutral,
    background: {
      default: darkModeOverrides.background.body,
      paper: darkModeOverrides.background.level1,
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
})

function ThemeManager() {
  // MUI's ThemeProvider handles theme application directly
  return null
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { mode } = useModeStore()
  const theme = mode === 'dark' ? darkTheme : lightTheme

  return (
    <MuiThemeProvider theme={theme}>
      <ThemeManager />
      <CssBaseline enableColorScheme />
      {children}
    </MuiThemeProvider>
  )
}
