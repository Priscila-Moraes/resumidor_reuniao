-- Novos campos na tabela meetings (estrutura do professor)
ALTER TABLE public.meetings
  ADD COLUMN IF NOT EXISTS resumo_executivo TEXT,
  ADD COLUMN IF NOT EXISTS decisoes TEXT,
  ADD COLUMN IF NOT EXISTS itens_acao JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS pendencias JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS aproveitamento_nota INTEGER,
  ADD COLUMN IF NOT EXISTS aproveitamento_motivo TEXT,
  ADD COLUMN IF NOT EXISTS aproveitamento_criterios JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS transcript JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS fireflies_id TEXT,
  ADD COLUMN IF NOT EXISTS duration INTEGER;

-- Webhook secret por usuário no profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS fireflies_webhook_secret TEXT;

-- Gera secrets para perfis existentes que ainda não têm
UPDATE public.profiles
SET fireflies_webhook_secret = gen_random_uuid()::text
WHERE fireflies_webhook_secret IS NULL;

-- Trigger para gerar secret automaticamente em novos perfis
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, fireflies_webhook_secret)
  VALUES (new.id, new.email, gen_random_uuid()::text)
  ON CONFLICT (id) DO UPDATE
    SET fireflies_webhook_secret = COALESCE(public.profiles.fireflies_webhook_secret, gen_random_uuid()::text);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
