import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/** GitHub Pages project site: set `VITE_BASE=/Pustakalaya/` in CI. Local dev omits it → `/`. */
const base = process.env.VITE_BASE?.trim() || '/';
const baseNormalized = base === '/' ? '/' : base.endsWith('/') ? base : `${base}/`;

export default defineConfig({
  base: baseNormalized,
  plugins: [react()],
});
