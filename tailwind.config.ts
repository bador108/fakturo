import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          DEFAULT: '#0c0c0e',
          dark:    '#1f1f23',
          soft:    '#f0f0ef',
        },
        ink:    '#0c0c0e',
        paper:  '#fafafa',
      },
    },
  },
  plugins: [],
};
export default config;
