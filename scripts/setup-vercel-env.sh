#!/usr/bin/env bash
# ============================================================
# PADAP Intelligence — Configurar variáveis de ambiente na Vercel
#
# Pré-requisitos:
#   npm install -g vercel
#   vercel login
#   vercel link   (aponte para o projeto correto)
#
# Uso:
#   bash scripts/setup-vercel-env.sh
# ============================================================

set -euo pipefail

# ---------- Edite os valores abaixo antes de executar ----------
SUPABASE_URL="https://tkxlrthqebhtawjxzojs.supabase.co"
SUPABASE_ANON_KEY="sb_publishable_62hINc40DJKvI4Kd82q3Qw_I6uyvKl3"

DEMO_PW_ADMIN="COLOQUE_SENHA_ADMIN"
DEMO_PW_GESTOR="COLOQUE_SENHA_GESTOR"
DEMO_PW_COMPRAS="COLOQUE_SENHA_COMPRAS"
DEMO_PW_CONSULTOR="COLOQUE_SENHA_CONSULTOR"
DEMO_PW_VIEWER="COLOQUE_SENHA_VIEWER"
DEMO_PW_INATIVO="COLOQUE_SENHA_INATIVO"
# ---------------------------------------------------------------

ENVS=("production" "preview" "development")

add_env() {
  local key="$1"
  local value="$2"
  for env in "${ENVS[@]}"; do
    echo "$value" | vercel env add "$key" "$env" --force 2>/dev/null || true
  done
  echo "  ✓ $key"
}

echo "Configurando variáveis de ambiente na Vercel..."

add_env "VITE_SUPABASE_URL"      "$SUPABASE_URL"
add_env "VITE_SUPABASE_ANON_KEY" "$SUPABASE_ANON_KEY"
add_env "VITE_DEMO_PW_ADMIN"     "$DEMO_PW_ADMIN"
add_env "VITE_DEMO_PW_GESTOR"    "$DEMO_PW_GESTOR"
add_env "VITE_DEMO_PW_COMPRAS"   "$DEMO_PW_COMPRAS"
add_env "VITE_DEMO_PW_CONSULTOR" "$DEMO_PW_CONSULTOR"
add_env "VITE_DEMO_PW_VIEWER"    "$DEMO_PW_VIEWER"
add_env "VITE_DEMO_PW_INATIVO"   "$DEMO_PW_INATIVO"

echo ""
echo "Feito! Faça um novo deploy para aplicar:"
echo "  vercel --prod"
