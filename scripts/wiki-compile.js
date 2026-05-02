/**
 * wiki-compile.js
 * ---------------
 * Compiles ELD source markdown files (knowledge/eld/) into a structured
 * LLM Wiki (knowledge/wiki/) with an index, source pages, and a compile log.
 *
 * Usage:
 *   node scripts/wiki-compile.js
 *   KNOWLEDGE_DIR=/custom/path node scripts/wiki-compile.js
 */

'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Extract the first H1 heading from markdown text.
 * Falls back to a slugified version of the filename.
 * @param {string} content  Markdown text
 * @param {string} fallback Fallback title (e.g. filename without extension)
 * @returns {string}
 */
function extractTitle(content, fallback) {
  const match = content.match(/^#\s+(.+)/m);
  return match ? match[1].trim() : fallback;
}

/**
 * Convert a file basename (without extension) to a wiki slug.
 * Lowercase, hyphens only.
 * @param {string} name e.g. "voter-registration" or "crawl-faq-html"
 * @returns {string}
 */
function toSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Extract the source URL comment inserted by scrape-eld.js (<!-- Source: URL -->).
 * @param {string} content
 * @returns {string|null}
 */
function extractSourceUrl(content) {
  const match = content.match(/<!--\s*Source:\s*(https?:\/\/\S+)\s*-->/);
  return match ? match[1] : null;
}

/**
 * Build a wiki source page from an ELD markdown file.
 * @param {string} slug    e.g. "voter-registration"
 * @param {string} title   e.g. "Voter Registration"
 * @param {string} content Original ELD markdown
 * @param {string|null} sourceUrl  Original URL if known
 * @returns {string}  Wiki page markdown
 */
function buildSourcePage(slug, title, content, sourceUrl) {
  const lines = [
    `# ${title}`,
    '',
    `> **Wiki slug:** \`[[${slug}]]\``,
    sourceUrl ? `> **Source:** ${sourceUrl}` : '',
    '',
    '---',
    '',
    content.replace(/<!--.*?-->/gs, '').trim(),
  ].filter(l => l !== null);
  return lines.join('\n');
}

/**
 * Build the wiki index page listing all compiled source pages.
 * @param {Array<{slug: string, title: string}>} entries
 * @param {string} compiledAt ISO timestamp
 * @returns {string}
 */
function buildIndexPage(entries, compiledAt) {
  const rows = entries
    .map(e => `| [[${e.slug}]] | ${e.title} |`)
    .join('\n');

  return [
    '# ELD Knowledge Wiki — Index',
    '',
    `> Last compiled: ${compiledAt}`,
    `> Total pages: ${entries.length}`,
    '',
    '---',
    '',
    '## Source Pages',
    '',
    '| Wikilink | Title |',
    '|----------|-------|',
    rows,
    '',
    '---',
    '',
    '## Usage',
    '',
    'Reference pages with `[[slug]]` syntax.',
    'The ELDBot agent reads all pages in `wiki/sources/` as its knowledge base.',
  ].join('\n');
}

/**
 * Build the compile log entry.
 * @param {Array<{slug: string, file: string, ok: boolean}>} results
 * @param {string} compiledAt
 * @returns {string}
 */
function buildLogEntry(results, compiledAt) {
  const passed = results.filter(r => r.ok).length;
  const failed = results.filter(r => !r.ok).length;
  const lines = [
    `## Compile run: ${compiledAt}`,
    '',
    `- Total input files: ${results.length}`,
    `- Successfully compiled: ${passed}`,
    `- Skipped/failed: ${failed}`,
    '',
    '### Files processed',
    '',
    ...results.map(r => `- [${r.ok ? 'OK' : 'SKIP'}] \`${r.file}\` → [[${r.slug}]]`),
    '',
    '---',
    '',
  ];
  return lines.join('\n');
}

// ── Main compile function ────────────────────────────────────────────────────

/**
 * Compile all ELD markdown files into the wiki directory.
 * @param {string} eldDir   Path to knowledge/eld/
 * @param {string} wikiDir  Path to knowledge/wiki/
 * @returns {{ entries: Array, results: Array, compiledAt: string }}
 */
function compile(eldDir, wikiDir) {
  const sourcesDir = path.join(wikiDir, 'sources');
  fs.mkdirSync(sourcesDir, { recursive: true });

  const mdFiles = [];
  function walk(dir, rel) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        walk(path.join(dir, entry.name), path.join(rel, entry.name));
      } else if (entry.name.endsWith('.md')) {
        mdFiles.push({ abs: path.join(dir, entry.name), rel: path.join(rel, entry.name) });
      }
    }
  }
  walk(eldDir, '');

  const compiledAt = new Date().toISOString();
  const entries = [];
  const results = [];

  for (const { abs, rel } of mdFiles) {
    const content = fs.readFileSync(abs, 'utf8');
    if (content.trim().length < 50) {
      results.push({ slug: toSlug(path.basename(rel, '.md')), file: rel, ok: false });
      continue;
    }

    const basename = path.basename(rel, '.md');
    const slug = toSlug(basename);
    const title = extractTitle(content, basename.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()));
    const sourceUrl = extractSourceUrl(content);

    const pageContent = buildSourcePage(slug, title, content, sourceUrl);
    const outPath = path.join(sourcesDir, `${slug}.md`);
    fs.writeFileSync(outPath, pageContent, 'utf8');

    entries.push({ slug, title });
    results.push({ slug, file: rel, ok: true });
  }

  const indexContent = buildIndexPage(entries, compiledAt);
  fs.writeFileSync(path.join(wikiDir, 'index.md'), indexContent, 'utf8');

  const logPath = path.join(wikiDir, 'log.md');
  const logEntry = buildLogEntry(results, compiledAt);
  const existingLog = fs.existsSync(logPath) ? fs.readFileSync(logPath, 'utf8') : '# Wiki Compile Log\n\n';
  fs.writeFileSync(logPath, existingLog + logEntry, 'utf8');

  return { entries, results, compiledAt };
}

