
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './src/App';
import { HashRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import esES from 'antd/locale/es_ES';
import { initializeLogger } from './src/config/logger.config';
import { initializeEmailAdapter } from './src/config/email.config';

// Inicializar servicios
initializeLogger();
initializeEmailAdapter();

// Tema personalizado de Ant Design
const antdTheme = {
  token: {
    // Colores principales
    colorPrimary: '#18181b',
    colorSuccess: '#059669',
    colorWarning: '#d97706',
    colorError: '#e11d48',
    colorInfo: '#0284c7',

    // Tipografía
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    fontSize: 14,

    // Border radius
    borderRadius: 8,
    borderRadiusLG: 12,
    borderRadiusSM: 6,

    // Colores de fondo
    colorBgContainer: '#ffffff',
    colorBgLayout: '#fafafa',
    colorBgElevated: '#ffffff',

    // Bordes
    colorBorder: '#e4e4e7',
    colorBorderSecondary: '#f4f4f5',

    // Texto
    colorText: '#18181b',
    colorTextSecondary: '#52525b',
    colorTextTertiary: '#71717a',
    colorTextQuaternary: '#a1a1aa',

    // Sombras
    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.04), 0 2px 6px -1px rgb(0 0 0 / 0.03)',
    boxShadowSecondary: '0 4px 12px -2px rgb(0 0 0 / 0.06), 0 8px 20px -4px rgb(0 0 0 / 0.04)',
  },
  components: {
    Button: {
      controlHeight: 40,
      controlHeightLG: 48,
      controlHeightSM: 32,
      paddingContentHorizontal: 20,
      fontWeight: 600,
      primaryColor: '#ffffff',
      defaultBg: '#ffffff',
      defaultBorderColor: '#e4e4e7',
    },
    Card: {
      paddingLG: 24,
      borderRadiusLG: 12,
    },
    Table: {
      headerBg: '#fafafa',
      headerColor: '#52525b',
      rowHoverBg: '#f4f4f5',
      borderColor: '#e4e4e7',
    },
    Input: {
      controlHeight: 40,
      paddingInline: 14,
      borderRadius: 8,
    },
    Select: {
      controlHeight: 40,
      borderRadius: 8,
    },
    Menu: {
      itemBorderRadius: 8,
      itemHeight: 44,
      itemMarginBlock: 4,
      itemMarginInline: 8,
    },
    Modal: {
      borderRadiusLG: 16,
      paddingContentHorizontalLG: 24,
    },
    Message: {
      borderRadiusLG: 12,
    },
    Notification: {
      borderRadiusLG: 12,
    },
  },
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ConfigProvider theme={antdTheme} locale={esES}>
      <HashRouter>
        <App />
      </HashRouter>
    </ConfigProvider>
  </React.StrictMode>
);