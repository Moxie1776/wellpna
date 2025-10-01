import { Link, useLocation } from 'react-router-dom';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

export function Breadcrumbs() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  const getBreadcrumbs = () => {
    const pathnames = location.pathname.split('/').filter((x) => x);

    const breadcrumbs = [
      { name: 'Home', href: '/', current: pathnames.length === 0 },
    ];

    if (pathnames.length > 0) {
      pathnames.forEach((pathname, index) => {
        const href = '/' + pathnames.slice(0, index + 1).join('/');
        const name = pathname.charAt(0).toUpperCase() + pathname.slice(1);
        const current = index === pathnames.length - 1;

        breadcrumbs.push({ name, href, current });
      });
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  if (isHomePage) {
    return null;
  }

  return (
    <div className='px-4 py-2'>
      <Breadcrumb>
        <BreadcrumbList className='flex items-center space-x-2 overflow-x-auto'>
          {breadcrumbs.map((bc, i) => (
            <div key={bc.href} className='flex items-center flex-shrink-0'>
              {i > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {bc.current ? (
                  <BreadcrumbPage>{bc.name}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={bc.href}>{bc.name}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </div>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
