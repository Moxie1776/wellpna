import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { SIGN_IN_QUERY } from '../graphql/queries/signInQuery'
import { SIGN_UP_MUTATION } from '../graphql/mutations/signUpMutation'
import client from '../utils/graphqlClient'
import { isValidToken } from '../utils/jwt'

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
  isTokenValid: () => boolean
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
      isTokenValid: () => {
        const token = localStorage.getItem('token')
        return token ? isValidToken(token) : false
      },
      signIn: async (email: string, password: string) => {
        set({ loading: true, error: null })
        try {
          const result = await client
            .query(SIGN_IN_QUERY, { email, password }, { preferGetMethod: false })
            .toPromise()
          if (result.error) {
            set({
              error: result.error.message || 'Authentication failed',
              loading: false,
            })
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
          const result = await client
            .mutation(SIGN_UP_MUTATION, {
              email,
              password,
              name,
            })
            .toPromise()
          if (result.error) {
            set({
              error: result.error.message || 'Authentication failed',
              loading: false,
            })
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
