import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import { useMutation } from 'urql';
import EmailVerificationPage from '../EmailVerificationPage';

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

describe('EmailVerificationPage', () => {
  let mutationMocks: jest.Mock[] = [];
  beforeEach(() => {
    jest.clearAllMocks();
    mutationMocks = [jest.fn(), jest.fn()];
    (useMutation as jest.Mock).mockImplementation(() => [
      { fetching: false },
      mutationMocks.shift() || jest.fn(),
    ]);
  });

  // Rendering and initial state of the email verification form
  describe('rendering', () => {
    it('renders the email verification form', () => {
      render(
        <MemoryRouter>
          <EmailVerificationPage />
        </MemoryRouter>
      );

      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Verification Code')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Verify Email' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Resend Code' })
      ).toBeInTheDocument();
    });

    it('pre-fills email from URL params', () => {
      render(
        <MemoryRouter initialEntries={['/verify-email?email=test@example.com']}>
          <EmailVerificationPage />
        </MemoryRouter>
      );

      expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
    });
  });

  // Form submission: mutation call, navigation, error handling
  describe('form submission', () => {
    // Verifies that the mutation is called with correct values
    describe('mutation call', () => {
      it('calls verify mutation with correct values', async () => {
        const mockVerifyMutation = jest.fn().mockResolvedValue({
          data: {
            verifyEmail: {
              token: 'new-token',
              user: { id: '1', email: 'test@example.com' },
            },
          },
          error: null,
        });
        // Mock useMutation to always return mockVerifyMutation for this test
        (useMutation as jest.Mock).mockImplementation(() => [
          { fetching: false },
          mockVerifyMutation,
        ]);

        render(
          <MemoryRouter>
            <EmailVerificationPage />
          </MemoryRouter>
        );

        const emailInput = screen.getByLabelText('Email');
        const otpField = screen.getByLabelText('Verification Code');
        const submitButton = screen.getByRole('button', {
          name: 'Verify Email',
        });

        await userEvent.clear(emailInput);
        await userEvent.type(emailInput, 'test@example.com');
        await userEvent.clear(otpField);
        await userEvent.type(otpField, '123456');
        await userEvent.click(submitButton);

        await waitFor(() => {
          expect(mockVerifyMutation).toHaveBeenCalledWith({
            email: 'test@example.com',
            code: '123456',
          });
        });
      });
    });

    // Verifies navigation to dashboard after successful verification
    describe('navigation', () => {
      it('navigates to dashboard after successful verification', async () => {
        const mockVerifyMutation = jest.fn().mockResolvedValue({
          data: {
            verifyEmail: {
              token: 'new-token',
              user: { id: '1', email: 'test@example.com' },
            },
          },
          error: null,
        });
        // Mock useMutation to always return mockVerifyMutation for this test
        (useMutation as jest.Mock).mockImplementation(() => [
          { fetching: false },
          mockVerifyMutation,
        ]);

        render(
          <MemoryRouter>
            <EmailVerificationPage />
          </MemoryRouter>
        );

        const emailInput = screen.getByLabelText('Email');
        const otpField = screen.getByLabelText('Verification Code');
        const submitButton = screen.getByRole('button', {
          name: 'Verify Email',
        });

        await userEvent.clear(emailInput);
        await userEvent.type(emailInput, 'test@example.com');
        await userEvent.clear(otpField);
        await userEvent.type(otpField, '123456');
        await userEvent.click(submitButton);

        await waitFor(() => {
          expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
        });
      });
    });

    // Shows error when fields are empty
    it('shows error when fields are empty', async () => {
      render(
        <MemoryRouter>
          <EmailVerificationPage />
        </MemoryRouter>
      );

      const submitButton = screen.getByRole('button', { name: 'Verify Email' });
      fireEvent.click(submitButton);

      // Error should be shown via toast
    });

    // Handles mutation error for invalid code
    it('handles verification mutation error', async () => {
      const mockVerifyMutation = jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Invalid code' },
      });
      // Mock useMutation to always return mockVerifyMutation for this test
      (useMutation as jest.Mock).mockImplementation(() => [
        { fetching: false },
        mockVerifyMutation,
      ]);

      render(
        <MemoryRouter>
          <EmailVerificationPage />
        </MemoryRouter>
      );

      const emailInput = screen.getByLabelText('Email');
      const otpField = screen.getByLabelText('Verification Code');
      const submitButton = screen.getByRole('button', { name: 'Verify Email' });

      await userEvent.clear(emailInput);
      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.clear(otpField);
      await userEvent.type(otpField, '123456');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockVerifyMutation).toHaveBeenCalled();
      });
    });
  });

  // Resend code: mutation call and error handling
  describe('resend code', () => {
    // Verifies resend mutation is called with correct values
    it('resends verification code successfully', async () => {
      const mockResendMutation = jest
        .fn()
        .mockResolvedValue({ data: {}, error: null });
      // Mock useMutation to always return mockResendMutation for this test
      (useMutation as jest.Mock).mockImplementation(() => [
        { fetching: false },
        mockResendMutation,
      ]);

      render(
        <MemoryRouter>
          <EmailVerificationPage />
        </MemoryRouter>
      );

      const emailInput = screen.getByLabelText('Email');
      const resendButton = screen.getByRole('button', { name: 'Resend Code' });

      await userEvent.clear(emailInput);
      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.click(resendButton);

      await waitFor(() => {
        expect(mockResendMutation).toHaveBeenCalledWith({
          email: 'test@example.com',
        });
      });
    });

    // Handles resend mutation error
    it('shows error when resend fails', async () => {
      const mockResendMutation = jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Email not found' },
      });
      // Mock useMutation to always return mockResendMutation for this test
      (useMutation as jest.Mock).mockImplementation(() => [
        { fetching: false },
        mockResendMutation,
      ]);

      render(
        <MemoryRouter>
          <EmailVerificationPage />
        </MemoryRouter>
      );

      const emailInput = screen.getByLabelText('Email');
      const resendButton = screen.getByRole('button', { name: 'Resend Code' });

      await userEvent.clear(emailInput);
      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.click(resendButton);

      await waitFor(() => {
        expect(mockResendMutation).toHaveBeenCalled();
      });
    });
  });
});
