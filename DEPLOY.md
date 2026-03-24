# Deploy — CRM Pilar del Espanhol

## 1. Supabase

1. Crie um projeto em https://supabase.com
2. Abra o **SQL Editor** e execute o conteúdo de `supabase/schema.sql`
3. Copie as credenciais em **Settings → API**:
   - `URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY`
4. Habilite o **Realtime** para a tabela `leads`:
   - Table Editor → leads → Replication → Enable

## 2. Vercel

1. Faça push do projeto para um repositório GitHub
2. No Vercel, clique **Add New Project** e importe o repositório
3. Em **Environment Variables**, adicione:
   ```
   NEXT_PUBLIC_SUPABASE_URL     = https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJ...
   SUPABASE_SERVICE_ROLE_KEY     = eyJ...
   ```
4. Clique em **Deploy**

## 3. Configurar Webhooks

Após o deploy, o domínio Vercel será algo como `crm-pilar.vercel.app`.

### Funil Low Ticket (tag: low1 express)
```
POST https://crm-pilar.vercel.app/api/webhook/low-ticket
Content-Type: application/json

{ "nome": "João Silva", "telefone": "11999999999" }
```

### Funil Perpétuo — PlugLead (tag: lead perpétuo)
Configure o PlugLead para enviar para:
```
POST https://crm-pilar.vercel.app/api/webhook/perpetuo
```
No PlugLead, o webhook de origem é:
`https://webhook.pluglead.com/webhook/a40dc6fa-aa9d-46e9-a267-ddc8ae8ee982`

## 4. Desenvolvimento local

```bash
cp .env.local.example .env.local
# Preencha .env.local com as credenciais do Supabase

npm install
npm run dev
# Acesse http://localhost:3000
```

## Campos aceitos nos webhooks

| Campo | Alternativas aceitas |
|-------|---------------------|
| `nome` | `name`, `full_name`, `contact_name` |
| `telefone` | `phone`, `whatsapp`, `mobile` |
| `origem` | `source`, `utm_source` |

Todos os campos são opcionais, exceto pelo menos um identificador.
