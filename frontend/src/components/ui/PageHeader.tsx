import { SxProps, Theme, Typography } from '@mui/material'

import { useMode } from '../../hooks/useMode'

interface PageHeaderProps {
  children: React.ReactNode
  sx?: SxProps<Theme>
}

export const PageHeader = ({ children, sx }: PageHeaderProps) => {
  const { mode } = useMode()

  return (
    <Typography
      variant="h3"
      color={mode === 'dark' ? 'primary.light' : 'primary.main'}
      sx={{ mb: 3, ...sx }}
    >
      {children}
    </Typography>
  )
}
