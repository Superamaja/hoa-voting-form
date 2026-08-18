/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#dae6ff",
          200: "#bcd2ff",
          300: "#8eb4ff",
          400: "#5a8bff",
          500: "#3563f5",
          600: "#2247e0",
          700: "#1c37b4",
          800: "#1c318f",
          900: "#1c2d71",
        },
        ink: {
          900: "#070b18",
          800: "#0b1020",
          700: "#111834",
        },
      },
      boxShadow: {
        card: "0 24px 64px -12px rgba(4, 8, 22, 0.65)",
        glow: "0 0 0 1px rgba(255,255,255,0.06), 0 18px 40px -18px rgba(53,99,245,0.85)",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.94)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        drift: {
          "0%, 100%": { transform: "translate3d(0,0,0) scale(1)" },
          "50%": { transform: "translate3d(0,-24px,0) scale(1.08)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) both",
        "scale-in": "scale-in 0.35s cubic-bezier(0.16, 1, 0.3, 1) both",
        drift: "drift 14s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
