import { Routes, Route } from 'react-router-dom';
import { Provider as UrqlProvider } from 'urql';
import { client } from './lib/graphqlClient';
import { ThemeProvider } from './providers/theme-provider';
import { ToastProvider } from './providers/toast-provider';
import { Layout } from './components/layout';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import { Dashboard } from './pages/dashboard/Dashboard';
import HomePage from './pages/public/HomePage';
import EmailVerificationPage from './pages/public/EmailVerificationPage';
import PasswordResetPage from './pages/public/PasswordResetPage';

const App = () => (
  <ThemeProvider defaultTheme='light' storageKey='vite-ui-theme'>
    <UrqlProvider value={client}>
      <ToastProvider />
      <Routes>
        <Route
          path='/login'
          element={
            <Layout>
              <LoginPage />
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
