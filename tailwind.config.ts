import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: "#FDFBF7",
          100: "#F8F4EE",
          200: "#F0E8DC",
          300: "#E5D9C8",
        },
        indigo: {
          deep: "#1A1744",
          DEFAULT: "#2D2A6B",
          soft: "#4A4690",
          mist: "#E8E7F5",
        },
        turquoise: {
          DEFAULT: "#0D9488",
          soft: "#14B8A6",
          mist: "#D5F5F0",
          deep: "#0F766E",
        },
        gold: {
          DEFAULT: "#C9A24A",
          soft: "#E8D5A3",
          mist: "#F7F0DE",
          deep: "#A8842E",
        },
      },
      boxShadow: {
        card: "0 8px 30px -8px rgba(26, 23, 68, 0.18), 0 2px 8px -2px rgba(26, 23, 68, 0.08)",
        float: "0 12px 40px -12px rgba(26, 23, 68, 0.25)",
        soft: "0 2px 12px -2px rgba(26, 23, 68, 0.08)",
        glow: "0 0 0 4px rgba(201, 162, 74, 0.25)",
      },
      borderRadius: {
        "2.5xl": "1.25rem",
        "4xl": "2rem",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px) scale(0.98)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "pop-in": {
          "0%": { opacity: "0", transform: "scale(0.85)" },
          "60%": { transform: "scale(1.04)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "match-burst": {
          "0%": { opacity: "0", transform: "scale(0.5) rotate(-8deg)" },
          "100%": { opacity: "1", transform: "scale(1) rotate(0deg)" },
        },
        "slide-out-left": {
          "0%": { transform: "translateX(0) rotate(0)", opacity: "1" },
          "100%": { transform: "translateX(-120%) rotate(-12deg)", opacity: "0" },
        },
        "slide-out-right": {
          "0%": { transform: "translateX(0) rotate(0)", opacity: "1" },
          "100%": { transform: "translateX(120%) rotate(12deg)", opacity: "0" },
        },
        "toast-in": {
          "0%": { opacity: "0", transform: "translateY(16px) scale(0.95)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "pulse-soft": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.35s ease-out both",
        "fade-in": "fade-in 0.25s ease-out both",
        "pop-in": "pop-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both",
        "match-burst": "match-burst 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both",
        "slide-out-left": "slide-out-left 0.35s ease-in forwards",
        "slide-out-right": "slide-out-right 0.35s ease-in forwards",
        "toast-in": "toast-in 0.3s ease-out both",
        shimmer: "shimmer 1.5s linear infinite",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
