import { useColorScheme } from '@mui/joy/styles'
import * as React from 'react'

import { useModeStore } from '../store/theme'

// Custom hook to sync Joy UI color scheme with Zustand and expose palette
export function useMode() {
  const { mode: joyMode, setMode: setJoyMode } = useColorScheme()
  const { mode, setMode } = useModeStore()

  // Sync Zustand store with Joy UI mode
  React.useEffect(() => {
    // Joy UI mode can be 'light', 'dark', or 'system'. Map 'system' to 'light'.
    setMode(joyMode === 'dark' ? 'dark' : 'light')
  }, [joyMode, setMode])

  return {
    mode,
    setMode: setJoyMode,
  }
}
