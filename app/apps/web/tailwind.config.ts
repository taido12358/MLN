import type { Config } from "tailwindcss";
import { THEME } from "./src/theme-tokens";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: { ...THEME },
      backgroundImage: {
        "app-gradient": "radial-gradient(1200px 600px at 10% -10%, #3b1d8f33, transparent), radial-gradient(1000px 500px at 110% 10%, #0891b233, transparent), linear-gradient(180deg, #0b0a1f 0%, #120f2e 100%)",
        "kahoot-a": "linear-gradient(135deg, #ef4444, #dc2626)",
        "kahoot-b": "linear-gradient(135deg, #3b82f6, #2563eb)",
        "kahoot-c": "linear-gradient(135deg, #f59e0b, #d97706)",
        "kahoot-d": "linear-gradient(135deg, #22c55e, #16a34a)",
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 40px -10px rgba(124,92,255,0.55)",
      },
    },
  },
  plugins: [],
};

export default config;
