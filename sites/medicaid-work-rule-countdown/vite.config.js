import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Relative base so the built page works from any path (a subdomain root or a static file host).
export default defineConfig({ base: './', plugins: [react(), tailwindcss()] });
