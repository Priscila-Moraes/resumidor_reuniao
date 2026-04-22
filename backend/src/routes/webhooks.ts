import { Router, Request, Response } from 'express';
import { supabase } from '../services/supabaseClient';
import { fetchFirefliesTranscript } from '../services/firefliesService';
import { analyzeMeetingTranscript } from '../services/aiService';

const router = Router();

router.post('/fireflies', async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    console.log('Webhook do Fireflies recebido:', JSON.stringify(payload));

    const transcriptId = payload?.meetingId || payload?.transcript?.id || payload?.transcript_id;
    const organizerEmail = payload?.transcript?.organizer_email || payload?.organizer_email;
    const meetingTitle = payload?.transcript?.title || payload?.title || 'Reunião sem título';
    const rawDate = payload?.transcript?.date || payload?.date;
    const meetingDate = rawDate
      ? (typeof rawDate === 'number' ? new Date(rawDate).toISOString() : rawDate)
      : new Date().toISOString();

    if (!organizerEmail || !transcriptId) {
      return res.status(400).json({ error: 'Missing organizer_email or transcript_id' });
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, openai_api_key, fireflies_api_key')
      .eq('email', organizerEmail)
      .single();

    if (profileError || !profile) {
      console.error('Usuário não encontrado:', organizerEmail);
      return res.status(404).json({ error: 'User not found in the system' });
    }

    if (!profile.openai_api_key) {
      return res.status(400).json({ error: 'User has no OpenAI API Key configured' });
    }

    // Insere a reunião imediatamente com status 'processando'
    const { data: newMeeting, error: insertError } = await supabase
      .from('meetings')
      .insert({
        user_id: profile.id,
        titulo: meetingTitle,
        data: meetingDate,
        status: 'processando',
      })
      .select('id')
      .single();

    if (insertError || !newMeeting) {
      console.error('Erro ao criar reunião:', insertError);
      return res.status(500).json({ error: 'Failed to create meeting' });
    }

    // Retorna 202 imediatamente — processa em background
    res.status(202).json({ success: true, meeting_id: newMeeting.id });

    // Processamento assíncrono em background
    (async () => {
      try {
        const transcript = await fetchFirefliesTranscript(transcriptId, profile.fireflies_api_key || undefined);
        const analysis = await analyzeMeetingTranscript(transcript, profile.openai_api_key);

        await supabase
          .from('meetings')
          .update({
            tipo_reuniao: analysis.tipo_reuniao,
            objetivo: analysis.objetivo,
            resumo: analysis.resumo,
            pontos_importantes: analysis.pontos_importantes,
            topicos_discutidos: analysis.topicos_discutidos,
            transcricao_bruta: transcript,
            status: 'concluido',
          })
          .eq('id', newMeeting.id);

        console.log(`Reunião ${newMeeting.id} processada com sucesso.`);
      } catch (err: any) {
        console.error(`Erro ao processar reunião ${newMeeting.id}:`, err.message);
        await supabase
          .from('meetings')
          .update({ status: 'erro' })
          .eq('id', newMeeting.id);
      }
    })();

  } catch (error: any) {
    console.error('Erro geral no webhook:', error.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
