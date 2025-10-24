import { Alert, Snackbar } from '@mui/material'
import * as React from 'react'

import logger from '../../utils/logger'

export type SnackbarColor =
  | 'primary'
  | 'primary.main'
  | 'secondary'
  | 'secondary.main'
  | 'neutral'
  | 'neutral.main'
  | 'warning'
  | 'warning.main'
  | 'danger'
  | 'danger.main'
  | 'success'
  | 'success.main'
  | 'info'
  | 'info.main'

export interface SnackbarMessage {
  message: string
  color: SnackbarColor
  autoHideDuration?: number
}

const getSeverity = (
  color: SnackbarColor,
): 'error' | 'warning' | 'success' | 'info' | 'neutral' => {
  const base = color.split('.')[0] as string
  switch (base) {
    case 'danger':
      return 'error'
    case 'warning':
      return 'warning'
    case 'success':
      return 'success'
    case 'info':
      return 'info'
    case 'neutral':
      return 'info'
    default:
      return 'info'
  }
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
    // Log danger messages
    if (msg.color === 'danger' || msg.color === 'danger.main') {
      logger.error(`Snackbar: ${msg.message}`)
    }
  }

  const colorValue = snackbar?.color || 'neutral'

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      <Snackbar
        open={open}
        onClose={() => setOpen(false)}
        autoHideDuration={snackbar?.autoHideDuration ?? 10000}
        data-testid="snackbar"
        data-color={colorValue}
        data-variant="filled"
        data-autohideduration={String(snackbar?.autoHideDuration ?? 10000)}
        role="alert"
        aria-live="assertive"
      >
        <Alert
          severity={getSeverity(colorValue)}
          variant="filled"
          action={
            <button
              data-testid="snackbar-close"
              aria-label="Close notification"
              onClick={() => setOpen(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              ×
            </button>
          }
        >
          {snackbar?.message ?? ''}
        </Alert>
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
