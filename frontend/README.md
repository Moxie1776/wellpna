# WellPNA Frontend

## Overview

The WellPNA frontend is a React application that provides the user interface for data visualization and management in the Well Plug & Abandon system.

## Technology Stack

- React with TypeScript
- Joy UI - Component library for accessible interfaces
- React Router - Routing library
- Zustand - State management
- urql - GraphQL client
- React Hook Form + Zod - Form handling and validation
- Jest + React Testing Library - Testing framework

## Project Structure

The frontend follows a feature-based architecture with clear separation of concerns:

### Core Directories

- **`src/`**: Main application source code
  - **`components/`**: Reusable UI components
    - **`forms/`**: Form components (SignInForm, SignUpForm, ProfileForm, etc.)
    - **`hookForm/`**: React Hook Form integrations and custom form components
    - **`layout/`**: Layout components (sidebar, breadcrumbs, theme toggle, etc.)
    - **`tables/`**: Table components (UserManagementTable, etc.)
    - **`ui/`**: Base UI components (snackbar, upload components, etc.)
  - **`pages/`**: Top-level route components
    - **`admin/`**: Admin-only pages (user management, role management)
    - **`dashboard/`**: Protected dashboard pages
    - **`profile/`**: User profile pages (profile editing)
  - **`providers/`**: React context providers (Theme, Snackbar, ProtectedRoute, etc.)
  - **`hooks/`**: Custom React hooks (useAuth, useMobile, useMode, etc.)
  - **`store/`**: Zustand state stores (auth, theme)
  - **`utils/`**: Utility functions (JWT helpers, logger, GraphQL client, etc.)
  - **`lib/`**: Configuration and shared code (routes, colors, password schema)
  - **`graphql/`**: GraphQL queries and mutations

### File Organization Rules

- **Components**: Place in appropriate subfolder (`forms/`, `hookForm/`, `layout/`, `tables/`, `ui/`)
- **Pages**: One component per file in `pages/admin/`, `pages/dashboard/`, or `pages/profile/`
- **Tests**: Mirror source structure in `__tests__/` directories
- **Types**: Define interfaces/types in component files or shared types file

## Adding New Features

### Adding a New Page

1. **Create Page Component** in appropriate `src/pages/` subfolder (admin, dashboard, or profile)

    ```tsx
    // src/pages/dashboard/NewFeature.tsx
    const NewFeaturePage = () => {
      return (
        <div>
          <h1>New Feature</h1>
          {/* Page content */}
        </div>
      )
    }
    export default NewFeaturePage
    ```

2. **Add Route** in `src/lib/routes.ts`

    ```tsx
    import NewFeaturePage from '../pages/dashboard/NewFeature'
    // ... existing imports

    export const appRoutes: AppRoute[] = [
      // ... existing routes
      {
        label: 'New Feature',
        href: '/new-feature',
        icon: MdStar, // Import from react-icons/md
        requiresAuth: true,
        page: NewFeaturePage,
      },
    ]
    ```

3. **Add Tests** in `src/pages/dashboard/__tests__/NewFeature.test.tsx`

   ```tsx
   import { render, screen } from '@testing-library/react'
   import NewFeaturePage from '../NewFeature'

   describe('NewFeaturePage', () => {
     it('renders page content', () => {
       render(<NewFeaturePage />)
       expect(screen.getByText('New Feature')).toBeInTheDocument()
     })
   })
   ```

### Adding a New Component

1. **Create Component** in appropriate `src/components/` subfolder

   ```tsx
   // src/components/ui/NewComponent.tsx
   interface NewComponentProps {
     title: string
   }

   export const NewComponent = ({ title }: NewComponentProps) => {
     return <div>{title}</div>
   }
   ```

2. **Add Tests** in `src/components/ui/__tests__/NewComponent.test.tsx`

   ```tsx
   import { render, screen } from '@testing-library/react'
   import { NewComponent } from '../NewComponent'

   describe('NewComponent', () => {
     it('renders title', () => {
       render(<NewComponent title="Test Title" />)
       expect(screen.getByText('Test Title')).toBeInTheDocument()
     })
   })
   ```

### Using Snackbar Notifications

Import and use the `useSnackbar` hook:

