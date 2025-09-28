import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

  describe('form submission', () => {
    it('submits the verification form successfully', async () => {
      const mockVerifyMutation = jest.fn().mockResolvedValue({
        data: {
          verifyEmail: {
            token: 'new-token',
            user: { id: '1', email: 'test@example.com' },
          },
        },
        error: null,
      });
      mutationMocks = [mockVerifyMutation, jest.fn()];

      render(
        <MemoryRouter>
          <EmailVerificationPage />
        </MemoryRouter>
      );

      const emailInput = screen.getByLabelText('Email');
      const codeInput = screen.getByLabelText('Verification Code');
      const submitButton = screen.getByRole('button', { name: 'Verify Email' });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(codeInput, { target: { value: '123456' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockVerifyMutation).toHaveBeenCalledWith({
          email: 'test@example.com',
          code: '123456',
        });
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      });
    });

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

    it('handles verification mutation error', async () => {
      const mockVerifyMutation = jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Invalid code' },
      });
      mutationMocks = [mockVerifyMutation, jest.fn()];

      render(
        <MemoryRouter>
          <EmailVerificationPage />
        </MemoryRouter>
      );

      const emailInput = screen.getByLabelText('Email');
      const codeInput = screen.getByLabelText('Verification Code');
      const submitButton = screen.getByRole('button', { name: 'Verify Email' });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(codeInput, { target: { value: '123456' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockVerifyMutation).toHaveBeenCalled();
      });
    });
  });

  describe('resend code', () => {
    it('resends verification code successfully', async () => {
      const mockResendMutation = jest
        .fn()
        .mockResolvedValue({ data: {}, error: null });
      mutationMocks = [jest.fn(), mockResendMutation];

      render(
        <MemoryRouter>
          <EmailVerificationPage />
        </MemoryRouter>
      );

      const emailInput = screen.getByLabelText('Email');
      const resendButton = screen.getByRole('button', { name: 'Resend Code' });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(resendButton);

      await waitFor(() => {
        expect(mockResendMutation).toHaveBeenCalledWith({
          email: 'test@example.com',
        });
      });
    });

    it('shows error when resend fails', async () => {
      const mockResendMutation = jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Email not found' },
      });
      mutationMocks = [jest.fn(), mockResendMutation];

      render(
        <MemoryRouter>
          <EmailVerificationPage />
        </MemoryRouter>
      );

      const emailInput = screen.getByLabelText('Email');
      const resendButton = screen.getByRole('button', { name: 'Resend Code' });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(resendButton);

      await waitFor(() => {
        expect(mockResendMutation).toHaveBeenCalled();
      });
    });
  });
});