if (require.main === module) {
  const repoRoot = path.join(__dirname, '..');
  const eldDir = process.env.KNOWLEDGE_DIR
    ? path.join(process.env.KNOWLEDGE_DIR, 'eld')
    : path.join(repoRoot, 'knowledge', 'eld');
  const wikiDir = process.env.WIKI_DIR
    ? process.env.WIKI_DIR
    : path.join(repoRoot, 'knowledge', 'wiki');

  if (!fs.existsSync(eldDir)) {
    console.error(`Error: ELD knowledge directory not found: ${eldDir}`);
    console.error('Run the scraper first: FIRECRAWL_API_KEY=... node scripts/scrape-eld.js');
    process.exit(1);
  }

  console.log('Wiki Compile — Starting\n');
  console.log(`  ELD source: ${eldDir}`);
  console.log(`  Wiki output: ${wikiDir}\n`);

  try {
    const { entries, results, compiledAt } = compile(eldDir, wikiDir);
    const passed = results.filter(r => r.ok).length;
    const failed = results.filter(r => !r.ok).length;

    console.log(`Compiled at: ${compiledAt}`);
    console.log(`Pages written: ${passed}`);
    if (failed > 0) console.log(`Skipped (too short): ${failed}`);
    console.log(`\nIndex: ${path.join(wikiDir, 'index.md')}`);
    console.log('\nNext step: run the linter to verify the wiki is healthy.');
    console.log('  node scripts/wiki-lint.js');
  } catch (err) {
    console.error('Fatal error during compilation:', err.message);
    process.exit(1);
  }
}

module.exports = { extractTitle, toSlug, extractSourceUrl, buildSourcePage, buildIndexPage, buildLogEntry, compile };
