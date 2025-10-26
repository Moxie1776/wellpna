// Material UI
import { TextField, TextFieldProps } from '@mui/material'
import { ChangeEvent } from 'react'
import { Controller, useFormContext } from 'react-hook-form'

import { FormField, FormItem, FormMessage } from './HFForm'

interface Props extends Omit<TextFieldProps, 'name'> {
  label: string
  inputId: string
  name: string
}

export default function HFTextField(props: Props) {
  const {
    label,
    inputId,
    name,
    type,
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
      render={({ field, fieldState }) => (
        <FormItem>
          <FormField label={label} inputId={inputId} error={!!fieldState.error}>
            <TextField
              {...field}
              type={type}
              id={inputId}
              name={name}
              variant="filled"
              size="small"
              fullWidth
              error={!!fieldState.error}
              disabled={disabled}
              hidden={hidden}
              autoComplete={autoComplete}
              inputMode={inputMode}
              placeholder={placeholder}
              slotProps={{
                htmlInput: {
                  ...field,
                  onChange: (e: ChangeEvent<HTMLInputElement>) => {
                    field.onChange(e)
                    if (onChange) onChange(e)
                  },
                },
              }}
              {...other}
            />
            {fieldState.error && (
              <FormMessage>{fieldState.error.message}</FormMessage>
            )}
          </FormField>
        </FormItem>
      )}
    />
  )
}
