import OpenAI from 'openai';
import { loadKnowledge } from '@/lib/knowledge';
import { NextRequest } from 'next/server';

const client = new OpenAI({
  apiKey: process.env.ANTHROPIC_API_KEY,
  baseURL: 'https://api.ai.tech.gov.sg/platform/models',
});

export async function POST(req: NextRequest) {
  const { message, history = [] } = await req.json();
  const knowledge = await loadKnowledge();

  const response = await client.chat.completions.create({
    model: 'bedrock.claude-haiku-4-5',
    max_tokens: 512,
    messages: [
      {
        role: 'system',
        content: `You are ELDBot, an official election information assistant for Singapore's Elections Department (ELD).

RULES:
- ONLY answer questions about Singapore elections, voting, and electoral processes
- Ground ALL answers in the KNOWLEDGE section below — never invent facts
- Never give political opinions, party recommendations, or candidate assessments
- Keep responses concise: 2–4 sentences maximum
- If topic not covered: "I don't have that information. Please contact ELD at 1800-225-5353 or visit www.eld.gov.sg"
- Never store, echo, or process personal data (NRIC, address, phone number)
- End every answer with the source in italics: _(Source: ELD — [topic name])_

KNOWLEDGE:
${knowledge}`,
      },
      ...history.slice(-10),
      { role: 'user', content: message },
    ],
  });

  const reply = response.choices[0]?.message?.content ?? '';
  return Response.json({ reply });
}
