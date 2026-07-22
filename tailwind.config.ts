import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        /* ── Primary tokens ───────────────────────────── */
        bg:              "rgb(var(--bg) / <alpha-value>)",
        surface:         "rgb(var(--surface) / <alpha-value>)",
        "surface-raised":"rgb(var(--surface-raised) / <alpha-value>)",
        border:          "rgb(var(--border) / <alpha-value>)",
        clause:          "rgb(var(--clause) / <alpha-value>)",
        "text-primary":  "rgb(var(--text-primary) / <alpha-value>)",
        "text-muted":    "rgb(var(--text-muted) / <alpha-value>)",

        /* ── Legacy names (now CSS-var-backed for dark mode) */
        background:      "rgb(var(--bg) / <alpha-value>)",
        panel:           "rgb(var(--panel) / <alpha-value>)",
        ink:             "rgb(var(--ink) / <alpha-value>)",
        muted:           "rgb(var(--muted-legacy) / <alpha-value>)",
        line:            "rgb(var(--line) / <alpha-value>)",
        teal:            "rgb(var(--teal) / <alpha-value>)",
        amber:           "rgb(var(--amber-legacy) / <alpha-value>)",
        danger:          "rgb(var(--danger) / <alpha-value>)",
        gold:            "rgb(var(--gold) / <alpha-value>)",
        cobalt:          "rgb(var(--cobalt) / <alpha-value>)",
      },
      fontFamily: {
        sans:    ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
        mono:    ["var(--font-mono)", "Courier New", "monospace"],
      },
      animation: {
        "fade-in":  "fadeIn 0.35s ease forwards",
        "slide-up": "slideUp 0.45s ease forwards",
      },
      keyframes: {
        fadeIn:  { from: { opacity: "0" }, to: { opacity: "1" } },
        slideUp: {
          from: { opacity: "0", transform: "translateY(10px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
