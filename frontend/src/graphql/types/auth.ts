export interface User {
  id: string
  email: string
  name: string
  phoneNumber: string
  role: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface AuthState {
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