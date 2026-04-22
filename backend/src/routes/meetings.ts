import { Router, Request, Response } from 'express';
import { supabase } from '../services/supabaseClient';
import { fetchFirefliesTranscript } from '../services/firefliesService';
import { analyzeMeetingTranscript } from '../services/aiService';

const router = Router();

// Autentica o token e retorna o perfil do usuário
async function getUserProfile(authHeader: string | undefined) {
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, openai_api_key, fireflies_api_key')
    .eq('id', user.id)
    .single();

  return profile ?? null;
}

// POST /api/meetings/process — processa manualmente pelo Transcript ID
router.post('/process', async (req: Request, res: Response) => {
  try {
    const { transcript_id } = req.body;

    if (!transcript_id) {
      return res.status(400).json({ error: 'transcript_id é obrigatório' });
    }

    const profile = await getUserProfile(req.headers.authorization);
    if (!profile) return res.status(401).json({ error: 'Token inválido ou expirado' });
    if (!profile.openai_api_key) return res.status(400).json({ error: 'Configure sua chave da OpenAI nas configurações' });

    // Cria a reunião com status 'processando' e retorna imediatamente
    const { data: newMeeting, error: insertError } = await supabase
      .from('meetings')
      .insert({
        user_id: profile.id,
        titulo: 'Processando...',
        data: new Date().toISOString(),
        status: 'processando',
      })
      .select('id')
      .single();

    if (insertError || !newMeeting) {
      return res.status(500).json({ error: 'Erro ao criar reunião' });
    }

    res.status(202).json({ success: true, meeting_id: newMeeting.id });

    // Processa em background
    (async () => {
      try {
        const transcript = await fetchFirefliesTranscript(transcript_id, profile.fireflies_api_key || undefined);
        const analysis = await analyzeMeetingTranscript(transcript, profile.openai_api_key);

        await supabase
          .from('meetings')
          .update({
            titulo: analysis.tipo_reuniao || 'Reunião processada',
            tipo_reuniao: analysis.tipo_reuniao,
            objetivo: analysis.objetivo,
            resumo: analysis.resumo,
            pontos_importantes: analysis.pontos_importantes,
            topicos_discutidos: analysis.topicos_discutidos,
            transcricao_bruta: transcript,
            status: 'concluido',
          })
          .eq('id', newMeeting.id);
      } catch (err: any) {
        console.error('Erro ao processar transcrição:', err.message);
        await supabase
          .from('meetings')
          .update({ status: 'erro' })
          .eq('id', newMeeting.id);
      }
    })();

  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Erro interno' });
  }
});

// POST /api/meetings/:id/reprocess — reanalisa com a IA usando transcrição já salva
router.post('/:id/reprocess', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const profile = await getUserProfile(req.headers.authorization);
    if (!profile) return res.status(401).json({ error: 'Token inválido ou expirado' });
    if (!profile.openai_api_key) return res.status(400).json({ error: 'Configure sua chave da OpenAI nas configurações' });

    // Busca a reunião verificando que pertence ao usuário
    const { data: meeting, error: fetchError } = await supabase
      .from('meetings')
      .select('id, transcricao_bruta, status')
      .eq('id', id)
      .eq('user_id', profile.id)
      .single();

    if (fetchError || !meeting) {
      return res.status(404).json({ error: 'Reunião não encontrada' });
    }

    if (!meeting.transcricao_bruta) {
      return res.status(400).json({ error: 'Sem transcrição disponível para reprocessar' });
    }

    if (meeting.status === 'processando') {
      return res.status(409).json({ error: 'Reunião já está sendo processada' });
    }

    // Marca como processando e retorna imediatamente
    await supabase.from('meetings').update({ status: 'processando' }).eq('id', id);
    res.status(202).json({ success: true });

    // Reanalisa em background
    (async () => {
      try {
        const analysis = await analyzeMeetingTranscript(meeting.transcricao_bruta, profile.openai_api_key);

        await supabase
          .from('meetings')
          .update({
            tipo_reuniao: analysis.tipo_reuniao,
            objetivo: analysis.objetivo,
            resumo: analysis.resumo,
            pontos_importantes: analysis.pontos_importantes,
            topicos_discutidos: analysis.topicos_discutidos,
            status: 'concluido',
          })
          .eq('id', id);

        console.log(`Reunião ${id} reprocessada com sucesso.`);
      } catch (err: any) {
        console.error(`Erro ao reprocessar reunião ${id}:`, err.message);
        await supabase.from('meetings').update({ status: 'erro' }).eq('id', id);
      }
    })();

  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Erro interno' });
  }
});

export default router;
