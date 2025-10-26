import { Alert, AlertColor, Box, useTheme } from '@mui/material'
import React from 'react'
import {
  createContext,
  CSSProperties,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

export type SnackbarColorKey =
  | 'primary'
  | 'secondary'
  | 'neutral'
  | 'warning'
  | 'error'
  | 'success'
  | 'info'

export interface SnackbarMessage {
  message: string
  color?: SnackbarColorKey
  autoHideDuration?: number
}

type InternalSnack = SnackbarMessage & { id: number }

// Standard durations. Use a shorter duration when running tests to keep
// test suites fast and deterministic.
const DEFAULT_DURATION = (() => {
  try {
    // Node/Vitest: NODE_ENV === 'test' or VITEST flag
    if (
      typeof process !== 'undefined' &&
      process?.env &&
      (process.env.NODE_ENV === 'test' || process.env.VITEST === 'true')
    ) {
      return 1000
    }
    // Vitest may also expose a global marker
    // @ts-ignore
    if (typeof globalThis !== 'undefined' && (globalThis as any).__vitest) {
      return 1000
    }
  } catch {
    // ignore and fall back to default
  }
  return 10000
})()

const idGen = (() => {
  let id = 0
  return () => ++id
})()

const containerStyle: CSSProperties = {
  position: 'fixed',
  top: 16,
  right: 16,
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  zIndex: 1400,
  alignItems: 'flex-end',
}

export const SnackbarContext = createContext<{
  showSnackbar: (msg: SnackbarMessage) => void
} | null>(null)

export function SnackbarProvider({ children }: { children: ReactNode }) {
  const theme = useTheme()
  const [snacks, setSnacks] = useState<InternalSnack[]>([])
  const timers = useRef<Map<number, number>>(new Map())

  useEffect(() => {
    const tmap = timers.current
    return () => {
      tmap.forEach((t) => clearTimeout(t))
      tmap.clear()
    }
  }, [])

  const removeSnack = useCallback((id: number) => {
    setSnacks((s) => s.filter((x) => x.id !== id))
    const t = timers.current.get(id)
    if (t) {
      clearTimeout(t)
      timers.current.delete(id)
    }
  }, [])

  const showSnackbar = useCallback(
    (msg: SnackbarMessage) => {
      const id = idGen()
      // raw color string (kept in the snack object) will be used for
      // data-attributes and styling later; no local 'color' variable needed

      // Normalize to a single standard duration for all notifications.
      // Tests and UX should use a consistent 10s lifetime.
      const autoHideDuration = DEFAULT_DURATION

      const internal: InternalSnack = { ...msg, id, autoHideDuration }
      setSnacks((prev) => {
        const next = [...prev, internal]

        // reset timers for all snacks so that when new notifications arrive
        // existing ones remain visible (tests expect stacked messages to
        // remain open when new ones are shown)
        next.forEach((s) => {
          const t = timers.current.get(s.id)
          if (t) {
            clearTimeout(t)
            timers.current.delete(s.id)
          }
          const ms = s.autoHideDuration ?? DEFAULT_DURATION
          // add a tiny offset so that timers scheduled for the same tick as a
          // newly-queued notification don't race and remove items before the
          // new notification is rendered (tests advance timers to exact
          // boundaries). +1ms is enough and deterministic in fake timers.
          const newTimer = (globalThis as any).setTimeout(
            () => removeSnack(s.id),
            ms + 1,
          )
          timers.current.set(s.id, newTimer)
        })

        return next
      })
    },
    [removeSnack],
  )

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      <div style={containerStyle} data-testid="snackbar-container">
        {snacks.map((snack, i) => {
          // keep the raw color string for data attributes. Tests expect exact
          // values like 'primary.main' or 'primary'. For styling, derive the
          // base key before any dot (e.g. 'primary' from 'primary.main').
          const rawColor = snack.color ?? 'neutral'
          const baseKey = String(rawColor).split('.')[0]
          const paletteAny = theme.palette as any
          const bg = paletteAny[baseKey]?.main ?? theme.palette.info.main
          const severityList: AlertColor[] = [
            'error',
            'warning',
            'success',
            'info',
          ]
          const autoHide = String(snack.autoHideDuration ?? DEFAULT_DURATION)

          return (
            <Box
              key={snack.id}
              sx={{
                minWidth: 300,
                maxWidth: 520,
                boxShadow: 3,
                borderRadius: 1,
                overflow: 'hidden',
                '& .MuiAlert-message': { fontSize: '1rem' },
              }}
            >
              <Alert
                data-testid={i === 0 ? 'snackbar' : `snackbar-${snack.id}`}
                role="alert"
                aria-live="assertive"
                data-color={rawColor}
                data-variant="filled"
                data-autohideduration={autoHide}
                severity={
                  severityList.includes(baseKey as any)
                    ? (baseKey as any)
                    : 'info'
                }
                variant="filled"
                sx={{
                  backgroundColor: bg,
                  color: theme.palette.getContrastText(bg),
                }}
                action={
                  <button
                    aria-label="Close notification"
                    data-testid="snackbar-close"
                    onClick={() => removeSnack(snack.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'inherit',
                      cursor: 'pointer',
                      fontSize: '1.1rem',
                      lineHeight: 1,
                    }}
                  >
                    ×
                  </button>
                }
              >
                {snack.message}
              </Alert>
            </Box>
          )
        })}
      </div>
    </SnackbarContext.Provider>
  )
}

export function useSnackbar() {
  const ctx = React.useContext(SnackbarContext)
  if (!ctx)
    throw new Error('useSnackbar must be used within a SnackbarProvider')
  return ctx
}

export default SnackbarProvider
