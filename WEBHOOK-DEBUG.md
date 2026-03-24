# Guia de Debug — Webhooks

Se seu webhook não está criando leads, use este guia para investigar.

## 🔍 Passo 1: Verificar se o Webhook está Recebendo Dados

Use o **endpoint de debug** para ver exatamente o que está sendo enviado:

```bash
# Teste local
curl -X POST http://localhost:3000/api/webhook/debug \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Seu Nome",
    "telefone": "seu_telefone"
  }'

# Teste produção (Vercel)
curl -X POST https://crm-pilar.vercel.app/api/webhook/debug \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Seu Nome",
    "telefone": "seu_telefone"
  }'
```

**Você deve ver:**
```json
{
  "success": true,
  "message": "Webhook recebido com sucesso",
  "timestamp": "2024-03-24T10:30:00.000Z",
  "received": {
    "body": {
      "nome": "Seu Nome",
      "telefone": "seu_telefone"
    },
    "headers": {
      "content-type": "application/json",
      ...
    }
  }
}
```

---

## 🔧 Passo 2: Testar com Payload Correto

### Para Low Ticket:

```bash
curl -X POST https://crm-pilar.vercel.app/api/webhook/low-ticket \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Maria Silva",
    "telefone": "21988888888",
    "origem": "hotmart"
  }'
```

**Resposta esperada (HTTP 201):**
```json
{
  "success": true,
  "lead": {
    "id": "uuid-aqui",
    "nome": "Maria Silva",
    "telefone": "21988888888",
    "tags": ["low1-express"],
    "origem": "hotmart",
    "funnel": "low-ticket",
    "coluna": "novo-lead",
    "created_at": "2024-03-24T10:30:00Z"
  }
}
```

---

## ❌ Possíveis Erros

### Erro 400 - "Payload inválido"
**Causa:** JSON malformado

**Solução:**
- ✅ Verifique se o JSON está válido (use https://jsonlint.com/)
- ✅ Confirme se há quebras de linha indevidas
- ✅ Verifique aspas (use `"`, não `'`)

### Erro 500 - Supabase Error
**Causa:** Problema ao inserir no banco

**Solução:**
- ✅ Verifique se a coluna `valor` existe no Supabase
- ✅ Execute a migração: `ALTER TABLE leads ADD COLUMN IF NOT EXISTS valor DECIMAL(10, 2) DEFAULT 0.00;`
- ✅ Confirme que as credenciais Supabase estão corretas no `.env.local`

### Card não aparece (Status 201, mas sem lead no CRM)

**Causa:** Lead foi criado, mas não aparece visualmente

**Solução:**
1. Clique no botão **Recarregar** (↻) na header
2. Verifique se o lead apareceu na coluna "Novo Lead"
3. Se não aparecer, verifique no Supabase:

```sql
-- No SQL Editor do Supabase:
SELECT * FROM leads WHERE nome = 'Maria Silva' ORDER BY created_at DESC;
```

---

## 📋 Checklist de Funcionamento

- [ ] Endpoint debug retorna dados recebidos
- [ ] Status HTTP é 201 (sucesso)
- [ ] Resposta inclui campo "success": true
- [ ] Supabase mostra o novo lead na tabela
- [ ] CRM mostra o lead na coluna "Novo Lead" após recarregar
- [ ] Lead tem tag "low1-express"
- [ ] Lead tem funnel "low-ticket"

---

## 🧪 Script de Teste Completo

```bash
# Executar: ./test-low-ticket.sh https://crm-pilar.vercel.app
./test-low-ticket.sh https://crm-pilar.vercel.app
```

---

## 📊 Verificar Logs em Produção (Vercel)

1. Acesse: https://vercel.com/dashboard
2. Clique no projeto `crm-pilar`
3. Vá para **Deployments** → Projeto atual → **Functions Logs**
4. Procure por `[webhook/low-ticket]` ou `[webhook/debug]`
5. Veja os erros exatos

---

## 🔗 URLs para Testar

| Endpoint | URL |
|----------|-----|
| Debug | `https://crm-pilar.vercel.app/api/webhook/debug` |
| Low Ticket | `https://crm-pilar.vercel.app/api/webhook/low-ticket` |
| Perpétuo | `https://crm-pilar.vercel.app/api/webhook/perpetuo` |
| Hotmart | `https://crm-pilar.vercel.app/api/webhook/hotmart` |

---

## 💡 Exemplo de Payload Correto

```json
{
  "nome": "João Silva",
  "telefone": "11999999999",
  "origem": "hotmart"
}
```

**Campos aceitos:**
- `nome` (ou `name`, `full_name`, `contact_name`)
- `telefone` (ou `phone`, `whatsapp`, `mobile`)
- `origem` (ou `source`, `utm_source`) — OPCIONAL

---

## 🚀 Teste Agora

```bash
# Copie e execute:
curl -X POST https://crm-pilar.vercel.app/api/webhook/debug \
  -H "Content-Type: application/json" \
  -d '{"nome":"Test","telefone":"1199999999"}'

# Se receber resposta com "success": true, o webhook está recebendo dados ✅
```

Se ainda tiver problemas, me envie:
1. O **status HTTP** da resposta
2. A **mensagem de erro** (se houver)
3. O **payload exato** que você está enviando
