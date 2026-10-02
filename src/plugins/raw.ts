import { readFile } from 'node:fs/promises';

import type { Plugin } from 'vite-plus';

const RAW_QUERY = '?raw-string';

function isVite(meta: object): boolean {
    return 'viteVersion' in meta;
}

export default function raw(pattern: RegExp): Plugin {
    const files = new Set<string>();

    return {
        name: `raw:${pattern.source}`,
        enforce: 'pre',
        async resolveId(source, importer, options) {
            if (options.isEntry || source.includes('?')) {
                return;
            }

            const resolved = await this.resolve(source, importer, { ...options, skipSelf: true });

            pattern.lastIndex = 0;

            if (!resolved || resolved.external || !pattern.test(resolved.id)) {
                return resolved;
            }

            if (isVite(this.meta)) {
                return `${resolved.id}${RAW_QUERY}`;
            }

            files.add(resolved.id);

            return resolved;
        },
        async load(id) {
            if (id.endsWith(RAW_QUERY)) {
                const file = id.slice(0, -RAW_QUERY.length);

                this.addWatchFile(file);

                return { code: `export default ${JSON.stringify(await readFile(file, 'utf-8'))};`, map: null };
            }

            if (isVite(this.meta) || !files.has(id)) {
                return;
            }

            return { code: await readFile(id, 'utf-8'), moduleType: 'text' };
        },
    };
}
