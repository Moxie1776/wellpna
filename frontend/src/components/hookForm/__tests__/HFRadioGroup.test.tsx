import '@testing-library/jest-dom'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'

import HFProvider from '../HFProvider'
import HFRadioGroup from '../HFRadioGroup'

type TestFormData = {
  radioField?: string
}

describe('HFRadioGroup', () => {
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

  const options = [
    { label: 'Option 1', value: 'value1' },
    { label: 'Option 2', value: 'value2' },
  ]

  it('renders with options and label', () => {
    render(
      <TestWrapper>
        <HFRadioGroup name="radioField" options={options} label="Test Label" />
      </TestWrapper>,
    )

    expect(screen.getByText('Test Label')).toBeInTheDocument()
    expect(screen.getByText('Option 1')).toBeInTheDocument()
    expect(screen.getByText('Option 2')).toBeInTheDocument()
  })

  it('renders helperText', () => {
    render(
      <TestWrapper>
        <HFRadioGroup
          name="radioField"
          options={options}
          helperText="Helper text"
        />
      </TestWrapper>,
    )

    expect(screen.getByText('Helper text')).toBeInTheDocument()
  })

  it('handles radio selection and updates form value', async () => {
    const user = userEvent.setup()

    let methods: any
    const TestWrapperWithMethods = ({
      children,
    }: {
      children: React.ReactNode
    }) => {
      methods = useForm<TestFormData>()
      return <HFProvider methods={methods}>{children}</HFProvider>
    }

    render(
      <TestWrapperWithMethods>
        <HFRadioGroup name="radioField" options={options} />
      </TestWrapperWithMethods>,
    )

    const option1Radio = screen.getByLabelText('Option 1')
    await user.click(option1Radio)

    expect(methods.getValues('radioField')).toBe('value1')
  })

  it('displays error messages', () => {
    const TestWrapperWithError = ({
      children,
    }: {
      children: React.ReactNode
    }) => {
      const methods = useForm<TestFormData>()
      methods.setError('radioField', { message: 'This field is required' })
      return <HFProvider methods={methods}>{children}</HFProvider>
    }

    render(
      <TestWrapperWithError>
        <HFRadioGroup name="radioField" options={options} />
      </TestWrapperWithError>,
    )

    expect(screen.getByText('This field is required')).toBeInTheDocument()
  })

  it('integrates with form default values', () => {
    render(
      <TestWrapper defaultValues={{ radioField: 'value2' }}>
        <HFRadioGroup name="radioField" options={options} />
      </TestWrapper>,
    )

    const option2Radio = screen.getByLabelText('Option 2')
    expect(option2Radio).toBeChecked()
  })

  it('renders multiple options correctly', () => {
    const moreOptions = [
      { label: 'A', value: 'a' },
      { label: 'B', value: 'b' },
      { label: 'C', value: 'c' },
    ]

    render(
      <TestWrapper>
        <HFRadioGroup name="radioField" options={moreOptions} />
      </TestWrapper>,
    )

    expect(screen.getByText('A')).toBeInTheDocument()
    expect(screen.getByText('B')).toBeInTheDocument()
    expect(screen.getByText('C')).toBeInTheDocument()
  })
})
