import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { appRoutes } from '../../../lib/routes'
import { Breadcrumbs } from '../Breadcrumbs'

const TestWrapper = ({
  children,
  initialEntries = ['/'],
}: {
  children: React.ReactNode
  initialEntries?: string[]
}) => <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>

function expectedCrumbs(pathname: string) {
  const pathnames = String(pathname).split('/').filter(Boolean)
  const crumbs = [{ name: 'Home', href: '/' }]
  pathnames.forEach((segment, idx) => {
    const name = segment.charAt(0).toUpperCase() + segment.slice(1)
    const href = '/' + pathnames.slice(0, idx + 1).join('/')
    crumbs.push({ name, href })
  })
  return crumbs
}

describe('Breadcrumbs (rewired)', () => {
  it('shows Home only at root', () => {
    render(
      <TestWrapper initialEntries={['/']}>
        <Breadcrumbs />
      </TestWrapper>,
    )

    const nav = screen.getByRole('navigation')
    expect(nav).toBeInTheDocument()
    const home = screen.getByText('Home')
    expect(home).toBeInTheDocument()
    expect(home.tagName).toBe('SPAN')
  })

  it('renders a top-level route from appRoutes', () => {
    const top = appRoutes.find(
      (r) => r.href && r.href !== '/' && r.href !== '*',
    )
    if (!top) return

    render(
      <TestWrapper initialEntries={[top.href!]}>
        <Breadcrumbs />
      </TestWrapper>,
    )

    const nav = screen.getByRole('navigation')
    const crumbs = expectedCrumbs(top.href!)

    // Home link
    const homeLink = within(nav).getByText('Home').closest('a')
    expect(homeLink).toBeInTheDocument()
    expect(homeLink).toHaveAttribute('href', '/')

    // last crumb present as span
    const last = crumbs[crumbs.length - 1]
    expect(screen.getByText(last.name).tagName).toBe('SPAN')
  })

  it('renders derived nested path and verifies non-final hrefs', async () => {
    const path = '/admin/users/roles/123'
    render(
      <TestWrapper initialEntries={[path]}>
        <Breadcrumbs />
      </TestWrapper>,
    )

    const nav = screen.getByRole('navigation')
    const crumbs = expectedCrumbs(path)

    crumbs.forEach((c, idx) => {
      if (idx < crumbs.length - 1) {
        const link = within(nav).getByText(c.name).closest('a')
        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute('href', c.href)
      } else {
        const span = screen.getByText(c.name)
        expect(span.tagName).toBe('SPAN')
      }
    })

    // basic click smoke on first link
    const links = within(nav).getAllByRole('link')
    const user = userEvent.setup()
    await user.click(links[0])
  })
})
