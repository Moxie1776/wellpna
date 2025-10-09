import '@testing-library/jest-dom'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'

import HFProvider from '../HFProvider'
import HFSwitch from '../HFSwitch'

type TestFormData = {
  switchField?: boolean
}

describe('HFSwitch', () => {
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
        <HFSwitch
          name="switchField"
          label="Test Label"
          helperText="Helper text"
        />
      </TestWrapper>,
    )

    expect(screen.getByText('Test Label')).toBeInTheDocument()
    expect(screen.getByText('Helper text')).toBeInTheDocument()
    expect(screen.getByRole('switch')).toBeInTheDocument()
  })

  it('renders checked/unchecked states', () => {
    render(
      <TestWrapper defaultValues={{ switchField: true }}>
        <HFSwitch name="switchField" />
      </TestWrapper>,
    )

    const switchElement = screen.getByRole('switch')
    expect(switchElement).toBeChecked()
  })

  it('handles toggling on/off', async () => {
    const user = userEvent.setup()

    render(
      <TestWrapper>
        <HFSwitch name="switchField" />
      </TestWrapper>,
    )

    const switchElement = screen.getByRole('switch')
    expect(switchElement).not.toBeChecked()

    await user.click(switchElement)
    expect(switchElement).toBeChecked()

    await user.click(switchElement)
    expect(switchElement).not.toBeChecked()
  })

  it('displays error messages', () => {
    const TestWrapperWithError = ({
      children,
    }: {
      children: React.ReactNode
    }) => {
      const methods = useForm<TestFormData>({ defaultValues: {} })
      methods.setError('switchField', { message: 'This field is required' })
      return <HFProvider methods={methods}>{children}</HFProvider>
    }

    render(
      <TestWrapperWithError>
        <HFSwitch name="switchField" />
      </TestWrapperWithError>,
    )

    expect(screen.getByText('This field is required')).toBeInTheDocument()
  })

  it('integrates with form context', async () => {
    const user = userEvent.setup()

    render(
      <TestWrapper>
        <HFSwitch name="switchField" />
      </TestWrapper>,
    )

    const switchElement = screen.getByRole('switch')
    await user.click(switchElement)

    // Form value should be updated
    expect(switchElement).toBeChecked()
  })

  it('renders without label and helperText', () => {
    render(
      <TestWrapper>
        <HFSwitch name="switchField" />
      </TestWrapper>,
    )

    expect(screen.getByRole('switch')).toBeInTheDocument()
    expect(screen.queryByText('Test Label')).not.toBeInTheDocument()
    expect(screen.queryByText('Helper text')).not.toBeInTheDocument()
  })
})
