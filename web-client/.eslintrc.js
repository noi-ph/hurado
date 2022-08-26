module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  env: {
    browser: true,
    es6: true,
  },
  plugins: [
    '@typescript-eslint',
    'react',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'plugin:@next/next/recommended',
  ],
  rules: {
    // For a list of available rules see:
    // eslint:
    // https://eslint.org/docs/rules/
    // Possible errors
    'no-await-in-loop': 'error',
    'no-dupe-else-if': 'error',
    'no-import-assign': 'error',
    'no-setter-return': 'error',
    'no-template-curly-in-string': 'error',
    // Best Practices
    'array-callback-return': 'error',
    'block-scoped-var': 'error',
    'consistent-return': ['error', { 'treatUndefinedAsUnspecified': false }],
    'curly': 'error',
    'default-case': 'error',
    'default-param-last': 'error',
    'dot-location': ['error', 'property'],
    'guard-for-in': 'error',
    'no-alert': 'warn',
    'no-caller': 'error',
    'no-console': 'warn',
    'no-constructor-return': 'error',
    'no-debugger': 'warn',
    'no-empty-function': 'error',
    'no-extend-native': 'error',
    'no-floating-decimal': 'error',
    'no-invalid-this': 'off', // This is broken by typescript
    'no-lone-blocks': 'error',
    'no-multi-spaces': ['error', { 'ignoreEOLComments': false, 'exceptions': { 'Property': true } }],
    'no-new': 'error',
    'no-new-func': 'error',
    'no-octal-escape': 'error',
    'no-param-reassign': 'error',
    'no-proto': 'error',
    'no-return-assign': 'error',
    'no-return-await': 'off', // overridden by @typescript-eslint/return-await
    'no-script-url': 'error',
    'no-self-compare': 'error',
    'no-sequences': 'error',
    'no-unused-expressions': 'off', // overridden by @typescript-eslint/no-unused-expressions
    'no-useless-call': 'error',
    'require-await': 'off',
    // Variables
    'no-shadow': 'off', // overridden by @typescript-eslint/no-shadow
    'no-use-before-define': 'off', // overridden by @typescript-eslint/no-use-before-define
    // Stylistic issues
    'array-bracket-newline': ['error', 'consistent'],
    'array-bracket-spacing': ['error', 'never'],
    'array-element-newline': ['error', 'consistent'],
    'block-spacing': ['error', 'always'],
    'comma-dangle': ['error', 'always-multiline'],
    'comma-spacing': 'error',
    'comma-style': 'error',
    'computed-property-spacing': 'error',
    'func-names': ['error', 'never'],
    'func-style': ['error', 'declaration', { 'allowArrowFunctions': true }],
    'function-call-argument-newline': ['error', 'consistent'],
    'function-paren-newline': ['error', 'multiline-arguments'],
    'indent': 'off', // overridden by @typescript-eslint/indent
    'jsx-quotes': ['error', 'prefer-single'],
    'key-spacing': 'error',
    'new-parens': ['error', 'always'],
    'no-lonely-if': 'error',
    'no-multi-assign': 'error',
    'no-multiple-empty-lines': ['error', { 'max': 2, 'maxEOF': 1 }],
    'no-trailing-spaces': 'error',
    'no-whitespace-before-property': 'error',
    'object-curly-newline': ['error', { 'consistent': true }],
    'object-curly-spacing': ['error', 'always'],
    'operator-linebreak': ['error', 'after', { 'overrides': { '?': 'before', ':': 'before' } }],
    'prefer-object-spread': 'error',
    'quotes': 'off',
    'semi': 'off', // overridden by @typescript-eslint/semi
    'semi-spacing': 'error',
    'space-before-blocks': 'error',
    'space-before-function-paren': 'off', // overridden by @typescript-eslint/space-before-function-paren
    'space-in-parens': ['error', 'never'],
    'space-unary-ops': ['error', { 'words': true, 'nonwords': false }],
    'spaced-comment': ['error', 'always', {
      'line': {
          'markers': ['/'],
          'exceptions': ['-', '+', '*']
      },
      'block': {
          'markers': ['!'],
          'exceptions': ['*'],
          'balanced': true
      }
    }],
    'switch-colon-spacing': 'error',
    // ECMAScript 6
    'no-duplicate-imports': 'error',
    'no-restricted-imports': ['error', { 'patterns': ['tests/*'] }],
    'no-var': 'error',
    'object-shorthand': 'error',
    'prefer-const': 'error',
    'sort-imports': ['error', { 'ignoreDeclarationSort': true }],
    'template-curly-spacing': ['error', 'never'],
    'yield-star-spacing': ['error', { 'before': false, 'after': true }],
    // typescript-eslint:
    // https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/eslint-plugin#supported-rules
    //
    '@typescript-eslint/brace-style': ['error', '1tbs'],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/func-call-spacing': 'error',
    '@typescript-eslint/indent': ['error', 2],
    '@typescript-eslint/naming-convention': [
      'error',
      { "selector": "enumMember", "format": ["PascalCase"] },
    ],
    '@typescript-eslint/no-require-imports': 'error',
    '@typescript-eslint/no-shadow': 'error',
    '@typescript-eslint/no-this-alias': 'off',
    '@typescript-eslint/no-unused-expressions': 'error',
    '@typescript-eslint/no-unused-vars': ['warn', { 'argsIgnorePattern': '^_' }],
    '@typescript-eslint/no-use-before-define': ['error', {
      'functions': false,
      'classes': false,
      'variables': true,
      'enums': true,
      'typedefs': false,
    }],
    '@typescript-eslint/prefer-for-of': 'error',
    '@typescript-eslint/prefer-nullish-coalescing': 'error',
    '@typescript-eslint/prefer-optional-chain': 'error',
    '@typescript-eslint/prefer-readonly': 'error',
    '@typescript-eslint/promise-function-async': 'off', // We might want promise functions that are not async
    '@typescript-eslint/quotes': ['error', 'single', { 'avoidEscape': true }],
    '@typescript-eslint/restrict-plus-operands': ['error', { 'checkCompoundAssignments': true }],
    '@typescript-eslint/return-await': 'error',
    '@typescript-eslint/semi': ['error', 'always'],
    '@typescript-eslint/space-before-function-paren': ['error', 'never'],
    // eslint-plugin-react:
    // https://github.com/yannickcr/eslint-plugin-react#list-of-supported-rules
    'react/button-has-type': 'error',
    'react/display-name': 'error',
    'react/prop-types': 'off',
    'react/jsx-equals-spacing': ['error', 'never'],
    'react/jsx-uses-react': 'error',
    'react/jsx-uses-vars': 'error',
    // eslint-plugin-import
    // https://github.com/benmosher/eslint-plugin-impor
    'import/no-unresolved': 'off', // Let the typescript compiler handle module resolution
    'import/order': ['warn',
      {
        'groups': ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object'],
        'alphabetize': { 'caseInsensitive': false }
      }
    ]
  },
  'settings': {
    // This magic was copy-pasted from:
    // https://github.com/yannickcr/eslint-plugin-react#configuration
    'react': {
      'version': 'detect',
    },
    'propWrapperFunctions': [
        'forbidExtraProps',
        { 'property': 'freeze', 'object': 'Object' },
        { 'property': 'myFavoriteWrapper' }
    ],
    'import/extensions': [
      '.js',
      '.jsx',
      '.ts',
      '.tsx',
    ],
  },
  overrides: [
    {
      files: [
        '**/*.test.{ts,tsx}',
      ],
      env: {
        jest: true,
      },
      // Can't extend in overrides: https://github.com/eslint/eslint/issues/8813
      // 'extends': ['plugin:jest/recommended']
      plugins: [
        'react',
        'jest',
      ],
      rules: {
        'no-restricted-imports': 'off',
      }
    },
    {
      files: [
        'src/index.tsx',
      ],
      env: {
        node: true,
      },
    },
    {
      files: [
        '**/serviceWorker.ts',
      ],
      env: {
        serviceworker: true,
        node: true,
      },
      rules: {
        'no-console': 'off',
      },
    },
  ],
}
