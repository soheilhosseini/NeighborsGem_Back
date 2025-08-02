module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
    project: "./tsconfig.json",
  },
  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "@typescript-eslint/recommended",
    "@typescript-eslint/recommended-requiring-type-checking",
  ],
  rules: {
    // TypeScript specific rules
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-non-null-assertion": "warn",
    "@typescript-eslint/prefer-const": "error",
    "@typescript-eslint/no-var-requires": "error",
    "@typescript-eslint/consistent-type-imports": [
      "error",
      { prefer: "type-imports" },
    ],

    // General rules
    "no-console": "off", // Allow console for logging
    "no-debugger": "error",
    "no-duplicate-imports": "error",
    "no-unused-expressions": "error",
    "prefer-const": "error",
    "no-var": "error",
    "object-shorthand": "error",
    "prefer-template": "error",

    // Code style
    indent: ["error", 2],
    quotes: ["error", "single"],
    semi: ["error", "always"],
    "comma-dangle": ["error", "always-multiline"],
    "trailing-comma": ["error", "es5"],
    "eol-last": ["error", "always"],
    "no-trailing-spaces": "error",
    "no-multiple-empty-lines": ["error", { max: 2 }],
  },
  env: {
    node: true,
    es2022: true,
  },
  ignorePatterns: ["dist/", "node_modules/", "*.js", "*.d.ts"],
};
