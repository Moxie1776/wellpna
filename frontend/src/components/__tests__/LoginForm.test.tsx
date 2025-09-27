import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

  describe('rendering', () => {
    it('renders the login form', () => {
      render(<LoginForm onLogin={mockOnLogin} />);

      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
    });
  });

  describe('form submission success', () => {
    it('calls signIn and onLogin when form is submitted', async () => {
      mockSignIn.mockResolvedValueOnce({
        token: 'test-token',
        user: { id: '1', email: 'test@example.com', name: 'Test User' },
      });

      render(<LoginForm onLogin={mockOnLogin} />);

      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'password123' },
      });
      fireEvent.click(screen.getByRole('button', { name: 'Login' }));

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith(
          'test@example.com',
          'password123'
        );
        expect(mockOnLogin).toHaveBeenCalled();
      });
    });
  });

  describe('form submission failure', () => {
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

      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'wrongpassword' },
      });
      fireEvent.click(screen.getByRole('button', { name: 'Login' }));

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });
  });
});
