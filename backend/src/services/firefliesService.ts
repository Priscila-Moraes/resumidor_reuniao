import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

export interface FirefliesTranscriptData {
  id: string;
  title: string;
  date: number;
  duration: number;
  sentences: Array<{ speaker_name: string; text: string }>;
}

export interface TranscriptResult {
  text: string;
  transcript: FirefliesTranscriptData;
  fireflies_id: string;
  duration: number;
}

export const fetchFirefliesTranscript = async (
  transcriptId: string,
  apiKey?: string
): Promise<TranscriptResult> => {
  const key = apiKey || process.env.FIREFLIES_API_KEY;

  if (!key) {
    console.warn('Fireflies API key not found. Returning mock transcript.');
    const mockTranscript: FirefliesTranscriptData = {
      id: transcriptId,
      title: 'Mock Meeting',
      date: Date.now(),
      duration: 30,
      sentences: [
        { speaker_name: 'Sarah', text: "Let's kick off the Q3 planning. I've shared the proposed roadmap." },
        { speaker_name: 'Mike', text: 'Thanks, Sarah. The focus on scalability makes sense.' },
      ],
    };
    return {
      text: mockTranscript.sentences.map((s) => `${s.speaker_name}: ${s.text}`).join('\n'),
      transcript: mockTranscript,
      fireflies_id: transcriptId,
      duration: 30,
    };
  }

  const query = `
    query transcript($transcriptId: String!) {
      transcript(id: $transcriptId) {
        id
        title
        date
        duration
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
      { headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' } }
    );

    const data = response.data?.data?.transcript;
    if (!data) throw new Error('Transcript not found in Fireflies response');

    const sentences: Array<{ speaker_name: string; text: string }> = data.sentences || [];
    const text = sentences.map((s) => `${s.speaker_name}: ${s.text}`).join('\n');

    return {
      text,
      transcript: data as FirefliesTranscriptData,
      fireflies_id: data.id || transcriptId,
      duration: data.duration || 0,
    };
  } catch (error) {
    console.error('Error fetching transcript from Fireflies', error);
    throw new Error('Failed to fetch transcript from Fireflies.');
  }
};
