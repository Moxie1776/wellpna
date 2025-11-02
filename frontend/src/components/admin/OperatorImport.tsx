import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { useMutation } from 'urql'

import { StandardButton } from '../ui'

const IMPORT_OPERATORS_MUTATION = `
  mutation ImportOperators($state: String!) {
    importOperators(state: $state) {
      success
      imported
      skipped
      errors
    }
  }
`

interface ImportResult {
  success: boolean
  imported: number
  skipped: number
  errors: string[]
}

export const OperatorImport = () => {
  const [importing, setImporting] = useState<'TX' | 'NM' | null>(null)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [, importOperators] = useMutation(IMPORT_OPERATORS_MUTATION)

  const handleImport = async (state: 'TX' | 'NM') => {
    setImporting(state)
    setResult(null)
    setError(null)

    try {
      const response = await importOperators({ state })
      if (response.error) {
        setError(response.error.message)
      } else {
        setResult(response.data?.importOperators)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setImporting(null)
    }
  }

  return (
    <Card sx={{ mt: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Operator Data Import
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Import operator data from Excel files. This will read and import
          active operator lists from TX Railroad Commission and NM Oil
          Conservation Division Excel directories.
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <StandardButton
            sx={{ flex: 1, minWidth: 200 }}
            onClick={() => handleImport('TX')}
            disabled={importing !== null}
          >
            {importing === 'TX' ? (
              <>
                <CircularProgress size={20} style={{ marginRight: 8 }} />
                Importing TX...
              </>
            ) : (
              'Import TX Operators'
            )}
          </StandardButton>
          <StandardButton
            sx={{ flex: 1, minWidth: 200 }}
            onClick={() => handleImport('NM')}
            disabled={importing !== null}
          >
            {importing === 'NM' ? (
              <>
                <CircularProgress size={20} style={{ marginRight: 8 }} />
                Importing NM...
              </>
            ) : (
              'Import NM Operators'
            )}
          </StandardButton>
        </Box>

        {result && (
          <Alert severity={result.success ? 'success' : 'error'} sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Import Results:</strong>
              <br />• Imported: {result.imported}
              <br />• Skipped: {result.skipped}
              {result.errors.length > 0 && (
                <>
                  <br />• Errors: {result.errors.length}
                  {result.errors.map((err, index) => (
                    <div key={index}> - {err}</div>
                  ))}
                </>
              )}
            </Typography>
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Import Failed:</strong> {error}
            </Typography>
          </Alert>
        )}

        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Note: Duplicate operators (same company and state) will be skipped
            automatically. The import process may take several minutes depending
            on the website response times.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )
}
