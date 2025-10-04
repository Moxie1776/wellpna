import { IconButton, Tooltip } from '@mui/joy'
import * as React from 'react'
import { MdDarkMode, MdLightMode } from 'react-icons/md'

import { useMode } from '../../hooks/useMode'

export default function ThemeToggle() {
  const { mode, setMode } = useMode()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])
  if (!mounted) {
    return <IconButton size="sm" variant="outlined" color="neutral" disabled />
  }

  return (
    <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
      <IconButton
        size="sm"
        variant="outlined"
        color="neutral"
        onClick={() => {
          setMode(mode === 'light' ? 'dark' : 'light')
        }}
        sx={[
          {
            backgroundColor: mode === 'light' ? '#2E4A7D' : '#FFD700',
            borderColor: mode === 'light' ? '#2E4A7D' : '#FFD700',
            color: mode === 'light' ? '#ffffff' : '#000000',
            '&:hover': {
              backgroundColor: mode === 'light' ? '#000080' : '#FFED4E',
              borderColor: mode === 'light' ? '#000080' : '#FFED4E',
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
        <MdDarkMode />
        <MdLightMode />
      </IconButton>
    </Tooltip>
  )
}
