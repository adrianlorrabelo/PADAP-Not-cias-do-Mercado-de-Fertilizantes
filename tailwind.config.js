/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        padap: {
          green:    "#0f4c4f",  // primário — verde escuro PADAP
          emerald:  "#0a3538",  // hover/profundidade do primário
          mint:     "#e6f3f3",  // tint suave do verde escuro (hover, preenchimentos)
          cyan:     "#1dba2c",  // acento — verde claro (badges, sucesso, destaques)
          amber:    "#c98200",
          oil:      "#072a2c",
          deep:     "#0f4c4f",
          graphite: "#ffffff",
          panel:    "#ffffff",
          paper:    "#ffffff",
          field:    "#f2f8f8",  // fundo de inputs com leve tom teal
          line:     "#cddede",  // borda com tom teal
          ink:      "#0b1f1e",
          muted:    "#4a6565"   // texto secundário com tom teal
        }
      },
      boxShadow: {
        glow:  "0 0 0 1px rgba(15, 76, 79, 0.28), 0 14px 34px rgba(15, 76, 79, 0.14)",
        panel: "0 18px 44px rgba(15, 76, 79, 0.10)",
        lift:  "0 16px 36px rgba(15, 76, 79, 0.14)"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "Segoe UI", "Arial", "sans-serif"]
      }
    }
  },
  plugins: []
};
