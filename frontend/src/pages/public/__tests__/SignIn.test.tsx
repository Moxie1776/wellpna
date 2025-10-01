 
import '@testing-library/jest-dom';

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { SignInForm } from '../../../components/public/SignInForm';
import { useAuth } from '../../../hooks/useAuth';

// Mock useAuth hook directly
jest.mock('../../../hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('SignInForm', () => {
  const mockSignIn = jest.fn();
  const mockonSignIn = jest.fn();

  beforeEach(() => {
    mockSignIn.mockReset();
    mockonSignIn.mockReset();
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
    render(<SignInForm onSignIn={mockonSignIn} />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
  });

  // Form submission success tests
  it('calls signIn when form is submitted', async () => {
    mockSignIn.mockResolvedValueOnce({
      token: 'test-token',
      user: { id: '1', email: 'test@example.com', name: 'Test User' },
    });
    render(<SignInForm onSignIn={mockonSignIn} />);
    await userEvent.type(screen.getByLabelText('Email'), 'test@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'password123');
    await userEvent.click(screen.getByRole('button', { name: 'Sign In' }));
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith(
        'test@example.com',
        'password123'
      );
    });
  });

  it('calls onSignIn after successful signIn', async () => {
    mockSignIn.mockResolvedValueOnce({
      token: 'test-token',
      user: { id: '1', email: 'test@example.com', name: 'Test User' },
    });
    render(<SignInForm onSignIn={mockonSignIn} />);
    await userEvent.type(screen.getByLabelText('Email'), 'test@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'password123');
    await userEvent.click(screen.getByRole('button', { name: 'Sign In' }));
    await waitFor(() => {
      expect(mockonSignIn).toHaveBeenCalled();
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
    render(<SignInForm onSignIn={mockonSignIn} />);
    await userEvent.type(screen.getByLabelText('Email'), 'test@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'wrongpassword');
    await userEvent.click(screen.getByRole('button', { name: 'Sign In' }));
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });
});
