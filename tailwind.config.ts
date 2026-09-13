import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        crimson: {
          DEFAULT: "#990000",
          dark: "#7A0000",
          light: "#B32424",
          50: "#FBECEC",
        },
        cream: "#F7F3EC",
        paper: "#FFFFFF",
        ink: {
          DEFAULT: "#1E1B1B",
          soft: "#5A5450",
          faint: "#8B8480",
        },
        line: "#E6DFD3",
        positive: "#1E7B4D",
        negative: "#B32424",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(30,27,27,0.04), 0 1px 12px rgba(30,27,27,0.05)",
      },
      borderRadius: {
        card: "10px",
      },
    },
  },
  plugins: [],
};
export default config;
