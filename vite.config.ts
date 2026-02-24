/// <reference types="vitest/config" />
import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';

export default defineConfig(({ mode }) => {

    // Check for local SSL certificates (for MercadoPago production credentials)
    const certPath = path.resolve(__dirname, '.cert/localhost.pem');
    const keyPath = path.resolve(__dirname, '.cert/localhost-key.pem');
    const hasLocalCerts = fs.existsSync(certPath) && fs.existsSync(keyPath);

    return {
      test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./src/test/setup.ts'],
        include: ['src/**/*.{test,spec}.{ts,tsx}'],
        exclude: ['node_modules', 'e2e/**', 'src/components/ui/**'],
        coverage: {
          provider: 'v8',
          reporter: ['text', 'html'],
          include: ['src/**/*.{ts,tsx}'],
          exclude: [
            'src/components/ui/**',
            'src/test/**',
            'src/vite-env.d.ts',
            'src/types/**',
            '**/*.test.{ts,tsx}',
            '**/*.d.ts',
          ],
        },
      },
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
        headers: {
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
          'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
        },
      },
      plugins: [react()],
      esbuild: {
        drop: ['console', 'debugger'],
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
                '@radix-ui/react-alert-dialog',
                '@radix-ui/react-accordion',
              ],
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
