import { format } from 'vite-plus/fmt';
import { describe, expect, it } from 'vite-plus/test';

import { fmt, lint } from './index.ts';

describe('fmt', () => {
    it('formats code', async () => {
        const { code, errors } = await format(
            'example.ts',
            [
                'import { b } from "./b"',
                'import { a } from "./a"',
                'export function sum(x: number, y: number) { return a(x) + b(y) }',
            ].join('\n'),
            fmt,
        );

        expect(errors).toEqual([]);
        expect(code).toBe(
            [
                "import { a } from './a';",
                "import { b } from './b';",
                'export function sum(x: number, y: number) {',
                '    return a(x) + b(y);',
                '}',
                '',
            ].join('\n'),
        );
    });
});

describe('lint', () => {
    it('enables type-aware linting', () => {
        expect(lint.options).toEqual({ typeAware: true, typeCheck: true });
    });

    it('relaxes rules in tests', () => {
        expect(lint.overrides).toContainEqual(expect.objectContaining({ files: ['**/*.test.ts'] }));
    });
});
