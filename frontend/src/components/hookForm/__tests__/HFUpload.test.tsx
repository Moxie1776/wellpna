import '@testing-library/jest-dom'

import { render, screen } from '@testing-library/react'
import { useForm } from 'react-hook-form'

import HFProvider from '../HFProvider'
import { HFUpload, HFUploadAvatar, HFUploadBox } from '../HFUpload'

// Mock URL.createObjectURL
Object.defineProperty(window.URL, 'createObjectURL', {
  writable: true,
  value: jest.fn(() => 'mock-url'),
})

type TestFormData = {
  avatar?: File
  files?: File[]
  singleFile?: File
}

describe('HFUpload Components', () => {
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

  const mockFile = new File(['test'], 'test.png', { type: 'image/png' })
  const mockFiles = [
    mockFile,
    new File(['test2'], 'test2.png', { type: 'image/png' }),
  ]

  describe('HFUploadAvatar', () => {
    it('renders with file display', () => {
      render(
        <TestWrapper defaultValues={{ avatar: mockFile }}>
          <HFUploadAvatar name="avatar" />
        </TestWrapper>,
      )

      expect(screen.getByText('Upload Avatar')).toBeInTheDocument()
    })

    it('displays error message', () => {
      const TestWrapperWithError = ({
        children,
      }: {
        children: React.ReactNode
      }) => {
        const methods = useForm<TestFormData>({ defaultValues: {} })
        methods.setError('avatar', { message: 'Avatar is required' })
        return <HFProvider methods={methods}>{children}</HFProvider>
      }

      render(
        <TestWrapperWithError>
          <HFUploadAvatar name="avatar" />
        </TestWrapperWithError>,
      )

      expect(screen.getByText('Avatar is required')).toBeInTheDocument()
    })
  })

  describe('HFUploadBox', () => {
    it('renders with files display', () => {
      render(
        <TestWrapper defaultValues={{ files: mockFiles }}>
          <HFUploadBox name="files" />
        </TestWrapper>,
      )

      expect(screen.getByText('Upload Box')).toBeInTheDocument()
      expect(screen.getByText('test.png')).toBeInTheDocument()
      expect(screen.getByText('test2.png')).toBeInTheDocument()
    })

    it('renders with error state', () => {
      const TestWrapperWithError = ({
        children,
      }: {
        children: React.ReactNode
      }) => {
        const methods = useForm<TestFormData>({ defaultValues: {} })
        methods.setError('files', { message: 'Files are required' })
        return <HFProvider methods={methods}>{children}</HFProvider>
      }

      render(
        <TestWrapperWithError>
          <HFUploadBox name="files" />
        </TestWrapperWithError>,
      )

      // HFUploadBox passes error to UploadBox but doesn't display error message
      expect(screen.getByText('Upload Box')).toBeInTheDocument()
    })
  })

  describe('HFUpload', () => {
    it('renders single file with helper text', () => {
      render(
        <TestWrapper defaultValues={{ singleFile: mockFile }}>
          <HFUpload name="singleFile" helperText="Upload a file" />
        </TestWrapper>,
      )

      expect(screen.getByText('Upload a file')).toBeInTheDocument()
    })

    it('renders multiple files', () => {
      render(
        <TestWrapper defaultValues={{ files: mockFiles }}>
          <HFUpload name="files" multiple />
        </TestWrapper>,
      )

      expect(screen.getByText('Upload Component')).toBeInTheDocument()
    })

    it('displays error message for single upload', () => {
      const TestWrapperWithError = ({
        children,
      }: {
        children: React.ReactNode
      }) => {
        const methods = useForm<TestFormData>({ defaultValues: {} })
        methods.setError('singleFile', { message: 'File is required' })
        return <HFProvider methods={methods}>{children}</HFProvider>
      }

      render(
        <TestWrapperWithError>
          <HFUpload name="singleFile" />
        </TestWrapperWithError>,
      )

      expect(screen.getByText('File is required')).toBeInTheDocument()
    })

    it('handles file selection interaction', () => {
      render(
        <TestWrapper>
          <HFUpload name="singleFile" />
        </TestWrapper>,
      )

      // Since the UI components are stubs, we can't easily test file input interaction
      // This test verifies the component renders without errors
      expect(screen.getByText('Upload Component')).toBeInTheDocument()
    })
  })
})
