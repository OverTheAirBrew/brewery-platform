import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    swc.vite({
      module: { type: 'es6' },
      jsc: { transform: { decoratorMetadata: true } },
    }),
  ],
  test: {
    watch: false,
    coverage: {
      exclude: [
        'src/data',
        'src/api/**/*.module.ts',
        'src/api/**/errors/*.ts',
        'src/api/**/*.controller.ts',
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
