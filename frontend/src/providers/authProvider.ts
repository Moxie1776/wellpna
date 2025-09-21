import { AuthProvider } from 'react-admin';
import { useAuthStore } from '../store/auth';

export const authProvider: AuthProvider = {
  login: async ({ username, password }) => {
    const response = await fetch('http://localhost:4000/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          mutation Login($email: String!, $password: String!) {
            login(email: $email, password: $password) {
              token
              user {
                id
                email
              }
            }
          }
        `,
        variables: { email: username, password },
      }),
    });

    const { data, errors } = await response.json();

    if (errors) {
      return Promise.reject(new Error(errors[0].message));
    }

    const { token, user } = data.login;
    useAuthStore.getState().setAuth(token, user);
    return Promise.resolve();
  },
  logout: () => {
    useAuthStore.getState().clearAuth();
    return Promise.resolve();
  },
  checkError: (error) => {
    const status = error.status;
    if (status === 401 || status === 403) {
      useAuthStore.getState().clearAuth();
      return Promise.reject();
    }
    return Promise.resolve();
  },
  checkAuth: () => {
    return useAuthStore.getState().token ? Promise.resolve() : Promise.reject();
  },
  getPermissions: () => Promise.resolve(),
  getIdentity: () => {
    const { user } = useAuthStore.getState();
    return user ? Promise.resolve(user) : Promise.reject();
  },
};