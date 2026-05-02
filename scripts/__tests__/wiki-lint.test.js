'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { extractWikilinks, lint } = require('../wiki-lint');
const { compile } = require('../wiki-compile');

describe('extractWikilinks', () => {
  test('extracts single wikilink', () => {
    expect(extractWikilinks('See [[voter-registration]] for details.')).toEqual(['voter-registration']);
  });

  test('extracts multiple wikilinks', () => {
    const links = extractWikilinks('[[voter-registration]] and [[how-to-vote]] are pages.');
    expect(links).toEqual(['voter-registration', 'how-to-vote']);
  });

  test('deduplicates repeated wikilinks', () => {
    const links = extractWikilinks('[[faq]] [[faq]] [[faq]]');
    expect(links).toEqual(['faq']);
  });

  test('returns empty array when no wikilinks', () => {
    expect(extractWikilinks('No links here.')).toEqual([]);
  });

  test('trims whitespace inside wikilinks', () => {
    expect(extractWikilinks('[[ voter-registration ]]')).toEqual(['voter-registration']);
  });
});

describe('lint', () => {
  let tmpDir, wikiDir, sourcesDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'wiki-lint-test-'));
    wikiDir = path.join(tmpDir, 'wiki');
    sourcesDir = path.join(wikiDir, 'sources');
    fs.mkdirSync(sourcesDir, { recursive: true });
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  function writeIndex(content) {
    fs.writeFileSync(path.join(wikiDir, 'index.md'), content, 'utf8');
  }

  function writeSource(slug, content) {
    fs.writeFileSync(path.join(sourcesDir, `${slug}.md`), content, 'utf8');
  }

  test('passes on a valid wiki with all links resolved', () => {
    writeIndex('# Index\n\nSee [[voter-registration]] and [[how-to-vote]] for more details on elections.');
    writeSource('voter-registration', '# Voter Registration\n\nFull content about voter registration in Singapore.');
    writeSource('how-to-vote', '# How To Vote\n\nDetailed instructions for casting your vote in Singapore elections.');
    const { errors, warnings } = lint(wikiDir);
    expect(errors).toHaveLength(0);
  });

  test('reports error for missing index.md', () => {
    fs.rmSync(path.join(wikiDir, '..'), { recursive: true, force: true });
    fs.mkdirSync(path.join(wikiDir, 'sources'), { recursive: true });
    const { errors } = lint(wikiDir);
    expect(errors.some(e => e.includes('index.md not found'))).toBe(true);
  });

  test('reports error for broken wikilink', () => {
    writeIndex('# Index\n\nReference to [[missing-page]] which does not exist in the sources directory.');
    const { errors } = lint(wikiDir);
    expect(errors.some(e => e.includes('[[missing-page]]'))).toBe(true);
  });

  test('reports error when index.md is empty', () => {
    writeIndex('short');
    const { errors } = lint(wikiDir);
    expect(errors.some(e => e.includes('empty or too short'))).toBe(true);
  });

  test('reports warning for nearly-empty source file', () => {
    writeIndex('# Index\n\nSee [[voter-registration]] for voter information and procedures.');
    writeSource('voter-registration', 'tiny');
    const { warnings } = lint(wikiDir);
    expect(warnings.some(w => w.includes('voter-registration.md') && w.includes('empty'))).toBe(true);
  });

  test('reports warning for orphaned source file not in index', () => {
    writeIndex('# Index\n\nThis index only references faq content for election information.');
    writeSource('orphaned-page', '# Orphaned Page\n\nThis page is not referenced anywhere in the index file.');
    const { warnings } = lint(wikiDir);
    expect(warnings.some(w => w.includes('orphaned-page') && w.includes('orphaned'))).toBe(true);
  });

  test('reports warning when log.md is missing', () => {
    writeIndex('# Index\n\nA valid index with sufficient content for testing purposes in this lint check.');
    const { warnings } = lint(wikiDir);
    expect(warnings.some(w => w.includes('log.md'))).toBe(true);
  });

  test('no errors on freshly compiled wiki', () => {
    const eldDir = path.join(tmpDir, 'eld');
    fs.mkdirSync(eldDir, { recursive: true });
    fs.writeFileSync(path.join(eldDir, 'voter-registration.md'),
      '# Voter Registration\n\nDetailed content about voter registration eligibility and procedures in Singapore.');
    fs.writeFileSync(path.join(eldDir, 'how-to-vote.md'),
      '# How To Vote\n\nStep-by-step guide to casting your vote at the polling station on Singapore election day.');
    compile(eldDir, wikiDir);

    const { errors } = lint(wikiDir);
    expect(errors).toHaveLength(0);
  });
});
