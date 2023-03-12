/* eslint-disable import/no-extraneous-dependencies */

import { defineConfig } from 'vitest/config';
import tsConfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsConfigPaths()],
  test: {
    globals: true,
    environment: 'node',
    exclude: [
      '**/node_modules/**',
      'src/**/dist/**',
      'src/**/types.ts',
      'src/tests/**',
    ],
    coverage: {
      exclude: [
        'src/tests/setup-tests.ts',
        'src/**/*.spec.ts',
        'src/**/types.ts',
      ],
    },
    setupFiles: ['src/tests/setup-tests.ts'],
  },
});
