// Simulador/Serviço do Fireflies
// Documentação real do Fireflies usaria GraphQL
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

export const fetchFirefliesTranscript = async (transcriptId: string): Promise<string> => {
  const apiKey = process.env.FIREFLIES_API_KEY;
  
  if (!apiKey) {
    console.warn('⚠️ FIREFLIES_API_KEY is not set. Returning mock transcript.');
    return "Sarah: Let's kick off the Q3 planning. I've shared the proposed roadmap. \n Mike: Thanks, Sarah. The focus on scalability makes sense.";
  }

  const query = `
    query transcript($transcriptId: String!) {
      transcript(id: $transcriptId) {
        sentences {
          text
          speaker_name
        }
      }
    }
  `;

  try {
    const response = await axios.post(
      'https://api.fireflies.ai/graphql',
      { query, variables: { transcriptId } },
      { headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' } }
    );

    const sentences = response.data?.data?.transcript?.sentences || [];
    return sentences.map((s: any) => `${s.speaker_name}: ${s.text}`).join('\n');
  } catch (error) {
    console.error('Error fetching transcript from Fireflies', error);
    throw new Error('Failed to fetch transcript from Fireflies.');
  }
};
