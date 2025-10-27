import '@testing-library/jest-dom'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { describe, expect, it } from 'vitest'

import { HFCheckbox, HFMultiCheckbox } from '../HFCheckbox'
import HFProvider from '../HFProvider'

type TestFormData = {
  singleCheckbox?: boolean
  multiCheckbox?: string[]
}

describe('HFCheckbox', () => {
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
        <HFCheckbox
          name="singleCheckbox"
          label="Test Label"
          helperText="Helper text"
        />
      </TestWrapper>,
    )

    expect(screen.getByText('Test Label')).toBeInTheDocument()
    expect(screen.getByText('Helper text')).toBeInTheDocument()
    expect(screen.getByRole('checkbox')).toBeInTheDocument()
  })

  it('renders checked/unchecked states', () => {
    render(
      <TestWrapper defaultValues={{ singleCheckbox: true }}>
        <HFCheckbox name="singleCheckbox" />
      </TestWrapper>,
    )

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeChecked()
  })

  it('handles checking/unchecking', async () => {
    const user = userEvent.setup()

    render(
      <TestWrapper>
        <HFCheckbox name="singleCheckbox" />
      </TestWrapper>,
    )

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).not.toBeChecked()

    await user.click(checkbox)
    expect(checkbox).toBeChecked()

    await user.click(checkbox)
    expect(checkbox).not.toBeChecked()
  })

  it('displays error messages', () => {
    const TestWrapperWithError = ({
      children,
    }: {
      children: React.ReactNode
    }) => {
      const methods = useForm<TestFormData>({ defaultValues: {} })
      methods.setError('singleCheckbox', { message: 'This field is required' })
      return <HFProvider methods={methods}>{children}</HFProvider>
    }

    render(
      <TestWrapperWithError>
        <HFCheckbox name="singleCheckbox" />
      </TestWrapperWithError>,
    )

    expect(screen.getByText('This field is required')).toBeInTheDocument()
  })
})

describe('HFMultiCheckbox', () => {
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

  it('renders with options array and layouts', () => {
    render(
      <TestWrapper>
        <HFMultiCheckbox
          name="multiCheckbox"
          label="Test Label"
          options={testOptions}
          row
        />
      </TestWrapper>,
    )

    expect(screen.getByText('Test Label')).toBeInTheDocument()
    expect(screen.getByText('Option 1')).toBeInTheDocument()
    expect(screen.getByText('Option 2')).toBeInTheDocument()
    expect(screen.getByText('Option 3')).toBeInTheDocument()
    expect(screen.getAllByRole('checkbox')).toHaveLength(3)
  })

  it('handles selecting/deselecting options', async () => {
    const user = userEvent.setup()

    render(
      <TestWrapper>
        <HFMultiCheckbox name="multiCheckbox" options={testOptions} />
      </TestWrapper>,
    )

    const checkboxes = screen.getAllByRole('checkbox')

    // Select multiple
    await user.click(checkboxes[0])
    await user.click(checkboxes[2])

    expect(checkboxes[0]).toBeChecked()
    expect(checkboxes[1]).not.toBeChecked()
    expect(checkboxes[2]).toBeChecked()

    // Deselect one
    await user.click(checkboxes[0])
    expect(checkboxes[0]).not.toBeChecked()
    expect(checkboxes[2]).toBeChecked()
  })

  it('displays error messages', () => {
    const TestWrapperWithError = ({
      children,
    }: {
      children: React.ReactNode
    }) => {
      const methods = useForm<TestFormData>({ defaultValues: {} })
      methods.setError('multiCheckbox', { message: 'This field is required' })
      return <HFProvider methods={methods}>{children}</HFProvider>
    }

    render(
      <TestWrapperWithError>
        <HFMultiCheckbox name="multiCheckbox" options={testOptions} />
      </TestWrapperWithError>,
    )

    expect(screen.getByText('This field is required')).toBeInTheDocument()
  })
})
