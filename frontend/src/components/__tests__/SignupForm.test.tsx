/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

  it('renders the signup form', () => {
    render(<SignupForm onSignup={mockOnSignup} />);

    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign Up' })).toBeInTheDocument();
  });

  it('calls signUp and onSignup when form is submitted', async () => {
    mockSignUp.mockResolvedValueOnce({
      token: 'test-token',
      user: { id: '1', email: 'test@example.com', name: 'Test User' },
    });

    render(<SignupForm onSignup={mockOnSignup} />);

    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'Test User' },
    });
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith(
        'test@example.com',
        'password123',
        'Test User'
      );
      expect(mockOnSignup).toHaveBeenCalled();
    });
  });

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

    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'Test User' },
    });
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });
});
