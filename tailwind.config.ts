import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: "#0f1117",
          secondary: "#1a1d27",
          card: "#1e2130",
        },
        border: {
          DEFAULT: "#2a2d3e",
        },
        accent: {
          DEFAULT: "#6366f1",
          hover: "#4f46e5",
          muted: "#312e81",
        },
        success: "#10b981",
        danger: "#ef4444",
        warning: "#f59e0b",
        "text-primary": "#f1f5f9",
        "text-secondary": "#94a3b8",
        "text-muted": "#475569",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
      },
    },
  },
  plugins: [],
};

export default config;
