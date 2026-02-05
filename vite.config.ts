import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');

    // Check for local SSL certificates (for MercadoPago production credentials)
    const certPath = path.resolve(__dirname, '.cert/localhost.pem');
    const keyPath = path.resolve(__dirname, '.cert/localhost-key.pem');
    const hasLocalCerts = fs.existsSync(certPath) && fs.existsSync(keyPath);

    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        // Enable HTTPS if local certificates exist
        ...(hasLocalCerts && {
          https: {
            cert: fs.readFileSync(certPath),
            key: fs.readFileSync(keyPath),
          },
        }),
      },
      plugins: [react()],
      define: {
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
        }
      },
      build: {
        target: 'es2022',
        minify: 'esbuild',
        sourcemap: mode === 'development',
        rollupOptions: {
          output: {
            manualChunks: {
              'vendor-react': ['react', 'react-dom', 'react-router-dom'],
              'vendor-supabase': ['@supabase/supabase-js'],
              'vendor-ui': [
                '@radix-ui/react-dialog',
                '@radix-ui/react-dropdown-menu',
                '@radix-ui/react-select',
                '@radix-ui/react-tabs',
                '@radix-ui/react-tooltip',
              ],
              'vendor-pdf': ['jspdf', 'jspdf-autotable'],
            },
          },
        },
        chunkSizeWarningLimit: 500,
      },
      optimizeDeps: {
        include: [
          'react',
          'react-dom',
          'react-router-dom',
          '@supabase/supabase-js',
        ],
      },
    };
});
