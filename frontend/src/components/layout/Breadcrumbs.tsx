import BreadcrumbsJoy from '@mui/joy/Breadcrumbs'
import { Link, useLocation } from 'react-router-dom'

export function Breadcrumbs() {
  const location = useLocation()
  const pathnames = location.pathname.split('/').filter(Boolean)

  const crumbs = [
    { name: 'Home', href: '/' },
    ...pathnames.map((segment, idx) => ({
      name: segment.charAt(0).toUpperCase() + segment.slice(1),
      href: '/' + pathnames.slice(0, idx + 1).join('/'),
    })),
  ]

  return (
    <BreadcrumbsJoy sx={{ px: 2, py: 1 }} separator="/">
      {crumbs.map((crumb, idx) =>
        idx === crumbs.length - 1 ? (
          <span key={crumb.href} style={{ fontWeight: 600 }}>
            {crumb.name}
          </span>
        ) : (
          <Link
            key={crumb.href}
            to={crumb.href}
            style={{
              color: '#1976d2',
              textDecoration: 'none',
              fontWeight: 500,
            }}
          >
            {crumb.name}
          </Link>
        ),
      )}
    </BreadcrumbsJoy>
  )
}
