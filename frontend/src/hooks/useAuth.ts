import { useState } from 'react';
import { useAuthStore } from '../store/auth';
import { useMutation, gql } from 'urql';
import { logger } from '../utils/logger';

const SIGN_IN_MUTATION = gql`
  mutation SignIn($email: String!, $password: String!) {
    signIn(email: $email, password: $password) {
      token
      user {
        id
        email
        name
      }
    }
  }
`;

const SIGN_UP_MUTATION = gql`
  mutation SignUp($email: String!, $password: String!, $name: String!) {
    signUp(email: $email, password: $password, name: $name) {
      token
      user {
        id
        email
        name
      }
    }
  }
`;

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, signInMutation] = useMutation(SIGN_IN_MUTATION);
  const [, signUpMutation] = useMutation(SIGN_UP_MUTATION);
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInMutation({ email, password });

      if (result.error) {
        throw new Error(result.error.message);
      }

      if (!result.data?.signIn) {
        throw new Error('No data returned from sign in');
      }

      const { token, user } = result.data.signIn;
      localStorage.setItem('token', token);
      setAuth(token, user);
      return result.data.signIn;
    } catch (err: any) {
      logger.error(err);
      setError(err.message || 'An error occurred during sign in');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    localStorage.removeItem('token');
    clearAuth();
  };

  const signUp = async (email: string, password: string, name: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await signUpMutation({ email, password, name });

      if (result.error) {
        throw new Error(result.error.message);
      }

      if (!result.data?.signUp) {
        throw new Error('No data returned from sign up');
      }

      const { token, user } = result.data.signUp;
      localStorage.setItem('token', token);
      setAuth(token, user);
      return result.data.signUp;
    } catch (err: any) {
      logger.error(err);
      setError(err.message || 'An error occurred during sign up');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getCurrentUser = async () => {
    // This would typically be implemented with a urql query
    // For now, we'll just return the user from the store
    const token = localStorage.getItem('token');
    if (!token) {
      return null;
    }

    // In a real implementation, we would verify the token with the server
    // For now, we'll just return the user from the store
    const state = useAuthStore.getState();
    return state.user;
  };

  return { signIn, signOut, signUp, getCurrentUser, loading, error };
};
