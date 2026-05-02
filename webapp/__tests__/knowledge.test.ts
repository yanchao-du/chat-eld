import { loadKnowledge } from '@/lib/knowledge';
import fs from 'fs';
import path from 'path';

jest.mock('fs');

const mockedFs = fs as jest.Mocked<typeof fs>;

describe('loadKnowledge', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns empty string when knowledge directory does not exist', async () => {
    mockedFs.existsSync.mockReturnValue(false);
    const result = await loadKnowledge();
    expect(result).toBe('');
  });

  it('reads all markdown files and formats them with topic headings', async () => {
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readdirSync.mockReturnValue(['how-to-vote.md', 'faq.md'] as unknown as fs.Dirent[]);
    mockedFs.readFileSync.mockImplementation((filePath: fs.PathOrFileDescriptor) => {
      if (String(filePath).endsWith('how-to-vote.md')) return 'Step 1: Go to polling station.';
      if (String(filePath).endsWith('faq.md')) return 'Q: Is voting compulsory?';
      return '';
    });

    const result = await loadKnowledge();

    expect(result).toContain('### how to vote');
    expect(result).toContain('Step 1: Go to polling station.');
    expect(result).toContain('### faq');
    expect(result).toContain('Q: Is voting compulsory?');
  });

  it('joins multiple files with separator', async () => {
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readdirSync.mockReturnValue(['a.md', 'b.md'] as unknown as fs.Dirent[]);
    mockedFs.readFileSync.mockReturnValue('content');

    const result = await loadKnowledge();

    expect(result).toContain('---');
  });

  it('ignores non-markdown files', async () => {
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readdirSync.mockReturnValue(['data.json', 'readme.txt', 'faq.md'] as unknown as fs.Dirent[]);
    mockedFs.readFileSync.mockReturnValue('FAQ content');

    const result = await loadKnowledge();

    expect(result).toContain('### faq');
    expect(result).not.toContain('data.json');
    expect(result).not.toContain('readme.txt');
  });

  it('converts hyphens to spaces in topic heading', async () => {
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readdirSync.mockReturnValue(['voter-registration.md'] as unknown as fs.Dirent[]);
    mockedFs.readFileSync.mockReturnValue('Registration info');

    const result = await loadKnowledge();

    expect(result).toContain('### voter registration');
  });
});
