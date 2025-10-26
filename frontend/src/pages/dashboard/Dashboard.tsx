import { Paper } from '@mui/material'

import { PageHeader } from '../../components/ui'

export const Dashboard = () => {
  return (
    <Paper
      sx={{
        height: '100%',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <PageHeader>WellPnA Dashboard</PageHeader>
    </Paper>
  )
}
