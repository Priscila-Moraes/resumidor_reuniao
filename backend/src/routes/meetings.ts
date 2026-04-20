import { Router, Request, Response } from 'express';
import { supabase } from '../services/supabaseClient';
import { fetchFirefliesTranscript } from '../services/firefliesService';
import { analyzeMeetingTranscript } from '../services/aiService';

const router = Router();

// Processa manualmente uma transcrição pelo ID (sem precisar de webhook)
router.post('/process', async (req: Request, res: Response) => {
  try {
    const { transcript_id, title } = req.body;
    const authHeader = req.headers.authorization;

    if (!transcript_id) {
      return res.status(400).json({ error: 'transcript_id é obrigatório' });
    }

    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token de autenticação não fornecido' });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Token inválido ou expirado' });
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, openai_api_key, fireflies_api_key')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return res.status(404).json({ error: 'Perfil não encontrado' });
    }

    if (!profile.openai_api_key) {
      return res.status(400).json({ error: 'Configure sua chave da OpenAI nas configurações' });
    }

    const transcript = await fetchFirefliesTranscript(transcript_id, profile.fireflies_api_key || undefined);
    const analysis = await analyzeMeetingTranscript(transcript, profile.openai_api_key);

    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .insert({
        user_id: profile.id,
        titulo: title || analysis.tipo_reuniao || 'Reunião processada manualmente',
        data: new Date().toISOString(),
        tipo_reuniao: analysis.tipo_reuniao,
        objetivo: analysis.objetivo,
        resumo: analysis.resumo,
        pontos_importantes: analysis.pontos_importantes,
        topicos_discutidos: analysis.topicos_discutidos,
        transcricao_bruta: transcript,
      })
      .select()
      .single();

    if (meetingError) {
      return res.status(500).json({ error: 'Erro ao salvar reunião' });
    }

    return res.status(200).json({ success: true, meeting });
  } catch (error: any) {
    console.error('Erro ao processar transcrição:', error.message);
    return res.status(500).json({ error: error.message || 'Erro interno' });
  }
});

export default router;
