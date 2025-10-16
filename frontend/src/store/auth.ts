import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { SIGN_UP_MUTATION } from '../graphql/mutations/signUpMutation'
import client from '../utils/graphqlClient'
import { decodeToken, isValidToken } from '../utils/jwt'
import logger from '../utils/logger'
import { SIGN_IN_MUTATION } from './../graphql/mutations/signInMutation'

interface User {
  id: string
  email: string
  name: string
  phoneNumber: string
  role: string
}

interface AuthState {
  token: string | null
  user: User | null
  loading: boolean
  error: string | null
  setAuth: (token: string, user: User) => void
  clearAuth: () => void
  updateUser: (user: User) => void
  signIn: (email: string, password: string) => Promise<any>
  signOut: () => void
  signUp: (
    email: string,
    password: string,
    name: string,
    phoneNumber: string,
  ) => Promise<any>
  getCurrentUser: () => User | null
  isTokenValid: () => boolean
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  initializeAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      loading: false,
      error: null,
      setAuth: (token, user) => set({ token, user }),
      updateUser: (user) => set({ user }),
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
            .mutation(SIGN_IN_MUTATION, {
              data: {
                email,
                password,
              },
            })
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
          logger.error('Sign in error:', err)
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
      signUp: async (
        email: string,
        password: string,
        name: string,
        phoneNumber: string,
      ) => {
        set({ loading: true, error: null })
        try {
          const result = await client
            .mutation(SIGN_UP_MUTATION, {
              data: {
                email,
                password,
                name,
                phoneNumber,
              },
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
          logger.error('Sign up error:', err)
          set({
            error: err.message || 'An error occurred during sign up',
            loading: false,
          })
          return null
        }
      },
      initializeAuth: () => {
        const token = localStorage.getItem('token')
        if (token && isValidToken(token)) {
          const decoded = decodeToken(token)
          if (decoded && typeof decoded === 'object') {
            // Extract user info from JWT payload
            const user: User = {
              id: decoded.id,
              email: decoded.email,
              name: decoded.name,
              phoneNumber: decoded.phoneNumber,
              role: decoded.role,
            }
            set({ token, user })
          }
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
