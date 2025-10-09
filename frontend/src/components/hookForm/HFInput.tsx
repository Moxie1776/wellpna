// Joy UI
import { FormHelperText, FormLabel, Input, InputProps } from '@mui/joy'
import { Controller, useFormContext } from 'react-hook-form'

interface Props extends InputProps {
  label?: string
  name: string
  helperText?: React.ReactNode
}

export default function HFInput(props: Props) {
  const { label, name, type, helperText, onChange, ...other } = props
  const { control } = useFormContext()
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <>
          {label && <FormLabel htmlFor={name}>{label}</FormLabel>}
          <Input
            {...field}
            type={type}
            id={name}
            name={name}
            slotProps={{ input: { id: name, name } }}
            onChange={(e) => {
              field.onChange(e)
              if (onChange) onChange(e)
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
