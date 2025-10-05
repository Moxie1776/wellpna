import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { gql } from 'urql'

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
`

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
`

interface AuthState {
  token: string | null
  user: { id: number; email: string } | null
  loading: boolean
  error: string | null
  setAuth: (token: string, user: { id: number; email: string }) => void
  clearAuth: () => void
  signIn: (email: string, password: string) => Promise<any>
  signOut: () => void
  signUp: (email: string, password: string, name: string) => Promise<any>
  getCurrentUser: () => { id: number; email: string } | null
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      loading: false,
      error: null,
      setAuth: (token, user) => set({ token, user }),
      clearAuth: () => set({ token: null, user: null }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      getCurrentUser: () => {
        const token = localStorage.getItem('token')
        if (!token) {
          return null
        }
        const state = get()
        return state.user
      },
      signIn: async (email: string, password: string) => {
        set({ loading: true, error: null })
        try {
          // Note: In a real implementation, you'd need to inject the urql client
          // For now, this is a placeholder - the actual implementation would use the client
          const response = await fetch('/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              query: SIGN_IN_MUTATION.loc?.source?.body,
              variables: { email, password },
            }),
          })
          const result = await response.json()

          if (result.errors) {
            set({ error: result.errors[0].message, loading: false })
            return null
          }

          if (!result.data?.signIn) {
            set({ error: 'No data returned from sign in', loading: false })
            return null
          }

          const { token, user } = result.data.signIn
          localStorage.setItem('token', token)
          set({ token, user, loading: false })
          return result.data.signIn
        } catch (err: any) {
          set({
            error: err.message || 'An error occurred during sign in',
            loading: false,
          })
          return null
        }
      },
      signOut: () => {
        localStorage.removeItem('token')
        set({ token: null, user: null })
      },
      signUp: async (email: string, password: string, name: string) => {
        set({ loading: true, error: null })
        try {
          const response = await fetch('/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              query: SIGN_UP_MUTATION.loc?.source?.body,
              variables: { email, password, name },
            }),
          })
          const result = await response.json()

          if (result.errors) {
            set({ error: result.errors[0].message, loading: false })
            return null
          }

          if (!result.data?.signUp) {
            set({ error: 'No data returned from sign up', loading: false })
            return null
          }

          const { token, user } = result.data.signUp
          localStorage.setItem('token', token)
          set({ token, user, loading: false })
          return result.data.signUp
        } catch (err: any) {
          set({
            error: err.message || 'An error occurred during sign up',
            loading: false,
          })
          return null
        }
      },
    }),
    {
      name: 'auth-storage',
      // Only persist token and user, not loading/error
      partialize: (state) => ({ token: state.token, user: state.user }),
    },
  ),
)
