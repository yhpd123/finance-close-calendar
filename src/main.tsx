import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import { App } from './App';
import { AppProvider } from './context/AppDataContext';
import { registerServiceWorker } from './pwa/registerServiceWorker';
import './styles/theme.css';
import './styles/app.css';

registerServiceWorker();

const isPortableMode = import.meta.env.VITE_PORTABLE_MODE === '1';
const Router = window.location.protocol === 'file:' || isPortableMode ? HashRouter : BrowserRouter;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router>
      <AppProvider>
        <App />
      </AppProvider>
    </Router>
  </React.StrictMode>,
);
