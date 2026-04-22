import { Router, Request, Response } from 'express';
import { supabase } from '../services/supabaseClient';
import { fetchFirefliesTranscript } from '../services/firefliesService';
import { analyzeMeetingTranscript } from '../services/aiService';

const router = Router();

async function getUserProfile(authHeader: string | undefined) {
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, openai_api_key, fireflies_api_key, fireflies_webhook_secret')
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

    const { data: newMeeting, error: insertError } = await supabase
      .from('meetings')
      .insert({
        user_id: profile.id,
        titulo: 'Processando...',
        data: new Date().toISOString(),
        status: 'processando',
        fireflies_id: transcript_id,
      })
      .select('id')
      .single();

    if (insertError || !newMeeting) {
      return res.status(500).json({ error: 'Erro ao criar reunião' });
    }

    res.status(202).json({ success: true, meeting_id: newMeeting.id });

    (async () => {
      try {
        const result = await fetchFirefliesTranscript(transcript_id, profile.fireflies_api_key || undefined);
        const analysis = await analyzeMeetingTranscript(result.text, profile.openai_api_key);

        await supabase
          .from('meetings')
          .update({
            titulo: analysis.titulo || 'Reunião processada',
            tipo_reuniao: analysis.tipo_reuniao,
            objetivo: analysis.objetivo,
            resumo_executivo: analysis.resumo_executivo,
            topicos_discutidos: analysis.topicos_discutidos,
            decisoes: analysis.decisoes,
            itens_acao: analysis.itens_acao,
            pendencias: analysis.pendencias,
            aproveitamento_nota: analysis.aproveitamento_nota,
            aproveitamento_motivo: analysis.aproveitamento_motivo,
            aproveitamento_criterios: analysis.aproveitamento_criterios,
            transcript: result.transcript,
            transcricao_bruta: result.text,
            duration: result.duration,
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

    const { data: meeting, error: fetchError } = await supabase
      .from('meetings')
      .select('id, transcricao_bruta, transcript, fireflies_id, status')
      .eq('id', id)
      .eq('user_id', profile.id)
      .single();

    if (fetchError || !meeting) {
      return res.status(404).json({ error: 'Reunião não encontrada' });
    }

    if (!meeting.transcricao_bruta && (!meeting.transcript || !Object.keys(meeting.transcript).length)) {
      return res.status(400).json({ error: 'Sem transcrição disponível para reprocessar' });
    }

    if (meeting.status === 'processando') {
      return res.status(409).json({ error: 'Reunião já está sendo processada' });
    }

    await supabase.from('meetings').update({ status: 'processando' }).eq('id', id);
    res.status(202).json({ success: true });

    (async () => {
      try {
        // Usa transcrição existente (texto ou reconstrói do JSONB)
        let transcriptText = meeting.transcricao_bruta || '';
        if (!transcriptText && meeting.transcript?.sentences) {
          transcriptText = meeting.transcript.sentences
            .map((s: any) => `${s.speaker_name}: ${s.text}`)
            .join('\n');
        }

        const analysis = await analyzeMeetingTranscript(transcriptText, profile.openai_api_key);

        await supabase
          .from('meetings')
          .update({
            titulo: analysis.titulo || undefined,
            tipo_reuniao: analysis.tipo_reuniao,
            objetivo: analysis.objetivo,
            resumo_executivo: analysis.resumo_executivo,
            topicos_discutidos: analysis.topicos_discutidos,
            decisoes: analysis.decisoes,
            itens_acao: analysis.itens_acao,
            pendencias: analysis.pendencias,
            aproveitamento_nota: analysis.aproveitamento_nota,
            aproveitamento_motivo: analysis.aproveitamento_motivo,
            aproveitamento_criterios: analysis.aproveitamento_criterios,
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
