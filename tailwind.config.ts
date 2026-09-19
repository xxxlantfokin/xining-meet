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
          50: "#FBF8F3",
          100: "#F7F2EA",
          200: "#EFE7DB",
          300: "#E4D9C8",
        },
        ink: {
          DEFAULT: "#1F2A44",
          soft: "#5A6578",
          mute: "#8A93A3",
          mist: "#E8EBF0",
        },
        teal: {
          DEFAULT: "#2A9D8F",
          soft: "#3DB5A6",
          mist: "#D8F0EC",
          deep: "#1F7A6F",
        },
        gold: {
          DEFAULT: "#C4A574",
          soft: "#E0D0B0",
          mist: "#F5EFE4",
          deep: "#A68958",
        },
        // Aliases so existing class names keep working while we migrate
        indigo: {
          deep: "#1F2A44",
          DEFAULT: "#1F2A44",
          soft: "#5A6578",
          mist: "#E8EBF0",
        },
        turquoise: {
          DEFAULT: "#2A9D8F",
          soft: "#3DB5A6",
          mist: "#D8F0EC",
          deep: "#1F7A6F",
        },
      },
      boxShadow: {
        card: "0 10px 28px -12px rgba(31, 42, 68, 0.16), 0 2px 8px -4px rgba(31, 42, 68, 0.06)",
        float: "0 16px 40px -16px rgba(31, 42, 68, 0.22)",
        soft: "0 2px 10px -2px rgba(31, 42, 68, 0.07)",
        glass: "0 8px 32px -8px rgba(31, 42, 68, 0.12)",
      },
      borderRadius: {
        "2.5xl": "1.25rem",
        "3xl": "1.5rem",
        "4xl": "1.75rem",
      },
      fontSize: {
        title: ["1.375rem", { lineHeight: "1.45", fontWeight: "600" }],
        "title-lg": ["1.5rem", { lineHeight: "1.45", fontWeight: "600" }],
        body: ["0.9375rem", { lineHeight: "1.5" }],
        "body-lg": ["1rem", { lineHeight: "1.5" }],
        secondary: ["0.8125rem", { lineHeight: "1.45" }],
        caption: ["0.75rem", { lineHeight: "1.45" }],
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "match-in": {
          "0%": { opacity: "0", transform: "scale(0.94)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "avatar-bounce": {
          "0%": { transform: "scale(0.88) translateY(6px)" },
          "55%": { transform: "scale(1.04) translateY(-2px)" },
          "100%": { transform: "scale(1) translateY(0)" },
        },
        "toast-in": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.32s ease-out both",
        "fade-in": "fade-in 0.28s ease-out both",
        "match-in": "match-in 0.3s ease-out both",
        "avatar-bounce": "avatar-bounce 0.45s ease-out both",
        "toast-in": "toast-in 0.28s ease-out both",
        shimmer: "shimmer 1.6s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
