'use strict';

const fs = require('fs');
const path = require('path');

const AGENT_DIR = path.join(__dirname, '..', '..', 'groups', 'election-bot');
const CLAUDE_MD = path.join(AGENT_DIR, 'CLAUDE.md');
const CONFIG_JSON = path.join(AGENT_DIR, 'config.json');

describe('CLAUDE.md — agent persona file', () => {
  let content;

  beforeAll(() => {
    content = fs.readFileSync(CLAUDE_MD, 'utf8');
  });

  test('file exists', () => {
    expect(fs.existsSync(CLAUDE_MD)).toBe(true);
  });

  test('has a top-level H1 title', () => {
    expect(content).toMatch(/^# .+/m);
  });

  test('includes a Role section', () => {
    expect(content).toMatch(/^## Role/m);
  });

  test('includes a Rules section', () => {
    expect(content).toMatch(/^## Rules/m);
  });

  test('references the knowledge wiki path', () => {
    expect(content).toContain('/knowledge/wiki');
  });

  test('specifies the ELD hotline number', () => {
    expect(content).toContain('1800-225-5353');
  });

  test('prohibits personal data processing', () => {
    expect(content.toLowerCase()).toContain('nric');
  });

  test('enforces grounding in wiki content only', () => {
    expect(content.toLowerCase()).toContain('never invent');
  });

  test('requires source citation at end of answers', () => {
    expect(content).toContain('_(Source: ELD');
  });

  test('is non-empty and substantial (>500 chars)', () => {
    expect(content.trim().length).toBeGreaterThan(500);
  });
});

describe('config.json — agent configuration', () => {
  let config;

  beforeAll(() => {
    config = JSON.parse(fs.readFileSync(CONFIG_JSON, 'utf8'));
  });

  test('file exists and is valid JSON', () => {
    expect(fs.existsSync(CONFIG_JSON)).toBe(true);
    expect(config).toBeDefined();
  });

  test('has a name field', () => {
    expect(typeof config.name).toBe('string');
    expect(config.name.length).toBeGreaterThan(0);
  });

  test('specifies the Haiku model', () => {
    expect(config.model).toContain('haiku');
  });

  test('requiresTrigger is false (public DMs)', () => {
    expect(config.requiresTrigger).toBe(false);
  });

  test('knowledgeMount points to wiki directory', () => {
    expect(config.knowledgeMount).toBeDefined();
    expect(config.knowledgeMount.path).toContain('wiki');
  });

  test('maxTokens is set and reasonable (256–1024)', () => {
    expect(config.maxTokens).toBeGreaterThanOrEqual(256);
    expect(config.maxTokens).toBeLessThanOrEqual(1024);
  });

  test('channels includes whatsapp', () => {
    expect(config.channels).toContain('whatsapp');
  });

  test('channels includes telegram', () => {
    expect(config.channels).toContain('telegram');
  });

  test('persona references CLAUDE.md', () => {
    expect(config.persona).toBe('CLAUDE.md');
  });
});
