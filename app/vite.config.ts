import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
    plugins: [react()],
    build: {
        outDir: resolve(__dirname, 'src/public'),
        emptyOutDir: true,
    },
    root: resolve(__dirname, 'frontend'),
});
