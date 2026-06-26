# Regra Obrigatória: Testar Após Toda Modificação

> **TODO mudanca no codigo DEVE ser testada antes de considerar pronto.**
> Sem esta verificacao, bugs passam despercebidos e o site fica fora do ar.

---

## Checklist de Teste (rodar toda vez)

### 1. Frontend (Cloudflare Pages)

```bash
# Deploy
cd frontend
npx wrangler pages deploy . --project-name=ocombebe --commit-dirty=true

# Verificar paginas
curl -s -o /dev/null -w "%{http_code}" https://ocombebe.pages.dev/
curl -s -o /dev/null -w "%{http_code}" https://ocombebe.pages.dev/acesso-ministro.html
curl -s -o /dev/null -w "%{http_code}" https://ocombebe.pages.dev/admin.html
curl -s -o /dev/null -w "%{http_code}" https://ocombebe.pages.dev/privacidade.html
curl -s -o /dev/null -w "%{http_code}" https://ocombebe.pages.dev/termos.html
```

**Esperado:** Todas retornam `200`

### 2. Backend (Cloudflare Workers)

```bash
# Deploy
cd backend
npx wrangler deploy

# Health check
curl https://ocomebe-api-v2.dev-teste.workers.dev/api/health
```

**Esperado:**
```json
{
  "status": "ok",
  "primary": true,
  "backup": true
}
```

### 3. API Endpoints

```bash
# CadastroGeral
curl https://ocomebe-api-v2.dev-teste.workers.dev/api/CadastroGeral

# Carteira por CPF
curl -X POST https://ocomebe-api-v2.dev-teste.workers.dev/api/carteira/acesso \
  -H "Content-Type: application/json" \
  -d '{"cpf":"12345678901"}'

# Noticias
curl https://ocomebe-api-v2.dev-teste.workers.dev/api/Noticia

# Eventos
curl https://ocomebe-api-v2.dev-teste.workers.dev/api/Evento

# Configuracoes
curl https://ocomebe-api-v2.dev-teste.workers.dev/api/Configuracoes
```

**Esperado:** Todos retornam JSON valido com dados

### 4. Testes no Browser (obrigatorio apos qualquer mudanca visual)

| Teste | Como testar | Esperado |
|-------|-------------|----------|
| Home | Acessar `ocombebe.pages.dev` | Logo, hero, stats, secoes visiveis |
| Lucide icons | Verificar todos os icones SVG | Nenhum emoji substituido faltando |
| Menu mobile | Reduzir janela para 768px | Menu hamburger aparece |
| Acesso Ministro | Acessar `/acesso-ministro.html` | Formulario CPF visivel |
| Carteirinha | Digitar `123.456.789-01` | Carteirinha do Joao aparece |
| Admin | Acessar `/admin.html` | Redireciona para login |
| Login admin | Senha `ocomeberio2019` | Painel com abas carrega |
| Aba Ministros | Clicar em "Ministros" | Tabela com 2 registros |
| Aba Artigos | Clicar em "Artigos" | Lista de artigos |
| Aba Estatuto | Clicar em "Estatuto" | Upload zone visivel |
| Cadastrar ministro | Preencher formulario + salvar | Registro criado no D1 |
| Upload foto | Selecionar imagem no admin | Preview aparece |
| Newsletter | Digitar email + assinar | Inscricao criada |

### 5. Banco de Dados (D1)

```bash
# Verificar tabelas
npx wrangler d1 execute ocomebe-db --remote --command "SELECT name FROM sqlite_master WHERE type='table'"

# Contar registros
npx wrangler d1 execute ocomebe-db --remote --command "SELECT COUNT(*) FROM CadastroGeral"

# Verificar backup
npx wrangler d1 execute ocomebe-db-backup --remote --command "SELECT COUNT(*) FROM CadastroGeral"
```

---

## Ordem Correta de Deploy

```
1. Alterar codigo
2. Testar localmente (se possivel)
3. Deploy backend: cd backend && npx wrangler deploy
4. Testar API: curl /api/health
5. Deploy frontend: cd frontend && npx wrangler pages deploy . --project-name=ocombebe --commit-dirty=true
6. Testar todas as paginas no browser
7. Commit e push: git add -A && git commit -m "..." && git push
```

## Nunca Fazer

- Deploy frontend sem testar backend
- Commit sem testar pelo menos o health check
- Modificar worker.js sem verificar se DB_BACKUP continua vinculado
- Alterar schema.sql sem atualizar o backup DB

## Endpoints de Verificacao Rapida

| O que testar | URL |
|-------------|-----|
| Frontend online | `https://ocombebe.pages.dev/` |
| API saudavel | `https://ocomebe-api-v2.dev-teste.workers.dev/api/health` |
| Carteirinha | `POST /api/carteira/acesso` com `{"cpf":"12345678901"}` |
| Admin | `https://ocombebe.pages.dev/admin.html` (senha: `ocomeberio2019`) |
