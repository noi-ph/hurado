module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.json",
    tsconfigRootDir: __dirname,
    ecmaVersion: 2020,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
    warnOnUnsupportedTypeScriptVersion: false,
  },
  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "next/core-web-vitals",
    "prettier"
  ],
  rules: {
    "no-console": "off",
    "no-unused-vars": "off",
    "consistent-return": "off",
    "import/extensions": ["error", "never"],
    "import/no-unresolved": "off", // Let the typescript compiler handle module resolution
    "import/order": [
      "warn",
      {
        "groups": [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index",
          "object",
        ],
        "alphabetize": { "caseInsensitive": false },
      },
    ],
    "import/prefer-default-export": "off",
    "jsx-a11y/label-has-associated-control": "off",
    "react/function-component-definition": "off",
    "react/jsx-filename-extension": [
      "error",
      {
        extensions: [".jsx", ".tsx"],
        ignoreFilesWithoutCode: true,
      },
    ],
    "react/react-in-jsx-scope": "off",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-non-null-assertion": "off",
  },
};
