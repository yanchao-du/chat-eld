/**
 * @jest-environment node
 */
import { POST } from '@/app/api/chat/route';
import { NextRequest } from 'next/server';

jest.mock('openai', () => {
  const mockCreate = jest.fn();
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      chat: { completions: { create: mockCreate } },
    })),
    _mockCreate: mockCreate,
  };
});

jest.mock('@/lib/knowledge', () => ({
  loadKnowledge: jest.fn().mockResolvedValue('## Voting\nPolling hours are 8am–8pm.'),
}));

function makeRequest(body: object) {
  return new NextRequest('http://localhost/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function getMockCreate() {
  const openaiModule = jest.requireMock('openai');
  return openaiModule._mockCreate as jest.Mock;
}

describe('POST /api/chat', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns a reply from the model', async () => {
    getMockCreate().mockResolvedValue({
      choices: [{ message: { content: 'Polling hours are 8am to 8pm.' } }],
    });

    const res = await POST(makeRequest({ message: 'What time do polls close?' }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.reply).toBe('Polling hours are 8am to 8pm.');
  });

  it('calls the model with bedrock.claude-haiku-4-5', async () => {
    getMockCreate().mockResolvedValue({
      choices: [{ message: { content: 'Answer' } }],
    });

    await POST(makeRequest({ message: 'Hello' }));

    expect(getMockCreate()).toHaveBeenCalledWith(
      expect.objectContaining({ model: 'bedrock.claude-haiku-4-5' })
    );
  });

  it('includes knowledge in the system prompt', async () => {
    getMockCreate().mockResolvedValue({
      choices: [{ message: { content: 'Answer' } }],
    });

    await POST(makeRequest({ message: 'Hello' }));

    const callArgs = getMockCreate().mock.calls[0][0];
    const systemMsg = callArgs.messages.find((m: { role: string }) => m.role === 'system');
    expect(systemMsg.content).toContain('Polling hours are 8am–8pm.');
  });

  it('passes conversation history sliced to 10 messages', async () => {
    getMockCreate().mockResolvedValue({
      choices: [{ message: { content: 'Answer' } }],
    });

    const history = Array.from({ length: 15 }, (_, i) => ({
      role: i % 2 === 0 ? 'user' : 'assistant',
      content: `message ${i}`,
    }));

    await POST(makeRequest({ message: 'New question', history }));

    const callArgs = getMockCreate().mock.calls[0][0];
    const nonSystemMessages = callArgs.messages.filter((m: { role: string }) => m.role !== 'system');
    expect(nonSystemMessages.length).toBe(11); // 10 history + 1 new
  });

  it('returns empty reply when model returns no content', async () => {
    getMockCreate().mockResolvedValue({ choices: [] });

    const res = await POST(makeRequest({ message: 'Hello' }));
    const body = await res.json();

    expect(body.reply).toBe('');
  });

  it('defaults history to empty array when not provided', async () => {
    getMockCreate().mockResolvedValue({
      choices: [{ message: { content: 'OK' } }],
    });

    const res = await POST(makeRequest({ message: 'Hello' }));
    expect(res.status).toBe(200);
  });
});
