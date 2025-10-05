import { FC } from 'react'
import { Navigate } from 'react-router-dom'

import { useAuthStore } from '@/store/auth'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export const ProtectedRoute: FC<ProtectedRouteProps> = ({ children }) => {
  const user = useAuthStore((state) => state.user)
  if (!user) {
    return <Navigate to="/" replace />
  }
  return <>{children}</>
}
