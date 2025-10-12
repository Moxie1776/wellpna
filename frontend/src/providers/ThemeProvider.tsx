import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'

import { CssBaseline } from '@mui/joy'
import { CssVarsProvider, extendTheme, useColorScheme } from '@mui/joy/styles'
import * as React from 'react'

import { colors, darkModeOverrides, lightModeOverrides } from '../lib/colors'
import { useModeStore } from '../store/theme'

export const theme = extendTheme({
  colorSchemes: {
    light: {
      palette: {
        ...colors,
        ...lightModeOverrides,
      },
    },
    dark: {
      palette: {
        ...colors,
        ...darkModeOverrides,
      },
    },
  },
  fontFamily: {
    display: 'Roboto, sans-serif',
    body: 'Roboto, sans-serif',
  },
})

function ThemeSetter() {
  const { mode } = useModeStore()
  const { setMode: setJoyMode } = useColorScheme()

  React.useEffect(() => {
    setJoyMode(mode)
  }, [mode, setJoyMode])

  return null
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <CssVarsProvider theme={theme}>
      <ThemeSetter />
      <CssBaseline />
      {children}
    </CssVarsProvider>
  )
}
