import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'

import { CssVarsProvider, extendTheme } from '@mui/joy/styles'

import { colors, darkModeOverrides } from '../lib/colors'
import { useModeStore } from '../store/theme'

export const theme = extendTheme({
  colorSchemes: {
    light: { palette: colors },
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

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { mode } = useModeStore()
  return (
    <CssVarsProvider theme={theme} {...({ mode } as any)}>
      {children}
    </CssVarsProvider>
  )
}
