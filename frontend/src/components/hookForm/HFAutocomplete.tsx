// Material UI
import { Autocomplete } from '@mui/material'
import { AutocompleteProps } from '@mui/material'
import { TextField } from '@mui/material'
import { Controller, useFormContext } from 'react-hook-form'

interface Props<
  T,
  Multiple extends boolean | undefined,
  DisableClearable extends boolean | undefined,
  FreeSolo extends boolean | undefined,
> extends AutocompleteProps<T, Multiple, DisableClearable, FreeSolo> {
  name: string
  label?: string
  helperText?: React.ReactNode
}

export default function HFAutocomplete<
  T,
  Multiple extends boolean | undefined,
  DisableClearable extends boolean | undefined,
  FreeSolo extends boolean | undefined,
>({
  name,
  label,
  helperText,
  ...other
}: Omit<Props<T, Multiple, DisableClearable, FreeSolo>, 'renderInput'>) {
  const { control, setValue } = useFormContext()

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <Autocomplete
          value={field.value}
          onChange={(_, newValue) =>
            setValue(name, newValue, { shouldValidate: true })
          }
          renderInput={(params) => (
            <TextField
              {...params}
              {...field}
              label={label}
              error={!!error}
              helperText={error ? error?.message : helperText}
            />
          )}
          {...other}
        />
      )}
    />
  )
}
