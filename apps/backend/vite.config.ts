import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    watch: false,
    coverage: {
      provider: 'istanbul',
      thresholds: {
        global: {
          lines: 100,
          statements: 100,
          functions: 100,
          branches: 100,
        },
      },
      exclude: [
        'src/data',
        'src/api/**/*.module.ts',
        'src/api/**/errors/*.ts',
        'src/api/**/*.errors.ts',
        'src/api/**/*.controller.ts',
        'src/plugins/**/index.ts',
        'src/*.ts',
        'src/api/**/*.abstractions.ts',
      ],
      include: ['src/**/*.ts'],
    },
    projects: [
      {
        test: {
          name: 'unit',
          globals: true,
          include: ['src/**/*.spec.ts'],
        },
      },
      {
        test: {
          name: 'e2e',
          include: ['test/*.e2e-spec.ts'],
          setupFiles: ['test/helpers/setup.ts'],
          globalSetup: ['test/helpers/global-setup.ts'],
          retry: 2,
        },
      },
    ],
  },
});
