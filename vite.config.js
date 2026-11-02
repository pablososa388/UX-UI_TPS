import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Asegura rutas relativas para deploy en GitHub Pages o subcarpetas
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
});

