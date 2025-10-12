import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Zustand store for theme mode
type ThemeMode = {
  mode: 'light' | 'dark' | 'system'
  setMode: (mode: 'light' | 'dark' | 'system') => void
}
export const useModeStore = create<ThemeMode>()(
  persist(
    (set) => ({
      mode: 'light',
      setMode: (mode: 'light' | 'dark' | 'system') => set({ mode }),
    }),
    {
      name: 'theme-storage',
    },
  ),
)
