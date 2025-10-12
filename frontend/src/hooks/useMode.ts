import { useModeStore } from '../store/theme'

// Custom hook to manage theme mode with Zustand store
export function useMode() {
  const { mode, setMode } = useModeStore()

  return {
    mode,
    setMode,
  }
}
