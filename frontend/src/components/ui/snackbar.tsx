import Snackbar from '@mui/joy/Snackbar'
import * as React from 'react'

export type SnackbarColor = 'primary' | 'neutral' | 'warning' | 'danger'

export interface SnackbarMessage {
  message: string
  color: SnackbarColor
}

export const SnackbarContext = React.createContext<{
  showSnackbar: (msg: SnackbarMessage) => void
} | null>(null)

export function SnackbarProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  const [snackbar, setSnackbar] = React.useState<SnackbarMessage | null>(null)

  const showSnackbar = (msg: SnackbarMessage) => {
    setSnackbar(msg)
    setOpen(true)
  }

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      <Snackbar
        open={open}
        onClose={() => setOpen(false)}
        color={snackbar?.color || 'primary'}
        variant="soft"
        autoHideDuration={3000}
      >
        {snackbar?.message}
      </Snackbar>
    </SnackbarContext.Provider>
  )
}

export function useSnackbar() {
  const context = React.useContext(SnackbarContext)
  if (!context)
    throw new Error('useSnackbar must be used within a SnackbarProvider')
  return context
}
