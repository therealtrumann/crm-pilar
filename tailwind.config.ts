import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0d0d0f',
          secondary: '#131316',
          card: '#1c1c20',
          column: '#16161a',
        },
        border: {
          DEFAULT: '#2a2a30',
          hover: '#3d3d46',
        },
        accent: {
          DEFAULT: '#7c3aed',
          hover: '#6d28d9',
          muted: '#7c3aed20',
        },
      },
    },
  },
  plugins: [],
};

export default config;
