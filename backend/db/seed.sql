-- Dados de teste para o banco de dados OCOMEBE
-- Execute este arquivo para inserir dados de exemplo

-- Inserir um ministro de teste
INSERT INTO CadastroGeral (
    id, nome, cpf, identidade, dataNascimento, naturalidade, 
    funcao, ministerio, telefone, email, cidade, regiao,
    numeroInscricao, validadeCarteirinha, statusAnuidade, anuidadePagaAte,
    created_date, updated_date
) VALUES (
    'testeministro001',
    'João da Silva Santos',
    '12345678901',
    '1234567',
    '1980-05-15',
    'Rio de Janeiro',
    'Pastor Presidente',
    'Igreja Evangélica Nova Vida',
    '21999998888',
    'joao.santos@email.com',
    'Rio de Janeiro',
    'Sudeste',
    'OCOMEBE-001',
    '2025-12-31',
    'em_dia',
    '2025-12-31',
    datetime('now'),
    datetime('now')
);

-- Inserir outro ministro de teste
INSERT INTO CadastroGeral (
    id, nome, cpf, identidade, dataNascimento, naturalidade, 
    funcao, ministerio, telefone, email, cidade, regiao,
    numeroInscricao, validadeCarteirinha, statusAnuidade, anuidadePagaAte,
    created_date, updated_date
) VALUES (
    'testeministro002',
    'Maria Oliveira Costa',
    '98765432100',
    '7654321',
    '1975-08-20',
    'São Paulo',
    'Pastora',
    'Igreja Evangélica Renovação',
    '11988887777',
    'maria.costa@email.com',
    'São Paulo',
    'Sudeste',
    'OCOMEBE-002',
    '2025-06-30',
    'pendente',
    '2024-06-30',
    datetime('now'),
    datetime('now')
);

-- Inserir um evento de teste
INSERT INTO Evento (
    id, titulo, descricao, data, local, created_date, updated_date
) VALUES (
    'evento001',
    'Concílio Regional de Pastores',
    'Foco em expansão missionária e novos estatutos ministeriais.',
    '2024-08-28',
    'Curitiba, PR',
    datetime('now'),
    datetime('now')
);

-- Inserir uma notícia de teste
INSERT INTO Noticia (
    id, titulo, subtitulo, conteudo, autor, dataPublicacao, created_date, updated_date
) VALUES (
    'noticia001',
    'Nova Diretoria Eleita para OCOMEBE',
    'Eleição define novos líderes para os próximos 4 anos',
    'A Assembleia Geral da OCOMEBE elegeu nesta semana a nova diretoria que comandará a organização pelos próximos quatro anos. O Pastor João da Silva Santos foi reeleito como Presidente.',
    'Assessoria de Comunicação',
    datetime('now'),
    datetime('now'),
    datetime('now')
);
