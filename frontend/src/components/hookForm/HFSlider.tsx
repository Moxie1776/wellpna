// Material UI
import { Box, FormHelperText, Slider } from '@mui/material'
import { SliderProps } from '@mui/material/Slider'
import { Controller, useFormContext } from 'react-hook-form'

type Props = SliderProps & {
  name: string
  helperText?: React.ReactNode
}

export default function HFSlider({ name, helperText, ...other }: Props) {
  const { control } = useFormContext()
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <Box>
          <Slider {...field} valueLabelDisplay="auto" {...other} />
          {(!!error || helperText) && (
            <FormHelperText error={!!error}>
              {error ? error?.message : helperText}
            </FormHelperText>
          )}
        </Box>
      )}
    />
  )
}
