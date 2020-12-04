module.exports = {
  extends: [
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'prettier/react',
    'prettier/@typescript-eslint',
    'plugin:prettier/recommended',
  ],
  plugins: ['react', '@typescript-eslint', 'eslint-plugin-tsdoc'],
  env: {
    browser: true,
    es6: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2020,
    sourceType: 'module',
    project: ['./tsconfig.json', './packages/**/tsconfig.json'],
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    'tsdoc/syntax': 'warn',
  },
};
