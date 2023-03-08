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
      'src/**/types.ts',
      'src/vitest-setup.ts',
    ],
    coverage: {
      exclude: ['src/vitest-setup.ts', 'src/**/*.spec.ts', 'src/**/types.ts'],
    },
  },
});
