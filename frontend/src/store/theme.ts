import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Zustand store for theme mode
type ThemeMode = {
  mode: 'light' | 'dark'
  setMode: (mode: 'light' | 'dark') => void
}
export const useModeStore = create<ThemeMode>()(
  persist(
    (set) => ({
      mode: 'light',
      setMode: (mode: 'light' | 'dark') => set({ mode }),
    }),
    {
      name: 'theme-storage',
    }
  )
)
