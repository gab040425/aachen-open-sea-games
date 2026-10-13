import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Components use the .js extension, so tell Vite/esbuild to parse JSX in .js files.
export default defineConfig({
  plugins: [react({ include: /\.(js|jsx)$/ })],
  esbuild: { loader: 'jsx', include: /src\/.*\.jsx?$/, exclude: [] },
  optimizeDeps: { esbuildOptions: { loader: { '.js': 'jsx' } } },
});
