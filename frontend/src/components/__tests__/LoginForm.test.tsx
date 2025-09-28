/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { LoginForm } from '../LoginForm';
import { useAuth } from '../../hooks/useAuth';

// Mock useAuth hook directly
jest.mock('../../hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('LoginForm', () => {
  const mockSignIn = jest.fn();
  const mockOnLogin = jest.fn();

  beforeEach(() => {
    mockSignIn.mockReset();
    mockOnLogin.mockReset();
    mockUseAuth.mockReturnValue({
      signIn: mockSignIn,
      signOut: jest.fn(),
      signUp: jest.fn(),
      getCurrentUser: jest.fn(),
      loading: false,
      error: null,
    } as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Rendering tests
  it('renders the login form fields and button', () => {
    render(<LoginForm onLogin={mockOnLogin} />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
  });

  // Form submission success tests
  it('calls signIn when form is submitted', async () => {
    mockSignIn.mockResolvedValueOnce({
      token: 'test-token',
      user: { id: '1', email: 'test@example.com', name: 'Test User' },
    });
    render(<LoginForm onLogin={mockOnLogin} />);
    await userEvent.type(screen.getByLabelText('Email'), 'test@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'password123');
    await userEvent.click(screen.getByRole('button', { name: 'Login' }));
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith(
        'test@example.com',
        'password123'
      );
    });
  });

  it('calls onLogin after successful signIn', async () => {
    mockSignIn.mockResolvedValueOnce({
      token: 'test-token',
      user: { id: '1', email: 'test@example.com', name: 'Test User' },
    });
    render(<LoginForm onLogin={mockOnLogin} />);
    await userEvent.type(screen.getByLabelText('Email'), 'test@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'password123');
    await userEvent.click(screen.getByRole('button', { name: 'Login' }));
    await waitFor(() => {
      expect(mockOnLogin).toHaveBeenCalled();
    });
  });

  // Error handling tests
  it('shows error message when signIn fails', async () => {
    const errorMessage = 'Invalid credentials';
    mockSignIn.mockRejectedValueOnce(new Error(errorMessage));
    mockUseAuth.mockReturnValue({
      signIn: mockSignIn,
      signOut: jest.fn(),
      signUp: jest.fn(),
      getCurrentUser: jest.fn(),
      loading: false,
      error: errorMessage,
    } as any);
    render(<LoginForm onLogin={mockOnLogin} />);
    await userEvent.type(screen.getByLabelText('Email'), 'test@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'wrongpassword');
    await userEvent.click(screen.getByRole('button', { name: 'Login' }));
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });
});
