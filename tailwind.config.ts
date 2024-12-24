import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      animation: {
        "gradient-shadow": "gradient-shadow 3s ease-in-out infinite",
      },
      keyframes: {
        "gradient-shadow": {
          "0%, 100%": {
            boxShadow: "0 4px 20px rgba(255, 0, 150, 0.5)",
          },
          "50%": {
            boxShadow: "0 6px 25px rgba(0, 200, 255, 0.7)",
          },
        },
      },
    },
  },
  plugins: [
    plugin(function ({ addUtilities }) {
      addUtilities({
        ".shadow-gradient": {
          boxShadow: "0 4px 20px rgba(255, 0, 150, 0.5)",
        },
      });
    }),
  ],
};

export default config;
