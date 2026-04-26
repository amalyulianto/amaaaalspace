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
            /* Allow alignment classes to work inside prose */
            '.text-left': { textAlign: 'left' },
            '.text-center': { textAlign: 'center' },
            '.text-right': { textAlign: 'right' },
            '.text-justify': { textAlign: 'justify' },
            /* Make all paragraphs have 0 margin, so Enter == Shift+Enter */
            'p': {
              marginTop: '0',
              marginBottom: '0',
            },
            /* Empty paragraphs (Enter key) still need some height to exist */
            'p:empty': {
              margin: '0',
              minHeight: '1.5em',
            },
          },
        },
      },
    },
  },
};
export default config;
