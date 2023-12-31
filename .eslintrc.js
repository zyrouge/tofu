/**
 * @type {import("eslint").ESLint.ConfigData}
 */
/* eslint-env node */
module.exports = {
    extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
    parser: "@typescript-eslint/parser",
    plugins: ["@typescript-eslint"],
    root: true,
    rules: {
        indent: ["error", 4, { SwitchCase: 1 }],
    },
};
