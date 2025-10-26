import { Button, ButtonProps } from '@mui/material'
import { forwardRef } from 'react'
import { GrPowerReset } from 'react-icons/gr'

interface ResetButtonProps extends Omit<ButtonProps, 'variant' | 'color'> {
  children?: React.ReactNode
}

export const ResetButton = forwardRef<HTMLButtonElement, ResetButtonProps>(
  ({ children, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant="contained"
        color="secondary"
        sx={{
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 2,
          boxShadow: 6,
          minWidth: 120,
          ...props.sx,
        }}
        {...props}
      >
        <GrPowerReset style={{ marginRight: children ? 8 : 0 }} />
        {children || 'Reset'}
      </Button>
    )
  },
)

ResetButton.displayName = 'ResetButton'
