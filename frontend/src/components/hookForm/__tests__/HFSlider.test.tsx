import '@testing-library/jest-dom'

import { render, screen } from '@testing-library/react'
import { useForm } from 'react-hook-form'

import HFProvider from '../HFProvider'
import HFSlider from '../HFSlider'

type TestFormData = {
  sliderField?: number
}

describe('HFSlider', () => {
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

  it('renders with helperText', () => {
    render(
      <TestWrapper>
        <HFSlider
          name="sliderField"
          helperText="Helper text"
          min={0}
          max={100}
        />
      </TestWrapper>,
    )

    expect(screen.getByText('Helper text')).toBeInTheDocument()
  })

  it('displays value label', () => {
    render(
      <TestWrapper defaultValues={{ sliderField: 50 }}>
        <HFSlider name="sliderField" min={0} max={100} />
      </TestWrapper>,
    )

    expect(screen.getByText('50')).toBeInTheDocument()
  })

  it('displays error messages', () => {
    const TestWrapperWithError = ({
      children,
    }: {
      children: React.ReactNode
    }) => {
      const methods = useForm<TestFormData>()
      methods.setError('sliderField', { message: 'This field is required' })
      return <HFProvider methods={methods}>{children}</HFProvider>
    }

    render(
      <TestWrapperWithError>
        <HFSlider name="sliderField" min={0} max={100} />
      </TestWrapperWithError>,
    )

    expect(screen.getByText('This field is required')).toBeInTheDocument()
  })

  it('integrates with form default values', () => {
    render(
      <TestWrapper defaultValues={{ sliderField: 75 }}>
        <HFSlider name="sliderField" min={0} max={100} />
      </TestWrapper>,
    )

    expect(screen.getByText('75')).toBeInTheDocument()
  })

  it('renders with min and max props', () => {
    render(
      <TestWrapper>
        <HFSlider name="sliderField" min={10} max={90} />
      </TestWrapper>,
    )

    const slider = screen.getByRole('slider')
    expect(slider).toHaveAttribute('aria-valuemin', '10')
    expect(slider).toHaveAttribute('aria-valuemax', '90')
  })
})
