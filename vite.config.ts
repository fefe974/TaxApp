import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

// base: './' — relative paths so the built site works from the GitHub Pages
// project subpath (/TaxApp/) without any server-side configuration.
export default defineConfig({
  base: './',
  plugins: [preact()],
});
