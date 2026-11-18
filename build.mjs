// Build statique de Giragi — aucune dépendance.
// Usage : node build.mjs   (SITE_URL=https://domaine.fr node build.mjs pour forcer le domaine)
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as R from './build/renderers.mjs';

const ROOT = dirname(fileURLToPath(import.meta.url));
const SRC = join(ROOT, 'src');
const OUT = join(ROOT, 'dist');
const read = p => readFileSync(p, 'utf8');
const json = name => JSON.parse(read(join(ROOT, 'data', name + '.json')));

const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
const siteUrl = (process.env.SITE_URL || (vercelUrl ? `https://${vercelUrl}` : 'https://giragi.vercel.app')).replace(/\/$/, '');
const ctx = { site: { url: siteUrl, annee: new Date().getFullYear() }, infos: json('infos'), carte: json('carte'), avis: json('avis') };

// ---- Templates : {{> partial}}, {{@ renderer}}, {{ chemin.valeur }}
const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const get = (obj, path) => path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);
function render(tpl, depth = 0) {
  if (depth > 8) throw new Error('Inclusions trop profondes');
  return tpl
    .replace(/\{\{>\s*([\w/-]+)\s*\}\}/g, (_, n) => render(read(join(SRC, 'partials', n + '.html')), depth + 1))
    .replace(/\{\{@\s*(\w+)\s*\}\}/g, (_, n) => {
      if (!R[n]) throw new Error(`Renderer inconnu : ${n}`);
      return R[n](ctx);
    })
    .replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, p) => {
      const v = get(ctx, p);
      if (v === undefined) throw new Error(`Valeur manquante : ${p}`);
      return esc(v);
    });
}

// ---- Sortie
rmSync(OUT, { recursive: true, force: true });
mkdirSync(join(OUT, 'assets'), { recursive: true });
cpSync(join(ROOT, 'public'), OUT, { recursive: true });

for (const page of readdirSync(join(SRC, 'pages'))) {
  writeFileSync(join(OUT, page), render(read(join(SRC, 'pages', page))));
}

// CSS : un fichier par composant, assemblés dans l'ordre de _order.txt
const order = read(join(SRC, 'css', '_order.txt')).split('\n').map(s => s.trim()).filter(Boolean);
const css = order.map(f => read(join(SRC, 'css', f))).join('\n')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\n\s*\n/g, '\n');
writeFileSync(join(OUT, 'assets', 'site.css'), css);

// JS : modules ES copiés tels quels
cpSync(join(SRC, 'js'), join(OUT, 'assets', 'js'), { recursive: true });

// Fichiers pour les moteurs et les IA
writeFileSync(join(OUT, 'robots.txt'), R.robots(ctx));
writeFileSync(join(OUT, 'sitemap.xml'), R.sitemap(ctx));
writeFileSync(join(OUT, 'llms.txt'), R.llms(ctx));

if (!existsSync(join(OUT, 'index.html'))) throw new Error('index.html absent');
console.log(`Build OK → dist/ (${siteUrl})`);
