import type { Config } from "tailwindcss";
import { THEME } from "./src/theme-tokens";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: { ...THEME },
      backgroundImage: {
        // Warm peach-cream page: soft red glow top-left (lantern), gold glow top-right, faint bamboo
        // green haze at the bottom, over a cream→peach vertical gradient.
        "app-gradient":
          "radial-gradient(900px 520px at 8% -8%, rgba(215,38,30,0.16), transparent 70%), radial-gradient(900px 520px at 100% 0%, rgba(246,207,90,0.38), transparent 70%), radial-gradient(1200px 400px at 50% 110%, rgba(63,157,58,0.14), transparent 70%), linear-gradient(180deg, #fff6ea 0%, #fbeedc 55%, #f7e2c4 100%)",
        // Kahoot-style answer tiles, re-tinted to the Tết palette: red / gold / bamboo / lantern-blue.
        "kahoot-a": "linear-gradient(135deg, #e53935, #b71c1c)",
        "kahoot-b": "linear-gradient(135deg, #f5b301, #d48806)",
        "kahoot-c": "linear-gradient(135deg, #43a047, #2e7d32)",
        "kahoot-d": "linear-gradient(135deg, #3f51b5, #283593)",
        "gold-shine": "linear-gradient(120deg, #b8860b 0%, #f6cf5a 35%, #fff2b0 50%, #f6cf5a 65%, #b8860b 100%)",
        "red-envelope": "linear-gradient(160deg, #e8362b 0%, #c8191a 60%, #a80f16 100%)",
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
      boxShadow: {
        // Warm red glow — primary buttons, dialogs, hero envelope.
        glow: "0 12px 36px -12px rgba(215,38,30,0.55), 0 0 0 1px rgba(246,207,90,0.35)",
        // Soft warm drop shadow for cards on the cream background.
        card: "0 10px 30px -14px rgba(120,40,10,0.28), 0 1px 0 rgba(255,255,255,0.8) inset",
        gold: "0 0 0 2px #f6cf5a, 0 10px 30px -10px rgba(229,164,28,0.6)",
      },
      keyframes: {
        "petal-fall": {
          "0%": { transform: "translate3d(0,-10vh,0) rotate(0deg)", opacity: "0" },
          "10%": { opacity: "1" },
          "100%": { transform: "translate3d(var(--drift, 40px),110vh,0) rotate(540deg)", opacity: "0.6" },
        },
        sway: {
          "0%, 100%": { transform: "rotate(-4deg)" },
          "50%": { transform: "rotate(4deg)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% center" },
          "100%": { backgroundPosition: "-200% center" },
        },
        "float-y": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      animation: {
        sway: "sway 4s ease-in-out infinite",
        "sway-slow": "sway 6s ease-in-out infinite",
        shimmer: "shimmer 4s linear infinite",
        "float-y": "float-y 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
