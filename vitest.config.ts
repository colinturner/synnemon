import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte({ hot: false })],
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}'],
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/tests/setup.ts'],
  },
  resolve: {
    alias: {
      $lib: '/src/lib',
      '$app/environment': '/src/tests/mocks/app-environment.ts',
      '$app/stores': '/src/tests/mocks/app-stores.ts',
    },
  },
});

