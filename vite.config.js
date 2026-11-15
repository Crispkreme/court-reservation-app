import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.jsx'],
            refresh: true,
        }),
        react(),
        tailwindcss(),
    ],

    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./resources/js', import.meta.url)),
            '@css': fileURLToPath(new URL('./resources/css', import.meta.url)),
            '@components': fileURLToPath(new URL('./resources/js/components', import.meta.url)),
            '@pages': fileURLToPath(new URL('./resources/js/pages', import.meta.url)),
            '@data': fileURLToPath(new URL('./resources/js/data', import.meta.url)),
            '@hooks': fileURLToPath(new URL('./resources/js/hooks', import.meta.url)),
            '@context': fileURLToPath(new URL('./resources/js/context', import.meta.url)),
            '@config': fileURLToPath(new URL('./resources/js/config', import.meta.url)),
            '@utils': fileURLToPath(new URL('./resources/js/utils', import.meta.url)),
            '@services': fileURLToPath(new URL('./resources/js/services', import.meta.url)),
        },
    },

    server: {
        watch: {
            ignored: ['**/storage/framework/views/**'],
        },
    },
});
