# Migração: Adicionar Coluna de Valor

Se o valor não está aparecendo no card ou na coluna, é porque a coluna `valor` não existe no banco de dados.

## ✅ Solução Rápida (Recomendado)

### Passo 1: Abrir SQL Editor do Supabase

1. Acesse https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá para **SQL Editor** (menu esquerdo)

### Passo 2: Executar SQL

Copie e execute este comando:

```sql
ALTER TABLE leads ADD COLUMN IF NOT EXISTS valor DECIMAL(10, 2) DEFAULT 0.00;
```

**Resultado esperado:**
- Mensagem: "Success"
- Coluna `valor` será adicionada à tabela

### Passo 3: Verificar

Execute esta query para confirmar:

```sql
SELECT * FROM leads LIMIT 1;
```

Você deve ver uma coluna `valor` na tabela.

---

## 📋 Verificar se Funcionou

1. Vá para o CRM: https://seu-dominio.vercel.app
2. Crie um novo lead com valor: **497.00**
3. O card deve mostrar: **R$ 497,00**
4. A coluna deve mostrar o total em roxo

---

## 🔗 URLs para Testar

Após adicionar a coluna:

```bash
# Testar criação de lead com valor
curl -X POST https://seu-dominio.vercel.app/api/webhook/low-ticket \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Test Valor",
    "telefone": "11999999999"
  }'
```

---

## ❓ Problemas?

Se ainda não funcionar depois da migração:

1. **Recarregue a página** (Ctrl+R ou Cmd+R)
2. **Clique no botão ↻ (Recarregar)** na header do CRM
3. **Verifique o Supabase** se a coluna foi criada:
   ```sql
   -- No SQL Editor:
   PRAGMA table_info(leads);  -- para SQLite
   -- OU
   \d leads  -- para PostgreSQL
   ```

---

## 📝 Se Preferir Via API

Você pode testar se o endpoint de migração está funcionando:

```bash
curl -X POST https://seu-dominio.vercel.app/api/migrate
```

Resposta esperada:
```json
{
  "success": true,
  "message": "Coluna valor já existe",
  "hasValorColumn": true
}
```

---

## ✨ Depois da Migração

Todas essas funcionalidades funcionarão:

- ✅ Campo "Valor (R$)" no modal de criar/editar lead
- ✅ Badge de valor R$ no card
- ✅ Total em roxo no topo da coluna
- ✅ Cálculo automático da soma
