/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        tBlack: "#232124",
        tOffWhite: "#C8C8C8",
        tWhite: "#DEDEDE",
        tWhiteBright: "#E5E5E5",
        tWhiteBrighter: "#EEECEC",
        tMenuDark: "#69636D",
        tHighlight: "#36065C",
      },
    },
  },
  plugins: [],
};
