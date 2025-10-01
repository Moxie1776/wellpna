import { Route,Routes } from 'react-router-dom';
import { Provider as UrqlProvider } from 'urql';

import Layout from './components/layout/layout';
import { client } from './lib/graphqlClient';
import { Dashboard } from './pages/dashboard/Dashboard';
import EmailVerificationPage from './pages/public/EmailVerification';
import HomePage from './pages/public/Home';
import PasswordResetPage from './pages/public/PasswordReset';
import SignInPage from './pages/public/Signin';
import SignupPage from './pages/public/Signup';
import { ThemeProvider } from './providers/theme-provider';
import { ToastProvider } from './providers/toast-provider';

const App = () => (
  <ThemeProvider defaultTheme='light' storageKey='vite-ui-theme'>
    <UrqlProvider value={client}>
      <ToastProvider />
      <Routes>
        <Route
          path='/login'
          element={
            <Layout>
              <SignInPage />
            </Layout>
          }
        />
        <Route
          path='/signup'
          element={
            <Layout>
              <SignupPage />
            </Layout>
          }
        />
        <Route
          path='/verify-email'
          element={
            <Layout>
              <EmailVerificationPage />
            </Layout>
          }
        />
        <Route
          path='/reset-password'
          element={
            <Layout>
              <PasswordResetPage />
            </Layout>
          }
        />
        <Route
          path='/dashboard'
          element={
            <Layout>
              <Dashboard />
            </Layout>
          }
        />
        <Route
          path='/'
          element={
            <Layout>
              <HomePage />
            </Layout>
          }
        />
      </Routes>
    </UrqlProvider>
  </ThemeProvider>
);

export default App;
