import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  site: process.env.UI_BASE_URL ?? 'http://localhost:4321',
  integrations: [
    react(),
    tailwind({ configFile: './src/ui/tailwind.config.mjs' }),
  ],
  adapter: node({
    mode: 'standalone',
  }),
  output: 'server',
});
