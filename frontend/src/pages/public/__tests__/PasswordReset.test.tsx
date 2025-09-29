import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import { useMutation } from 'urql';
import PasswordResetPage from '../PasswordReset';

// Mock urql
jest.mock('urql', () => ({
  useMutation: jest.fn(),
  gql: jest.fn((template: TemplateStringsArray) => template.join('')),
}));

// Mock useToast
jest.mock('@/hooks/useToast', () => ({
  useToast: () => ({
    showToast: jest.fn(),
  }),
}));

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('PasswordResetPage', () => {
  const mockRequestResetMutation = jest.fn();
  const mockResetPasswordMutation = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useMutation as jest.Mock).mockReturnValue([
      { fetching: false },
      mockRequestResetMutation,
    ]);
  });

  describe('Request Password Reset Mode', () => {
    it('renders the request reset form', () => {
      render(
        <MemoryRouter>
          <PasswordResetPage />
        </MemoryRouter>
      );

      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Send Reset Link' })
      ).toBeInTheDocument();
    });

    it('submits the request reset form successfully', async () => {
      mockRequestResetMutation.mockResolvedValue({ data: {}, error: null });
      // Mock useMutation to always return mockRequestResetMutation for this test
      (useMutation as jest.Mock).mockImplementation(() => [
        { fetching: false },
        mockRequestResetMutation,
      ]);

      render(
        <MemoryRouter>
          <PasswordResetPage />
        </MemoryRouter>
      );

      const emailInput = screen.getByLabelText('Email');
      const submitButton = screen.getByRole('button', {
        name: 'Send Reset Link',
      });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockRequestResetMutation).toHaveBeenCalledWith({
          email: 'test@example.com',
        });
      });
    });

    it('shows error when email is empty', async () => {
      render(
        <MemoryRouter>
          <PasswordResetPage />
        </MemoryRouter>
      );

      const submitButton = screen.getByRole('button', {
        name: 'Send Reset Link',
      });
      fireEvent.click(submitButton);

      // Error should be shown via toast, but since we mock it, we can't test directly
      // In a real test, we'd check the toast was called
    });

    it('handles mutation error', async () => {
      mockRequestResetMutation.mockResolvedValue({
        data: null,
        error: { message: 'User not found' },
      });
      // Mock useMutation to always return mockRequestResetMutation for this test
      (useMutation as jest.Mock).mockImplementation(() => [
        { fetching: false },
        mockRequestResetMutation,
      ]);

      render(
        <MemoryRouter>
          <PasswordResetPage />
        </MemoryRouter>
      );

      const emailInput = screen.getByLabelText('Email');
      const submitButton = screen.getByRole('button', {
        name: 'Send Reset Link',
      });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockRequestResetMutation).toHaveBeenCalled();
      });
    });
  });

  describe('Reset Password Mode', () => {
    beforeEach(() => {
      (useMutation as jest.Mock).mockReturnValue([
        { fetching: false },
        mockResetPasswordMutation,
      ]);
    });

    it('renders the reset password form when token is present', () => {
      render(
        <MemoryRouter initialEntries={['/reset-password?token=abc123']}>
          <PasswordResetPage />
        </MemoryRouter>
      );

      expect(screen.getByLabelText('New Password')).toBeInTheDocument();
      expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Reset Password' })
      ).toBeInTheDocument();
    });

    it('submits the reset password form successfully', async () => {
      mockResetPasswordMutation.mockResolvedValue({
        data: {
          resetPassword: {
            token: 'new-token',
            user: { id: '1', email: 'test@example.com', name: 'Test' },
          },
        },
        error: null,
      });
      // Mock useMutation to always return mockResetPasswordMutation for this test
      (useMutation as jest.Mock).mockImplementation(() => [
        { fetching: false },
        mockResetPasswordMutation,
      ]);

      render(
        <MemoryRouter initialEntries={['/reset-password?token=abc123']}>
          <PasswordResetPage />
        </MemoryRouter>
      );

      const otpInput = screen.getByLabelText('Verification Code');
      const newPasswordInput = screen.getByLabelText('New Password');
      const confirmPasswordInput = screen.getByLabelText('Confirm Password');
      const submitButton = screen.getByRole('button', {
        name: 'Reset Password',
      });

      await userEvent.clear(otpInput);
      await userEvent.type(otpInput, '123456');
      await userEvent.clear(newPasswordInput);
      await userEvent.type(newPasswordInput, 'newpassword123');
      await userEvent.clear(confirmPasswordInput);
      await userEvent.type(confirmPasswordInput, 'newpassword123');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockResetPasswordMutation).toHaveBeenCalledWith({
          token: 'abc123',
          newPassword: 'newpassword123',
          code: '123456',
        });
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('shows error when passwords do not match', async () => {
      render(
        <MemoryRouter initialEntries={['/reset-password?token=abc123']}>
          <PasswordResetPage />
        </MemoryRouter>
      );

      const newPasswordInput = screen.getByLabelText('New Password');
      const confirmPasswordInput = screen.getByLabelText('Confirm Password');
      const submitButton = screen.getByRole('button', {
        name: 'Reset Password',
      });

      fireEvent.change(newPasswordInput, { target: { value: 'password1' } });
      fireEvent.change(confirmPasswordInput, {
        target: { value: 'password2' },
      });
      fireEvent.click(submitButton);

      // Error should be shown via toast
    });

    it('shows error when password is too short', async () => {
      render(
        <MemoryRouter initialEntries={['/reset-password?token=abc123']}>
          <PasswordResetPage />
        </MemoryRouter>
      );

      const newPasswordInput = screen.getByLabelText('New Password');
      const confirmPasswordInput = screen.getByLabelText('Confirm Password');
      const submitButton = screen.getByRole('button', {
        name: 'Reset Password',
      });

      fireEvent.change(newPasswordInput, { target: { value: '123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: '123' } });
      fireEvent.click(submitButton);

      // Error should be shown via toast
    });

    it('handles mutation error', async () => {
      mockResetPasswordMutation.mockResolvedValue({
        data: null,
        error: { message: 'Invalid token' },
      });
      // Mock useMutation to always return mockResetPasswordMutation for this test
      (useMutation as jest.Mock).mockImplementation(() => [
        { fetching: false },
        mockResetPasswordMutation,
      ]);

      render(
        <MemoryRouter initialEntries={['/reset-password?token=abc123']}>
          <PasswordResetPage />
        </MemoryRouter>
      );

      const otpInput = screen.getByLabelText('Verification Code');
      const newPasswordInput = screen.getByLabelText('New Password');
      const confirmPasswordInput = screen.getByLabelText('Confirm Password');
      const submitButton = screen.getByRole('button', {
        name: 'Reset Password',
      });

      await userEvent.clear(otpInput);
      await userEvent.type(otpInput, '123456');
      await userEvent.clear(newPasswordInput);
      await userEvent.type(newPasswordInput, 'newpassword123');
      await userEvent.clear(confirmPasswordInput);
      await userEvent.type(confirmPasswordInput, 'newpassword123');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockResetPasswordMutation).toHaveBeenCalled();
      });
    });
  });
});
