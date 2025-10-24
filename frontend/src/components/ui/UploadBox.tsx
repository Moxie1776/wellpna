import { Box, Typography } from '@mui/material'

export interface UploadBoxProps {
  files?: File[]
  error?: boolean
}

export default function UploadBox({ files, error }: UploadBoxProps) {
  // Minimal stub: replace with your actual upload box logic
  return (
    <Box sx={{ border: error ? '1px solid red' : '1px solid #ccc', p: 2 }}>
      <Typography variant="body2">Upload Box</Typography>
      {files && files.length > 0 && (
        <Box>
          {files.map((file, idx) => (
            <Typography key={idx} variant="caption">
              {file.name}
            </Typography>
          ))}
        </Box>
      )}
    </Box>
  )
}
