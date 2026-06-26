const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    const path = url.pathname;
    const db = env.DB;

    if (!db) {
      return jsonResponse({ error: "Banco de dados D1 não vinculado." }, 500);
    }

    try {
      // Health check
      if (path === '/api/health') {
        return jsonResponse({ status: 'ok', timestamp: new Date().toISOString() });
      }

      // Acesso por CPF - Buscar ministro
      if (path === '/api/carteira/acesso' && request.method === 'POST') {
        const body = await request.json();
        const { cpf } = body;

        if (!cpf) {
          return jsonResponse({ error: 'CPF é obrigatório' }, 400);
        }

        const cpfLimpo = cpf.replace(/\D/g, '');

        // Buscar no CadastroGeral
        let result = await db.prepare(
          "SELECT * FROM CadastroGeral WHERE cpf = ? OR cpf = ?"
        ).bind(cpfLimpo, cpf).first();

        // Se não encontrou, tentar busca manual
        if (!result) {
          const { results } = await db.prepare("SELECT * FROM CadastroGeral").all();
          result = results.find(r => {
            const cpfCadastro = (r.cpf || '').replace(/\D/g, '');
            return cpfCadastro === cpfLimpo;
          });
        }

        if (!result) {
          return jsonResponse({ error: 'CPF não encontrado. Verifique se digitou corretamente ou entre em contato com a secretaria.' }, 404);
        }

        // Buscar número de inscrição no Ministro se não estiver no cadastro
        let numeroInscricao = result.numeroInscricao;
        if (!numeroInscricao) {
          try {
            const ministro = await db.prepare("SELECT * FROM Ministro WHERE cpf = ?").bind(cpfLimpo).first();
            if (ministro) {
              numeroInscricao = ministro.numeroInscricao || ministro.matricula;
            }
          } catch (e) {
            console.error('Erro ao buscar no Ministro:', e.message);
          }
        }

        return jsonResponse({
          success: true,
          data: {
            id: result.id,
            nome: result.nome,
            cpf: cpfLimpo,
            fotoUrl: result.fotoUrl,
            numeroInscricao: numeroInscricao,
            identidade: result.identidade,
            funcao: result.funcao,
            ministerio: result.ministerio,
            naturalidade: result.naturalidade,
            statusAnuidade: result.statusAnuidade || 'pendente',
            anuidadePagaAte: result.anuidadePagaAte,
            validadeCarteirinha: result.validadeCarteirinha
          }
        });
      }

      // Newsletter
      if (path === '/api/newsletter' && request.method === 'POST') {
        const body = await request.json();
        const { email, nome, telefone } = body;

        if (!email || !email.includes('@')) {
          return jsonResponse({ error: 'Email inválido' }, 400);
        }

        const id = crypto.randomUUID().replace(/-/g, '').slice(0, 24);
        const now = new Date().toISOString();

        await db.prepare(
          "INSERT INTO NewsletterInscrito (id, nome, email, telefone, dataInscricao, created_date, updated_date) VALUES (?, ?, ?, ?, ?, ?, ?)"
        ).bind(id, nome || '', email, telefone || '', now, now, now).run();

        return jsonResponse({ success: true, message: 'Inscrito com sucesso!' });
      }

      // Filição
      if (path === '/api/filiacao' && request.method === 'POST') {
        const body = await request.json();
        const { nome, email, telefone, igreja, cidade } = body;

        if (!nome || !email) {
          return jsonResponse({ error: 'Nome e email são obrigatórios' }, 400);
        }

        const id = crypto.randomUUID().replace(/-/g, '').slice(0, 24);
        const now = new Date().toISOString();

        await db.prepare(
          "INSERT INTO Candidato (id, nomeCompleto, email, telefone, nomeIgreja, cidade, status, created_date, updated_date) VALUES (?, ?, ?, ?, ?, ?, 'pendente', ?, ?)"
        ).bind(id, nome, email, telefone || '', igreja || '', cidade || '', now, now).run();

        return jsonResponse({
          success: true,
          message: 'Solicitação de filiação recebida! Entraremos em contato.',
          data: { id, nome, email }
        });
      }

      // Eventos
      if (path === '/api/eventos') {
        const { results } = await db.prepare("SELECT * FROM Evento ORDER BY data DESC").all();
        return jsonResponse({ success: true, data: results });
      }

      // Notícias
      if (path === '/api/noticias') {
        const { results } = await db.prepare("SELECT * FROM Noticia ORDER BY dataPublicacao DESC").all();
        return jsonResponse({ success: true, data: results });
      }

      // Palavra do Dia
      if (path === '/api/palavra-do-dia') {
        const result = await db.prepare("SELECT * FROM PalavraDoDia WHERE ativa = 'true' ORDER BY data DESC LIMIT 1").first();
        return jsonResponse({ success: true, data: result });
      }

      // Diretores
      if (path === '/api/diretores') {
        const { results } = await db.prepare("SELECT * FROM Diretor ORDER BY ordem ASC").all();
        return jsonResponse({ success: true, data: results });
      }

      // CRUD genérico para entidades
      const pathParts = path.replace('/api/', '').split('/').filter(Boolean);
      const entity = pathParts[0];
      const id = pathParts[1];

      const allowedTables = [
        'CadastroGeral', 'Candidato', 'Diretor', 'NewsletterInscrito',
        'Noticia', 'PalavraDoDia', 'Evento', 'Configuracoes',
        'HistoricoNotificacao', 'LembreteAgenda', 'PreferenciasNotificacao',
        'Inscritos', 'Ministro', 'Comentario'
      ];

      if (!allowedTables.includes(entity)) {
        return jsonResponse({ error: 'Entidade não encontrada' }, 404);
      }

      // GET /api/[entity]/[id]
      if (request.method === 'GET' && id) {
        const result = await db.prepare(`SELECT * FROM ${entity} WHERE id = ?`).bind(id).first();
        if (!result) {
          return jsonResponse({ error: 'Registro não encontrado' }, 404);
        }
        return jsonResponse(result);
      }

      // GET /api/[entity]
      if (request.method === 'GET') {
        const { results } = await db.prepare(`SELECT * FROM ${entity} ORDER BY created_date DESC`).all();
        return jsonResponse(results);
      }

      // POST /api/[entity]
      if (request.method === 'POST') {
        const rawData = await request.json();
        if (!rawData.id) {
          rawData.id = crypto.randomUUID().replace(/-/g, '').slice(0, 24);
        }
        const now = new Date().toISOString();
        rawData.created_date = rawData.created_date || now;
        rawData.updated_date = rawData.updated_date || now;

        const { results: tableInfo } = await db.prepare(`PRAGMA table_info(${entity})`).all();
        const validColumns = tableInfo.map(col => col.name);

        const data = {};
        for (const col of validColumns) {
          if (col in rawData) {
            data[col] = rawData[col];
          }
        }

        const columns = Object.keys(data);
        const placeholders = columns.map(() => '?').join(', ');
        const values = Object.values(data);

        await db.prepare(`INSERT INTO ${entity} (${columns.join(', ')}) VALUES (${placeholders})`).bind(...values).run();
        return jsonResponse(data, 201);
      }

      // PUT /api/[entity]/[id]
      if (request.method === 'PUT' && id) {
        const rawData = await request.json();
        rawData.updated_date = new Date().toISOString();
        delete rawData.id;

        const { results: tableInfo } = await db.prepare(`PRAGMA table_info(${entity})`).all();
        const validColumns = tableInfo.map(col => col.name);

        const data = {};
        for (const col of validColumns) {
          if (col in rawData && col !== 'id') {
            data[col] = rawData[col];
          }
        }

        const columns = Object.keys(data);
        const setClause = columns.map(col => `${col} = ?`).join(', ');
        const values = [...Object.values(data), id];

        const result = await db.prepare(`UPDATE ${entity} SET ${setClause} WHERE id = ?`).bind(...values).run();
        if (result.changes === 0) {
          return jsonResponse({ error: 'Registro não encontrado' }, 404);
        }
        return jsonResponse({ success: true, id });
      }

      // DELETE /api/[entity]/[id]
      if (request.method === 'DELETE' && id) {
        const result = await db.prepare(`DELETE FROM ${entity} WHERE id = ?`).bind(id).run();
        if (result.changes === 0) {
          return jsonResponse({ error: 'Registro não encontrado' }, 404);
        }
        return jsonResponse({ success: true });
      }

      return jsonResponse({ error: 'Rota não encontrada' }, 404);

    } catch (error) {
      console.error('Erro:', error);
      return jsonResponse({ error: error.message }, 500);
    }
  }
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    }
  });
}
