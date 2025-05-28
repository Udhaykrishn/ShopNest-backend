const tseslint = require('typescript-eslint');

module.exports = tseslint.config({
    files: ['**/*.ts'],
    languageOptions: {
        parser: tseslint.parser,
        parserOptions: {
            project: './tsconfig.json',
            sourceType: 'module',
        },
    },
    plugins: {
        '@typescript-eslint': tseslint.plugin,
    },
    ignores: ['dist/**', 'node_modules/**'],
    rules: {
        '@typescript-eslint/no-unused-vars': ['warn'],
        '@typescript-eslint/explicit-function-return-type': 'off',
        semi: ['error', 'always'],
        quotes: ['error', 'single'],
    },
});
