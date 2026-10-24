import { defineConfig } from "astro/config";

import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  site: "https://dev.tochibedford.com", // keep in step with SITE in src/data/work.ts
  integrations: [tailwind()],
  server: {
    host: true,
  },
});
