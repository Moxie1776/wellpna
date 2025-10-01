import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { CssVarsProvider } from '@mui/joy/styles';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <CssVarsProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </CssVarsProvider>
  </React.StrictMode>
);
