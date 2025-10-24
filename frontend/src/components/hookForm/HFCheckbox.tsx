// Material UI
import {
  Box,
  Checkbox,
  FormControl,
  FormHelperText,
  FormLabel,
  Stack,
} from '@mui/material'
import { Controller, useFormContext } from 'react-hook-form'

interface HFCheckboxProps {
  name: string
  label?: string
  helperText?: React.ReactNode
}

export function HFCheckbox({
  name,
  label,
  helperText,
  ...other
}: HFCheckboxProps) {
  const { control } = useFormContext()

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <FormControl>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Checkbox {...field} checked={field.value} {...other} />
            {label && <FormLabel>{label}</FormLabel>}
          </Stack>
          {(!!error || helperText) && (
            <FormHelperText error={!!error}>
              {error ? error?.message : helperText}
            </FormHelperText>
          )}
        </FormControl>
      )}
    />
  )
}

interface HFMultiCheckboxProps {
  name: string
  options: { label: string; value: any }[]
  row?: boolean
  label?: string
  spacing?: number
  helperText?: React.ReactNode
}

export function HFMultiCheckbox({
  row,
  name,
  label,
  options,
  spacing,
  helperText,
  ...other
}: HFMultiCheckboxProps) {
  const { control } = useFormContext()

  const getSelected = (selectedItems: string[] | undefined, item: string) => {
    const items = selectedItems || []
    return items.includes(item)
      ? items.filter((value) => value !== item)
      : [...items, item]
  }

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <FormControl>
          {label && <FormLabel>{label}</FormLabel>}
          <Stack direction={row ? 'row' : 'column'} spacing={spacing || 1}>
            {options.map((option) => (
              <Box key={option.value} display="flex" alignItems="center">
                <Checkbox
                  checked={(field.value || []).includes(option.value)}
                  onChange={() =>
                    field.onChange(getSelected(field.value, option.value))
                  }
                  {...other}
                />
                <FormLabel>{option.label}</FormLabel>
              </Box>
            ))}
          </Stack>
          {(!!error || helperText) && (
            <FormHelperText error={!!error} sx={{ mx: 0 }}>
              {error ? error?.message : helperText}
            </FormHelperText>
          )}
        </FormControl>
      )}
    />
  )
}
