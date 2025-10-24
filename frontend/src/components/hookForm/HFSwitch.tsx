// Material UI
import { Box, FormControl, FormHelperText, FormLabel, Switch } from '@mui/material'
import { Controller, useFormContext } from 'react-hook-form'

interface Props {
  name: string
  label?: string
  helperText?: React.ReactNode
}

export default function HFSwitch(props: Props) {
  const { name, label, helperText, ...other } = props
  const { control } = useFormContext()
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <FormControl>
          <Box display="flex" alignItems="center">
            <Switch {...field} checked={field.value} {...other} />
            {label && <FormLabel sx={{ ml: 1 }}>{label}</FormLabel>}
          </Box>
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
