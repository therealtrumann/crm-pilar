#!/bin/bash

# Teste do webhook low-ticket
DOMAIN="${1:-https://crm-pilar.vercel.app}"

echo "🧪 Testando webhook low-ticket"
echo "URL: $DOMAIN/api/webhook/low-ticket"
echo ""

# Teste 1: Payload simples
echo "Test 1: Payload básico (nome + telefone)"
curl -X POST "$DOMAIN/api/webhook/low-ticket" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Test User",
    "telefone": "11999999999"
  }' \
  -w "\nStatus: %{http_code}\n\n"

# Teste 2: Payload com origem
echo "Test 2: Payload com origem"
curl -X POST "$DOMAIN/api/webhook/low-ticket" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Maria Silva",
    "phone": "21988888888",
    "source": "hotmart"
  }' \
  -w "\nStatus: %{http_code}\n\n"

# Teste 3: Payload com campos alternativos
echo "Test 3: Payload com campos alternativos"
curl -X POST "$DOMAIN/api/webhook/low-ticket" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "João Santos",
    "mobile": "85987654321",
    "utm_source": "instagram"
  }' \
  -w "\nStatus: %{http_code}\n\n"

echo "✨ Testes completos!"
