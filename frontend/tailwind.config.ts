import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./types/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#070B16",
        card: "#0D1326",
        accent: {
          cyan: "#23D3EE",
          blue: "#4B83F5",
          lime: "#B4F15F",
          amber: "#FFB347",
          rose: "#FF6B9E"
        }
      },
      boxShadow: {
        glow: "0 0 40px rgba(35, 211, 238, 0.18)",
        panel: "0 25px 70px rgba(4, 7, 17, 0.42)"
      },
      backgroundImage: {
        "spectrum-radial": "radial-gradient(circle at 20% 20%, rgba(35, 211, 238, 0.22), transparent 45%), radial-gradient(circle at 75% 15%, rgba(255, 107, 158, 0.18), transparent 35%), radial-gradient(circle at 60% 80%, rgba(75, 131, 245, 0.22), transparent 40%)",
        "grid-fade": "linear-gradient(rgba(35, 211, 238, 0.07) 1px, transparent 1px), linear-gradient(to right, rgba(35, 211, 238, 0.07) 1px, transparent 1px)"
      },
      backgroundSize: {
        grid: "45px 45px"
      }
    }
  },
  plugins: []
};

export default config;
