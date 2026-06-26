import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        /* Brand */
        primary: {
          50: "var(--primary-50)",
          100: "var(--primary-100)",
          200: "var(--primary-200)",
          300: "var(--primary-300)",
          400: "var(--primary-400)",
        },
        secondary: {
          200: "var(--secondary-200)",
        },

        /* Semantic */
        success: "var(--success)",
        warning: "var(--warning)",
        error: "var(--error)",
        info: "var(--info)",

        /* Neutral */
        grey: {
          50: "var(--grey-50)",
          100: "var(--grey-100)",
          200: "var(--grey-200)",
          300: "var(--grey-300)",
          400: "var(--grey-400)",
          500: "var(--grey-500)",
          600: "var(--grey-600)",
          700: "var(--grey-700)",
          800: "var(--grey-800)",
        },

        /* Theme-aware */
        background: "var(--background)",
        foreground: "var(--text-primary)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-hint": "var(--text-hint)",
        "text-disabled": "var(--text-disabled)",
        "text-inverse": "var(--text-inverse)",
        "background-secondary": "var(--background-secondary)",
        surface: "var(--surface)",
        "surface-variant": "var(--surface-variant)",
        border: "var(--border)",
        divider: "var(--divider)",
        "icon-primary": "var(--icon-primary)",
        "icon-secondary": "var(--icon-secondary)",
      },
      borderColor: {
        DEFAULT: "var(--border)",
      },
      boxShadow: {
        card: "var(--shadow-card)",
        raised: "var(--shadow-raised)",
        overlay: "var(--shadow-overlay)",
      },
      borderRadius: {
        card: "var(--radius-card)",
        chip: "var(--radius-chip)",
        control: "var(--radius-control)",
      },
      backgroundImage: {
        "gradient-brand": "var(--gradient-brand)",
      },
    },
  },
  plugins: [],
};
export default config;
