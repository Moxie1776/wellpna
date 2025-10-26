import { Button, ButtonProps } from '@mui/material'
import { forwardRef } from 'react'
import { LiaSignInAltSolid } from 'react-icons/lia'

interface StandardButtonProps extends Omit<ButtonProps, 'variant'> {
  children?: React.ReactNode
}

export const StandardButton = forwardRef<
  HTMLButtonElement,
  StandardButtonProps
>(({ children, color, ...props }, ref) => {
  return (
    <Button
      ref={ref}
      variant="contained"
      color={color || 'primary'}
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
      <LiaSignInAltSolid style={{ marginRight: children ? 8 : 0 }} />
      {children || 'Submit'}
    </Button>
  )
})

StandardButton.displayName = 'StandardButton'
