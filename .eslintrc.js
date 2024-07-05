module.exports = {
  extends: ["react-app", "prettier"],
  env: {
    es2020: true,
  },
  globals: {
    chrome: "readonly",
    DEV_SERVER: "readonly",
  },
  ignorePatterns: [
    "dist/",
    "node_modules/",
    "build/",
    "__mocks__/",
    "e2e-tests/",
  ],
  overrides: [
    {
      files: ["webpack.*.js", "**/ducks/**/*.js", "**/ducks/**/*.ts"],
      rules: {
        "import/no-extraneous-dependencies": [0, { devDependencies: false }],
        "no-param-reassign": 0,
      },
    },
  ],
  rules: {
    "no-shadow": "off",
    "@typescript-eslint/no-shadow": ["error"],
    "@typescript-eslint/no-unused-vars": ["error"],
    // OFF
    indent: "off",
    "import/extensions": 0,
    "class-methods-use-this": 0,
    "import/prefer-default-export": 0,
    "jsx-a11y/label-has-for": 0,
    "jsx-a11y/heading-has-content": 0,
    "jsx-a11y/label-has-associated-control": 0,
    "linebreak-style": 0,
    "no-underscore-dangle": 0,
    "no-use-before-define": 0,
    "no-prototype-builtins": 0,
    "prefer-destructuring": 0,
    "react/forbid-prop-types": 0,
    "react/jsx-indent": 0,
    "react/no-did-mount-set-state": 0,
    "react/no-did-update-set-state": 0,
    "react/require-default-props": 0,
    "react/jsx-one-expression-per-line": 0,
    "lines-between-class-members": 0,
    "react/destructuring-assignment": 0,
    "react/jsx-wrap-multilines": 0,
    "no-console": "off",

    // WARN
    "prefer-object-spread": 1,
    "no-debugger": 1,
    "no-unused-vars": 1,
    "react/no-unused-prop-types": 1,
    "react/no-array-index-key": 1,
    "react/sort-comp": 1,
    "react/default-props-match-prop-types": 1,
    "react/prefer-stateless-function": 1,
    "react/no-unused-state": 1,
    "react/prop-types": 1,
    "react/jsx-curly-brace-presence": 1,
    "arrow-body-style": 1,
    "prefer-const": 1,
    "import/first": 1,
    "object-shorthand": 1,
    "react/no-access-state-in-setstate": 1,
    "require-await": 1,

    // ERROR
    semi: ["error", "always"],
    "object-curly-spacing": ["error", "always"],
    "jsx-a11y/anchor-is-valid": [
      2,
      {
        components: ["Link"],
        specialLink: ["hrefLeft", "hrefRight", "to"],
        aspects: ["noHref", "invalidHref", "preferButton"],
      },
    ],
    "no-unused-expressions": [2, { allowTaggedTemplates: true }],
    "react/jsx-filename-extension": [
      1,
      { extensions: [".js", ".jsx", ".tsx"] },
    ],
  },
  settings: {
    "import/resolver": {
      typescript: {},
      node: {
        extensions: [".ts", ".tsx"],
        moduleDirectory: ["node_modules", "src"],
      },
    },
  },
};
