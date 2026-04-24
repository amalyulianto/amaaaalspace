import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    'text-left',
    'text-center',
    'text-right',
    'text-justify',
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
            'p:empty': {
              marginTop: '0',
              marginBottom: '0',
              minHeight: '0',
              height: '1.25rem',
            },
            'p:empty::after': {
              content: '"\\00a0"',
            },
            'p > br::after': {
              content: '"\\00a0"',
            },
            'figure': {
              marginTop: '2rem',
              marginBottom: '2rem',
            },
            'figcaption': {
              textAlign: 'center',
              fontSize: '0.75rem',
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
