import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  // The site is published as a GitHub Pages *project* site, so it is served
  // from /JellyTech/ rather than from a domain root. Vite rewrites asset URLs
  // in index.html and in the bundle against this; anything referenced from
  // component code goes through src/lib/asset.ts instead.
  base: process.env.PAGES_BASE ?? '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: true,
  },
  build: {
    outDir: 'dist',
    // A 2.4MB sourcemap is useful locally and is dead weight on a static host.
    sourcemap: process.env.PAGES_BASE ? false : true,
  },
})