// build.mjs
// le config + content + template e emite dist/<slug>/<edition>/index.html
//
// uso: node system/scripts/build.mjs --client zerezes --edition 2026-05
//      node system/scripts/build.mjs --client zerezes --edition 2026-05 --as-root
//
// --as-root tambem escreve em /index.html (raiz do repo) para manter o deploy
// zerezes-leitura-criativa.vercel.app apontando pra edicao corrente.

import { parseArgs, loadClientConfig, requireArg, readJson, log, SYSTEM_ROOT, REPO_ROOT, contrastRatio } from './_shared.mjs';
import { readFileSync, writeFileSync, mkdirSync, cpSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';

const args = parseArgs(process.argv);
const slug = requireArg(args, 'client');
const edition = requireArg(args, 'edition');
const asRoot = !!args['as-root'];

const cfg = loadClientConfig(slug);
const contentPath = join(SYSTEM_ROOT, 'clients', slug, 'content', `${edition}.json`);
if (!existsSync(contentPath)) {
  console.error(`content not found: ${contentPath}`);
  console.error('rode "node system/scripts/draft-content.mjs" primeiro');
  process.exit(1);
}
const content = readJson(contentPath);
const templatePath = join(SYSTEM_ROOT, 'template', 'index.template.html');
const template = readFileSync(templatePath, 'utf8');

// -- contrast guard --
const bg = cfg.brand?.palette?.creme;
const accent = cfg.brand?.palette?.laranja || cfg.brand?.palette?.accent;
if (bg && accent) {
  const r = contrastRatio(accent, bg);
  if (r < 3.0 && !cfg.brand?.accent_usage?.dark_variant) {
    console.error(`contrast guard: accent ${accent} on bg ${bg} = ${r.toFixed(2)}:1 and no dark_variant defined.`);
    process.exit(1);
  }
}

// -- placeholder resolver (simple {{path.to.field}} substitution) --
function get(obj, path) {
  return path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);
}

function render(tpl, ctx) {
  return tpl.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (m, key) => {
    const v = get(ctx, key);
    return v == null ? '' : String(v);
  });
}

// -- palette to css variables --
function paletteToCssVars(palette) {
  return Object.entries(palette)
    .map(([k, v]) => `  --${k.replace(/_/g, '-')}: ${v};`)
    .join('\n');
}

const ctx = {
  client: cfg,
  edition,
  content,
  css_vars: paletteToCssVars(cfg.brand?.palette || {}),
  fonts_url: (() => {
    const sans = encodeURIComponent(cfg.brand?.fonts?.sans || 'DM Sans');
    const serif = encodeURIComponent(cfg.brand?.fonts?.serif || 'DM Serif Display');
    return `https://fonts.googleapis.com/css2?family=${sans}:ital,opsz,wght@0,9..40,300..700;1,9..40,300..700&family=${serif}:ital@0;1&display=swap`;
  })(),
  title: content.title || `${cfg.name} — leitura criativa ${edition}`,
  hero_headline: content.hero?.headline || '',
  hero_subhead: content.hero?.subhead || '',
};

const html = render(template, ctx);

// -- write outputs --
const distDir = join(REPO_ROOT, 'dist', slug, edition);
mkdirSync(distDir, { recursive: true });
writeFileSync(join(distDir, 'index.html'), html, 'utf8');

// copy lib (css+js) alongside
const libSrc = join(SYSTEM_ROOT, 'lib');
const libDst = join(distDir, 'lib');
if (existsSync(libSrc)) cpSync(libSrc, libDst, { recursive: true });

log('build', `wrote ${join(distDir, 'index.html')}`);

if (asRoot) {
  const rootIdx = join(REPO_ROOT, 'index.html');
  writeFileSync(rootIdx, html, 'utf8');
  log('build', `--as-root: wrote ${rootIdx} (vercel deploy target)`);
}
