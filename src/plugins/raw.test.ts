import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { build } from 'vite-plus';
import type { Rolldown } from 'vite-plus';
import { build as pack } from 'vite-plus/pack';
import { afterEach, beforeEach, describe, expect, it } from 'vite-plus/test';

import raw from './raw.ts';

describe('raw', () => {
    const template = '<p class="greeting">Hello `world` ${name}</p>\n';
    let root: string;

    async function evaluate(code: string): Promise<unknown> {
        const module = (await import(`data:text/javascript,${encodeURIComponent(code)}`)) as { default: unknown };

        return module.default;
    }

    beforeEach(() => {
        root = mkdtempSync(path.join(tmpdir(), 'vite-plus-config-raw-'));

        writeFileSync(path.join(root, 'template.html'), template);
        writeFileSync(
            path.join(root, 'main.js'),
            "import template from './template.html';\nexport default template;\n",
        );
    });

    afterEach(() => rmSync(root, { recursive: true, force: true }));

    it('works with Vite', async () => {
        const output = (await build({
            root,
            logLevel: 'silent',
            plugins: [raw(/\.html$/)],
            build: {
                write: false,
                lib: { entry: path.join(root, 'main.js'), formats: ['es'], fileName: 'main' },
            },
        })) as Rolldown.RolldownOutput[];
        const chunk = output[0]?.output.find((file) => file.type === 'chunk');

        await expect(evaluate(chunk?.code ?? '')).resolves.toBe(template);
    });

    it('works with vp pack', async () => {
        await pack({
            config: false,
            cwd: root,
            entry: { main: path.join(root, 'main.js') },
            outDir: path.join(root, 'dist'),
            logLevel: 'silent',
            plugins: [raw(/\.html$/)],
        });

        await expect(evaluate(readFileSync(path.join(root, 'dist/main.mjs'), 'utf-8'))).resolves.toBe(template);
    });
});
