import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './src/App';
import { HashRouter } from 'react-router-dom';
import { initializeLogger } from './src/config/logger.config';

// Import global styles (Tailwind + shadcn CSS)
import './src/styles/global.css';

// Inicializar servicios
initializeLogger();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

createRoot(rootElement).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>
);
