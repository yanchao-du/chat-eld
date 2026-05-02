'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const {
  extractTitle,
  toSlug,
  extractSourceUrl,
  buildSourcePage,
  buildIndexPage,
  buildLogEntry,
  compile,
} = require('../wiki-compile');

describe('extractTitle', () => {
  test('extracts first H1 heading', () => {
    expect(extractTitle('# Voter Registration\n\nSome text.', 'fallback')).toBe('Voter Registration');
  });

  test('returns fallback when no H1 present', () => {
    expect(extractTitle('## Section\n\nContent', 'My Fallback')).toBe('My Fallback');
  });

  test('trims whitespace from heading', () => {
    expect(extractTitle('#   Polling Procedures   \n', 'x')).toBe('Polling Procedures');
  });

  test('picks up H1 even if not on the first line', () => {
    expect(extractTitle('Intro text\n\n# FAQ General\n\nContent', 'x')).toBe('FAQ General');
  });
});

describe('toSlug', () => {
  test('lowercases input', () => {
    expect(toSlug('VoterRegistration')).toBe('voterregistration');
  });

  test('converts spaces and underscores to hyphens', () => {
    expect(toSlug('voter registration')).toBe('voter-registration');
  });

  test('collapses multiple hyphens', () => {
    expect(toSlug('crawl--faq--html')).toBe('crawl-faq-html');
  });

  test('strips leading and trailing hyphens', () => {
    expect(toSlug('-faq-')).toBe('faq');
  });

  test('passes clean slugs through unchanged', () => {
    expect(toSlug('how-to-vote')).toBe('how-to-vote');
  });
});

describe('extractSourceUrl', () => {
  test('extracts URL from HTML comment', () => {
    const content = '<!-- Source: https://www.eld.gov.sg/voters.html -->\n\n# Title';
    expect(extractSourceUrl(content)).toBe('https://www.eld.gov.sg/voters.html');
  });

  test('returns null when no source comment present', () => {
    expect(extractSourceUrl('# Title\n\nSome content.')).toBeNull();
  });

  test('handles spaces inside comment', () => {
    const content = '<!--  Source:  https://example.com/page  -->';
    expect(extractSourceUrl(content)).toBe('https://example.com/page');
  });
});

describe('buildSourcePage', () => {
  test('includes slug in wikilink', () => {
    const page = buildSourcePage('voter-reg', 'Voter Registration', '# Voter Registration\n\nContent', null);
    expect(page).toContain('[[voter-reg]]');
  });

  test('includes source URL when provided', () => {
    const page = buildSourcePage('faq', 'FAQ', '# FAQ\n\nContent', 'https://www.eld.gov.sg/faq.html');
    expect(page).toContain('https://www.eld.gov.sg/faq.html');
  });

  test('omits source URL line when null', () => {
    const page = buildSourcePage('faq', 'FAQ', '# FAQ\n\nContent', null);
    expect(page).not.toContain('Source:**');
  });

  test('strips HTML source comment from body', () => {
    const content = '<!-- Source: https://example.com -->\n\n# Title\n\nBody.';
    const page = buildSourcePage('title', 'Title', content, 'https://example.com');
    expect(page).not.toContain('<!-- Source:');
  });
});

describe('buildIndexPage', () => {
  const entries = [
    { slug: 'voter-registration', title: 'Voter Registration' },
    { slug: 'how-to-vote', title: 'How To Vote' },
  ];

  test('includes all entry slugs as wikilinks', () => {
    const index = buildIndexPage(entries, '2025-01-01T00:00:00.000Z');
    expect(index).toContain('[[voter-registration]]');
    expect(index).toContain('[[how-to-vote]]');
  });

  test('shows total page count', () => {
    const index = buildIndexPage(entries, '2025-01-01T00:00:00.000Z');
    expect(index).toContain('Total pages: 2');
  });

  test('includes compilation timestamp', () => {
    const index = buildIndexPage(entries, '2025-05-02T10:00:00.000Z');
    expect(index).toContain('2025-05-02T10:00:00.000Z');
  });
});

