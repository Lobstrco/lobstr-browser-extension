module.exports = {
    root: true,
    parser: "@typescript-eslint/parser",
    plugins: ["@typescript-eslint"],
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "prettier",
    ],
    env: {
        browser: true,
        es2020: true,
        node: true,
    },
    ignorePatterns: ["build/", "node_modules/", "coverage/"],
    rules: {
        semi: ["error", "always"],
        "object-curly-spacing": ["error", "always"],
        "no-shadow": "off",
        "@typescript-eslint/no-shadow": "error",
        "@typescript-eslint/no-unused-vars": "error",
        // the transport hands page-supplied data through untouched, so `any` is the honest type there
        "@typescript-eslint/no-explicit-any": "off",
        // `string & {}` is the open-string-union idiom the network vocabulary is built on
        "@typescript-eslint/ban-types": [
            "error",
            { extendDefaults: true, types: { "{}": false } },
        ],
        "prefer-const": "warn",
        "require-await": "warn",
        "no-console": "off",
    },
    overrides: [
        {
            files: ["src/**/__tests__/**", "tests/**"],
            env: { jest: true },
        },
        {
            files: ["*.js"],
            rules: { "@typescript-eslint/no-var-requires": "off" },
        },
    ],
};
