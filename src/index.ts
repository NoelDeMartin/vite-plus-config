import type { OxfmtConfig } from 'vite-plus/fmt';
import type { OxlintConfig } from 'vite-plus/lint';
import type { PackUserConfig } from 'vite-plus/pack';

export const fmt: OxfmtConfig = {
    semi: true,
    singleQuote: true,
    tabWidth: 4,
    printWidth: 120,
    sortImports: true,
    sortTailwindcss: true,
};

export const lint: OxlintConfig = {
    options: {
        typeAware: true,
        typeCheck: true,
    },
    rules: {
        'no-console': 'error',
        'no-unused-expressions': 'off',
        'no-unused-vars': ['error', { argsIgnorePattern: '^_+$' }],
        'typescript/consistent-type-imports': 'error',
        'typescript/explicit-module-boundary-types': 'error',
        'typescript/no-base-to-string': 'off',
        'typescript/no-explicit-any': ['warn', { ignoreRestArgs: true }],
        'typescript/no-unsafe-declaration-merging': 'off',
        'typescript/restrict-template-expressions': 'off',
    },
    overrides: [
        {
            files: ['**/*.test.ts'],
            rules: {
                'typescript/no-duplicate-type-constituents': 'off',
                'typescript/unbound-method': 'off',
            },
        },
    ],
};

export const pack: PackUserConfig = {
    unbundle: true,
    sourcemap: true,
    dts: true,
    fixedExtension: false,
    publint: true,
    attw: { profile: 'esm-only' },
};

export * from './plugins/index.ts';
