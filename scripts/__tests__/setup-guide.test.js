'use strict';

const fs = require('fs');
const path = require('path');

const GUIDE_PATH = path.join(__dirname, '..', '..', 'docs', 'setup-guide.md');

describe('docs/setup-guide.md', () => {
  let content;

  beforeAll(() => {
    content = fs.readFileSync(GUIDE_PATH, 'utf8');
  });

  test('file exists', () => {
    expect(fs.existsSync(GUIDE_PATH)).toBe(true);
  });

  test('covers Wave 1 Infrastructure section', () => {
    expect(content).toMatch(/Wave 1/i);
  });

  test('covers Wave 2 Content section', () => {
    expect(content).toMatch(/Wave 2/i);
  });

  test('covers Wave 3 Agent section', () => {
    expect(content).toMatch(/Wave 3/i);
  });

  test('includes terraform apply command', () => {
    expect(content).toContain('terraform apply');
  });

  test('includes AWS SSO login command', () => {
    expect(content).toContain('aws sso login');
  });

  test('references wiki-compile.js', () => {
    expect(content).toContain('wiki-compile.js');
  });

  test('references wiki-lint.js', () => {
    expect(content).toContain('wiki-lint.js');
  });

  test('references scrape-eld.js', () => {
    expect(content).toContain('scrape-eld.js');
  });

  test('includes tear-down instructions', () => {
    expect(content.toLowerCase()).toContain('terraform destroy');
  });

  test('includes the ELD hotline number', () => {
    expect(content).toContain('1800-225-5353');
  });

  test('references WhatsApp pairing steps', () => {
    expect(content.toLowerCase()).toContain('pairing');
  });

  test('references Telegram bot setup', () => {
    expect(content.toLowerCase()).toContain('botfather');
  });
});
