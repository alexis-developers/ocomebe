const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const ALLOWED_TABLES = [
  'CadastroGeral', 'Candidato', 'Diretor', 'NewsletterInscrito',
  'Noticia', 'PalavraDoDia', 'Evento', 'Configuracoes',
  'HistoricoNotificacao', 'LembreteAgenda', 'PreferenciasNotificacao',
  'Inscritos', 'Ministro', 'Comentario', 'Biblia'
];

function sanitizeTable(name) {
  if (!ALLOWED_TABLES.includes(name)) return null;
  return name;
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
}

async function queryDb(db, sql, params = []) {
  try {
    if (params.length > 0) {
      return await db.prepare(sql).bind(...params);
    }
    return await db.prepare(sql);
  } catch (e) {
    throw e;
  }
}

async function tryWithFallback(primary, backup, fn) {
  try {
    return await fn(primary);
  } catch (e) {
    console.error('Primary DB error, trying backup:', e.message);
    try {
      return await fn(backup);
    } catch (e2) {
      console.error('Backup DB also failed:', e2.message);
      throw e2;
    }
  }
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    const path = url.pathname;
    const db = env.DB;
    const dbBackup = env.DB_BACKUP;

    if (!db) {
      return jsonResponse({ error: "Banco de dados não vinculado." }, 500);
    }

    const activeDb = db;
    const fallbackDb = dbBackup || db;

    try {

      // === HEALTH ===
      if (path === '/api/health') {
        let primaryOk = false, backupOk = false;
        try { await db.prepare("SELECT 1").first(); primaryOk = true; } catch(e) {}
        if (dbBackup) { try { await dbBackup.prepare("SELECT 1").first(); backupOk = true; } catch(e) {} }
        return jsonResponse({ status: 'ok', primary: primaryOk, backup: backupOk, timestamp: new Date().toISOString() });
      }

      // === CARTEIRA POR CPF ===
      if (path === '/api/carteira/acesso' && request.method === 'POST') {
        const body = await request.json();
        const { cpf } = body;
        if (!cpf) return jsonResponse({ error: 'CPF é obrigatório' }, 400);

        const cpfLimpo = cpf.replace(/\D/g, '');

        const searchFn = async (database) => {
          let result = await database.prepare("SELECT * FROM CadastroGeral WHERE cpf = ?").bind(cpfLimpo).first();
          if (!result) {
            const { results } = await database.prepare("SELECT * FROM CadastroGeral").all();
            result = results.find(r => (r.cpf || '').replace(/\D/g, '') === cpfLimpo);
          }
          if (!result) return null;

          let numeroInscricao = result.numeroInscricao;
          if (!numeroInscricao) {
            try {
              const ministro = await database.prepare("SELECT * FROM Ministro WHERE cpf = ?").bind(cpfLimpo).first();
              if (ministro) numeroInscricao = ministro.numeroInscricao || ministro.matricula;
            } catch (e) {}
          }

          return {
            success: true,
            data: {
              id: result.id, nome: result.nome, cpf: cpfLimpo,
              fotoUrl: result.fotoUrl, numeroInscricao,
              identidade: result.identidade, funcao: result.funcao,
              ministerio: result.ministerio, naturalidade: result.naturalidade,
              statusAnuidade: result.statusAnuidade || 'pendente',
              anuidadePagaAte: result.anuidadePagaAte,
              validadeCarteirinha: result.validadeCarteirinha
            }
          };
        };

        let result;
        try { result = await tryWithFallback(activeDb, fallbackDb, searchFn); } catch(e) {}
        if (!result) return jsonResponse({ error: 'CPF não encontrado.' }, 404);
        return jsonResponse(result);
      }

      // === NEWSLETTER ===
      if (path === '/api/newsletter' && request.method === 'POST') {
        const { email, nome, telefone } = await request.json();
        if (!email || !email.includes('@')) return jsonResponse({ error: 'Email inválido' }, 400);
        const id = crypto.randomUUID().replace(/-/g, '').slice(0, 24);
        const now = new Date().toISOString();
        const sql = "INSERT INTO NewsletterInscrito (id, nome, email, telefone, dataInscricao, created_date, updated_date) VALUES (?, ?, ?, ?, ?, ?, ?)";
        const params = [id, nome || '', email, telefone || '', now, now, now];
        try { await tryWithFallback(activeDb, fallbackDb, db => db.prepare(sql).bind(...params).run()); } catch(e) {}
        return jsonResponse({ success: true, message: 'Inscrito com sucesso!' });
      }

      // === FILIÇÃO ===
      if (path === '/api/filiacao' && request.method === 'POST') {
        const { nome, email, telefone, igreja, cidade } = await request.json();
        if (!nome || !email) return jsonResponse({ error: 'Nome e email são obrigatórios' }, 400);
        const id = crypto.randomUUID().replace(/-/g, '').slice(0, 24);
        const now = new Date().toISOString();
        const sql = "INSERT INTO Candidato (id, nomeCompleto, email, telefone, nomeIgreja, cidade, status, created_date, updated_date) VALUES (?, ?, ?, ?, ?, ?, 'pendente', ?, ?)";
        const params = [id, nome, email, telefone || '', igreja || '', cidade || '', now, now];
        try { await tryWithFallback(activeDb, fallbackDb, db => db.prepare(sql).bind(...params).run()); } catch(e) {}
        return jsonResponse({ success: true, message: 'Filiação recebida!', data: { id, nome, email } });
      }

      // === EVENTOS ===
      if (path === '/api/eventos') {
        try {
          const result = await tryWithFallback(activeDb, fallbackDb, db => db.prepare("SELECT * FROM Evento ORDER BY data DESC").all());
          return jsonResponse({ success: true, data: result.results || [] });
        } catch(e) { return jsonResponse({ success: true, data: [] }); }
      }

      // === NOTICIAS ===
      if (path === '/api/noticias') {
        try {
          const result = await tryWithFallback(activeDb, fallbackDb, db => db.prepare("SELECT * FROM Noticia ORDER BY dataPublicacao DESC").all());
          return jsonResponse({ success: true, data: result.results || [] });
        } catch(e) { return jsonResponse({ success: true, data: [] }); }
      }

      // === PALAVRA DO DIA ===
      if (path === '/api/palavra-do-dia') {
        try {
          const result = await tryWithFallback(activeDb, fallbackDb, db => db.prepare("SELECT * FROM PalavraDoDia WHERE ativa = 'true' ORDER BY data DESC LIMIT 1").first());
          return jsonResponse({ success: true, data: result });
        } catch(e) { return jsonResponse({ success: true, data: null }); }
      }

      // === DIRETORES ===
      if (path === '/api/diretores') {
        try {
          const result = await tryWithFallback(activeDb, fallbackDb, db => db.prepare("SELECT * FROM Diretor ORDER BY ordem ASC").all());
          return jsonResponse({ success: true, data: result.results || [] });
        } catch(e) { return jsonResponse({ success: true, data: [] }); }
      }

      // === CRUD GENÉRICO ===
      const pathParts = path.replace('/api/', '').split('/').filter(Boolean);
      const entity = pathParts[0];
      const id = pathParts[1];

      const table = sanitizeTable(entity);
      if (!table) return jsonResponse({ error: 'Entidade não encontrada' }, 404);

      // GET /api/[entity]/[id]
      if (request.method === 'GET' && id) {
        try {
          const result = await tryWithFallback(activeDb, fallbackDb, db => db.prepare(`SELECT * FROM ${table} WHERE id = ?`).bind(id).first());
          if (!result) return jsonResponse({ error: 'Registro não encontrado' }, 404);
          return jsonResponse(result);
        } catch(e) { return jsonResponse({ error: 'Erro ao buscar registro' }, 500); }
      }

      // GET /api/[entity]
      if (request.method === 'GET') {
        try {
          const result = await tryWithFallback(activeDb, fallbackDb, db => db.prepare(`SELECT * FROM ${table} ORDER BY created_date DESC`).all());
          return jsonResponse(result.results || []);
        } catch(e) { return jsonResponse([], 500); }
      }

      // POST /api/[entity]
      if (request.method === 'POST') {
        const rawData = await request.json();
        if (!rawData.id) rawData.id = crypto.randomUUID().replace(/-/g, '').slice(0, 24);
        const now = new Date().toISOString();
        rawData.created_date = rawData.created_date || now;
        rawData.updated_date = rawData.updated_date || now;

        const insertFn = async (database) => {
          const { results: tableInfo } = await database.prepare(`PRAGMA table_info(${table})`).all();
          const validColumns = tableInfo.map(col => col.name);
          const data = {};
          for (const col of validColumns) { if (col in rawData) data[col] = rawData[col]; }
          const columns = Object.keys(data);
          const placeholders = columns.map(() => '?').join(', ');
          const values = Object.values(data);
          await database.prepare(`INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`).bind(...values).run();
          return data;
        };

        try {
          const data = await tryWithFallback(activeDb, fallbackDb, insertFn);
          return jsonResponse(data, 201);
        } catch(e) { return jsonResponse({ error: 'Erro ao salvar: ' + e.message }, 500); }
      }

      // PUT /api/[entity]/[id]
      if (request.method === 'PUT' && id) {
        const rawData = await request.json();
        rawData.updated_date = new Date().toISOString();
        delete rawData.id;

        const updateFn = async (database) => {
          const { results: tableInfo } = await database.prepare(`PRAGMA table_info(${table})`).all();
          const validColumns = tableInfo.map(col => col.name);
          const data = {};
          for (const col of validColumns) { if (col in rawData && col !== 'id') data[col] = rawData[col]; }
          const columns = Object.keys(data);
          const setClause = columns.map(col => `${col} = ?`).join(', ');
          const values = [...Object.values(data), id];
          const result = await database.prepare(`UPDATE ${table} SET ${setClause} WHERE id = ?`).bind(...values).run();
          return result.changes;
        };

        try {
          const changes = await tryWithFallback(activeDb, fallbackDb, updateFn);
          if (changes === 0) return jsonResponse({ error: 'Registro não encontrado' }, 404);
          return jsonResponse({ success: true, id });
        } catch(e) { return jsonResponse({ error: 'Erro ao atualizar: ' + e.message }, 500); }
      }

      // DELETE /api/[entity]/[id]
      if (request.method === 'DELETE' && id) {
        const deleteFn = async (database) => {
          const result = await database.prepare(`DELETE FROM ${table} WHERE id = ?`).bind(id).run();
          return result.changes;
        };

        try {
          const changes = await tryWithFallback(activeDb, fallbackDb, deleteFn);
          if (changes === 0) return jsonResponse({ error: 'Registro não encontrado' }, 404);
          return jsonResponse({ success: true });
        } catch(e) { return jsonResponse({ error: 'Erro ao excluir: ' + e.message }, 500); }
      }

      return jsonResponse({ error: 'Rota não encontrada' }, 404);

    } catch (error) {
      console.error('Erro geral:', error);
      return jsonResponse({ error: error.message }, 500);
    }
  }
};
