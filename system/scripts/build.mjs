// build.mjs
// le config + content + template e emite dist/<slug>/<edition>/index.html
//
// uso: node system/scripts/build.mjs --client zerezes --edition 2026-05
//      node system/scripts/build.mjs --client zerezes --edition 2026-05 --as-root
//
// --as-root tambem escreve em /index.html (raiz do repo) para manter o deploy
// zerezes-leitura-criativa.vercel.app apontando pra edicao corrente.

import { parseArgs, loadClientConfig, requireArg, readJson, log, SYSTEM_ROOT, REPO_ROOT, contrastRatio } from './_shared.mjs';
import { validateConfig } from './validate-config.mjs';
import { readFileSync, writeFileSync, mkdirSync, cpSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';

const args = parseArgs(process.argv);
const slug = requireArg(args, 'client');
const edition = requireArg(args, 'edition');
const asRoot = !!args['as-root'];

const cfg = loadClientConfig(slug);

const { errors: cfgErrors } = validateConfig(slug, { cfg });
if (cfgErrors > 0) {
  console.error(`build aborted: ${cfgErrors} validation error(s) in client config.`);
  process.exit(1);
}
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
const palette = cfg.brand?.palette || {};
const bg = palette.creme;
const accent = palette.laranja || palette.accent;
if (bg && accent) {
  const r = contrastRatio(accent, bg);
  if (r < 3.0 && !cfg.brand?.accent_usage?.dark_variant) {
    console.error(`contrast guard: accent ${accent} on bg ${bg} = ${r.toFixed(2)}:1 and no dark_variant defined.`);
    process.exit(1);
  }
}

// -- extra AA pairs (opt-in via cfg.brand.accessibility_pairs) --
// formato: [{ fg: "preto", bg: "creme", min: 4.5, note?: "body text" }, ...]
// "fg"/"bg" sao keys do palette; min default 4.5 (AA small text).
const extraPairs = cfg.brand?.accessibility_pairs;
if (Array.isArray(extraPairs)) {
  for (const pair of extraPairs) {
    const fgHex = palette[pair.fg];
    const bgHex = palette[pair.bg];
    if (!fgHex || !bgHex) {
      console.error(`contrast guard: accessibility_pairs references unknown palette key (${pair.fg} / ${pair.bg}).`);
      process.exit(1);
    }
    const min = typeof pair.min === 'number' ? pair.min : 4.5;
    const r = contrastRatio(fgHex, bgHex);
    if (r < min) {
      const note = pair.note ? ` (${pair.note})` : '';
      console.error(`contrast guard: ${pair.fg} on ${pair.bg}${note} = ${r.toFixed(2)}:1, min ${min}:1.`);
      process.exit(1);
    }
    log('build', `contrast ${pair.fg}/${pair.bg} = ${r.toFixed(2)}:1 (min ${min}) ok`);
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

const social = cfg.social || {};
const baseUrl = (social.base_url || '').replace(/\/+$/, '');
const ogImagePath = content.og?.image || social.og_image_path || '';
const ogImageUrl = /^https?:\/\//.test(ogImagePath)
  ? ogImagePath
  : baseUrl && ogImagePath
    ? `${baseUrl}/${ogImagePath.replace(/^\/+/, '')}`
    : ogImagePath;

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
  og_type: social.og_type || 'article',
  og_site_name: social.og_site_name || cfg.name || '',
  og_url: content.og?.url || baseUrl || '',
  og_description: content.og?.description || social.default_description || content.hero?.subhead || '',
  og_image: ogImageUrl,
  og_image_alt: content.og?.image_alt || social.og_image_alt || cfg.name || '',
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
