import { Box, Typography } from '@mui/material'

export interface UploadProps {
  file?: File
  files?: File[]
  multiple?: boolean
  accept?: Record<string, string[]>
  error?: boolean
  helperText?: React.ReactNode
  onChange?: (files: File | File[] | null) => void
}

export default function Upload({ error, helperText }: UploadProps) {
  // Minimal stub: replace with your actual upload logic
  return (
    <Box sx={{ border: error ? '1px solid red' : '1px solid #ccc', p: 2 }}>
      <Typography variant="body2">Upload Component</Typography>
      {helperText}
    </Box>
  )
}
