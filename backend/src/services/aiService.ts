import OpenAI from 'openai';

interface MeetingAnalysis {
  tipo_reuniao: string;
  objetivo: string;
  resumo: string;
  pontos_importantes: string[];
  topicos_discutidos: string[];
}

export const analyzeMeetingTranscript = async (
  transcript: string, 
  userApiKey: string
): Promise<MeetingAnalysis> => {
  if (!userApiKey) {
    throw new Error('User OpenAI API key is missing.');
  }

  const openai = new OpenAI({
    apiKey: userApiKey,
  });

  const prompt = `
Você é um assistente sênior de análise de reuniões.
Analise a transcrição abaixo e extraia as seguintes informações em formato JSON estrito:
{
  "tipo_reuniao": "Ex: Vendas, Equipe, Kickoff de Projeto, etc",
  "objetivo": "Um texto curto com o objetivo principal da reunião",
  "resumo": "Um parágrafo resumindo o contexto e os principais acontecimentos",
  "pontos_importantes": ["Decisão 1", "Item de ação 2", "Ponto chave 3"],
  "topicos_discutidos": ["Tag1", "Tag2", "Tag3"]
}

Transcrição:
"""
${transcript}
"""
  `;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You only reply with valid JSON. Do not use markdown blocks like ```json.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.2,
  });

  const content = response.choices[0].message.content || '{}';
  
  try {
    return JSON.parse(content) as MeetingAnalysis;
  } catch (error) {
    console.error('Failed to parse OpenAI response as JSON:', content);
    throw new Error('Invalid JSON format from AI model.');
  }
};
