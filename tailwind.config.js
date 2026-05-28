/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        padap: {
          green: "#1dba2c",
          emerald: "#0f4c4f",
          mint: "#e2f8e5",
          cyan: "#2d7f82",
          amber: "#c98200",
          oil: "#143f42",
          deep: "#0f4c4f",
          graphite: "#ffffff",
          panel: "#ffffff",
          paper: "#ffffff",
          field: "#f4f7fa",
          line: "#dce6e2",
          ink: "#0b1f1e",
          muted: "#4f655d"
        }
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(29, 186, 44, 0.24), 0 14px 34px rgba(15, 76, 79, 0.14)",
        panel: "0 18px 44px rgba(15, 76, 79, 0.10)",
        lift: "0 16px 36px rgba(15, 76, 79, 0.14)"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "Segoe UI", "Arial", "sans-serif"]
      }
    }
  },
  plugins: []
};
