/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: "class",
    content: [
        "./pages/**/*.{ts,tsx}",
        "./components/**/*.{ts,tsx}",
        "./app/**/*.{ts,tsx}",
        "./src/**/*.{ts,tsx}",
        "*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        container: {
            center: true,
            padding: "2rem",
            screens: {
                "2xl": "1400px",
            },
        },
        extend: {
            colors: {
                base: "#09090f",
                surface: {
                    DEFAULT: "#111118",
                    2: "#18181f",
                    3: "#1e1e28",
                },
                primary: {
                    DEFAULT: "#6366f1",
                    hover: "#818cf8",
                    dim: "#4f46e5",
                    muted: "rgba(99,102,241,0.12)",
                },
                accent: {
                    DEFAULT: "#8b5cf6",
                    hover: "#a78bfa",
                },
            },
            boxShadow: {
                "glow-sm": "0 0 12px rgba(99,102,241,0.25)",
                "glow": "0 0 24px rgba(99,102,241,0.3)",
                "glow-lg": "0 0 40px rgba(99,102,241,0.35)",
                "card": "0 1px 3px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.3)",
                "modal": "0 8px 32px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4)",
            },
            keyframes: {
                "accordion-down": {
                    from: { height: 0 },
                    to: { height: "var(--radix-accordion-content-height)" },
                },
                "accordion-up": {
                    from: { height: "var(--radix-accordion-content-height)" },
                    to: { height: 0 },
                },
                "pulse-glow": {
                    "0%, 100%": { opacity: 0.6 },
                    "50%": { opacity: 1 },
                },
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
                "pulse-glow": "pulse-glow 2s ease-in-out infinite",
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
}
