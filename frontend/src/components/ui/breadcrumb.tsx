export const Breadcrumbs = (props: any) => (
  <nav {...props}>{props.children}</nav>
);
export const Breadcrumb = (props: any) => (
  <div {...props}>{props.children}</div>
);
export const BreadcrumbItem = (props: any) => (
  <div {...props}>{props.children}</div>
);
export const BreadcrumbLink = (props: any) => (
  <a {...props}>{props.children}</a>
);
export const BreadcrumbList = (props: any) => (
  <ol {...props}>{props.children}</ol>
);
export const BreadcrumbPage = (props: any) => (
  <span {...props}>{props.children}</span>
);
export const BreadcrumbSeparator = (props: any) => (
  <span {...props}>{props.children}</span>
);
// Removed Joy UI Breadcrumbs import and export to avoid conflicts
