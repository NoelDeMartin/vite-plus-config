import { defineConfig } from 'vite-plus';

import { fmt, lint } from './src/index.ts';

export default defineConfig({
    pack: {
        dts: true,
        exports: true,
        publint: true,
        attw: { profile: 'esm-only' },
    },
    fmt,
    lint: { extends: [lint] },
});
