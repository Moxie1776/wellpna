import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { describe, expect, it, vi } from 'vitest'

import HFProvider from '../HFProvider'
import HFTextField from '../HFTextField'

type TestFormData = {
  testInput?: string
  emailInput?: string
}

describe('HFTextField', () => {
  const TestWrapper = ({
    children,
    defaultValues = {},
  }: {
    children: React.ReactNode
    defaultValues?: Partial<TestFormData>
  }) => {
    const methods = useForm<TestFormData>({ defaultValues })
    return <HFProvider methods={methods}>{children}</HFProvider>
  }

  it('renders with label and helperText', () => {
    render(
      <TestWrapper>
        <HFTextField
          name="testInput"
          label="Test Label"
          inputId="testInput-id"
          helperText="Helper text"
        />
      </TestWrapper>,
    )

    expect(screen.getByLabelText('Test Label')).toBeInTheDocument()
    expect(screen.getByText('Helper text')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('renders email input type', () => {
    render(
      <TestWrapper>
        <HFTextField name="testInput" inputId="emailInput-id" label="Email" type="email" />
      </TestWrapper>,
    )

    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('type', 'email')
  })

  it('renders password input type', () => {
    render(
      <TestWrapper>
        <HFTextField name="emailInput" inputId="passwordInput-id" label="Password" type="password" />
      </TestWrapper>,
    )

    const input = screen.getByDisplayValue('')
    expect(input).toHaveAttribute('type', 'password')
  })

  it('handles user typing', async () => {
    const user = userEvent.setup()

    render(
      <TestWrapper>
        <HFTextField name="testInput" inputId="testInput-id" label="Test Label" />
      </TestWrapper>,
    )

    const input = screen.getByRole('textbox')
    await user.type(input, 'test value')
    expect(input).toHaveValue('test value')
  })

  it('displays error messages', () => {
    const TestWrapperWithError = ({
      children,
    }: {
      children: React.ReactNode
    }) => {
      const methods = useForm<TestFormData>({ defaultValues: {} })
      methods.setError('testInput', { message: 'This field is required' })
      return <HFProvider methods={methods}>{children}</HFProvider>
    }

    render(
      <TestWrapperWithError>
        <HFTextField name="testInput" inputId="testInput-id" label="Test Label" />
      </TestWrapperWithError>,
    )

    expect(screen.getByText('This field is required')).toBeInTheDocument()
  })

  it('integrates with form default values', () => {
    render(
      <TestWrapper defaultValues={{ testInput: 'default value' }}>
        <HFTextField name="testInput" inputId="testInput-id" label="Test Label" />
      </TestWrapper>,
    )

    const input = screen.getByRole('textbox')
    expect(input).toHaveValue('default value')
  })

  it('handles onChange prop', async () => {
    const user = userEvent.setup()
    const mockOnChange = vi.fn()

    render(
      <TestWrapper>
        <HFTextField name="testInput" inputId="testInput-id" label="Test Label" onChange={mockOnChange} />
      </TestWrapper>,
    )

    const input = screen.getByRole('textbox')
    await user.type(input, 'a')
    expect(mockOnChange).toHaveBeenCalled()
  })
})
