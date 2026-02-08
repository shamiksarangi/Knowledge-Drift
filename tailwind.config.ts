import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        rp: {
          navy: "#1B2A4A",
          dark: "#0F1D36",
          teal: "#00A3A1",
          blue: "#2B6CB0",
          light: "#E8F4F8",
          gray: "#64748B",
        },
      },
    },
  },
  plugins: [],
};
export default config;
