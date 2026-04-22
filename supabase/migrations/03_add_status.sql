-- Adiciona campo de status nas reuniões
ALTER TABLE public.meetings
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'concluido';

-- Marca reuniões existentes como concluídas
UPDATE public.meetings SET status = 'concluido' WHERE status IS NULL;
