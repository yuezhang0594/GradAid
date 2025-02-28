import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import pkg from './package.json';
import path from "path"

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173
  },
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(pkg.version)
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});