```tsx
import { useSnackbar } from '@/components/ui/snackbar'

const MyComponent = () => {
  const { showSnackbar } = useSnackbar()

  const handleSuccess = () => {
    showSnackbar({
      message: 'Operation successful!',
      color: 'success',
      autoHideDuration: 5000, // Optional, defaults to 10000ms
    })
  }

  const handleError = () => {
    showSnackbar({
      message: 'Something went wrong',
      color: 'danger',
    })
  }

  return (
    <button onClick={handleSuccess}>Success</button>
    <button onClick={handleError}>Error</button>
  )
}
```

**Available Colors:**

- `primary` / `primary.main`
- `secondary` / `secondary.main`
- `success` / `success.main`
- `warning` / `warning.main`
- `danger` / `danger.main`
- `info` / `info.main`
- `neutral` / `neutral.main`

### Form Handling with React Hook Form + Zod

```tsx
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import RHFInputJoy from '@/components/hook-form/RHFInputJoy'
import { Form, FormControl, FormItem } from '@/components/ui/form'

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
})

const MyForm = () => {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: '', name: '' },
  })

  const onSubmit = (data: z.infer<typeof schema>) => {
    logger.debug(data)
  }

  return (
    <Form onSubmit={form.handleSubmit(onSubmit)}>
      <FormItem>
        <FormControl>
          <RHFInputJoy name="email" label="Email" type="email" />
        </FormControl>
      </FormItem>
      <FormItem>
        <FormControl>
          <RHFInputJoy name="name" label="Name" />
        </FormControl>
      </FormItem>
      <button type="submit">Submit</button>
    </Form>
  )
}
```

### State Management with Zustand

```tsx
// src/store/myStore.ts
import { create } from 'zustand'

interface MyState {
  count: number
  increment: () => void
}

export const useMyStore = create<MyState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}))
```

```tsx
// Usage in component
import { useMyStore } from '@/store/myStore'

const Counter = () => {
  const { count, increment } = useMyStore()
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>Increment</button>
    </div>
  )
}
```

## Setup

1. Install dependencies: `npm install`
2. Start development server: `npm run dev`

## Building for Production

Run `npm run build` to build the app for production. The build artifacts will be stored in the `dist/` directory.

## Deployment

### AWS Amplify (Recommended for React SPAs)

1. Go to AWS Amplify Console
2. Connect your GitHub repository
3. Amplify will automatically detect the build settings and handle SPA routing
4. Set environment variables for production (e.g., `VITE_GRAPHQL_ENDPOINT`)

### AWS S3 + CloudFront

1. Build the app: `npm run build`
2. Upload the `dist/` folder contents to an S3 bucket
3. Configure CloudFront distribution:
   - Set the S3 bucket as origin
   - Add error page rule: Error code 404 -> /index.html (HTTP 200)
4. Set environment variables in CloudFront or use build-time replacement

### Environment Variables

For production deployment, ensure `VITE_GRAPHQL_ENDPOINT` points to your deployed GraphQL API.

Example: `VITE_GRAPHQL_ENDPOINT=https://your-api.example.com/graphql`

## Development Guidelines

- Use TypeScript for all new code
- Follow Joy UI component patterns
- Test all components and pages
- Use the established color scheme and design tokens
- Keep components small and focused on single responsibilities

## Testing Best Practices

### Console Output in Tests

- **Console suppression**: `logger.debug` and `console.error` are suppressed globally in Jest tests to keep test output clean
- **Debugging**: Use the winston logger for debugging instead: `logger.info()`, `logger.debug()`, `logger.error()`, etc.
- **Important errors**: Critical test failures and assertion errors will still appear in test output

### Component Tests

- Test user-facing behavior, not implementation details
- Mock external dependencies (hooks, stores, API calls)
- Focus on rendering and user interactions
- Avoid testing child component internals

### Page Tests

- Test page-level composition and routing
- Mock child components and providers
- Verify correct data flow and navigation

### Example Test Structure

```tsx
describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })

  it('handles user interaction', async () => {
    render(<MyComponent />)
    await userEvent.click(screen.getByRole('button'))
    expect(mockFunction).toHaveBeenCalled()
  })
})
```

## Color Scheme

- **Primary:** #012d6c (Dark Blue)
- **Secondary:** #c51230 (Red)

Use Joy UI color tokens: `primary`, `secondary`, etc.
