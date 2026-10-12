import { defineConfig } from "astro/config";

import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  site: "https://tochibedford.com",
  integrations: [tailwind()],
  server: {
    host: true,
  },
});
