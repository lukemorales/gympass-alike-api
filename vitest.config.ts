/* eslint-disable import/no-extraneous-dependencies */

import { defineConfig } from 'vitest/config';
import tsConfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsConfigPaths()],
  test: {
    globals: true,
    environment: 'node',
    root: 'src',
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/types.ts',
      'tests/setup-tests.ts',
    ],
    coverage: {
      exclude: [
        'src/tests/setup-tests.ts',
        'src/**/*.spec.ts',
        'src/**/types.ts',
      ],
    },
    setupFiles: ['tests/setup-tests.ts'],
  },
});
