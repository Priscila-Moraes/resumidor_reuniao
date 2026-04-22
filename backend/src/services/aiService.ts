import OpenAI from 'openai';

export interface MeetingAnalysis {
  titulo: string;
  tipo_reuniao: string;
  objetivo: string;
  resumo_executivo: string;
  topicos_discutidos: string[];
  decisoes: string;
  itens_acao: Array<{ tarefa: string; responsavel: string; prazo: string }>;
  pendencias: string[];
  aproveitamento_nota: number;
  aproveitamento_motivo: string;
  aproveitamento_criterios: {
    objetivos_claros: boolean;
    decisoes_tomadas: boolean;
    responsaveis_definidos: boolean;
    prazos_definidos: boolean;
    foco_mantido: boolean;
  };
}

export const analyzeMeetingTranscript = async (
  transcript: string,
  userApiKey: string
): Promise<MeetingAnalysis> => {
  if (!userApiKey) {
    throw new Error('User OpenAI API key is missing.');
  }

  const openai = new OpenAI({ apiKey: userApiKey });

  const prompt = `Você é um assistente especialista em análise de reuniões corporativas.
Analise a transcrição abaixo e extraia as informações em formato JSON estrito, sem blocos markdown.

Retorne EXATAMENTE este JSON:
{
  "titulo": "Título descritivo da reunião (máx 60 chars)",
  "tipo_reuniao": "Um de: Equipe | Vendas | Projeto | Planejamento | Feedback | Cliente | Outro",
  "objetivo": "Uma frase objetiva descrevendo o propósito da reunião",
  "resumo_executivo": "2 a 3 parágrafos resumindo o contexto, discussões e resultados da reunião",
  "topicos_discutidos": ["Tópico 1", "Tópico 2", "Tópico 3"],
  "decisoes": "Lista em markdown com • das decisões tomadas. Ex:\\n• Decisão 1\\n• Decisão 2",
  "itens_acao": [
    { "tarefa": "Descrição da tarefa", "responsavel": "Nome do responsável ou 'A definir'", "prazo": "Data ou 'A definir'" }
  ],
  "pendencias": ["Pendência ou questão não resolvida 1", "Pendência 2"],
  "aproveitamento_nota": 75,
  "aproveitamento_motivo": "Justificativa da nota de 0 a 100 em 1-2 frases",
  "aproveitamento_criterios": {
    "objetivos_claros": true,
    "decisoes_tomadas": true,
    "responsaveis_definidos": false,
    "prazos_definidos": false,
    "foco_mantido": true
  }
}

Critérios para aproveitamento_nota (0-100):
- objetivos_claros: a reunião teve pauta e objetivos definidos? (+20 pts)
- decisoes_tomadas: foram tomadas decisões concretas? (+20 pts)
- responsaveis_definidos: os itens de ação têm responsáveis? (+20 pts)
- prazos_definidos: os itens de ação têm prazos? (+20 pts)
- foco_mantido: a reunião manteve foco no objetivo? (+20 pts)

Transcrição:
"""
${transcript}
"""`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You only reply with valid JSON. Do not use markdown code blocks.' },
      { role: 'user', content: prompt },
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
