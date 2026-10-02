import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import prettier from "eslint-config-prettier";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig(
    { ignores: ["build/", "node_modules/", "coverage/"] },
    js.configs.recommended,
    tseslint.configs.recommended,
    prettier,
    {
        languageOptions: {
            globals: { ...globals.browser, ...globals.node },
        },
        rules: {
            "no-shadow": "off",
            "@typescript-eslint/no-shadow": "error",
            "@typescript-eslint/no-unused-vars": "error",
            // the transport hands page-supplied data through untouched, so `any` is the honest type there
            "@typescript-eslint/no-explicit-any": "off",
            "prefer-const": "warn",
            "require-await": "warn",
            "no-console": "off",
        },
    },
);
