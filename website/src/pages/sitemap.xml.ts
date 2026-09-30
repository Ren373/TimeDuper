import type { APIRoute } from 'astro';

export const prerender = true;

export const GET: APIRoute = ({ site }) => {
  const origin = site ?? new URL('https://ren373.github.io');
  const pages = [
    { path: '/TimeDuper/en/', lang: 'en', alternate: '/TimeDuper/ja/' },
    { path: '/TimeDuper/ja/', lang: 'ja', alternate: '/TimeDuper/en/' },
    { path: '/TimeDuper/en/block-instagram-reels-iphone/', lang: 'en', alternate: '/TimeDuper/ja/hide-instagram-reels-iphone/' },
    { path: '/TimeDuper/ja/hide-instagram-reels-iphone/', lang: 'ja', alternate: '/TimeDuper/en/block-instagram-reels-iphone/' },
  ];
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${pages.map(({ path, lang, alternate }) => {
    const location = new URL(path, origin).href;
    const alternateLanguage = lang === 'ja' ? 'en' : 'ja';
    return `  <url>
    <loc>${location}</loc>
    <xhtml:link rel="alternate" hreflang="${lang}" href="${location}" />
    <xhtml:link rel="alternate" hreflang="${alternateLanguage}" href="${new URL(alternate, origin).href}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${lang === 'en' ? location : new URL(alternate, origin).href}" />
  </url>`;
  }).join('\n')}
</urlset>`;
  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
