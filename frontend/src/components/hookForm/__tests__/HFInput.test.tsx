import '@testing-library/jest-dom'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'

import HFInput from '../HFInput'
import HFProvider from '../HFProvider'

type TestFormData = {
  testInput?: string
  emailInput?: string
}

describe('HFInput', () => {
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
        <HFInput name="testInput" label="Test Label" helperText="Helper text" />
      </TestWrapper>,
    )

    expect(screen.getByText('Test Label')).toBeInTheDocument()
    expect(screen.getByText('Helper text')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('renders email input type', () => {
    render(
      <TestWrapper>
        <HFInput name="testInput" type="email" />
      </TestWrapper>,
    )

    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('type', 'email')
  })

  it('renders password input type', () => {
    render(
      <TestWrapper>
        <HFInput name="emailInput" type="password" />
      </TestWrapper>,
    )

    const input = screen.getByDisplayValue('')
    expect(input).toHaveAttribute('type', 'password')
  })

  it('handles user typing', async () => {
    const user = userEvent.setup()

    render(
      <TestWrapper>
        <HFInput name="testInput" />
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
        <HFInput name="testInput" />
      </TestWrapperWithError>,
    )

    expect(screen.getByText('This field is required')).toBeInTheDocument()
  })

  it('integrates with form default values', () => {
    render(
      <TestWrapper defaultValues={{ testInput: 'default value' }}>
        <HFInput name="testInput" />
      </TestWrapper>,
    )

    const input = screen.getByRole('textbox')
    expect(input).toHaveValue('default value')
  })

  it('handles onChange prop', async () => {
    const user = userEvent.setup()
    const mockOnChange = jest.fn()

    render(
      <TestWrapper>
        <HFInput name="testInput" onChange={mockOnChange} />
      </TestWrapper>,
    )

    const input = screen.getByRole('textbox')
    await user.type(input, 'a')
    expect(mockOnChange).toHaveBeenCalled()
  })
})
