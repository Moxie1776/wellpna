// RHFInputJoyPassword.tsx
// React Hook Form Joy UI Input for password fields
import {
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  InputProps,
} from '@mui/joy'
import React from 'react'
import { Controller, useFormContext } from 'react-hook-form'

interface Props extends InputProps {
  label?: string
  name: string
  helperText?: React.ReactNode
}

export default function RHFInputJoyPassword({
  label,
  name,
  type = 'password',
  helperText,
  ...other
}: Props) {
  const { control } = useFormContext()

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <FormControl error={!!error}>
          {label && <FormLabel htmlFor={name}>{label}</FormLabel>}
          <Input
            {...field}
            type={type}
            error={!!error}
            slotProps={{ input: { id: name, name } }}
            {...other}
          />
          {(!!error || helperText) && (
            <FormHelperText>
              {error ? error.message : helperText}
            </FormHelperText>
          )}
        </FormControl>
      )}
    />
  )
}
