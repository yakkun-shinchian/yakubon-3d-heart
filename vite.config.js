import { defineConfig } from 'vite';
export default defineConfig({ base: './', optimizeDeps: { entries: ['index.html'] }, server: { host: '0.0.0.0', port: 5173 } });
