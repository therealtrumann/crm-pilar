# Guia Completo de Webhooks — CRM Pilar del Espanhol

## 📊 Fluxos de Integração

### Fluxo 1: Lead Perpétuo (PlugLead)
```
Form (Lovable) → PlugLead → CRM
```

**Passo 1: Form dispara para PlugLead**
- URL: `https://webhook.pluglead.com/webhook/a40dc6fa-aa9d-46e9-a267-ddc8ae8ee982`
- O formulário já faz isso (PlugLead fornece essa URL)

**Passo 2: PlugLead dispara para CRM**
- URL: `https://seu-dominio-vercel.app/api/webhook/perpetuo`
- Tag automática: `lead-perpetuo`
- Funil: `perpetuo`

---

### Fluxo 2: Low Ticket Express (Hotmart → PlugLead → CRM)
```
Hotmart Checkout → PlugLead → CRM
```

**Passo 1: Hotmart dispara para PlugLead**
- URL: `https://webhook.pluglead.com/webhook/sua-chave-hotmart`
- Você configura isso no painel da Hotmart

**Passo 2: PlugLead dispara para CRM**
- URL: `https://seu-dominio-vercel.app/api/webhook/perpetuo` (mesmo endpoint)
- OU: `https://seu-dominio-vercel.app/api/webhook/low-ticket` (para diferenciar)
- Tag automática: `low1-express`
- Funil: `low-ticket`

---

## 🔧 Como Configurar na PlugLead

### 1. Acessar Configurações de Webhook

1. Entre no painel da **PlugLead**: https://pluglead.com.br/dashboard
2. Vá para **Integrações** ou **Configurações**
3. Procure por **Webhooks** ou **Automações**
4. Clique em **Adicionar Webhook** ou **Nova Automação**

### 2. Configurar Webhook para Lead Perpétuo

**Quando**: Um novo lead é criado no formulário

**URL do Webhook**:
```
https://seu-dominio-vercel.app/api/webhook/perpetuo
```

**Método**: `POST`

**Headers**:
```
Content-Type: application/json
```

**Dados a enviar (Body)**:
```json
{
  "nome": "{{contact.name}}",
  "telefone": "{{contact.phone}}",
  "email": "{{contact.email}}",
  "origem": "pluglead-perpetuo"
}
```

**Ou use os campos dinâmicos da PlugLead**:
- `{{contact.name}}` → Nome do contato
- `{{contact.phone}}` → Telefone do contato
- `{{contact.email}}` → Email
- `{{stage.name}}` → Etapa atual (se tiver)

### 3. Configurar Webhook para Low Ticket (Hotmart)

**Quando**: Uma venda é confirmada na Hotmart (via PlugLead)

**URL do Webhook**:
```
https://seu-dominio-vercel.app/api/webhook/low-ticket
```

**Método**: `POST`

**Headers**:
```
Content-Type: application/json
```

**Dados a enviar (Body)**:
```json
{
  "nome": "{{contact.name}}",
  "telefone": "{{contact.phone}}",
  "email": "{{contact.email}}",
  "origem": "hotmart-low-ticket"
}
```

---

## 📝 Campos Aceitos nos Webhooks

Todos os webhooks do CRM aceitam as seguintes variações de nomes:

| Campo | Alternativas Aceitas |
|-------|----------------------|
| `nome` | `name`, `full_name`, `contact_name` |
| `telefone` | `phone`, `whatsapp`, `mobile` |
| `origem` | `source`, `utm_source` |
| `email` | *(armazenado em `origem` se não houver nome/telefone)* |

---

## 🧪 Testando os Webhooks

### Via cURL (teste local)

**Lead Perpétuo:**
```bash
curl -X POST http://localhost:3000/api/webhook/perpetuo \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "telefone": "11999999999",
    "origem": "teste-perpetuo"
  }'
```

**Low Ticket:**
```bash
curl -X POST http://localhost:3000/api/webhook/low-ticket \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Maria Santos",
    "telefone": "21988888888",
    "origem": "teste-low-ticket"
  }'
```

**Hotmart:**
```bash
curl -X POST http://localhost:3000/api/webhook/hotmart \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Pedro Costa",
    "telefone": "85987654321",
    "origem": "hotmart-teste"
  }'
```

### Via Vercel (teste produção)

Substitua `http://localhost:3000` por `https://seu-dominio.vercel.app`

---

## ⚙️ Checklist de Configuração

### Para PlugLead (Lead Perpétuo)
- [ ] Webhook configurado em **PlugLead → Integrações → Webhooks**
- [ ] URL: `https://seu-dominio.app/api/webhook/perpetuo`
- [ ] Método: `POST`
- [ ] Content-Type: `application/json`
- [ ] Campos mapeados: `nome`, `telefone`, `origem`
- [ ] Status: **Ativo**

### Para PlugLead (Low Ticket / Hotmart)
- [ ] Webhook configurado em **PlugLead → Integrações → Webhooks**
- [ ] URL: `https://seu-dominio.app/api/webhook/low-ticket`
- [ ] Método: `POST`
- [ ] Content-Type: `application/json`
- [ ] Campos mapeados: `nome`, `telefone`, `origem`
- [ ] Status: **Ativo**
- [ ] Disparo: **Quando venda da Hotmart chega**

### No CRM (Verificar)
- [ ] Botão "Webhooks" mostra as 3 URLs corretas
- [ ] Leads chegando com tags corretas:
  - ✅ `lead-perpetuo` para PlugLead (perpétuo)
  - ✅ `low1-express` para Low Ticket/Hotmart
- [ ] Campo `origem` preenchido corretamente

---

## 🔍 Verificando se Está Funcionando

1. **No CRM**:
   - Clique em **Webhooks** (botão na header)
   - Confirme que as URLs estão corretas
   - Crie um lead manualmente para testar

2. **No Console/Logs**:
   - Se usar Vercel, vá para **Project Settings → Function Logs**
   - Procure por `[webhook/perpetuo]` ou `[webhook/low-ticket]`
   - Verifique se há erros

3. **No Banco (Supabase)**:
   - Acesse https://supabase.com/dashboard
   - Vá para **SQL Editor**
   - Execute: `SELECT * FROM leads ORDER BY created_at DESC LIMIT 5;`
   - Verifique os últimos leads criados

---

## 🚨 Troubleshooting

### Leads não aparecem
1. ✅ Verifique a URL do webhook (sem erros de digitação)
2. ✅ Confirme método POST e Content-Type application/json
3. ✅ Teste com cURL para confirmar que funciona
4. ✅ Verifique console.log em Vercel → Function Logs

### Tags erradas
- Lead com tag errada = webhook enviou dados errados
- Verifique o mapeamento de campos na PlugLead

### Leads com origem vazia
- Campo `origem` não foi enviado
- Adicione `"origem": "pluglead-perpetuo"` no body do webhook

### Erro 500 no webhook
- Supabase offline ou credenciais inválidas
- Verifique `.env.local` tem as credenciais corretas

---

## 📞 Suporte

Se tiver problemas:
1. Teste primeiro com `cURL` localmente
2. Copie a URL exata do endpoint
3. Verifique os logs em Vercel
4. Confirme que o banco está acessível
