
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './src/App';
import { HashRouter } from 'react-router-dom';
import { initializeLogger } from './src/config/logger.config';
import { initializeEmailAdapter } from './src/config/email.config';

// Inicializar servicios
initializeLogger();
initializeEmailAdapter();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
);