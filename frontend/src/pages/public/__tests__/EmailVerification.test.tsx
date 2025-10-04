import '@testing-library/jest-dom'

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { useMutation } from 'urql'

import EmailVerificationPage from '../EmailVerification'

// Mock urql
jest.mock('urql', () => ({
  useMutation: jest.fn(),
  gql: jest.fn((template: TemplateStringsArray) => template.join('')),
}))

// Mock useSnackbar
jest.mock('@/components/ui/snackbar', () => ({
  useSnackbar: () => ({
    showSnackbar: jest.fn(),
  }),
}))

// Mock useNavigate
const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

describe('EmailVerificationPage resend code', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('resends verification code successfully', async () => {
    const mockResendMutation = jest
      .fn()
      .mockResolvedValue({ data: {}, error: null })
    ;(useMutation as jest.Mock).mockImplementation(() => [
      { fetching: false },
      mockResendMutation,
    ])

    render(
      <MemoryRouter>
        <EmailVerificationPage />
      </MemoryRouter>,
    )

    const emailInput = screen.getByLabelText('Email')
    const resendButton = screen.getByRole('button', { name: 'Resend Code' })

    await userEvent.clear(emailInput)
    await userEvent.type(emailInput, 'test@example.com')
    await userEvent.click(resendButton)

    await waitFor(() => {
      expect(mockResendMutation).toHaveBeenCalledWith({
        email: 'test@example.com',
      })
    })
  })
})

describe('EmailVerificationPage mutation error', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('handles verification mutation error', async () => {
    const mockVerifyMutation = jest.fn().mockResolvedValue({
      data: null,
      error: { message: 'Invalid code' },
    })
    ;(useMutation as jest.Mock).mockImplementation(() => [
      { fetching: false },
      mockVerifyMutation,
    ])

    render(
      <MemoryRouter>
        <EmailVerificationPage />
      </MemoryRouter>,
    )

    const emailInput = screen.getByLabelText('Email')
    const otpField = screen.getByLabelText('Verification Code')
    const submitButton = screen.getByRole('button', { name: 'Verify Email' })

    await userEvent.clear(emailInput)
    await userEvent.type(emailInput, 'test@example.com')
    await userEvent.clear(otpField)
    await userEvent.type(otpField, '123456')
    await userEvent.click(submitButton)

    await waitFor(() => {
      expect(mockVerifyMutation).toHaveBeenCalled()
    })
  })
})

describe('EmailVerificationPage mutation call', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useMutation as jest.Mock).mockImplementation(() => [
      { fetching: false },
      jest.fn().mockResolvedValue({
        data: {
          verifyEmail: {
            token: 'new-token',
            user: { id: '1', email: 'test@example.com' },
          },
        },
        error: null,
      }),
    ])
  })

  it('calls verify mutation with correct values', async () => {
    const mockVerifyMutation = jest.fn().mockResolvedValue({
      data: {
        verifyEmail: {
          token: 'new-token',
          user: { id: '1', email: 'test@example.com' },
        },
      },
      error: null,
    })
    ;(useMutation as jest.Mock).mockImplementation(() => [
      { fetching: false },
      mockVerifyMutation,
    ])

    render(
      <MemoryRouter>
        <EmailVerificationPage />
      </MemoryRouter>,
    )

    const emailInput = screen.getByLabelText('Email')
    const otpField = screen.getByLabelText('Verification Code')
    const submitButton = screen.getByRole('button', {
      name: 'Verify Email',
    })

    await userEvent.clear(emailInput)
    await userEvent.type(emailInput, 'test@example.com')
    await userEvent.clear(otpField)
    await userEvent.type(otpField, '123456')
    await userEvent.click(submitButton)

    await waitFor(() => {
      expect(mockVerifyMutation).toHaveBeenCalledWith({
        email: 'test@example.com',
        code: '123456',
      })
    })
  })
})

describe('EmailVerificationPage navigation', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('navigates to dashboard after successful verification', async () => {
    const mockVerifyMutation = jest.fn().mockResolvedValue({
      data: {
        verifyEmail: {
          token: 'new-token',
          user: { id: '1', email: 'test@example.com' },
        },
      },
      error: null,
    })
    ;(useMutation as jest.Mock).mockImplementation(() => [
      { fetching: false },
      mockVerifyMutation,
    ])

    render(
      <MemoryRouter>
        <EmailVerificationPage />
      </MemoryRouter>,
    )

    const emailInput = screen.getByLabelText('Email')
    const otpField = screen.getByLabelText('Verification Code')
    const submitButton = screen.getByRole('button', {
      name: 'Verify Email',
    })

    await userEvent.clear(emailInput)
    await userEvent.type(emailInput, 'test@example.com')
    await userEvent.clear(otpField)
    await userEvent.type(otpField, '123456')
    await userEvent.click(submitButton)

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    })
  })
})
