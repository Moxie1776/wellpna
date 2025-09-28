import { Routes, Route } from 'react-router-dom';
import { Provider as UrqlProvider } from 'urql';
import { client } from './lib/graphqlClient';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import { Dashboard } from './pages/dashboard/Dashboard';
import HomePage from './pages/public/HomePage';

const App = () => (
  <UrqlProvider value={client}>
    <Routes>
      <Route path='/login' element={<LoginPage />} />
      <Route path='/signup' element={<SignupPage />} />
      <Route path='/dashboard' element={<Dashboard />} />
      <Route path='/' element={<HomePage />} />
    </Routes>
  </UrqlProvider>
);

export default App;
