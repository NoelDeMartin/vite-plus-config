import { defineConfig } from 'vite-plus';

import { fmt, lint, pack } from './src/index.ts';

export default defineConfig({
    pack,
    fmt,
    lint: { extends: [lint] },
});
