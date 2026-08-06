import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    watch: false,
    projects: [
      {
        test: {
          name: 'unit',
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
