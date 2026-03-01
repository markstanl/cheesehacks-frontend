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
        'light-grey': 'var(--color-light-grey)',
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
