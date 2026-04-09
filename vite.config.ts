import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative base works for GitHub Pages in a subfolder or root.
export default defineConfig({
  base: './',
  plugins: [react()],
});
