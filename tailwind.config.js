/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ground: {
          DEFAULT: "rgb(var(--ground))",
          raised: "rgb(var(--ground-raised))",
          deep: "rgb(var(--ground-deep))",
        },
        ink: {
          DEFAULT: "rgb(var(--ink))",
          muted: "rgb(var(--ink-muted))",
          faint: "rgb(var(--ink-faint))",
        },
        rule: "rgb(var(--rule))",
        glow: {
          DEFAULT: "rgb(var(--glow))",
          bright: "rgb(var(--glow-bright))",
          deep: "rgb(var(--glow-deep))",
        },
        signal: "rgb(var(--signal))",
        // aliases the components/ui primitives were written against
        border: "rgb(var(--rule))",
        input: "rgb(var(--rule))",
        ring: "rgb(var(--glow-bright))",
        background: "rgb(var(--ground))",
        foreground: "rgb(var(--ink))",
        primary: {
          DEFAULT: "rgb(var(--glow))",
          foreground: "rgb(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "rgb(var(--ground-raised))",
          foreground: "rgb(var(--ink))",
        },
        accent: {
          DEFAULT: "rgb(var(--glow))",
          foreground: "rgb(var(--accent-foreground))",
        },
        muted: {
          DEFAULT: "rgb(var(--ground-raised))",
          foreground: "rgb(var(--ink-muted))",
        },
        destructive: {
          DEFAULT: "rgb(var(--signal))",
          foreground: "rgb(var(--destructive-foreground))",
        },
      },
      fontFamily: {
        display: ["var(--font-display)"],
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
      fontSize: {
        // Maximalist: display sizes are meant to reach the full width of the
        // page, not sit politely above a paragraph.
        mega: ["clamp(4rem, 13vw, 13rem)", { lineHeight: "0.84", letterSpacing: "-0.045em" }],
        display: ["clamp(3.25rem, 9vw, 8.5rem)", { lineHeight: "0.88", letterSpacing: "-0.04em" }],
        title: ["clamp(2.5rem, 6.5vw, 5.5rem)", { lineHeight: "0.92", letterSpacing: "-0.035em" }],
        heading: ["clamp(1.875rem, 3.4vw, 3.25rem)", { lineHeight: "1.0", letterSpacing: "-0.025em" }],
        lead: ["clamp(1.25rem, 1.9vw, 1.65rem)", { lineHeight: "1.45" }],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "var(--radius)",
        sm: "var(--radius)",
      },
      maxWidth: {
        measure: "58ch",
        page: "88rem",
      },
    },
  },
  plugins: [],
}
