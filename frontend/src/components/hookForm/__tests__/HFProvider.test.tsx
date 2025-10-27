import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm, useFormContext } from 'react-hook-form'
import { describe, expect, it } from 'vitest'

import HFProvider from '../HFProvider'

type TestFormData = {
  testField?: string
}

describe('HFProvider', () => {
  const TestWrapper = ({
    children,
    onSubmit,
    defaultValues = {},
  }: {
    children: React.ReactNode
    onSubmit?: () => void
    defaultValues?: Partial<TestFormData>
  }) => {
    const methods = useForm<TestFormData>({ defaultValues })
    return (
      <HFProvider methods={methods} onSubmit={onSubmit}>
        {children}
      </HFProvider>
    )
  }

  it('renders children correctly', () => {
    render(
      <TestWrapper>
        <div data-testid="child">Test Child</div>
      </TestWrapper>,
    )

    expect(screen.getByTestId('child')).toBeInTheDocument()
    expect(screen.getByText('Test Child')).toBeInTheDocument()
  })

  it('renders form element', () => {
    render(
      <TestWrapper>
        <div>Form content</div>
      </TestWrapper>,
    )

    const form = document.querySelector('form')
    expect(form).toBeInTheDocument()
  })

  it('handles onSubmit callback', async () => {
    const user = userEvent.setup()
    let submitted = false
    const onSubmit = () => {
      submitted = true
    }

    render(
      <TestWrapper onSubmit={onSubmit}>
        <button type="submit">Submit</button>
      </TestWrapper>,
    )

    const submitButton = screen.getByRole('button', { name: /submit/i })
    await user.click(submitButton)

    expect(submitted).toBe(true)
  })

  it('passes form methods to FormProvider', () => {
    const TestComponent = () => {
      const { getValues } = useFormContext<TestFormData>()
      return <div data-testid="context-value">{getValues('testField')}</div>
    }

    render(
      <TestWrapper defaultValues={{ testField: 'default' }}>
        <TestComponent />
      </TestWrapper>,
    )

    expect(screen.getByTestId('context-value')).toHaveTextContent('default')
  })

  it('handles form submission with validation', async () => {
    const user = userEvent.setup()
    let submittedData: TestFormData | undefined

    const TestComponentWithForm = () => {
      const methods = useForm<TestFormData>({
        defaultValues: { testField: 'value' },
      })
      const onSubmit = (data: TestFormData) => {
        submittedData = data
      }
      return (
        <HFProvider methods={methods} onSubmit={methods.handleSubmit(onSubmit)}>
          <input data-testid="input" {...methods.register('testField')} />
          <button type="submit">Submit</button>
        </HFProvider>
      )
    }

    render(<TestComponentWithForm />)

    const submitButton = screen.getByRole('button', { name: /submit/i })
    await user.click(submitButton)

    expect(submittedData).toEqual({ testField: 'value' })
  })

  it('renders without onSubmit', () => {
    render(
      <TestWrapper>
        <div>No submit handler</div>
      </TestWrapper>,
    )

    const form = document.querySelector('form')
    expect(form).toBeInTheDocument()
  })
})
