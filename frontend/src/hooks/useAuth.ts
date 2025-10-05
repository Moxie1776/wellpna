import { useAuthStore } from '../store/auth'

export const useAuth = () => {
  const {
    signIn,
    signOut,
    signUp,
    getCurrentUser,
    loading,
    error,
    user,
    token,
  } = useAuthStore()

  return {
    signIn,
    signOut,
    signUp,
    getCurrentUser,
    loading,
    error,
    user,
    token,
  }
}
