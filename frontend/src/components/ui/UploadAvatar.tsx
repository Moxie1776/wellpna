import { Avatar, Box, Typography } from '@mui/material'

export interface UploadProps {
  file?: File
  error?: boolean
  accept?: Record<string, string[]>
}

export default function UploadAvatar({ file, error }: UploadProps) {
  // Minimal stub: replace with your actual avatar upload logic
  return (
    <Box sx={{ border: error ? '1px solid red' : '1px solid #ccc', p: 2 }}>
      <Avatar src={file ? URL.createObjectURL(file) : undefined} />
      <Typography variant="body2">Upload Avatar</Typography>
    </Box>
  )
}
