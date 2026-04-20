-- Criação da tabela de Perfis (Profiles) para guardar a chave da OpenAI
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  openai_api_key TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ativar Row Level Security (RLS) para profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
-- Usuário só pode ler e atualizar seu próprio perfil
CREATE POLICY "Usuários podem ver o próprio perfil" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar o próprio perfil" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Trigger para criar o profile automaticamente ao criar usuário no Auth do Supabase
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Criação da tabela de Reuniões (Meetings)
CREATE TABLE public.meetings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  titulo TEXT NOT NULL,
  data TIMESTAMP WITH TIME ZONE NOT NULL,
  tipo_reuniao TEXT,
  objetivo TEXT,
  resumo TEXT,
  pontos_importantes JSONB DEFAULT '[]'::jsonb,
  topicos_discutidos JSONB DEFAULT '[]'::jsonb,
  transcricao_bruta TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ativar Row Level Security (RLS) para meetings
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;

-- Políticas para meetings
-- Usuário só pode ler, inserir, atualizar e deletar suas próprias reuniões
CREATE POLICY "Usuários podem ver as próprias reuniões" 
  ON public.meetings FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir as próprias reuniões" 
  ON public.meetings FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar as próprias reuniões" 
  ON public.meetings FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar as próprias reuniões" 
  ON public.meetings FOR DELETE 
  USING (auth.uid() = user_id);
