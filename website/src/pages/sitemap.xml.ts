import type { APIRoute } from 'astro';

export const prerender = true;

export const GET: APIRoute = ({ site }) => {
  const origin = site ?? new URL('https://ren373.github.io');
  const urls = ['/TimeDuper/en/', '/TimeDuper/ja/'];
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.map((path) => {
    const location = new URL(path, origin).href;
    const alternate = path.endsWith('/ja/') ? '/TimeDuper/en/' : '/TimeDuper/ja/';
    const language = path.endsWith('/ja/') ? 'ja' : 'en';
    const alternateLanguage = language === 'ja' ? 'en' : 'ja';
    return `  <url>
    <loc>${location}</loc>
    <xhtml:link rel="alternate" hreflang="${language}" href="${location}" />
    <xhtml:link rel="alternate" hreflang="${alternateLanguage}" href="${new URL(alternate, origin).href}" />
  </url>`;
  }).join('\n')}
</urlset>`;
  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
