-- Schema OCOMEBE - Banco de dados para carteira digital de pastores

-- Tabela principal de cadastro de pastores/ministros
CREATE TABLE IF NOT EXISTS CadastroGeral (
    id TEXT PRIMARY KEY,
    nome TEXT,
    cpf TEXT,
    identidade TEXT,
    dataNascimento TEXT,
    naturalidade TEXT,
    funcao TEXT,
    ministerio TEXT,
    telefone TEXT,
    email TEXT,
    cidade TEXT,
    regiao TEXT,
    bairro TEXT,
    numeroInscricao TEXT,
    validadeCarteirinha TEXT,
    statusAnuidade TEXT DEFAULT 'pendente',
    anuidadePagaAte TEXT,
    valorAnuidade TEXT,
    fotoUrl TEXT,
    status TEXT DEFAULT 'ativo',
    lembretesEnviados TEXT,
    dataUltimoLembrete TEXT,
    created_date TEXT,
    updated_date TEXT,
    created_by_id TEXT,
    is_sample TEXT
);

-- Tabela de candidatos em processo de filiação
CREATE TABLE IF NOT EXISTS Candidato (
    id TEXT PRIMARY KEY,
    nomeCompleto TEXT,
    cpf TEXT,
    email TEXT,
    celular TEXT,
    telefone TEXT,
    cidade TEXT,
    estado TEXT,
    bairro TEXT,
    cep TEXT,
    endereco TEXT,
    dataNascimento TEXT,
    naturalidade TEXT,
    nacionalidade TEXT,
    identidade TEXT,
    orgaoExpedidor TEXT,
    estadoCivil TEXT,
    nomeConjuge TEXT,
    dataNascimentoConjuge TEXT,
    nomePai TEXT,
    nomeMae TEXT,
    quantidadeFilhos TEXT,
    profissao TEXT,
    escolaridade TEXT,
    formacaoTeologica TEXT,
    entidadeTeologica TEXT,
    funcaoEclesiastica TEXT,
    ministerio TEXT,
    dataOrdenacao TEXT,
    localOrdenacao TEXT,
    convencao TEXT,
    pastorPresidente TEXT,
    nomeIgreja TEXT,
    cnpjIgreja TEXT,
    enderecoIgreja TEXT,
    bairroIgreja TEXT,
    cidadeIgreja TEXT,
    estadoIgreja TEXT,
    cepIgreja TEXT,
    telefoneIgreja TEXT,
    emailIgreja TEXT,
    fotoUrl TEXT,
    selfieUrl TEXT,
    documentoFrenteUrl TEXT,
    documentoVersoUrl TEXT,
    fotoSegDocUrl TEXT,
    status TEXT DEFAULT 'pendente',
    statusVerificacao TEXT,
    created_date TEXT,
    updated_date TEXT,
    created_by_id TEXT,
    is_sample TEXT
);

-- Tabela de diretores/membros da diretoria
CREATE TABLE IF NOT EXISTS Diretor (
    id TEXT PRIMARY KEY,
    nome TEXT,
    cargoPrincipal TEXT,
    cargoSecundario TEXT,
    fotoUrl TEXT,
    dataNascimento TEXT,
    ordem TEXT,
    created_date TEXT,
    updated_date TEXT,
    created_by_id TEXT,
    is_sample TEXT
);

-- Tabela de inscritos na newsletter
CREATE TABLE IF NOT EXISTS NewsletterInscrito (
    id TEXT PRIMARY KEY,
    nome TEXT,
    email TEXT,
    telefone TEXT,
    dataInscricao TEXT,
    created_date TEXT,
    updated_date TEXT,
    created_by_id TEXT,
    is_sample TEXT
);

