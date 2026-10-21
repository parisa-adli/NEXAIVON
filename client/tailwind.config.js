/** @type {import('tailwindcss').Config} */
const { fontFamily } = require("tailwindcss/defaultTheme");

function withOpacity(variableName) {
  return ({ opacityValue }) => {
    if (opacityValue !== undefined) {
      return `rgba(var(${variableName}), ${opacityValue})`;
    }
    return `rgb(var(${variableName}))`;
  };
}

module.exports = {
  content: [
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/common/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ["class", '[class="dark-mode"]'],
  theme: {
    extend: {
      screens: {
        xs: "380px",
      },
      colors: {
        primary: {
          900: withOpacity("--color-primary-900"),
          800: withOpacity("--color-primary-800"),
          700: withOpacity("--color-primary-700"),
          600: withOpacity("--color-primary-600"),
          500: withOpacity("--color-primary-500"),
          400: withOpacity("--color-primary-400"),
          300: withOpacity("--color-primary-300"),
          200: withOpacity("--color-primary-200"),
          100: withOpacity("--color-primary-100"),
        },
        secondary: {
          900: withOpacity("--color-secondary-900"),
          800: withOpacity("--color-secondary-800"),
          700: withOpacity("--color-secondary-700"),
          600: withOpacity("--color-secondary-600"),
          500: withOpacity("--color-secondary-500"),
          400: withOpacity("--color-secondary-400"),
          300: withOpacity("--color-secondary-300"),
          200: withOpacity("--color-secondary-200"),
          100: withOpacity("--color-secondary-100"),
          50: withOpacity("--color-secondary-50"),
          0: withOpacity("--color-secondary-0"),
        },
        success: withOpacity("--color-success"),
        warning: withOpacity("--color-warning"),
        error: withOpacity("--color-error"),
        // Storefront palette (globals.css); light and dark values swap with the theme.
        page: withOpacity("--color-page"),
        surface: withOpacity("--color-surface"),
        ink: withOpacity("--color-ink"),
        muted: withOpacity("--color-muted"),
        sage: withOpacity("--color-sage"),
        sand: withOpacity("--color-sand"),
        "sage-ink": withOpacity("--color-sage-ink"),
        "sand-ink": withOpacity("--color-sand-ink"),
        sale: withOpacity("--color-sale"),
        "in-stock": withOpacity("--color-in-stock"),
        line: withOpacity("--color-line"),
        cta: withOpacity("--color-cta"),
        "on-cta": withOpacity("--color-on-cta"),
      },
      fontFamily: {
        sans: ["var(--font-vazir)", ...fontFamily.sans],
        latin: ["var(--font-inter)", ...fontFamily.sans],
      },
      // Storefront type scale: mobile size first ("-m"), desktop size from `md:`.
      fontSize: {
        display: ["56px", { lineHeight: "1.2" }],
        "display-m": ["36px", { lineHeight: "1.2" }],
        h1: ["40px", { lineHeight: "1.25" }],
        "h1-m": ["28px", { lineHeight: "1.25" }],
        h2: ["28px", { lineHeight: "1.3" }],
        "h2-m": ["22px", { lineHeight: "1.3" }],
        h3: ["20px", { lineHeight: "1.3" }],
        "h3-m": ["18px", { lineHeight: "1.3" }],
        body: ["16px", { lineHeight: "1.75" }],
        small: ["14px", { lineHeight: "1.7" }],
        caption: ["12px", { lineHeight: "1.6" }],
      },
      borderRadius: {
        card: "12px",
        panel: "20px",
        hero: "24px",
        pill: "9999px",
      },
      container: {
        center: true,
      },
      boxShadow: {
        "input-focus": "0 12px 24px -8px rgb(var(--color-primary-300))",
      },
    },
  },
  plugins: [],
};
