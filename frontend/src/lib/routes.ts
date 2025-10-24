import * as React from 'react'

export type AppRoute = {
  label: string
  href: string
  icon?: React.ComponentType<{ size?: number }>
  requiresAuth?: boolean
  requiredRole?: string
  element?: React.ReactNode
  page?: React.ComponentType<any>
}

// Import icons at the top of your file

import {
  MdDashboard,
  MdHome,
  MdLockReset,
  MdLogin,
  MdOutlineAdminPanelSettings,
  MdPerson,
  MdPersonAdd,
  MdVerifiedUser,
} from 'react-icons/md'

import { Admin as AdminPage } from '../pages/admin/Admin'
import { Dashboard } from '../pages/dashboard/Dashboard'
import Forbidden from '../pages/errors/Forbidden'
import NotFound from '../pages/errors/NotFound'
import ServerError from '../pages/errors/ServerError'
import { Profile as ProfilePage } from '../pages/profile/Profile'
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
    label: 'Profile',
    href: '/profile',
    icon: MdPerson,
    requiresAuth: true,
    page: ProfilePage,
  },
  {
    label: 'Admin',
    href: '/admin',
    icon: MdOutlineAdminPanelSettings,
    requiresAuth: true,
    requiredRole: 'admin',
    page: AdminPage,
  },
  {
    label: 'Sign In',
    href: '/signin',
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
    icon: MdLockReset,
    requiresAuth: false,
    page: PasswordResetPage,
  },
  {
    label: 'Email Verification',
    href: '/verify-email',
    icon: MdVerifiedUser,
    requiresAuth: false,
    page: EmailVerificationPage,
  },
  {
    label: 'Forbidden',
    href: '/forbidden',
    requiresAuth: false,
    page: Forbidden,
  },
  {
    label: 'Server Error',
    href: '/server-error',
    requiresAuth: false,
    page: ServerError,
  },
  {
    label: 'Not Found',
    href: '*',
    requiresAuth: false,
    page: NotFound,
  },
]
