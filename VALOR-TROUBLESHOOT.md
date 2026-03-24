# 🔧 Troubleshoot: Valor R$ Não Aparece

## 🔴 Sintomas
- Campo "Valor (R$)" não aparece no modal
- Card não mostra badge de valor
- Total da coluna não é exibido

## ✅ Solução em 3 Passos

### Passo 1: Verificar se a Coluna Existe

Abra o **Supabase Dashboard** → **SQL Editor** e execute:

```sql
SELECT column_name FROM information_schema.columns
WHERE table_name='leads' AND column_name='valor';
```

**Se retornar 0 linhas** = coluna não existe (próximo passo)
**Se retornar 1 linha** = coluna existe (vá para Passo 3)

---

### Passo 2: Criar a Coluna (se não existir)

Execute no SQL Editor:

```sql
ALTER TABLE leads ADD COLUMN valor DECIMAL(10, 2) DEFAULT 0.00;
```

✅ Pronto! A coluna foi criada.

---

### Passo 3: Testar

1. Recarregue a página: `https://seu-dominio.vercel.app`
2. Clique em **+ Novo Lead**
3. Preencha:
   - **Nome**: João Silva
   - **Telefone**: 11 99999-9999
   - **Valor (R$)**: 497.00
4. Clique em "Criar Lead"

**Deve aparecer:**
- ✅ Card com badge roxo: "R$ 497,00"
- ✅ Total na coluna: "Total: R$ 497,00"

---

## 📊 Verificar Dados no Banco

No SQL Editor, execute:

```sql
SELECT id, nome, telefone, valor FROM leads LIMIT 5;
```

Você deve ver algo assim:

| id | nome | telefone | valor |
|----|------|----------|-------|
| uuid-1 | João Silva | 11999999999 | 497.00 |
| uuid-2 | Maria Santos | 21988888888 | 299.00 |

Se o `valor` estiver como `null`, significa que precisa recriar os leads.

---

## 🎯 Checklist Completo

- [ ] Coluna `valor` existe no Supabase
- [ ] Campo "Valor (R$)" aparece no modal
- [ ] Card mostra badge roxo com valor
- [ ] Coluna mostra total em roxo
- [ ] Webhook cria leads com valor 0 (padrão)

---

## 🚀 Depois que Funcionar

```bash
# Teste a criação via webhook
curl -X POST https://seu-dominio.vercel.app/api/webhook/low-ticket \
  -H "Content-Type: application/json" \
  -d '{"nome":"Test","telefone":"11999999999","valor":"497.00"}'
```

Embora os webhooks atuais não enviem `valor`, os leads criados manualmente terão valores corretos.

---

## ❓ Ainda Não Funciona?

1. **Teste o endpoint de migração:**
   ```bash
   curl -X POST https://seu-dominio.vercel.app/api/migrate
   ```

2. **Verifique os logs** em Vercel → Functions Logs

3. **Sincronize o banco** clicando em ↻ (Recarregar) no CRM

4. **Força atualizar a página:** Ctrl+Shift+R (ou Cmd+Shift+R no Mac)
