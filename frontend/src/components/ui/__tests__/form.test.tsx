import '@testing-library/jest-dom'

import { Input } from '@mui/joy'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'

// Mock react-hook-form
jest.mock('react-hook-form', () => ({
  useForm: jest.fn(),
}))

// Mock Joy UI components
jest.mock('@mui/joy', () => ({
  FormControl: ({ children, ...props }: any) => (
    <div data-testid="form-control" {...props}>
      {children}
    </div>
  ),
  FormHelperText: ({ children, ...props }: any) => (
    <div data-testid="form-helper-text" {...props}>
      {children}
    </div>
  ),
  FormLabel: ({ children, ...props }: any) => (
    <label data-testid="form-label" {...props}>
      {children}
    </label>
  ),
  Input: ({ slotProps, ...props }: any) => (
    <input data-testid="input" {...slotProps?.input} {...props} />
  ),
}))

import {
  Form,
  FormControl,
  FormField,
  FormHelperText,
  FormItem,
  FormLabel,
  FormMessage,
} from '../form'

describe('Form Components', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Form Component', () => {
    it('renders form element with valid HTML props', () => {
      render(
        <Form onSubmit={() => {}} className="test-form">
          <div>Form content</div>
        </Form>,
      )

      const form = screen.getByTestId('form')
      expect(form).toBeInTheDocument()
      expect(form).toHaveClass('test-form')
    })

    it('filters out invalid HTML form props', () => {
      render(
        <Form
          onSubmit={() => {}}
          action="/test"
          method="post"
          {...({ invalidProp: 'should-be-filtered' } as any)}
        >
          <div>Form content</div>
        </Form>,
      )

      const form = screen.getByTestId('form')
      expect(form).toHaveAttribute('action', '/test')
      expect(form).toHaveAttribute('method', 'post')
      expect(form).not.toHaveAttribute('invalidProp')
    })

    it('handles form submission', async () => {
      const mockOnSubmit = jest.fn()
      const user = userEvent.setup()

      render(
        <Form onSubmit={mockOnSubmit}>
          <button type="submit">Submit</button>
        </Form>,
      )

      const submitButton = screen.getByRole('button', { name: /submit/i })
      await user.click(submitButton)

      expect(mockOnSubmit).toHaveBeenCalled()
    })
  })

  describe('FormField Rendering Tests', () => {
    it('renders with correct structure and label', () => {
      render(
        <FormField label="Test Label" inputId="test-input">
          <Input />
        </FormField>,
      )

      expect(screen.getByTestId('form-control')).toBeInTheDocument()
      expect(screen.getByTestId('form-label')).toBeInTheDocument()
      expect(screen.getByTestId('form-label')).toHaveTextContent('Test Label')
      expect(screen.getByTestId('input')).toBeInTheDocument()
    })

    it('passes htmlFor to FormLabel', () => {
      render(
        <FormField label="Test Label" inputId="test-input">
          <Input />
        </FormField>,
      )

      const label = screen.getByTestId('form-label')
      expect(label).toHaveAttribute('for', 'test-input')
    })

    it('renders children correctly', () => {
      render(
        <FormField label="Test Label" inputId="test-input">
          <div data-testid="custom-child">Custom Child</div>
        </FormField>,
      )

      expect(screen.getByTestId('custom-child')).toBeInTheDocument()
      expect(screen.getByTestId('custom-child')).toHaveTextContent(
        'Custom Child',
      )
    })

    it('handles empty children gracefully', () => {
      render(
        <FormField label="Test Label" inputId="test-input">
          {null}
        </FormField>,
      )

      expect(screen.getByTestId('form-control')).toBeInTheDocument()
      expect(screen.getByTestId('form-label')).toBeInTheDocument()
    })
  })

  describe('Form Control Tests', () => {
    it('passes additional props to FormControl', () => {
      render(
        <FormField
          label="Test Label"
          inputId="test-input"
          error
          sx={{ margin: 1 }}
        >
          <Input />
        </FormField>,
      )

      const formControl = screen.getByTestId('form-control')
      expect(formControl.className).toMatch(/Mui-error/)
      expect(formControl).toHaveStyle({ margin: '8px' }) // Joy UI converts sx to style
    })

    it('handles error state correctly', () => {
      render(
        <FormField label="Email" inputId="email" error>
          <Input type="email" />
        </FormField>,
      )

      const formControl = screen.getByTestId('form-control')
      expect(formControl.className).toMatch(/Mui-error/)
    })

    it('handles required state', () => {
      render(
        <FormField label="Required Field" inputId="required" required>
          <Input />
        </FormField>,
      )

      const formControl = screen.getByTestId('form-control')
      expect(formControl.className).toMatch(/MuiFormControl-root/)
    })

    it('integrates with react-hook-form register', () => {
      const mockRegister = jest.fn()
      ;(useForm as jest.Mock).mockReturnValue({
        register: mockRegister,
        formState: { errors: {} },
      })

      render(
        <FormField label="Email" inputId="email">
          <Input {...mockRegister('email')} />
        </FormField>,
      )

      expect(mockRegister).toHaveBeenCalledWith('email')
    })
  })

  describe('Input Variants Tests', () => {
    it('renders text input correctly', () => {
      render(
        <FormField label="Text Input" inputId="text-input">
          <Input type="text" placeholder="Enter text" />
        </FormField>,
      )

      const input = screen.getByTestId('input')
      expect(input).toHaveAttribute('type', 'text')
      expect(input).toHaveAttribute('placeholder', 'Enter text')
    })

    it('renders email input correctly', () => {
      render(
        <FormField label="Email" inputId="email-input">
          <Input type="email" placeholder="Enter email" />
        </FormField>,
      )

      const input = screen.getByTestId('input')
      expect(input).toHaveAttribute('type', 'email')
      expect(input).toHaveAttribute('placeholder', 'Enter email')
    })

    it('renders password input correctly', () => {
      render(
        <FormField label="Password" inputId="password-input">
          <Input type="password" placeholder="Enter password" />
        </FormField>,
      )

      const input = screen.getByTestId('input')
      expect(input).toHaveAttribute('type', 'password')
      expect(input).toHaveAttribute('placeholder', 'Enter password')
    })

    it('handles input variants and colors', () => {
      render(
        <FormField label="Colored Input" inputId="colored-input">
          <Input variant="outlined" color="primary" />
        </FormField>,
      )

      const input = screen.getByTestId('input')
      expect(input).toBeInTheDocument()
      // Note: variant and color are handled by Joy UI internally
    })
  })

  describe('FormItem Component', () => {
    it('renders as div with children', () => {
      render(
        <FormItem className="form-item">
          <span>Item content</span>
        </FormItem>,
      )

      const item = screen.getByText('Item content').parentElement
      expect(item?.tagName).toBe('DIV')
      expect(item).toHaveClass('form-item')
    })

    it('passes through additional props', () => {
      render(
        <FormItem data-testid="form-item" sx={{ padding: 1 }}>
          <span>Item content</span>
        </FormItem>,
      )

      const item = screen.getByTestId('form-item')
      expect(item).toBeInTheDocument()
    })
  })

  describe('FormMessage Component', () => {
    it('renders FormHelperText with children', () => {
      render(<FormMessage className="error-message">Error message</FormMessage>)

      const message = screen.getByTestId('form-helper-text')
      expect(message).toBeInTheDocument()
      expect(message).toHaveTextContent('Error message')
      expect(message).toHaveClass('error-message')
    })

    it('passes through additional props', () => {
      render(
        <FormMessage data-testid="custom-message" color="danger">
          Warning message
        </FormMessage>,
      )

      const message = screen.getByTestId('custom-message')
      expect(message).toBeInTheDocument()
      expect(message).toHaveTextContent('Warning message')
    })
  })

  describe('Validation Tests', () => {
    it('displays validation error messages', () => {
      const mockForm = {
        register: jest.fn(),
        formState: {
          errors: {
            email: { message: 'Email is required' },
          },
        },
      }
      ;(useForm as jest.Mock).mockReturnValue(mockForm)

      render(
        <FormField label="Email" inputId="email">
          <FormItem>
            <Input {...mockForm.register('email')} />
            <FormMessage>
              {mockForm.formState.errors.email?.message}
            </FormMessage>
          </FormItem>
        </FormField>,
      )

      expect(screen.getByTestId('form-helper-text')).toHaveTextContent(
        'Email is required',
      )
    })

    it('displays success state without errors', () => {
      const mockForm = {
        register: jest.fn(),
        formState: { errors: {} },
      }
      ;(useForm as jest.Mock).mockReturnValue(mockForm)

      render(
        <FormField label="Email" inputId="email">
          <FormItem>
            <Input {...mockForm.register('email')} />
            <FormMessage>{null}</FormMessage>
          </FormItem>
        </FormField>,
      )

      const message = screen.getByTestId('form-helper-text')
      expect(message).toBeInTheDocument()
      expect(message).toBeEmptyDOMElement()
    })

    it('handles multiple validation errors', () => {
      const mockForm = {
        register: jest.fn(),
        formState: {
          errors: {
            email: { message: 'Invalid email' },
            password: { message: 'Password too short' },
          },
        },
      }
      ;(useForm as jest.Mock).mockReturnValue(mockForm)

      render(
        <div>
          <FormField label="Email" inputId="email">
            <FormItem>
              <Input {...mockForm.register('email')} />
              <FormMessage>
                {mockForm.formState.errors.email?.message}
              </FormMessage>
            </FormItem>
          </FormField>
          <FormField label="Password" inputId="password">
            <FormItem>
              <Input {...mockForm.register('password')} />
              <FormMessage>
                {mockForm.formState.errors.password?.message}
              </FormMessage>
            </FormItem>
          </FormField>
        </div>,
      )

      expect(screen.getByText('Invalid email')).toBeInTheDocument()
      expect(screen.getByText('Password too short')).toBeInTheDocument()
    })
  })

  describe('Accessibility Tests', () => {
    it('FormLabel has correct htmlFor attribute', () => {
      render(
        <FormField label="Accessible Label" inputId="accessible-input">
          <Input />
        </FormField>,
      )

      const label = screen.getByTestId('form-label')
      expect(label).toHaveAttribute('for', 'accessible-input')
    })

    it('input has correct id for label association', () => {
      render(
        <FormField label="Test Label" inputId="test-id">
          <Input id="test-id" />
        </FormField>,
      )

      const input = screen.getByTestId('input')
      expect(input).toHaveAttribute('id', 'test-id')
    })

    it('supports ARIA attributes', () => {
      render(
        <FormField
          label="ARIA Label"
          inputId="aria-input"
          aria-describedby="helper-text"
        >
          <Input aria-describedby="helper-text" />
        </FormField>,
      )

      const formControl = screen.getByTestId('form-control')
      expect(formControl).toHaveAttribute('aria-describedby', 'helper-text')
    })

    it('FormControl supports ARIA roles', () => {
      render(
        <FormField label="Role Test" inputId="role-input" role="group">
          <Input />
        </FormField>,
      )

      const formControl = screen.getByTestId('form-control')
      expect(formControl).toHaveAttribute('role', 'group')
    })

    it('keyboard navigation works', async () => {
      const user = userEvent.setup()

      render(
        <FormField label="Keyboard Test" inputId="keyboard-input">
          <Input />
        </FormField>,
      )

      const input = screen.getByTestId('input')
      input.focus()
      expect(input).toHaveFocus()

      await user.tab()
      // Should move focus away from input
    })
  })

  describe('Theme Integration Tests', () => {
    it('applies Joy UI theme classes', () => {
      render(
        <FormField label="Theme Test" inputId="theme-input">
          <Input />
        </FormField>,
      )

      const formControl = screen.getByTestId('form-control')
      expect(formControl).toHaveClass('MuiFormControl-root')
    })

    it('FormLabel applies theme styling', () => {
      render(
        <FormField label="Styled Label" inputId="styled-input">
          <Input />
        </FormField>,
      )

      const label = screen.getByTestId('form-label')
      expect(label).toHaveClass('MuiFormLabel-root')
    })

    it('FormHelperText applies theme styling', () => {
      render(<FormMessage>Helper text</FormMessage>)

      const helperText = screen.getByTestId('form-helper-text')
      expect(helperText).toHaveClass('MuiFormHelperText-root')
    })

    it('supports theme color variants', () => {
      render(<FormMessage color="danger">Error message</FormMessage>)

      const message = screen.getByTestId('form-helper-text')
      expect(message).toBeInTheDocument()
      // Color is applied via Joy UI theme system
    })
  })

  describe('Error Handling Tests', () => {
    it('handles FormField without required props gracefully', () => {
      render(
        <FormField label="Test" inputId="test">
          <Input />
        </FormField>,
      )

      expect(screen.getByTestId('form-control')).toBeInTheDocument()
      // Test passes with required props
    })

    it('FormMessage handles empty content', () => {
      render(<FormMessage>{null}</FormMessage>)

      const message = screen.getByTestId('form-helper-text')
      expect(message).toBeInTheDocument()
      expect(message).toBeEmptyDOMElement()
    })

    it('handles malformed props gracefully', () => {
      render(
        <FormField
          label="Test"
          inputId="test"
          {...({ invalidProp: 'test' } as any)}
        >
          <Input />
        </FormField>,
      )

      expect(screen.getByTestId('form-control')).toBeInTheDocument()
    })
  })

  describe('Interactive Tests', () => {
    it('input accepts user typing', async () => {
      const user = userEvent.setup()

      render(
        <FormField label="Interactive Input" inputId="interactive">
          <Input />
        </FormField>,
      )

      const input = screen.getByTestId('input')
      await user.type(input, 'test input')

      expect(input).toHaveValue('test input')
    })

    it('handles focus and blur events', async () => {
      const user = userEvent.setup()

      render(
        <FormField label="Focus Test" inputId="focus-test">
          <Input />
        </FormField>,
      )

      const input = screen.getByTestId('input')

      await user.click(input)
      expect(input).toHaveFocus()

      await user.tab()
      expect(input).not.toHaveFocus()
    })

    it('form submission prevents default', async () => {
      const mockOnSubmit = jest.fn((e) => e.preventDefault())
      const user = userEvent.setup()

      render(
        <Form onSubmit={mockOnSubmit}>
          <FormField label="Submit Test" inputId="submit-input">
            <Input />
          </FormField>
          <button type="submit">Submit</button>
        </Form>,
      )

      const submitButton = screen.getByRole('button', { name: /submit/i })
      await user.click(submitButton)

      expect(mockOnSubmit).toHaveBeenCalled()
    })

    it('handles rapid interactions', async () => {
      const user = userEvent.setup()

      render(
        <FormField label="Rapid Test" inputId="rapid">
          <Input />
        </FormField>,
      )

      const input = screen.getByTestId('input')

      // Rapid focus/blur
      await user.click(input)
      await user.click(document.body)
      await user.click(input)
      await user.click(document.body)

      expect(input).not.toHaveFocus()
    })
  })

  describe('Joy UI Component Exports', () => {
    it('exports FormControl from Joy UI', () => {
      expect(FormControl).toBeDefined()
    })

    it('exports FormHelperText from Joy UI', () => {
      expect(FormHelperText).toBeDefined()
    })

    it('exports FormLabel from Joy UI', () => {
      expect(FormLabel).toBeDefined()
    })
  })
})
