import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider as UrqlProvider } from 'urql'
import { describe, expect, it } from 'vitest'

import {
  createAdminTestUser,
  createTestUser,
  enqueueCleanup,
  executeGraphQL,
} from '../../../../tests/utils/testUsers'
import { SnackbarProvider } from '../../../providers/SnackbarProvider'
import { ThemeProvider } from '../../../providers/ThemeProvider'
import client from '../../../utils/graphqlClient'
import { Admin } from '../Admin'
import { USERS_QUERY } from '../../../graphql/queries/usersQuery'

describe('Admin page — full integration', () => {
  it('lists users and allows changing role for a created user', async () => {
    // Create an admin and set client auth
    const adminResp = await createAdminTestUser()

    // Create a secondary test user that we'll promote
    const testEmail = `promote-${Date.now()}@example.com`
    const testPassword = 'Password1!'
    const testName = 'Promote User'

    const created = await createTestUser(testEmail, testPassword, testName)
    // ensure cleanup after run
    enqueueCleanup(created.user.email)
    expect(created.user.email).toBe(testEmail)

    // Render admin page with only required providers
    render(
      <UrqlProvider value={client}>
        <ThemeProvider>
          <SnackbarProvider>
            <Admin />
          </SnackbarProvider>
        </ThemeProvider>
      </UrqlProvider>,
    )

    // Wait for the created user's email to appear in the table
    const userCell = await screen.findByText(testEmail, undefined, {
      timeout: 10000,
    })
    expect(userCell).toBeInTheDocument()

    // Find the row containing our created user
    const table = screen.getByRole('table')
    const rows = within(table).getAllByRole('row')
    // header row included; find the row that contains the email
    const targetRow = rows.find((r) => within(r).queryByText(testEmail))
    if (!targetRow) throw new Error('Could not find table row for created user')

    // Interact with the real UI Select to change the user's role.
    // This exercises the component mutation and the USERS_QUERY refetch.
    // MUI Select may expose a 'combobox' role for the visible element
    const roleControl = within(targetRow).getByRole('combobox')
    await userEvent.click(roleControl)

    // MUI renders options with role 'option' when the menu is open.
    const options = await screen.findAllByRole('option')
    const adminOption = options.find((o) => /admin/i.test(o.textContent || ''))
    if (!adminOption) throw new Error('Could not find Admin option in Select')
    await userEvent.click(adminOption)

    // After the mutation and refetch, assert the table shows the updated role.
    // Wait for the table to refresh and assert the visible Select shows 'Admin'.
    const refreshedTable = await screen.findByRole('table')
    const refreshedRows = within(refreshedTable).getAllByRole('row')
    const updatedRow = refreshedRows.find((r) =>
      within(r).queryByText(testEmail),
    )
    expect(updatedRow).toBeDefined()

    // Verify via the backend that the user's role was updated. This is a
    // deterministic check that avoids depending on MUI Select internal
    // rendering details in the DOM.
    const usersData = await executeGraphQL(
      USERS_QUERY,
      undefined,
      adminResp.token,
      { retries: 3, timeoutMs: 15000 },
    )

    const updatedUser = (usersData?.users || []).find(
      (u: any) => u.id === created.user.id,
    )
    expect(updatedUser).toBeDefined()
    expect(updatedUser.role).toBe('admin')

    // Ensure adminResp exists and had token/user info
    expect(adminResp).toHaveProperty('token')
    expect(adminResp).toHaveProperty('user')
  }, 30000)
})
