import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { build } from 'vite-plus';
import type { Rolldown } from 'vite-plus';
import { afterEach, beforeEach, describe, expect, it } from 'vite-plus/test';

import { externalDependencies } from './external.ts';

describe('externalDependencies', () => {
    it('matches dependencies and their subpaths', () => {
        const external = externalDependencies({
            dependencies: { vue: '*' },
            peerDependencies: { '@scope/peer': '*' },
            optionalDependencies: { optional: '*' },
        });

        expect(external('vue')).toBe(true);
        expect(external('vue/server-renderer')).toBe(true);
        expect(external('@scope/peer')).toBe(true);
        expect(external('@scope/peer/utils')).toBe(true);
        expect(external('optional')).toBe(true);
        expect(external('vue-router')).toBe(false);
        expect(external('@scope/peer-utils')).toBe(false);
        expect(external('./vue')).toBe(false);
        expect(external('/node_modules/vue/index.js')).toBe(false);
        expect(external('\0plugin-vue:export-helper')).toBe(false);
    });

    it('matches included modules', () => {
        const external = externalDependencies({}, { include: ['exact', /^virtual:/] });

        expect(external('exact')).toBe(true);
        expect(external('exact/subpath')).toBe(true);
        expect(external('virtual:app')).toBe(true);
        expect(external('other')).toBe(false);
    });

    it('matches stateful regular expressions consistently', () => {
        const external = externalDependencies({}, { include: [/^virtual:/g] });

        expect(external('virtual:app')).toBe(true);
        expect(external('virtual:app')).toBe(true);
    });

    describe('with Vite', () => {
        let root: string;

        beforeEach(() => {
            root = mkdtempSync(path.join(tmpdir(), 'vite-plus-config-external-'));

            mkdirSync(path.join(root, 'src'));
            writeFileSync(path.join(root, 'src/greeting.js'), "export default 'Hello';\n");
            writeFileSync(
                path.join(root, 'src/main.js'),
                [
                    "import { name } from 'dependency';",
                    "import greeting from '@self/greeting.js';",
                    'export default `${greeting} ${name}`;',
                    '',
                ].join('\n'),
            );
        });

        afterEach(() => rmSync(root, { recursive: true, force: true }));

        it('bundles everything but dependencies', async () => {
            const output = (await build({
                root,
                logLevel: 'silent',
                resolve: { alias: { '@self': path.join(root, 'src') } },
                build: {
                    write: false,
                    lib: { entry: path.join(root, 'src/main.js'), formats: ['es'], fileName: 'main' },
                    rolldownOptions: { external: externalDependencies({ dependencies: { dependency: '*' } }) },
                },
            })) as Rolldown.RolldownOutput[];
            const code = output[0]?.output.find((file) => file.type === 'chunk')?.code ?? '';

            expect(code).toContain('from "dependency"');
            expect(code).toContain('Hello');
            expect(code).not.toContain('@self');
        });
    });
});
