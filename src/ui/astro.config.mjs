import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  // TODO:
  site: 'https://example.com',
  integrations: [
    react(),
    tailwind({ configFile: './src/ui/tailwind.config.mjs' }),
  ],
  adapter: node({
    mode: 'standalone',
  }),
  output: 'server',
});
