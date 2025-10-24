// Material UI
import { Box, FormHelperText } from '@mui/material'
import { Controller, useFormContext } from 'react-hook-form'

import Upload, { UploadProps } from '../ui/Upload'
import UploadAvatar from '../ui/UploadAvatar'
import UploadBox from '../ui/UploadBox'

interface Props extends Omit<UploadProps, 'file'> {
  name: string
  multiple?: boolean
}

export function HFUploadAvatar({ name, ...other }: Props) {
  const { control } = useFormContext()
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <Box>
          <UploadAvatar
            accept={{ 'image/*': [] }}
            error={!!error}
            file={field.value}
            {...other}
          />
          {!!error && (
            <FormHelperText
              sx={{ px: 2, textAlign: 'center' }}
              error
            >
              {error.message}
            </FormHelperText>
          )}
        </Box>
      )}
    />
  )
}

export function HFUploadBox({ name, ...other }: Props) {
  const { control } = useFormContext()
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <UploadBox files={field.value} error={!!error} {...other} />
      )}
    />
  )
}

export function HFUpload({ name, multiple, helperText, ...other }: Props) {
  const { control } = useFormContext()
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) =>
        multiple ? (
          <Upload
            multiple
            accept={{ 'image/*': [] }}
            files={field.value}
            error={!!error}
            helperText={
              (!!error || helperText) && (
                <FormHelperText sx={{ px: 2 }} error={!!error}>
                  {error ? error?.message : helperText}
                </FormHelperText>
              )
            }
            {...other}
          />
        ) : (
          <Upload
            accept={{ 'image/*': [] }}
            file={field.value}
            error={!!error}
            helperText={
              (!!error || helperText) && (
                <FormHelperText sx={{ px: 2 }} error={!!error}>
                  {error ? error?.message : helperText}
                </FormHelperText>
              )
            }
            {...other}
          />
        )
      }
    />
  )
}
