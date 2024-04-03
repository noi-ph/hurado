module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  extends: [
    'eslint:recommended',
    'next/core-web-vitals',
    'airbnb',
    'airbnb/hooks',
  ],
  rules: {
    'no-console': ['warn', {
      allow: ['info', 'warn', 'error'],
    }],
    'no-empty': 'off',
    'consistent-return': 'off',
    'import/extensions': ['error', 'never'],
    'import/prefer-default-export': 'off',
    'jsx-a11y/label-has-associated-control': 'off',
    'react/function-component-definition': 'off',
    'react/jsx-filename-extension': ['error', {
      extensions: ['.jsx', '.tsx'],
      ignoreFilesWithoutCode: true,
    }],
    'react/react-in-jsx-scope': 'off',
  },
};
