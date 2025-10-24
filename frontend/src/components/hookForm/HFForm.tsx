import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import FormLabel from '@mui/material/FormLabel'

export { FormControl, FormHelperText, FormLabel }

export const Form = (props: React.FormHTMLAttributes<HTMLFormElement>) => {
  const {
    children,
    action,
    method,
    target,
    autoComplete,
    encType,
    name,
    noValidate,
    onSubmit,
    onReset,
    className,
    style,
    id,
    role = 'form', // Default role to 'form' unless overridden
  } = props

  const allowedProps: React.FormHTMLAttributes<HTMLFormElement> = {
    action,
    method,
    target,
    autoComplete,
    encType,
    name,
    noValidate,
    onSubmit,
    onReset,
    className,
    style,
    id,
    role,
  }

  return (
    <form data-testid="form" {...allowedProps}>
      {children}
    </form>
  )
}

export const FormField = ({
  label,
  inputId,
  error,
  children,
  ...rest
}: {
  label: string
  inputId: string
  error?: boolean
  children: React.ReactNode
  [key: string]: unknown
}) => (
  <FormControl data-testid="form-control" error={error} {...rest}>
    <FormLabel data-testid="form-label" htmlFor={inputId}>
      {label}
    </FormLabel>
    {children}
  </FormControl>
)

export const FormItem = ({
  children,
  ...rest
}: {
  children: React.ReactNode
  [key: string]: unknown
}) => <div {...rest}>{children}</div>

export const FormMessage = ({
  children,
  ...rest
}: {
  children: React.ReactNode
  [key: string]: unknown
}) => (
  <FormHelperText data-testid="form-helper-text" {...rest}>
    {children}
  </FormHelperText>
)
