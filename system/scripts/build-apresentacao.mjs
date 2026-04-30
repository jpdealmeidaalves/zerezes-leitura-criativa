// build-apresentacao.mjs
// gera o "Book Digital — Fechamento Mensal · Mídia" a partir do content/<edicao>.json.
//
// uso:
//   node system/scripts/build-apresentacao.mjs --client zerezes --edition 2026-04
//   node system/scripts/build-apresentacao.mjs --client zerezes --edition 2026-04 --estilo fechamento-mensal --janela maio
//
// saida: apresentacoes/<edicao>/midia-<estilo>.html
// versao PDF: print do navegador (Save as PDF).

import { parseArgs, loadClientConfig, requireArg, readJson, log, SYSTEM_ROOT, REPO_ROOT } from './_shared.mjs';
import { lintContent } from './lint-content.mjs';
import { renderApresentacao } from './_render-apresentacao.mjs';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const args = parseArgs(process.argv);
const slug = requireArg(args, 'client');
const edition = requireArg(args, 'edition');
const estilo = args.estilo || 'fechamento-mensal';
const janela = args.janela || 'maio';

const cfg = loadClientConfig(slug);
const contentPath = join(SYSTEM_ROOT, 'clients', slug, 'content', `${edition}.json`);
if (!existsSync(contentPath)) {
  console.error(`content not found: ${contentPath}`);
  console.error('rode "node system/scripts/extract-april.mjs" para abril ou "draft-content.mjs" para edicoes futuras');
  process.exit(1);
}
const content = readJson(contentPath);

// -- editorial lint (mesma regra do build editorial) --
const lint = lintContent(slug, edition, { cfg, contentPath });
if (!lint.skipped) {
  for (const i of lint.issues) {
    const tag = i.severity === 'error' ? 'ERROR' : 'warn';
    const sug = i.suggest ? ` -> "${i.suggest}"` : '';
    const note = i.note ? ` [${i.note}]` : '';
    log('lint', `${tag} ${i.jsonPath}: "${i.match}"${sug}${note}`);
  }
  if (lint.errors > 0) {
    console.error(`build aborted: ${lint.errors} editorial lint error(s).`);
    process.exit(1);
  }
}

// -- carrega template --
const templateName = `apresentacao-${estilo}.template.html`;
const templatePath = join(SYSTEM_ROOT, 'template', templateName);
if (!existsSync(templatePath)) {
  console.error(`template not found: ${templatePath}`);
  console.error(`estilos disponiveis: fechamento-mensal`);
  process.exit(1);
}
const template = readFileSync(templatePath, 'utf8');

// -- paleta + fontes da APRESENTACAO (presentation > brand) --
const presentation = cfg.presentation || {};
const palette = presentation.palette || cfg.brand?.palette || {};
const fonts = presentation.fonts || cfg.brand?.fonts || { sans: 'Plus Jakarta Sans', serif: 'Plus Jakarta Sans' };

function paletteToCssVars(p) {
  return Object.entries(p)
    .map(([k, v]) => `  --${k.replace(/_/g, '-')}: ${v};`)
    .join('\n');
}

const fontsUrl = (() => {
  const sans = encodeURIComponent(fonts.sans || 'Plus Jakarta Sans');
  return `https://fonts.googleapis.com/css2?family=${sans}:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&display=swap`;
})();

// -- render das secoes --
const sections = renderApresentacao(content, {
  clientName: cfg.name || 'zerezes',
  period: content.period || '',
});

// -- monta ctx --
const ctx = {
  title: `${cfg.name} — ${content.title || `fechamento mensal ${edition}`}`,
  cover_title: content.title || `fechamento mensal · ${edition}`,
  client_name: cfg.name || 'zerezes',
  period: content.period || edition,
  next_window: janela,
  css_vars: paletteToCssVars(palette),
  fonts_url: fontsUrl,
  font_sans: fonts.sans || 'Plus Jakarta Sans',
  ...sections,
};

// -- placeholder resolver simples --
function render(tpl, c) {
  return tpl.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (m, key) => {
    const v = key.split('.').reduce((o, k) => (o == null ? o : o[k]), c);
    return v == null ? '' : String(v);
  });
}

const html = render(template, ctx);

// -- write output --
const outDir = join(REPO_ROOT, 'apresentacoes', edition);
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, `midia-${estilo}.html`);
writeFileSync(outPath, html, 'utf8');
log('apresentacao', `wrote ${outPath}`);
log('apresentacao', `abrir no navegador, conferir, e Print > Save as PDF para exportar`);
