import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.{test,spec}.ts'],
    coverage: {
      reporter: ['text', 'html', 'lcov'],
      exclude: ['**/node_modules/**', '**/dist/**', '**/*.config.ts'],
    },
  },
  resolve: {
    alias: {
      '@pharma/shared': path.resolve(__dirname, '../../packages/shared/src'),
      '@pharma/database': path.resolve(__dirname, '../../packages/database/src'),
    },
  },
});
