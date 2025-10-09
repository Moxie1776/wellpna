import { Box, Typography } from '@mui/joy'

export interface UploadBoxProps {
  files?: File[]
  error?: boolean
}

export default function UploadBox({ files, error }: UploadBoxProps) {
  // Minimal stub: replace with your actual upload box logic
  return (
    <Box sx={{ border: error ? '1px solid red' : '1px solid #ccc', p: 2 }}>
      <Typography level="body-sm">Upload Box</Typography>
      {files && files.length > 0 && (
        <Box>
          {files.map((file, idx) => (
            <Typography key={idx} level="body-xs">
              {file.name}
            </Typography>
          ))}
        </Box>
      )}
    </Box>
  )
}
