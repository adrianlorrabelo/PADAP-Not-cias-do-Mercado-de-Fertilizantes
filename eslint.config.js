import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist", "preview", "node_modules"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      // Proibir uso de `any` explícito
      "@typescript-eslint/no-explicit-any": "warn",
      // Proibir variáveis declaradas e não usadas
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      // Exigir uso consistente de `const`
      "prefer-const": "error",
      // Proibir console.log em produção (use console.warn/error quando necessário)
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  }
);
