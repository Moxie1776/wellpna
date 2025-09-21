import { Admin, Resource, CustomRoutes } from 'react-admin';
import { Route } from 'react-router-dom';
import { dataProvider } from './providers/dataProvider';
import { authProvider } from './providers/authProvider';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import { Dashboard } from './pages/dashboard/Dashboard';
import HomePage from './pages/public/HomePage';
import WellboreDiagramPage from './pages/wellbore/WellboreDiagramPage';

const App = () => (
  <Admin
    dataProvider={dataProvider}
    authProvider={authProvider}
    loginPage={LoginPage}
    dashboard={Dashboard}
  >
    <Resource name='users' />
    <Resource name='wells' />
    <Resource name='bids' />
    <CustomRoutes noLayout>
      <Route path='/signup' element={<SignupPage />} />
      <Route path='/' element={<HomePage />} />
    </CustomRoutes>
    <CustomRoutes>
      <Route path='/wellbore' element={<WellboreDiagramPage />} />
    </CustomRoutes>
  </Admin>
);

export default App;
