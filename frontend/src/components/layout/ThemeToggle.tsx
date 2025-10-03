import { IconButton } from '@mui/joy'
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
    <IconButton
      size="sm"
      variant="outlined"
      color="neutral"
      onClick={() => {
        setMode(mode === 'light' ? 'dark' : 'light')
      }}
      sx={[
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
  )
}
