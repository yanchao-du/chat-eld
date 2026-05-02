/**
 * wiki-lint.js
 * ------------
 * Health-checks the compiled LLM Wiki (knowledge/wiki/).
 * Checks for: broken [[wikilinks]], empty source files, and missing index.
 * Exits with code 1 if any issues found.
 *
 * Usage:
 *   node scripts/wiki-lint.js
 *   WIKI_DIR=/custom/path node scripts/wiki-lint.js
 */

'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Extract all [[wikilink]] references from markdown text.
 * @param {string} content
 * @returns {string[]}  Array of slug strings (deduplicated)
 */
function extractWikilinks(content) {
  const stripped = content.replace(/`[^`]*`/g, '');
  const matches = [...stripped.matchAll(/\[\[([^\]]+)\]\]/g)];
  return [...new Set(matches.map(m => m[1].trim()))];
}

/**
 * Check a wiki directory for structural integrity.
 * @param {string} wikiDir  Path to knowledge/wiki/
 * @returns {{ errors: string[], warnings: string[] }}
 */
function lint(wikiDir) {
  const errors = [];
  const warnings = [];

  const indexPath = path.join(wikiDir, 'index.md');
  if (!fs.existsSync(indexPath)) {
    errors.push('index.md not found — run wiki-compile.js first');
    return { errors, warnings };
  }

  const indexContent = fs.readFileSync(indexPath, 'utf8');

  if (indexContent.trim().length < 50) {
    errors.push('index.md is empty or too short — wiki may not have been compiled correctly');
  }

  const sourcesDir = path.join(wikiDir, 'sources');
  if (!fs.existsSync(sourcesDir)) {
    errors.push('sources/ directory not found — run wiki-compile.js first');
    return { errors, warnings };
  }

  const slugs = extractWikilinks(indexContent);
  for (const slug of slugs) {
    const sourcePath = path.join(sourcesDir, `${slug}.md`);
    if (!fs.existsSync(sourcePath)) {
      errors.push(`Broken wikilink [[${slug}]] — sources/${slug}.md not found`);
    }
  }

  const sourceFiles = fs.readdirSync(sourcesDir).filter(f => f.endsWith('.md'));
  for (const file of sourceFiles) {
    const content = fs.readFileSync(path.join(sourcesDir, file), 'utf8');
    if (content.trim().length < 50) {
      warnings.push(`sources/${file} is nearly empty (< 50 chars)`);
    }
  }

  const linkedSlugs = new Set(slugs);
  for (const file of sourceFiles) {
    const slug = file.replace('.md', '');
    if (!linkedSlugs.has(slug)) {
      warnings.push(`sources/${file} is not referenced in index.md (orphaned page)`);
    }
  }

  const logPath = path.join(wikiDir, 'log.md');
  if (!fs.existsSync(logPath)) {
    warnings.push('log.md not found — compile history unavailable');
  }

  return { errors, warnings };
}

if (require.main === module) {
  const repoRoot = path.join(__dirname, '..');
  const wikiDir = process.env.WIKI_DIR
    ? process.env.WIKI_DIR
    : path.join(repoRoot, 'knowledge', 'wiki');

  if (!fs.existsSync(wikiDir)) {
    console.error(`Error: Wiki directory not found: ${wikiDir}`);
    console.error('Run the compiler first: node scripts/wiki-compile.js');
    process.exit(1);
  }

  console.log('Wiki Lint — Starting\n');
  console.log(`  Wiki dir: ${wikiDir}\n`);

  const { errors, warnings } = lint(wikiDir);

  if (warnings.length > 0) {
    console.log('Warnings:');
    for (const w of warnings) console.log(`  ⚠  ${w}`);
    console.log('');
  }

  if (errors.length > 0) {
    console.log('Errors:');
    for (const e of errors) console.log(`  ✗  ${e}`);
    console.log('');
    console.log(`Lint FAILED — ${errors.length} error(s), ${warnings.length} warning(s)`);
    process.exit(1);
  }

  console.log(`Lint PASSED — 0 errors, ${warnings.length} warning(s)`);
}

module.exports = { extractWikilinks, lint };
