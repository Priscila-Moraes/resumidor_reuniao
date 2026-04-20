-- Adiciona coluna de chave do Fireflies no perfil do usuário
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS fireflies_api_key TEXT;
