// Joy UI
import { Autocomplete } from '@mui/joy'
import { AutocompleteProps } from '@mui/joy'
import { FormLabel } from '@mui/joy'
import { FormHelperText } from '@mui/joy'
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
          startDecorator={label ? <FormLabel>{label}</FormLabel> : null}
          endDecorator={
            <FormHelperText color={error ? 'danger' : undefined}>
              {error ? error?.message : helperText}
            </FormHelperText>
          }
          error={!!error}
          {...other}
          sx={{ mb: 1, ml: 1, mt: 1, mr: -1 }}
        />
      )}
    />
  )
}
