import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    {
        ignores: [
            'dist/**',
            'node_modules/**',
            'uploads/**',
            'scratch/**',
            'godot_project/**',
            '*.txt',
            '*.json',
            '*.cjs',
            '*.log',
        ],
    },
    {
        extends: [js.configs.recommended, ...tseslint.configs.recommended],
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
        },
        plugins: {
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
        },
        rules: {
            ...reactHooks.configs.recommended.rules,
            'react-refresh/only-export-components': 'off',
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-unused-vars': ['warn', {
                argsIgnorePattern: '^_',
                varsIgnorePattern: '^_',
                caughtErrorsIgnorePattern: '^_',
                destructuredArrayIgnorePattern: '^_',
            }],
            'react-hooks/set-state-in-effect': 'off',
            '@typescript-eslint/no-empty-object-type': 'warn',
            'react-hooks/immutability': 'warn',
            'react-hooks/rules-of-hooks': 'warn',
            'no-empty': 'warn',
            'react-hooks/purity': 'warn',
            '@typescript-eslint/ban-ts-comment': 'off',
        },
    },
);
