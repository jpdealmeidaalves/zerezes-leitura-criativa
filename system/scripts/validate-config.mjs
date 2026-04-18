// validate-config.mjs
// valida config de cliente contra schema + regras extras (contraste aa, presenca de campos criticos)
//
// uso: node system/scripts/validate-config.mjs --client zerezes

import { parseArgs, loadClientConfig, requireArg, contrastRatio, log, SYSTEM_ROOT } from './_shared.mjs';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const args = parseArgs(process.argv);
const slug = requireArg(args, 'client');
const cfg = loadClientConfig(slug);

let errors = 0;
let warnings = 0;
const err = (m) => { errors++; console.error(`  x ${m}`); };
const warn = (m) => { warnings++; console.warn(`  ! ${m}`); };
const ok = (m) => console.log(`  . ${m}`);

log('validate', `client = ${slug}`);

// -- schema-ish checks (no ajv, keep deps zero) --
['slug', 'name', 'brand', 'sources', 'competitors', 'voice'].forEach((k) => {
  if (!cfg[k]) err(`missing required field: ${k}`);
  else ok(`has ${k}`);
});

if (cfg.slug !== slug) err(`config.slug (${cfg.slug}) does not match --client (${slug})`);

// -- brand kit: contrast aa --
const pal = cfg.brand?.palette || {};
const bg = pal.creme || pal.bg || pal.background;
const accent = pal.laranja || pal.accent;
const accentDark = cfg.brand?.accent_usage?.dark_variant;
if (!bg || !accent) {
  err('palette needs at least a bg and an accent color');
} else {
  const r = contrastRatio(accent, bg);
  if (r < 3.0) warn(`accent vs bg contrast = ${r.toFixed(2)}:1 — must be used only in large decorative text (>= 24px). check accent_usage.dark_variant is defined.`);
  else ok(`accent vs bg contrast = ${r.toFixed(2)}:1`);

  if (accentDark) {
    const r2 = contrastRatio(accentDark, bg);
    if (r2 < 4.5) err(`accent_usage.dark_variant vs bg = ${r2.toFixed(2)}:1 — fails AA for small text (needs >= 4.5:1)`);
    else ok(`dark_variant contrast = ${r2.toFixed(2)}:1 (AA pass)`);
  } else {
    warn('accent_usage.dark_variant not set — if accent contrast < 4.5:1, small labels will fail AA');
  }
}

// -- competitors --
if (!Array.isArray(cfg.competitors) || cfg.competitors.length < 3) {
  err('competitors: need at least 3 to produce meaningful section 05');
} else {
  ok(`competitors: ${cfg.competitors.length}`);
}

// -- sources presence --
const sources = cfg.sources || {};
['motion', 'drive', 'vercel', 'github'].forEach((s) => {
  if (!sources[s]) warn(`sources.${s} missing — fluxos que dependem dele falharão`);
});

// -- voice --
if (!cfg.voice?.tone) warn('voice.tone missing — brand-voice skill usará defaults');

// -- content dir --
const contentDir = join(SYSTEM_ROOT, 'clients', slug, 'content');
if (!existsSync(contentDir)) warn(`content/ dir does not exist yet — ok for first-time setup`);

console.log('');
log('validate', `${errors} errors, ${warnings} warnings`);
process.exit(errors > 0 ? 1 : 0);
