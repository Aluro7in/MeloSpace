import { iwsdkDev } from '@iwsdk/vite-plugin-dev';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [iwsdkDev({ emulator: { device: process.env.MELO_DEVICE === 'metaVRGlasses' ? 'metaVRGlasses' : 'metaQuest3' } })],
  server: { host: '0.0.0.0', port: 8081, open: false },
  build: { outDir: 'dist', sourcemap: false, target: 'esnext', rollupOptions: { input: './index.html' } },
  esbuild: { target: 'esnext' },
  resolve: { dedupe: ['three', '@pmndrs/uikit', '@pmndrs/uikit-horizon', '@pmndrs/uikit-lucide'] },
  optimizeDeps: { exclude: ['@babylonjs/havok'], include: ['three', '@pmndrs/uikit'], esbuildOptions: { target: 'esnext' } },
  publicDir: 'public',
  base: './',
});
