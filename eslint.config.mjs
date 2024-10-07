import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['preset.js', '**/dist/', '**/node_modules'],
  },
  {
    files: ['**/*.ts'],
    extends: [eslint.configs.recommended, ...tseslint.configs.recommended],
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: ['./tsconfig.eslint.json', './tsconfig.json'],
      },
    },
    rules: {
      'no-console': 1,
      'object-curly-spacing': ['error', 'always'],
      '@typescript-eslint/ban-ts-comment': 0,
    },
  },
);
