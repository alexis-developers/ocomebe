# OCOMEBE - Ordem e Conselho Fraternal de Ministros Evangélico do Brasil e Exterior

## Arquitetura

| Recurso | Tipo | URL | Responsabilidade |
|---------|------|-----|------------------|
| `frontend/` | Cloudflare Pages | `ocomebe.pages.dev` | Interface visual |
| `backend/` | Cloudflare Workers | `ocomebe-api.dev-teste.workers.dev` | API REST + D1 |

## Estrutura

```
├── frontend/                    # Cloudflare Pages
│   ├── index.html               # Página principal
│   ├── acesso-ministro.html     # Acesso carteirinha por CPF
│   ├── privacidade.html         # Política de Privacidade
│   ├── termos.html              # Termos de Uso
│   ├── style.css                # Estilos
│   ├── app.js                   # Lógica frontend
│   └── logo-ocomebe.png         # Logo
│
├── backend/                     # Cloudflare Workers
│   ├── src/
│   │   └── worker.js            # API REST completa
│   ├── db/
│   │   ├── schema.sql           # Schema do banco D1
│   │   └── seed.sql             # Dados de teste
│   ├── wrangler.toml            # Configuração Cloudflare
│   └── package.json
│
└── README.md
```

## Banco de Dados (D1)

**Database ID:** `94d38319-21ee-4687-bbb6-ce03ece12a7b`

### Tabelas

| Tabela | Descrição |
|--------|-----------|
| `CadastroGeral` | Cadastro principal de pastores/ministros |
| `Candidato` | Candidatos em processo de filiação |
| `Diretor` | Membros da diretoria |
| `NewsletterInscrito` | Inscritos na newsletter |
| `Noticia` | Notícias e artigos |
| `PalavraDoDia` | Palavra do dia |
| `Evento` | Eventos da organização |
| `Ministro` | CRM de ministros |
| `Configuracoes` | Configurações do sistema |
| `HistoricoNotificacao` | Histórico de notificações |
| `LembreteAgenda` | Lembretes da agenda |
| `PreferenciasNotificacao` | Preferências de notificação |
| `Inscritos` | Inscritos em eventos |
| `Comentario` | Comentários |
| `Biblia` | Bíblia para consultas |

## Deploy

### Criar banco D1

```bash
cd backend
wrangler d1 create ocombebe-db
# Copiar o database_id gerado para wrangler.toml
wrangler d1 execute DB --file=db/schema.sql --remote
wrangler d1 execute DB --file=db/seed.sql --remote  # Dados de teste (opcional)
```

### Backend (Cloudflare Workers)

```bash
cd backend
npm install
npm run deploy
```

### Frontend (Cloudflare Pages)

Conectar o diretório `frontend/` ao Cloudflare Pages via dashboard.

## Endpoints da API

### Acesso por CPF

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/carteira/acesso` | Acessar carteirinha por CPF |

**Exemplo de uso:**
```bash
curl -X POST "https://ocomebe-api.dev-teste.workers.dev/api/carteira/acesso" \
  -H "Content-Type: application/json" \
  -d '{"cpf":"12345678901"}'
```

### CRUD Genérico

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/[entity]` | Listar registros |
| GET | `/api/[entity]/[id]` | Buscar registro |
| POST | `/api/[entity]` | Criar registro |
| PUT | `/api/[entity]/[id]` | Atualizar registro |
| DELETE | `/api/[entity]/[id]` | Excluir registro |

### Endpoints Específicos

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/health` | Status da API |
| POST | `/api/newsletter` | Inscrição na newsletter |
| POST | `/api/filiacao` | Solicitação de filiação |
| GET | `/api/eventos` | Lista de eventos |
| GET | `/api/noticias` | Lista de notícias |
| GET | `/api/palavra-do-dia` | Palavra do dia |
| GET | `/api/diretores` | Lista de diretores |

## Carteirinha Digital

A carteirinha digital é acessada via CPF na página `acesso-ministro.html`. 

### Funcionalidades
- Acesso por CPF (com formatação automática)
- Exibição de dados do ministro
- Status da anuidade (Pago, Pendente, Inadimplente, Cancelada)
- Foto do ministro
- Validade da carteirinha
- Modo ampliado (fullscreen)

### CPFs de teste
- `123.456.789-01` - João da Silva Santos (Pastor Presidente - Em dia)
- `987.654.321-00` - Maria Oliveira Costa (Pastora - Pendente)

## Variáveis de Ambiente

### Backend

Configurar via `wrangler secret`:

```bash
wrangler secret put SESSION_SECRET
wrangler secret put ADMIN_PASSWORD
```

### Frontend

A URL da API é configurada em `app.js`:

```javascript
const API_URL = localStorage.getItem('ocomebe_api_url') || 'https://ocomebe-api.dev-teste.workers.dev';
```

## Desenvolvimento Local

```bash
# Frontend
cd frontend
npx serve . -p 3000

# Backend
cd backend
npm run dev
```

## Desenvolvido por

Alexis Marketing & Dev - https://desenvolvimentodesites.dev.br/
