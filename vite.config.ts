import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// Assumed FastAPI port; the real backend's source is not available to confirm it.
const BACKEND_URL = 'http://localhost:8000';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': { target: BACKEND_URL, changeOrigin: true },
    },
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['src/test/setup.ts'],
  },
});
