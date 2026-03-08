-- Criar enum para roles
CREATE TYPE user_role AS ENUM ('master', 'admin', 'user');

-- Tabela de perfis de usuários
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role user_role DEFAULT 'user' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de receitas
CREATE TABLE IF NOT EXISTS receitas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  descricao TEXT NOT NULL,
  valor DECIMAL(10, 2) NOT NULL,
  data DATE NOT NULL,
  categoria TEXT NOT NULL DEFAULT 'Outra',
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de despesas
CREATE TABLE IF NOT EXISTS despesas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  descricao TEXT NOT NULL,
  valor DECIMAL(10, 2) NOT NULL,
  data DATE NOT NULL,
  categoria TEXT NOT NULL DEFAULT 'Outra',
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de sonhos (objetivos financeiros)
CREATE TABLE IF NOT EXISTS sonhos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  valor_objetivo DECIMAL(10, 2) NOT NULL,
  valor_acumulado DECIMAL(10, 2) DEFAULT 0,
  prioridade INTEGER DEFAULT 1,
  data_alvo DATE,
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'concluido', 'cancelado')),
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_receitas_user_id ON receitas(user_id);
CREATE INDEX IF NOT EXISTS idx_receitas_data ON receitas(data);
CREATE INDEX IF NOT EXISTS idx_despesas_user_id ON despesas(user_id);
CREATE INDEX IF NOT EXISTS idx_despesas_data ON despesas(data);
CREATE INDEX IF NOT EXISTS idx_sonhos_user_id ON sonhos(user_id);

-- Habilitar RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE receitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE despesas ENABLE ROW LEVEL SECURITY;
ALTER TABLE sonhos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profiles
CREATE POLICY "Usuários podem ver seu próprio perfil"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Usuários master podem ver todos os perfis"
  ON profiles FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'master'
    )
  );

-- Políticas RLS para receitas
CREATE POLICY "Usuários podem ver suas próprias receitas"
  ON receitas FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar receitas"
  ON receitas FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias receitas"
  ON receitas FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias receitas"
  ON receitas FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas RLS para despesas
CREATE POLICY "Usuários podem ver suas próprias despesas"
  ON despesas FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar despesas"
  ON despesas FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias despesas"
  ON despesas FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias despesas"
  ON despesas FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas RLS para sonhos
CREATE POLICY "Usuários podem ver seus próprios sonhos"
  ON sonhos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar sonhos"
  ON sonhos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios sonhos"
  ON sonhos FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios sonhos"
  ON sonhos FOR DELETE
  USING (auth.uid() = user_id);
