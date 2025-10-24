import { IconButton, Tooltip } from '@mui/material'
import * as React from 'react'
import { useEffect } from 'react'
import { MdDarkMode, MdLightMode } from 'react-icons/md'

import { useMode } from '../../hooks/useMode'

export default function ThemeToggle() {
  const { mode, setMode } = useMode()
  const [mounted, setMounted] = React.useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])
  if (!mounted) {
    return <IconButton size="small" disabled sx={{ color: 'neutral' }} />
  }

  return (
    <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
      <IconButton
        size="small"
        onClick={() => {
          setMode(mode === 'light' ? 'dark' : 'light')
        }}
        sx={[
          {
            backgroundColor: mode === 'light' ? '#2E4A7D' : '#ffd900a5',
            borderColor: mode === 'light' ? '#2E4A7D' : '#ffd900a5',
            color: mode === 'light' ? '#ffffff' : '#000000',
            '&:hover': {
              backgroundColor:
                mode === 'light' ? '#000080' : 'rgba(255, 237, 78, 0.69)',
              borderColor:
                mode === 'light' ? '#000080' : '#rgba(255, 237, 78, 0.69)',
            },
          },
          mode === 'dark'
            ? { '& > *:first-of-type': { display: 'none' } }
            : { '& > *:first-of-type': { display: 'initial' } },
          mode === 'light'
            ? { '& > *:last-of-type': { display: 'none' } }
            : { '& > *:last-of-type': { display: 'initial' } },
        ]}
      >
        <MdDarkMode data-testid="MdDarkMode" />
        <MdLightMode data-testid="MdLightMode" />
      </IconButton>
    </Tooltip>
  )
}
