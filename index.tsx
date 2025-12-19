import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './src/App';
import { HashRouter } from 'react-router-dom';
import { ToastProvider } from './src/components/common/Toast';
import { initializeLogger } from './src/config/logger.config';

// Import global styles (Tailwind + shadcn CSS)
import './src/styles/global.css';

// Inicializar servicios
initializeLogger();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <HashRouter>
      <ToastProvider>
        <App />
      </ToastProvider>
    </HashRouter>
  </React.StrictMode>
);
