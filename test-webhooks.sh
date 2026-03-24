#!/bin/bash

# Script para testar webhooks do CRM Pilar del Espanhol
# Use: ./test-webhooks.sh [dominio] [tipo]

DOMINIO="${1:-http://localhost:3000}"
TIPO="${2:-all}"

echo "🧪 Testando Webhooks — CRM Pilar"
echo "Domínio: $DOMINIO"
echo ""

# Cor para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

test_webhook() {
  local nome=$1
  local url=$2
  local data=$3

  echo -e "${YELLOW}→ Testando: $nome${NC}"
  echo "   URL: $url"

  response=$(curl -s -X POST "$url" \
    -H "Content-Type: application/json" \
    -d "$data" \
    -w "\n%{http_code}")

  body=$(echo "$response" | head -n -1)
  http_code=$(echo "$response" | tail -n 1)

  if [ "$http_code" = "201" ] || [ "$http_code" = "200" ]; then
    echo -e "${GREEN}✅ Sucesso ($http_code)${NC}"
    echo "   Response: $(echo $body | jq '.success' 2>/dev/null || echo 'OK')"
  else
    echo -e "${RED}❌ Erro ($http_code)${NC}"
    echo "   Response: $body"
  fi
  echo ""
}

# Teste 1: Lead Perpétuo
if [ "$TIPO" = "all" ] || [ "$TIPO" = "perpetuo" ]; then
  test_webhook "Lead Perpétuo (PlugLead)" \
    "$DOMINIO/api/webhook/perpetuo" \
    '{
      "nome": "João Silva - Perpétuo",
      "telefone": "11999999999",
      "origin": "pluglead-perpetuo"
    }'
fi

# Teste 2: Low Ticket
if [ "$TIPO" = "all" ] || [ "$TIPO" = "low-ticket" ]; then
  test_webhook "Low Ticket Express" \
    "$DOMINIO/api/webhook/low-ticket" \
    '{
      "nome": "Maria Santos - Low Ticket",
      "telefone": "21988888888",
      "origin": "pluglead-low-ticket"
    }'
fi

# Teste 3: Hotmart
if [ "$TIPO" = "all" ] || [ "$TIPO" = "hotmart" ]; then
  test_webhook "Hotmart" \
    "$DOMINIO/api/webhook/hotmart" \
    '{
      "nome": "Pedro Costa - Hotmart",
      "telefone": "85987654321",
      "origin": "hotmart"
    }'
fi

echo "✨ Testes completos!"
