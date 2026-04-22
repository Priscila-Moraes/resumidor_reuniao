-- RPC para buscar perfil pelo webhook secret (sem autenticação JWT)
-- SECURITY DEFINER para contornar RLS no contexto do webhook
CREATE OR REPLACE FUNCTION public.get_profile_by_webhook_secret(p_secret TEXT)
RETURNS TABLE(
  id UUID,
  openai_api_key TEXT,
  fireflies_api_key TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.openai_api_key, p.fireflies_api_key
  FROM public.profiles p
  WHERE p.fireflies_webhook_secret = p_secret
  LIMIT 1;
END;
$$;

-- RPC para buscar reunião para reprocessamento (contorna RLS no contexto do backend)
CREATE OR REPLACE FUNCTION public.get_meeting_for_reprocess(p_meeting_id UUID, p_user_id UUID)
RETURNS TABLE(
  id UUID,
  transcript JSONB,
  transcricao_bruta TEXT,
  status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT m.id, m.transcript, m.transcricao_bruta, m.status
  FROM public.meetings m
  WHERE m.id = p_meeting_id AND m.user_id = p_user_id
  LIMIT 1;
END;
$$;

-- Permissões para as funções (chamáveis com anon key)
GRANT EXECUTE ON FUNCTION public.get_profile_by_webhook_secret(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_meeting_for_reprocess(UUID, UUID) TO authenticated;
