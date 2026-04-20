import { Router, Request, Response } from 'express';
import { supabase } from '../services/supabaseClient';
import { fetchFirefliesTranscript } from '../services/firefliesService';
import { analyzeMeetingTranscript } from '../services/aiService';

const router = Router();

// Endpoint que recebe o Webhook do Fireflies
router.post('/fireflies', async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    console.log('Webhook do Fireflies recebido:', JSON.stringify(payload));

    // Fireflies envia: { meetingId, eventType, transcript: { id, title, organizer_email, date } }
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

    // 1. Encontrar o usuário no Supabase pelo email
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
      console.error('Usuário não possui chave da OpenAI configurada.');
      return res.status(400).json({ error: 'User has no OpenAI API Key configured' });
    }

    // 2. Buscar transcrição no Fireflies (usa chave do perfil ou do env como fallback)
    const transcript = await fetchFirefliesTranscript(transcriptId, profile.fireflies_api_key || undefined);

    // 3. Processar a transcrição com a IA (passando a chave do usuário)
    const analysis = await analyzeMeetingTranscript(transcript, profile.openai_api_key);

    // 4. Salvar tudo no Supabase
    const { error: meetingError } = await supabase
      .from('meetings')
      .insert({
        user_id: profile.id,
        titulo: meetingTitle,
        data: meetingDate,
        tipo_reuniao: analysis.tipo_reuniao,
        objetivo: analysis.objetivo,
        resumo: analysis.resumo,
        pontos_importantes: analysis.pontos_importantes,
        topicos_discutidos: analysis.topicos_discutidos,
        transcricao_bruta: transcript
      });

    if (meetingError) {
      console.error('Erro ao salvar reunião no Supabase:', meetingError);
      return res.status(500).json({ error: 'Failed to save meeting' });
    }

    return res.status(200).json({ success: true });

  } catch (error: any) {
    console.error('Erro geral no webhook:', error.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
