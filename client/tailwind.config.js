/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cream: {
          primary: "#FDFCFB",
          secondary: "#F8F6F2",
          surface: "#F1EEE6",
          accent: "#EAE6D9",
        },
        background: {
          DEFAULT: "#09090b", // Zinc 950
          light: "#FDFCFB", // Updated to Cream
          dark: "#09090b",
        },
        surface: {
          DEFAULT: "#18181b", // Zinc 900
          light: "#F8F6F2", // Updated to Cream Secondary
          dark: "#18181b",
          accent: {
            light: "#F1EEE6", // Updated to Cream Surface
            dark: "#27272a",
          }
        },
        primary: {
          DEFAULT: "#10b981", // Emerald 500
          hover: "#059669",
          glow: "rgba(16, 185, 129, 0.15)",
        },
        text: {
          primary: {
            DEFAULT: "#fafafa",
            light: "#0f172a",
            dark: "#fafafa",
          },
          muted: {
            DEFAULT: "#a1a1aa",
            light: "#64748b",
            dark: "#a1a1aa",
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glow': '0 0 20px rgba(16, 185, 129, 0.15)',
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.3)',
      }
    },
  },
  plugins: [],
}

