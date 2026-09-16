import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const dist = new URL('../dist/', import.meta.url);
const expectedRoutes = ['index.html', 'en/index.html', 'ja/index.html', 'sitemap.xml', 'robots.txt'];
const expectedHash = 'a125674d6c36664b0c35b40300de66b47b8fc0ab63a917477ba4025b66eeee8d';
const errors = [];

for (const route of expectedRoutes) {
  if (!existsSync(new URL(route, dist))) errors.push(`Missing route: ${route}`);
}

for (const lang of ['en', 'ja']) {
  const file = new URL(`${lang}/index.html`, dist);
  const html = readFileSync(file, 'utf8');
  if (!html.includes(`<html lang="${lang}">`)) errors.push(`${lang}: missing html lang`);
  if (!html.includes('<link rel="canonical"')) errors.push(`${lang}: missing canonical`);
  for (const code of ['en', 'ja', 'x-default']) {
    if (!html.includes(`hreflang="${code}"`)) errors.push(`${lang}: missing hreflang ${code}`);
  }
  for (const name of ['description', 'twitter:card', 'twitter:title', 'twitter:description']) {
    if (!html.includes(`name="${name}"`)) errors.push(`${lang}: missing ${name}`);
  }
  for (const property of ['og:title', 'og:description', 'og:url']) {
    if (!html.includes(`property="${property}"`)) errors.push(`${lang}: missing ${property}`);
  }
  if (!html.includes('<main id="main">') || !html.includes('<h1')) errors.push(`${lang}: missing semantic main/h1`);
  if (/<(?:script|img)[^>]+src="https?:\/\//i.test(html)
    || /<link[^>]+(?:stylesheet|preconnect)[^>]+href="https?:\/\//i.test(html)) {
    errors.push(`${lang}: external runtime asset found`);
  }

  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]));
  for (const match of html.matchAll(/<a\b[^>]*href="([^"]+)"/g)) {
    const href = match[1];
    if (href.startsWith('#') && !ids.has(href.slice(1))) errors.push(`${lang}: broken fragment ${href}`);
    if (href.startsWith('/TimeDuper') && !href.startsWith('/TimeDuper/')) {
      errors.push(`${lang}: malformed base-path link ${href}`);
      continue;
    }
    if (href.startsWith('/TimeDuper/')) {
      const relative = href.slice('/TimeDuper/'.length).split('#')[0];
      const candidate = relative.endsWith('/') ? `${relative}index.html` : relative;
      if (candidate && !existsSync(new URL(candidate, dist))) errors.push(`${lang}: broken internal link ${href}`);
    }
  }
}

const userscript = readFileSync(new URL('downloads/timeduper.user.js', dist));
const actualHash = createHash('sha256').update(userscript).digest('hex');
if (actualHash !== expectedHash) errors.push('Download checksum mismatch');

const sitemap = readFileSync(new URL('sitemap.xml', dist), 'utf8');
if (!sitemap.includes('/TimeDuper/en/') || !sitemap.includes('/TimeDuper/ja/')) errors.push('Sitemap routes missing');
const robots = readFileSync(new URL('robots.txt', dist), 'utf8');
if (!robots.includes('/TimeDuper/sitemap.xml')) errors.push('robots.txt sitemap missing');

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log('Static build validation: PASS');
