import * as React from 'react'

export type AppRoute = {
  label: string
  href: string
  icon?: React.ComponentType<{ size?: number }>
  requiresAuth?: boolean
  element?: React.ReactNode
  page?: React.ComponentType<any>
}

// Import icons at the top of your file

import {
  MdDashboard,
  MdEmail,
  MdHome,
  MdLogin,
  MdPersonAdd,
  MdVpnKey,
} from 'react-icons/md'

import { Dashboard } from '../pages/dashboard/Dashboard'
import EmailVerificationPage from '../pages/public/EmailVerification'
import HomePage from '../pages/public/Home'
import PasswordResetPage from '../pages/public/PasswordReset'
import SignInPage from '../pages/public/SignIn'
import SignupPage from '../pages/public/SignUp'

export const appRoutes: AppRoute[] = [
  {
    label: 'Home',
    href: '/',
    icon: MdHome,
    requiresAuth: false,
    page: HomePage,
  },
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: MdDashboard,
    requiresAuth: true,
    page: Dashboard,
  },
  {
    label: 'Sign In',
    href: '/login',
    icon: MdLogin,
    requiresAuth: false,
    page: SignInPage,
  },
  {
    label: 'Sign Up',
    href: '/signup',
    icon: MdPersonAdd,
    requiresAuth: false,
    page: SignupPage,
  },
  {
    label: 'Password Reset',
    href: '/reset-password',
    icon: MdVpnKey,
    requiresAuth: false,
    page: PasswordResetPage,
  },
  {
    label: 'Email Verification',
    href: '/verify-email',
    icon: MdEmail,
    requiresAuth: false,
    page: EmailVerificationPage,
  },
]
