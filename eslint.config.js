const eslint = require("@eslint/js");
const tseslint = require("typescript-eslint");

module.exports = tseslint.config({
    files: ["src/**/*.ts", "scripts/**/*.js"],
    extends: [eslint.configs.recommended, ...tseslint.configs.recommended],
    rules: {
        indent: [
            "error",
            4,
            {
                SwitchCase: 1,
            },
        ],
    },
});
