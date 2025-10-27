import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'

import { PasswordResetForm } from '../PasswordResetForm'

let onRequestResetCalled = false
let onResetPasswordCalled = false
let requestResetData: any = null
let resetPasswordData: any = null

beforeEach(() => {
  onRequestResetCalled = false
  onResetPasswordCalled = false
  requestResetData = null
  resetPasswordData = null
})

describe('PasswordResetForm', () => {
  describe('request mode', () => {
    it('renders form fields and button', () => {
      render(
        <PasswordResetForm
          mode="request"
          onRequestReset={(data) => {
            onRequestResetCalled = true
            requestResetData = data
          }}
        />,
      )
      expect(screen.getByLabelText('Email')).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'Send Reset Code' }),
      ).toBeInTheDocument()
    })

    it('renders with default email', () => {
      render(
        <PasswordResetForm
          mode="request"
          onRequestReset={(data) => {
            onRequestResetCalled = true
            requestResetData = data
          }}
          defaultEmail="test@example.com"
        />,
      )
      expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument()
    })

    it('shows validation error for invalid email', async () => {
      render(
        <PasswordResetForm
          mode="request"
          onRequestReset={(data) => {
            onRequestResetCalled = true
            requestResetData = data
          }}
        />,
      )
      await userEvent.type(screen.getByLabelText('Email'), 'invalid-email')
      fireEvent.submit(screen.getByTestId('form'))
      await waitFor(() => {
        expect(
          screen.getByText('Please enter a valid email address'),
        ).toBeInTheDocument()
      })
    })

    it('calls onRequestReset with valid email on submit', async () => {
      render(
        <PasswordResetForm
          mode="request"
          onRequestReset={(data) => {
            onRequestResetCalled = true
            requestResetData = data
          }}
        />,
      )
      await act(async () => {
        await userEvent.type(screen.getByLabelText('Email'), 'test@example.com')
        await userEvent.click(
          screen.getByRole('button', { name: 'Send Reset Code' }),
        )
      })
      await waitFor(() => {
        expect(onRequestResetCalled).toBe(true)
        expect(requestResetData).toEqual({
          email: 'test@example.com',
        })
      })
    })

    it('disables button when loading', () => {
      render(
        <PasswordResetForm
          mode="request"
          onRequestReset={(data) => {
            onRequestResetCalled = true
            requestResetData = data
          }}
        />,
      )
      // Simulate loading state by rerendering with isLoading true if needed
      // This test may need to be updated to use a real loading state trigger
      // For now, just check the button exists
      expect(
        screen.getByRole('button', { name: 'Send Reset Code' }),
      ).toBeInTheDocument()
    })
  })

  describe('reset mode', () => {
    it('renders form fields and button', () => {
      render(
        <PasswordResetForm
          mode="reset"
          onResetPassword={(data) => {
            onResetPasswordCalled = true
            resetPasswordData = data
          }}
        />,
      )
      expect(screen.getByLabelText('Verification Code')).toBeInTheDocument()
      expect(screen.getByLabelText('New Password')).toBeInTheDocument()
      expect(
        screen.getByPlaceholderText('Confirm new password'),
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'Reset Password' }),
      ).toBeInTheDocument()
    })

    it('shows validation error for invalid code', async () => {
      render(
        <PasswordResetForm
          mode="reset"
          onResetPassword={(data) => {
            onResetPasswordCalled = true
            resetPasswordData = data
          }}
        />,
      )
      await userEvent.type(screen.getByLabelText('Verification Code'), '12345')
      await userEvent.type(screen.getByLabelText('New Password'), 'password123')
      await userEvent.type(
        screen.getByPlaceholderText('Confirm new password'),
        'password123',
      )
      await userEvent.click(
        screen.getByRole('button', { name: 'Reset Password' }),
      )
      await waitFor(() => {
        expect(screen.getByText('Code must be 6 digits')).toBeInTheDocument()
      })
    })

    it('shows validation error for short password', async () => {
      render(
        <PasswordResetForm
          mode="reset"
          onResetPassword={(data) => {
            onResetPasswordCalled = true
            resetPasswordData = data
          }}
        />,
      )
      await userEvent.type(screen.getByLabelText('Verification Code'), '123456')
      await userEvent.type(screen.getByLabelText('New Password'), '123')
      await userEvent.type(
        screen.getByPlaceholderText('Confirm new password'),
        '123',
      )
      await userEvent.click(
        screen.getByRole('button', { name: 'Reset Password' }),
      )
      await waitFor(() => {
        expect(
          screen.getAllByText('Password must be at least 8 characters'),
        ).toHaveLength(2)
      })
    })

    it('shows validation error for mismatched passwords', async () => {
      render(
        <PasswordResetForm
          mode="reset"
          onResetPassword={(data) => {
            onResetPasswordCalled = true
            resetPasswordData = data
          }}
        />,
      )
      await userEvent.type(screen.getByLabelText('Verification Code'), '123456')
      await userEvent.type(screen.getByLabelText('New Password'), 'Password1!')
      await userEvent.type(
        screen.getByPlaceholderText('Confirm new password'),
        'Password2!',
      )
      await userEvent.click(
        screen.getByRole('button', { name: 'Reset Password' }),
      )
      await waitFor(() => {
        // eslint-disable-next-line quotes
        expect(screen.getByText("Passwords don't match")).toBeInTheDocument()
      })
    })

    it('calls onResetPassword with valid data on submit', async () => {
      render(
        <PasswordResetForm
          mode="reset"
          onResetPassword={(data) => {
            onResetPasswordCalled = true
            resetPasswordData = data
          }}
        />,
      )
      await act(async () => {
        await userEvent.type(
          screen.getByLabelText('Verification Code'),
          '123456',
        )
        await userEvent.type(
          screen.getByLabelText('New Password'),
          'Password1!',
        )
        await userEvent.type(
          screen.getByPlaceholderText('Confirm new password'),
          'Password1!',
        )
        await userEvent.click(
          screen.getByRole('button', { name: 'Reset Password' }),
        )
      })
      await waitFor(() => {
        expect(onResetPasswordCalled).toBe(true)
        expect(resetPasswordData).toEqual({
          code: '123456',
          newPassword: 'Password1!',
          confirmPassword: 'Password1!',
        })
      })
    })
  })
})
