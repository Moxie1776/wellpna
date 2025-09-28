/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { SignupForm } from '../SignupForm';
import { useAuth } from '../../hooks/useAuth';

// Mock useAuth hook instead of low-level urql
jest.mock('../../hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('SignupForm', () => {
  const mockSignUp = jest.fn();
  const mockOnSignup = jest.fn();

  beforeEach(() => {
    mockSignUp.mockReset();
    mockOnSignup.mockReset();
    mockUseAuth.mockReturnValue({
      signIn: jest.fn(),
      signOut: jest.fn(),
      signUp: mockSignUp,
      getCurrentUser: jest.fn(),
      loading: false,
      error: null,
    } as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Rendering tests
  it('renders the signup form fields and button', () => {
    render(<SignupForm onSignup={mockOnSignup} />);
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign Up' })).toBeInTheDocument();
  });

  // Form submission success tests
  it('calls signUp when form is submitted', async () => {
    mockSignUp.mockResolvedValueOnce({
      token: 'test-token',
      user: { id: '1', email: 'test@example.com', name: 'Test User' },
    });
    render(<SignupForm onSignup={mockOnSignup} />);
    await userEvent.type(screen.getByLabelText('Name'), 'Test User');
    await userEvent.type(screen.getByLabelText('Email'), 'test@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'password123');
    await userEvent.click(screen.getByRole('button', { name: 'Sign Up' }));
    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith(
        'test@example.com',
        'password123',
        'Test User'
      );
    });
  });

  it('calls onSignup after successful signUp', async () => {
    mockSignUp.mockResolvedValueOnce({
      token: 'test-token',
      user: { id: '1', email: 'test@example.com', name: 'Test User' },
    });
    render(<SignupForm onSignup={mockOnSignup} />);
    await userEvent.type(screen.getByLabelText('Name'), 'Test User');
    await userEvent.type(screen.getByLabelText('Email'), 'test@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'password123');
    await userEvent.click(screen.getByRole('button', { name: 'Sign Up' }));
    await waitFor(() => {
      expect(mockOnSignup).toHaveBeenCalled();
    });
  });

  // Error handling tests
  it('shows error message when signUp fails', async () => {
    const errorMessage = 'Email already exists';
    mockSignUp.mockRejectedValueOnce(new Error(errorMessage));
    mockUseAuth.mockReturnValue({
      signIn: jest.fn(),
      signOut: jest.fn(),
      signUp: mockSignUp,
      getCurrentUser: jest.fn(),
      loading: false,
      error: errorMessage,
    } as any);
    render(<SignupForm onSignup={mockOnSignup} />);
    await userEvent.type(screen.getByLabelText('Name'), 'Test User');
    await userEvent.type(screen.getByLabelText('Email'), 'test@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'password123');
    await userEvent.click(screen.getByRole('button', { name: 'Sign Up' }));
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });
});
