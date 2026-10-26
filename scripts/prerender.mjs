import { createServer } from 'vite';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import sports from '../src/data/sports.js';
import merch from '../src/data/merch.js';

const origin = 'https://www.aachenopen.de';
const routes = [
  { path: '/', title: 'Aachen Open: SEA Games 2026', description: 'Three nations. One arena. Join Aachen Open: SEA Games on 5–6 December 2026 for sport, culture and community.' },
  ...sports.map(({ slug, name, description }) => ({ path: `/sports/${slug}`, title: `${name} | Aachen Open: SEA Games`, description })),
  { path: '/merchandise', title: 'Official Merchandise | Aachen Open: SEA Games', description: 'Explore official Aachen Open: SEA Games merchandise.' },
  ...merch.map(({ slug, name }) => ({ path: `/merchandise/${slug}`, title: `${name} | Aachen Open: SEA Games`, description: `Explore the ${name} and its design story at Aachen Open: SEA Games.` })),
];
const escapeHtml = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
try {
  const { render } = await vite.ssrLoadModule('/src/entry-server.js');
  const template = await readFile('dist/index.html', 'utf8');
  for (const route of routes) {
    const body = render(route.path);
    if (!body || !body.includes('<main')) throw new Error(`Missing rendered content for ${route.path}`);
    const meta = `<link rel="canonical" href="${origin}${route.path}"><meta property="og:title" content="${escapeHtml(route.title)}"><meta property="og:description" content="${escapeHtml(route.description)}"><meta property="og:url" content="${origin}${route.path}">`;
    const html = template
      .replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(route.title)}</title>`)
      .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${escapeHtml(route.description)}">${meta}`)
      .replace('<div id="root"></div>', `<div id="root">${body}</div>`);
    const target = path.join('dist', route.path.slice(1), 'index.html');
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, html);
    console.log(`Prerendered ${route.path}`);
  }
} finally {
  await vite.close();
}
