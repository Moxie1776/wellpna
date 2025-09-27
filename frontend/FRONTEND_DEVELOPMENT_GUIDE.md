# Frontend Development Guide for WellPNA Authentication

This guide provides instructions for setting up a new chat session to develop the frontend authentication components for the WellPNA application, matching the backend authentication system we've implemented.

## Prerequisites

1. Backend GraphQL API running on port 4000
2. Node.js and npm installed
3. VS Code with recommended extensions

## Initial Setup Instructions

When starting a new chat session, use these instructions to set up the frontend development environment:

### 1. Project Structure Review

First, examine the existing frontend structure:

- `frontend/src/components/` - Contains LoginForm and SignupForm components
- `frontend/src/pages/` - Contains LoginPage and SignupPage
- `frontend/src/store/auth.ts` - Authentication state management
- `frontend/src/providers/authProvider.ts` - Authentication context provider

### 2. GraphQL Client Setup

Install required dependencies for GraphQL integration:

```
cd frontend
npm install graphql @apollo/client
```

### 3. Environment Configuration

Create or update `.env` file in the frontend directory:

```
VITE_GRAPHQL_ENDPOINT=http://localhost:4000/graphql
```

### 4. GraphQL Client Configuration

Create `frontend/src/lib/graphqlClient.ts`:

```typescript
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const httpLink = createHttpLink({
  uri: import.meta.env.VITE_GRAPHQL_ENDPOINT,
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('authToken');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  }
});

export const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache()
});
```

### 5. Authentication Hook

Create `frontend/src/hooks/useAuth.ts`:

```typescript
import { useState } from 'react';
import { client } from '../lib/graphqlClient';
import { gql } from '@apollo/client';

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

const ME_QUERY = gql`
  query Me {
    me {
      id
      email
      name
    }
  }
`;

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signUp = async (email: string, password: string, name: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await client.mutate({
        mutation: SIGN_UP_MUTATION,
        variables: { email, password, name }
      });
      
      localStorage.setItem('authToken', data.signUp.token);
      return data.signUp;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await client.mutate({
        mutation: SIGN_IN_MUTATION,
        variables: { email, password }
      });
      
      localStorage.setItem('authToken', data.signIn.token);
      return data.signIn;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    localStorage.removeItem('authToken');
  };

  const getCurrentUser = async () => {
    try {
      const { data } = await client.query({ query: ME_QUERY });
      return data.me;
    } catch (err) {
      return null;
    }
  };

  return { signUp, signIn, signOut, getCurrentUser, loading, error };
};
```

## Testing Structure

### 1. Component Testing

Install testing dependencies:

```
cd frontend
npm install -D @testing-library/react @testing-library/jest-dom jest-environment-jsdom
```

### 2. Test Setup

Create `frontend/jest.setup.ts`:

```typescript
import '@testing-library/jest-dom';
```

Update `frontend/jest.config.js`:

```javascript
export default {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapping: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  testMatch: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
};
```

### 3. Component Tests

Create tests for authentication components:

- `frontend/src/components/__tests__/LoginForm.test.tsx`
- `frontend/src/components/__tests__/SignupForm.test.tsx`

Example test structure for LoginForm:

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { LoginForm } from '../LoginForm';

describe('LoginForm', () => {
  it('renders email and password fields', () => {
    render(<LoginForm onLogin={jest.fn()} />);
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('calls onLogin with form data when submitted', () => {
    const mockLogin = jest.fn();
    render(<LoginForm onLogin={mockLogin} />);
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    expect(mockLogin).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    });
  });
});
```

## Implementation Tasks

### 1. Update Authentication Components

Modify `frontend/src/components/LoginForm.tsx` to use the useAuth hook:

```typescript
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export const LoginForm = ({ onLogin }: { onLogin: () => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, loading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signIn(email, password);
      onLogin();
    } catch (err) {
      // Error handling
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields and submit button */}
      {error && <div className="error">{error}</div>}
    </form>
  );
};
```

### 2. Connect to Store

Update `frontend/src/store/auth.ts` to work with the GraphQL API:

```typescript
import { create } from 'zustand';
import { client } from '../lib/graphqlClient';
import { gql } from '@apollo/client';

const ME_QUERY = gql`
  query Me {
    me {
      id
      email
      name
    }
  }
`;

type AuthState = {
  user: any | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (token: string) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  loading: true,
  
  login: (token: string) => {
    localStorage.setItem('authToken', token);
    set({ isAuthenticated: true });
  },
  
  logout: () => {
    localStorage.removeItem('authToken');
    set({ user: null, isAuthenticated: false });
  },
  
  checkAuth: async () => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const { data } = await client.query({ query: ME_QUERY });
        set({ user: data.me, isAuthenticated: true, loading: false });
      } catch (error) {
        localStorage.removeItem('authToken');
        set({ user: null, isAuthenticated: false, loading: false });
      }
    } else {
      set({ user: null, isAuthenticated: false, loading: false });
    }
  }
}));
```

## Testing the Implementation

### 1. Run the Backend

Ensure the backend is running:

```
cd backend
npm run dev
```

### 2. Run Frontend Tests

Execute the test suite:

```
cd frontend
npm test
```

### 3. Manual Testing

1. Start the frontend development server:

   ```
   cd frontend
   npm run dev
   ```

2. Test the authentication flow:
   - Navigate to the signup page
   - Create a new account
   - Verify the user is redirected to the dashboard
   - Log out and log back in with the same credentials
   - Verify the user session persists

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure the backend is configured to accept requests from the frontend origin (localhost:5173)

2. **Authentication State Not Persisting**: Check that the auth token is being stored in localStorage correctly

3. **GraphQL Errors**: Verify the GraphQL endpoint URL in the environment variables

### Debugging Steps

1. Check browser developer tools Network tab for failed requests
2. Verify the GraphQL schema matches between frontend and backend
3. Ensure environment variables are correctly set
4. Check browser console for JavaScript errors

This guide provides a comprehensive approach to implementing frontend authentication that integrates with the backend GraphQL API we've developed.
