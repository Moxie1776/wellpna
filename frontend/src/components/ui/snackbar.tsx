// auto-sort-ignore-next
import Snackbar from '@mui/joy/Snackbar'
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

  // Extract base color and shade
  const colorValue = snackbar?.color || 'neutral'
  const [baseColor, shade] = colorValue.split('.')
  const sxProps = shade
    ? {
        backgroundColor: `var(--joy-palette-${baseColor}-${shade})`,
      }
    : {}

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      <Snackbar
        open={open}
        onClose={() => setOpen(false)}
        color={baseColor as any}
        variant="soft"
        autoHideDuration={snackbar?.autoHideDuration ?? 10000}
        data-testid="snackbar"
        data-color={colorValue}
        data-variant="soft"
        data-autohideduration={String(snackbar?.autoHideDuration ?? 10000)}
        role="alert"
        aria-live="assertive"
        sx={sxProps}
        endDecorator={
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
        <span>{snackbar?.message ?? ''}</span>
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
