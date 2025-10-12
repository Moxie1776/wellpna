// Joy UI
import { FormHelperText, FormLabel, Input, InputProps } from '@mui/joy'
import { Controller, useFormContext } from 'react-hook-form'

interface Props extends InputProps {
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
        <>
          {label && <FormLabel htmlFor={name}>{label}</FormLabel>}
          <Input
            // Spread field props on the root as a defensive measure
            {...(field as any)}
            type={type}
            id={name}
            name={name}
            disabled={disabled}
            hidden={hidden}
            // Pass the controlled input props directly to inner input element
            slotProps={{
              input: {
                id: name,
                name,
                ref: field.ref,
                value: field.value ?? '',
                autoComplete: autoComplete,
                inputMode: inputMode,
                placeholder: placeholder,
                onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                  field.onChange(e)
                  if (onChange) onChange(e)
                },
              },
            }}
            {...other}
          />
          {(!!error || helperText) && (
            <FormHelperText sx={{ mx: 0 }} color={error ? 'danger' : undefined}>
              {error ? error?.message : helperText}
            </FormHelperText>
          )}
        </>
      )}
    />
  )
}
