import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  plugins: [
    require('@tailwindcss/typography'),
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      typography: {
        DEFAULT: {
          css: {
            '.text-left': { textAlign: 'left' },
            '.text-center': { textAlign: 'center' },
            '.text-right': { textAlign: 'right' },
            '.text-justify': { textAlign: 'justify' },
            'p:empty::after': {
              content: '"\\00a0"',
              display: 'block',
            },
            'p > br::after': {
              content: '"\\00a0"',
              display: 'block',
            },
            'figure': {
              marginTop: '2rem',
              marginBottom: '2rem',
            },
            'figcaption': {
              textAlign: 'center',
              fontSize: '0.875rem',
              color: '#666666',
              marginTop: '0.5rem',
              fontStyle: 'italic',
            },
            'img[data-align="center"]': {
              marginLeft: 'auto',
              marginRight: 'auto',
              display: 'block',
            },
            'img[data-align="right"]': {
              marginLeft: 'auto',
              marginRight: '0',
              display: 'block',
            },
          },
        },
      },
    },
  },
};
export default config;
