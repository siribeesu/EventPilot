export default [
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/coverage/**',
      '**/*.d.ts',
      '**/build/**',
      '**/data/**',
    ],
  },
  {
    files: ['**/*.{js,ts,jsx,tsx}'],
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-console': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      'eqeqeq': ['error', 'always'],
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-debugger': 'error',
      'no-duplicate-imports': 'error',
    },
  },
  {
    files: ['server/src/utils/logger.ts', 'server/scripts/**'],
    rules: {
      'no-console': 'off',
    },
  },
];
