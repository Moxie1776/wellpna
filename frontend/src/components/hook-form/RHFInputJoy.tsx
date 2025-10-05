// RHFInputJoy.tsx
// React Hook Form Joy UI Input
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

export default function RHFInputJoy({
  label,
  name,
  type,
  helperText,
  ...other
}: Props) {
  const { control, formState } = useFormContext()

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        // Use error from formState if Controller doesn't provide it
        // If formState.errors[name] is an object, extract message
        const fieldError = error || formState.errors[name]
        let errorMessage = ''
        if (fieldError) {
          errorMessage =
            typeof fieldError === 'object' && 'message' in fieldError
              ? String(fieldError.message)
              : String(fieldError)
        }
        return (
          <FormControl error={!!fieldError}>
            {label && <FormLabel htmlFor={name}>{label}</FormLabel>}
            <Input
              {...field}
              type={type}
              error={!!fieldError}
              slotProps={{ input: { id: name, name } }}
              {...other}
            />
            <FormHelperText>
              {fieldError ? errorMessage : helperText}
            </FormHelperText>
          </FormControl>
        )
      }}
    />
  )
}
