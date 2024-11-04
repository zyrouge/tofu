const eslint = require("@eslint/js");
const tseslint = require("typescript-eslint");

module.exports = [
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    {
        plugins: {
            // "@typescript-eslint": typescriptEslint,
        },

        languageOptions: {
            // parser: tsParser,
        },

        rules: {
            indent: [
                "error",
                4,
                {
                    SwitchCase: 1,
                },
            ],
        },
    },
];
