# Test Simplification Guide

This guide summarizes the main issues found in the public page tests and proposes a simplified structure for future and refactored tests in the `frontend` directory.

## Main Issues Found

### Duplication

- Multiple test files (e.g., SignUp, SignIn) repeat the same setup, mocking, and form submission logic.
- Provider setup (ThemeProvider, SnackbarProvider, urql Provider) is duplicated across many tests.

### Overlap

- Page tests often check for layout components and provider behavior, which should be tested separately.
- Some tests assert on child component behavior instead of focusing on the parent/page actions.

### Scope Violations

- Tests for a page/component should only verify its own actions and rendering, not the internals of imported providers or layout.
- Avoid testing implementation details of child components or context providers in page/component tests.

## Simplified Test Structure

### General Principles

- **Test only the actions and rendering of the component/page under test.**
- **Mock hooks and context only as needed for the component/page.**
- **Do not assert on layout, provider, or child component internals.**
- **Use shared test helpers for common setup and mocking.**

### Example: SignUpForm Test

```tsx
// ...existing imports...
import { SignUpForm } from '../../../components/public/SignUpForm'
import { useAuth } from '../../../hooks/useAuth'

jest.mock('../../../hooks/useAuth', () => ({ useAuth: jest.fn() }))
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

describe('SignUpForm', () => {
  const mockSignUp = jest.fn()
  const mockOnSignup = jest.fn()

  beforeEach(() => {
    mockSignUp.mockReset()
    mockOnSignup.mockReset()
    mockUseAuth.mockReturnValue({ signUp: mockSignUp } as any)
  })

  it('renders form fields and button', () => {
    render(<SignUpForm onSignup={mockOnSignup} />)
    expect(screen.getByLabelText('Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign Up' })).toBeInTheDocument()
  })

  it('calls signUp when submitted', async () => {
    // ...simulate user input and submit...
    // ...assert signUp called with correct args...
  })
})
```

### Example: Page Rendering Test

```tsx
// ...existing imports...
import PasswordResetPage from '../PasswordReset'

describe('PasswordResetPage', () => {
  it('renders email input and submit button', () => {
    render(<PasswordResetPage />)
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Send Reset Link' })).toBeInTheDocument()
  })
})
```

## Recommendations

- Refactor tests to remove duplicated provider setup and focus only on the component/page actions.
- Move shared mocking and setup logic to test helpers.
- Assert only on the visible output and actions of the component/page under test.
- Avoid testing imported layout, provider, or child component internals in page/component tests.

---

For further details or code samples for specific files, see the examples above or request a targeted refactor for any test file.
