import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

// Two looks, one page. VITE_STYLE=dashboard builds the Congressional Dashboard look
// (src/styles/dashboard.css, Newsreader fonts); anything else builds the translating.policy
// hub look (src/index.css). The markup, data and sources are the same in both.
const dashboard = process.env.VITE_STYLE === 'dashboard';
const style = fileURLToPath(new URL(dashboard ? './src/styles/dashboard.css' : './src/index.css', import.meta.url));

const DASHBOARD_HEAD = [
  '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Libre+Franklin:wght@600;700&family=Newsreader:wght@400;500;600;700&family=Share+Tech+Mono&display=swap" />',
].join('');

function styleVariant() {
  return {
    name: 'style-variant',
    transformIndexHtml(html) {
      if (!dashboard) return html;
      return html
        .replace(/<link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com[^>]*>/, DASHBOARD_HEAD)
        .replace(
          /<meta name="theme-color"[^>]*>/,
          '<meta name="theme-color" content="#FFFFFF" media="(prefers-color-scheme: light)" /><meta name="theme-color" content="#0F1115" media="(prefers-color-scheme: dark)" />',
        );
    },
  };
}

export default defineConfig({
  plugins: [react(), styleVariant()],
  resolve: { alias: { 'site-style': style } },
});
