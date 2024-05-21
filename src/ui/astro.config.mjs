import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  // TODO:
  site: "https://example.com",
  integrations: [
    react(),
    tailwind({ configFile: "./src/ui/tailwind.config.mjs" }),
  ],
});
