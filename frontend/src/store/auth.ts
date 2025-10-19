import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { AuthState, User } from '../graphql'
import { SignInDocument, SignUpDocument } from '../graphql/generated/graphql'
import client from '../utils/graphqlClient'
import { decodeToken, isValidToken } from '../utils/jwt'
import logger from '../utils/logger'

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
            .mutation(SignInDocument, {
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
          logger.debug('Sign in successful, user details:', user)
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
        // Remove both the token and the persisted zustand storage to avoid
        // restoring a stale user without a valid token.
        try {
          localStorage.removeItem('token')
          localStorage.removeItem('auth-storage')
          logger.debug('Cleared token and auth-storage from localStorage')
        } catch (e) {
          logger.error('Error clearing localStorage on signOut', e)
        }
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
            .mutation(SignUpDocument, {
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
        if (!token) {
          // No token: ensure persisted user is not restored
          try {
            localStorage.removeItem('auth-storage')
            logger.debug('No token found; removed persisted auth-storage')
          } catch (e) {
            logger.error('Error clearing auth-storage during init', e)
          }
          set({ token: null, user: null })
          return
        }

        if (isValidToken(token)) {
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
            logger.debug('initializeAuth: token valid, user restored', user)
            return
          }
        }

        // Invalid token: clear everything
        try {
          localStorage.removeItem('token')
          localStorage.removeItem('auth-storage')
          logger.debug('initializeAuth: invalid token cleared')
        } catch (e) {
          logger.error('Error clearing storage during initializeAuth', e)
        }
        set({ token: null, user: null })
      },
    }),
    {
      name: 'auth-storage',
      // Only persist token and user, not loading/error
      partialize: (state) => ({ token: state.token, user: state.user }),
    },
  ),
)
