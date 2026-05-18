/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        padap: {
          green: "#39d353",
          emerald: "#16a34a",
          mint: "#9cffb1",
          cyan: "#42d7ff",
          amber: "#f6b73c",
          oil: "#062b2b",
          deep: "#031a18",
          graphite: "#091116",
          panel: "rgba(7, 19, 18, 0.78)"
        }
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(57, 211, 83, 0.22), 0 18px 46px rgba(57, 211, 83, 0.10)",
        panel: "0 24px 70px rgba(0, 0, 0, 0.34)",
        lift: "0 18px 48px rgba(0, 0, 0, 0.28)"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "Segoe UI", "Arial", "sans-serif"]
      }
    }
  },
  plugins: []
};
