const FirecrawlApp = require('@mendable/firecrawl-js').default;
const fs = require('fs');
const path = require('path');

const API_KEY = process.env.FIRECRAWL_API_KEY;
if (!API_KEY) {
  console.error('Error: FIRECRAWL_API_KEY environment variable not set.');
  console.error('Usage: FIRECRAWL_API_KEY=your_key node scripts/scrape-eld.js');
  console.error('Get a free key at https://firecrawl.dev');
  process.exit(1);
}

const app = new FirecrawlApp({ apiKey: API_KEY });
const OUTPUT_DIR = path.join(__dirname, '..', 'knowledge', 'eld');
const MEDIA_DIR = path.join(OUTPUT_DIR, 'media-releases');

const PRIORITY_URLS = [
  { url: 'https://www.eld.gov.sg/voters.html',                    slug: 'voter-registration' },
  { url: 'https://www.eld.gov.sg/faq.html',                       slug: 'faq-general' },
  { url: 'https://www.eld.gov.sg/candidate_parliamentary_publication.html', slug: 'publications' },
  { url: 'https://www.eld.gov.sg/candidate_parliamentary_forms.html',       slug: 'forms' },
  {
    url: 'https://www.eld.gov.sg/pdf/GE2025_HowToVote_Brochure_EL.pdf',
    slug: 'how-to-vote',
  },
  {
    url: 'https://www.eld.gov.sg/pdf/GE2025/13i%20Guide%20for%20Polling%20Agents%20of%20General%20Election%202025.pdf',
    slug: 'polling-agent-guide',
  },
  {
    url: 'https://www.eld.gov.sg/press/2025/Media%20Release%20on%20General%20Election%202025.pdf',
    slug: 'media-releases/ge2025-media-release',
  },
];

async function scrapeOne(url, outputPath) {
  try {
    const result = await app.scrapeUrl(url, { formats: ['markdown'] });
    if (!result.markdown) {
      console.warn(`  ⚠ No markdown returned for: ${url}`);
      return false;
    }
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, `<!-- Source: ${url} -->\n\n${result.markdown}`);
    return true;
  } catch (err) {
    console.error(`  ✗ Error scraping ${url}: ${err.message}`);
    return false;
  }
}

function urlToSlug(sourceUrl) {
  return sourceUrl
    .replace('https://www.eld.gov.sg/', '')
    .replace(/\//g, '-')
    .replace(/[^a-zA-Z0-9-_.]/g, '')
    .replace(/-+$/, '')
    || 'unknown';
}

async function main() {
  console.log('ELD Scraper — Starting\n');
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.mkdirSync(MEDIA_DIR, { recursive: true });

  console.log(`Step 1: Scraping ${PRIORITY_URLS.length} priority URLs...`);
  let successCount = 0;
  for (const { url, slug } of PRIORITY_URLS) {
    process.stdout.write(`  → ${slug} ... `);
    const outputPath = path.join(OUTPUT_DIR, `${slug}.md`);
    const ok = await scrapeOne(url, outputPath);
    console.log(ok ? '✓' : 'FAILED');
    if (ok) successCount++;
    await new Promise(r => setTimeout(r, 1500)); // Firecrawl free tier: ~1 req/sec
  }
  console.log(`  Priority: ${successCount}/${PRIORITY_URLS.length} succeeded.\n`);

  console.log('Step 2: Full site crawl (limit: 100 pages)...');
  let crawledCount = 0;
  try {
    const crawl = await app.crawlUrl('https://www.eld.gov.sg', {
      limit: 100,
      scrapeOptions: { formats: ['markdown'] },
    });

    const pages = crawl.data || [];
    console.log(`  Crawl returned ${pages.length} pages.`);

    for (const page of pages) {
      const sourceUrl = page.metadata?.sourceURL || '';
      const slug = urlToSlug(sourceUrl);
      const outputPath = path.join(OUTPUT_DIR, `crawl-${slug}.md`);

      const alreadySaved = PRIORITY_URLS.some(p => p.url === sourceUrl || outputPath.includes(p.slug));
      if (alreadySaved) continue;

      const content = page.markdown || '';
      if (content.trim().length < 100) continue;

      fs.writeFileSync(outputPath, `<!-- Source: ${sourceUrl} -->\n\n${content}`);
      crawledCount++;
    }
    console.log(`  Saved ${crawledCount} additional crawled pages.\n`);
  } catch (err) {
    console.error(`  Crawl failed: ${err.message}`);
    console.error('  Continuing with priority URLs only.\n');
  }

  const allFiles = fs.readdirSync(OUTPUT_DIR, { recursive: true })
    .filter(f => String(f).endsWith('.md'));

  console.log('────────────────────────────────');
  console.log(`Done. Total markdown files: ${allFiles.length}`);
  console.log(`Output directory: ${OUTPUT_DIR}`);
  console.log('');
  console.log('Next step: organise files, then run wiki compilation.');
  console.log('  node scripts/wiki-compile.js');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
