import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0b0a1f",
        panel: "#151233",
        panel2: "#1c1740",
        accent: "#7c5cff",
        accent2: "#22d3ee",
        correct: "#22c55e",
        wrong: "#ef4444",
      },
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
