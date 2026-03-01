import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: 'var(--color-cream)',
        ink: 'var(--color-ink)',
        'dark-ink': 'var(--color-dark-ink)',
        primary: 'var(--color-primary)', // Maps to --color-primary
        secondary: 'var(--color-secondary)',
        accent: 'var(--color-accent)',
        'cream-light': '#fcfcf6', // Example, adjust as needed or derive from base cream
        'cream-dark': '#e6e3d2', // Example, adjust as needed or derive from base cream
        'ink-light': '#5e5c54', // Example, adjust as needed or derive from base ink
      },
      fontFamily: {
        serif: ['var(--font-libre)'],
        sans: ['var(--font-inter)'],
        mono: ['var(--font-geist-mono)'],
      },
    },
  },
  plugins: [],
};
export default config;