describe('buildLogEntry', () => {
  const results = [
    { slug: 'voter-registration', file: 'voter-registration.md', ok: true },
    { slug: 'empty-file', file: 'empty-file.md', ok: false },
  ];

  test('reports OK and SKIP counts', () => {
    const log = buildLogEntry(results, '2025-01-01T00:00:00.000Z');
    expect(log).toContain('Successfully compiled: 1');
    expect(log).toContain('Skipped/failed: 1');
  });

  test('marks ok files as [OK]', () => {
    const log = buildLogEntry(results, '2025-01-01T00:00:00.000Z');
    expect(log).toContain('[OK]');
    expect(log).toContain('[SKIP]');
  });
});

describe('compile (integration)', () => {
  let tmpDir, eldDir, wikiDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'wiki-compile-test-'));
    eldDir = path.join(tmpDir, 'eld');
    wikiDir = path.join(tmpDir, 'wiki');
    fs.mkdirSync(eldDir, { recursive: true });
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test('creates index.md and log.md in wikiDir', () => {
    fs.writeFileSync(path.join(eldDir, 'voter-registration.md'),
      '<!-- Source: https://www.eld.gov.sg/voters.html -->\n\n# Voter Registration\n\nContent about voter registration. This file is long enough to pass the minimum length check.');
    compile(eldDir, wikiDir);
    expect(fs.existsSync(path.join(wikiDir, 'index.md'))).toBe(true);
    expect(fs.existsSync(path.join(wikiDir, 'log.md'))).toBe(true);
  });

  test('creates one source page per valid ELD file', () => {
    fs.writeFileSync(path.join(eldDir, 'faq-general.md'),
      '# FAQ General\n\nAnswers to common questions about Singapore elections and voter procedures.');
    fs.writeFileSync(path.join(eldDir, 'how-to-vote.md'),
      '# How To Vote\n\nStep-by-step guide to casting your vote at the polling station on election day.');
    const { entries } = compile(eldDir, wikiDir);
    expect(entries).toHaveLength(2);
    expect(fs.existsSync(path.join(wikiDir, 'sources', 'faq-general.md'))).toBe(true);
    expect(fs.existsSync(path.join(wikiDir, 'sources', 'how-to-vote.md'))).toBe(true);
  });

  test('skips files shorter than 50 characters', () => {
    fs.writeFileSync(path.join(eldDir, 'empty.md'), '# Short');
    const { entries, results } = compile(eldDir, wikiDir);
    expect(entries).toHaveLength(0);
    expect(results[0].ok).toBe(false);
  });

  test('recurses into subdirectories', () => {
    const subDir = path.join(eldDir, 'media-releases');
    fs.mkdirSync(subDir, { recursive: true });
    fs.writeFileSync(path.join(subDir, 'ge2025-media-release.md'),
      '# GE2025 Media Release\n\nOfficial media release for the General Election 2025 from the Elections Department.');
    const { entries } = compile(eldDir, wikiDir);
    expect(entries).toHaveLength(1);
    expect(entries[0].slug).toBe('ge2025-media-release');
  });

  test('index lists all compiled slugs', () => {
    fs.writeFileSync(path.join(eldDir, 'voter-registration.md'),
      '# Voter Registration\n\nDetailed information on voter registration eligibility and procedures in Singapore.');
    compile(eldDir, wikiDir);
    const index = fs.readFileSync(path.join(wikiDir, 'index.md'), 'utf8');
    expect(index).toContain('[[voter-registration]]');
  });

  test('appends to log on second run without overwriting previous run', () => {
    fs.writeFileSync(path.join(eldDir, 'faq-general.md'),
      '# FAQ General\n\nFrequently asked questions about Singapore elections and voter eligibility criteria.');
    compile(eldDir, wikiDir);
    compile(eldDir, wikiDir);
    const log = fs.readFileSync(path.join(wikiDir, 'log.md'), 'utf8');
    const runCount = (log.match(/## Compile run:/g) || []).length;
    expect(runCount).toBe(2);
  });
});
