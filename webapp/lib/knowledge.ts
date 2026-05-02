import fs from 'fs';
import path from 'path';

export async function loadKnowledge(): Promise<string> {
  const dir = path.join(process.cwd(), 'knowledge');
  if (!fs.existsSync(dir)) return '';
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
  const sections = files.map(file => {
    const content = fs.readFileSync(path.join(dir, file), 'utf-8');
    const topic = file.replace('.md', '').replace(/-/g, ' ');
    return `### ${topic}\n${content}`;
  });
  return sections.join('\n\n---\n\n');
}
