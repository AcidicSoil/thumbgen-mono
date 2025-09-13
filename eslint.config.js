const { FlatCompat } = require("@eslint/eslintrc");
const path = require("path");
const js = require("@eslint/js");

const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
});

module.exports = [
    ...compat.extends("eslint:recommended", "plugin:@typescript-eslint/recommended", "prettier"),
    {
        ignores: ["**/dist/**", "**/node_modules/**", "eslint.config.js", ".eslintrc.cjs"],
    },
    {
        files: ["**/*.ts", "**/*.tsx"],
        languageOptions: {
            parser: require('@typescript-eslint/parser'),
            globals: {
                ...require('globals').browser,
                ...require('globals').node,
            }
        }
    }
];
