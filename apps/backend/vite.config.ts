import { defineConfig } from 'vitest/config';

const activeProject = process.env.CURRENT_PROJECT;

console.log(process.env);

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
          fileParallelism: false,
        },
      },
    ],
  },
});
