import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { describe, expect, it } from 'vitest'

import HFAutocomplete from '../HFAutocomplete'
import HFProvider from '../HFProvider'

type TestFormData = {
  testField?: { label: string; value: string }
}

describe('HFAutocomplete', () => {
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

  const testOptions = [
    { label: 'Option 1', value: 'opt1' },
    { label: 'Option 2', value: 'opt2' },
    { label: 'Option 3', value: 'opt3' },
  ]

  it('renders with label and options', () => {
    render(
      <TestWrapper>
        <HFAutocomplete
          name="testField"
          label="Test Label"
          options={testOptions}
        />
      </TestWrapper>,
    )

    expect(screen.getByLabelText('Test Label')).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('displays selected value', () => {
    render(
      <TestWrapper defaultValues={{ testField: testOptions[0] }}>
        <HFAutocomplete name="testField" options={testOptions} />
      </TestWrapper>,
    )

    const input = screen.getByRole('combobox')
    expect(input).toHaveValue('Option 1')
  })

  it('handles value selection', async () => {
    const user = userEvent.setup()

    render(
      <TestWrapper>
        <HFAutocomplete name="testField" options={testOptions} />
      </TestWrapper>,
    )

    const input = screen.getByRole('combobox')
    await act(async () => {
      await user.click(input)
      await user.click(screen.getByText('Option 2'))
    })

    expect(input).toHaveValue('Option 2')
  })

  it('displays error message', () => {
    const TestWrapperWithError = ({
      children,
    }: {
      children: React.ReactNode
    }) => {
      const methods = useForm<TestFormData>({ defaultValues: {} })
      methods.setError('testField', { message: 'This field is required' })
      return <HFProvider methods={methods}>{children}</HFProvider>
    }

    render(
      <TestWrapperWithError>
        <HFAutocomplete name="testField" options={testOptions} />
      </TestWrapperWithError>,
    )

    expect(screen.getByText('This field is required')).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(
      <TestWrapper>
        <HFAutocomplete name="testField" options={testOptions} />
      </TestWrapper>,
    )

    const input = screen.getByRole('combobox')
    expect(input).toHaveAttribute('aria-expanded', 'false')
  })

  it('integrates with form submission', async () => {
    const user = userEvent.setup()
    let submittedData: TestFormData | undefined

    const TestWrapperWithSubmit = ({
      children,
    }: {
      children: React.ReactNode
    }) => {
      const methods = useForm<TestFormData>({ defaultValues: {} })
      const onSubmit = (data: TestFormData) => {
        submittedData = data
      }
      return (
        <HFProvider methods={methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            {children}
            <button type="submit">Submit</button>
          </form>
        </HFProvider>
      )
    }

    render(
      <TestWrapperWithSubmit>
        <HFAutocomplete name="testField" options={testOptions} />
      </TestWrapperWithSubmit>,
    )

    const input = screen.getByRole('combobox')
    await act(async () => {
      await user.click(input)
      await user.click(screen.getByText('Option 1'))

      const submitButton = screen.getByRole('button', { name: /submit/i })
      await user.click(submitButton)
    })

    expect(submittedData).toEqual({ testField: testOptions[0] })
  })
})
