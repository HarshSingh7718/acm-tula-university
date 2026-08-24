import tailwindcss from "@tailwindcss/vite";
import { defineConfig, fontProviders } from "astro/config";

// https://astro.build/config
export default defineConfig({
  site: "https://acmtulas.org",
  output: "static",
  vite: {
    plugins: [tailwindcss()],
  },
  fonts: [
    {
      name: "PolySans",
      cssVariable: "--font-polysans",
      provider: fontProviders.local(),
      weights: [400, 500, 700],
      subsets: ["latin"],
      display: "swap",
      options: {
        variants: [
          {
            src: ["./public/media/fonts/PolySans-400.woff2"],
            weight: 400,
            style: "normal",
          },
          {
            src: ["./public/media/fonts/PolySans-500.woff2"],
            weight: 500,
            style: "normal",
          },
          {
            src: ["./public/media/fonts/PolySans-700.woff2"],
            weight: 700,
            style: "normal",
          },
        ],
      },
    },
  ],
});
