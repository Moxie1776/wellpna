// Material UI
import { TextField, TextFieldProps } from '@mui/material'
import { Controller, useFormContext } from 'react-hook-form'

interface Props extends Omit<TextFieldProps, 'name'> {
  label?: string
  name: string
  helperText?: React.ReactNode
}

export default function HFInput(props: Props) {
  const {
    label,
    name,
    type,
    helperText,
    disabled,
    hidden,
    onChange,
    autoComplete,
    inputMode,
    placeholder,
    ...other
  } = props
  const { control } = useFormContext()
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          label={label}
          type={type}
          id={name}
          name={name}
          disabled={disabled}
          hidden={hidden}
          autoComplete={autoComplete}
          inputMode={inputMode}
          placeholder={placeholder}
          error={!!error}
          helperText={error ? error?.message : helperText}
          inputProps={{
            ...field,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
              field.onChange(e)
              if (onChange) onChange(e)
            },
          }}
          {...other}
        />
      )}
    />
  )
}
