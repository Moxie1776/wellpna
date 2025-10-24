// Material UI
import {
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Radio,
  RadioGroup,
} from '@mui/material'
import { RadioGroupProps } from '@mui/material/RadioGroup'
import { Controller, useFormContext } from 'react-hook-form'

type Props = RadioGroupProps & {
  name: string
  options: { label: string; value: any }[]
  label?: string
  spacing?: number
  helperText?: React.ReactNode
}

export default function HFRadioGroup(props: Props) {
  const { name, label, options, helperText, ...other } = props
  const { control } = useFormContext()
  const labelledby = label ? `${name}-${label}` : undefined
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <FormControl component="fieldset">
          {label && (
            <FormLabel
              component="legend"
              id={labelledby}
              sx={{ typography: 'body2' }}
            >
              {label}
            </FormLabel>
          )}
          <RadioGroup {...field} aria-labelledby={labelledby} {...other}>
            {options.map((option) => (
              <FormControlLabel
                key={option.value}
                value={option.value}
                control={<Radio />}
                label={option.label}
              />
            ))}
          </RadioGroup>
          {(!!error || helperText) && (
            <FormHelperText sx={{ mx: 0 }} error={!!error}>
              {error ? error?.message : helperText}
            </FormHelperText>
          )}
        </FormControl>
      )}
    />
  )
}