-- Tabela de notícias/artigos
CREATE TABLE IF NOT EXISTS Noticia (
    id TEXT PRIMARY KEY,
    titulo TEXT,
    subtitulo TEXT,
    conteudo TEXT,
    autor TEXT,
    imagemUrl TEXT,
    dataPublicacao TEXT,
    fixada TEXT,
    seoSlug TEXT,
    seoTitulo TEXT,
    seoDescricao TEXT,
    url_social_meta TEXT,
    galeriaImagens TEXT,
    galeriaVideos TEXT,
    created_date TEXT,
    updated_date TEXT,
    created_by_id TEXT,
    is_sample TEXT
);

-- Tabela de palavra do dia
CREATE TABLE IF NOT EXISTS PalavraDoDia (
    id TEXT PRIMARY KEY,
    data TEXT,
    ativa TEXT,
    frase TEXT,
    referencia TEXT,
    reflexao TEXT,
    created_date TEXT,
    updated_date TEXT,
    created_by_id TEXT,
    is_sample TEXT
);

-- Tabela de eventos
CREATE TABLE IF NOT EXISTS Evento (
    id TEXT PRIMARY KEY,
    titulo TEXT,
    descricao TEXT,
    data TEXT,
    local TEXT,
    imagemUrl TEXT,
    seoSlug TEXT,
    seoTitulo TEXT,
    seoDescricao TEXT,
    created_date TEXT,
    updated_date TEXT,
    created_by_id TEXT,
    is_sample TEXT
);

-- Tabela de configurações do sistema
CREATE TABLE IF NOT EXISTS Configuracoes (
    id TEXT PRIMARY KEY,
    mpAccessToken TEXT,
    mpPublicKey TEXT,
    mpWebhookSecret TEXT,
    telegramToken TEXT,
    telegramChatId TEXT,
    created_date TEXT,
    updated_date TEXT
);

-- Tabela de histórico de notificações
CREATE TABLE IF NOT EXISTS HistoricoNotificacao (
    id TEXT PRIMARY KEY,
    usuarioId TEXT,
    tipo TEXT,
    titulo TEXT,
    mensagem TEXT,
    lida TEXT,
    created_date TEXT,
    updated_date TEXT
);

-- Tabela de lembretes da agenda
CREATE TABLE IF NOT EXISTS LembreteAgenda (
    id TEXT PRIMARY KEY,
    usuarioId TEXT,
    titulo TEXT,
    descricao TEXT,
    data TEXT,
    hora TEXT,
    created_date TEXT,
    updated_date TEXT
);

-- Tabela de preferências de notificação
CREATE TABLE IF NOT EXISTS PreferenciasNotificacao (
    id TEXT PRIMARY KEY,
    usuarioId TEXT,
    email TEXT,
    sms TEXT,
    push TEXT,
    created_date TEXT,
    updated_date TEXT
);

-- Tabela de inscritos em eventos
CREATE TABLE IF NOT EXISTS Inscritos (
    id TEXT PRIMARY KEY,
    eventoId TEXT,
    nome TEXT,
    email TEXT,
    telefone TEXT,
    cpf TEXT,
    created_date TEXT,
    updated_date TEXT
);

-- Tabela de ministros (CRM)
CREATE TABLE IF NOT EXISTS Ministro (
    id TEXT PRIMARY KEY,
    nome TEXT,
    cpf TEXT,
    email TEXT,
    telefone TEXT,
    numeroInscricao TEXT,
    matricula TEXT,
    funcao TEXT,
    ministerio TEXT,
    status TEXT,
    created_date TEXT,
    updated_date TEXT
);

-- Tabela de comentários
CREATE TABLE IF NOT EXISTS Comentario (
    id TEXT PRIMARY KEY,
    noticiaId TEXT,
    usuarioId TEXT,
    nome TEXT,
    conteudo TEXT,
    aprovado TEXT,
    created_date TEXT,
    updated_date TEXT
);

-- Tabela de bíblia (para consultas)
CREATE TABLE IF NOT EXISTS Biblia (
    id TEXT PRIMARY KEY,
    livro TEXT,
    capitulo INTEGER,
    versiculo INTEGER,
    texto TEXT,
    referencia TEXT
);
