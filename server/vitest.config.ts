import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/tests/**',
        'src/index.ts',
        'src/scripts/**',
        'src/database/schema.ts',
        'src/database/seed.ts',
        'src/database/postgres.ts',
        'src/middleware/index.ts',
      ],
      thresholds: {
        lines: 65,
        functions: 70,
        statements: 65,
      },
    },
  },
});
