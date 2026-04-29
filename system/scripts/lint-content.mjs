// lint-content.mjs
// valida content/<edition>.json contra:
//   1. cfg.voice.forbidden — vocabulario proibido (bestseller, drop, hype, etc)
//   2. typos conhecidos — "The Simple Gyn" -> "The Simple Gym", etc.
//
// uso:
//   node system/scripts/lint-content.mjs --client zerezes --edition 2026-05
//
// retorna exit code 1 se achar erros (fail-fast pro build.mjs).
// retorna 0 se limpo. avisos (warnings) nao falham, so loggam.

import { parseArgs, loadClientConfig, requireArg, readJson, editionPath, log } from './_shared.mjs';
import { existsSync } from 'node:fs';

// typos conhecidos com correcao sugerida. mantem como dado, nao em config —
// sao patterns globais (todo cliente sofre disso). config tem o forbidden por marca.
export const KNOWN_TYPOS = [
  { pattern: /\bThe Simple Gyn\b/g, suggest: 'The Simple Gym', severity: 'error' },
  { pattern: /\bbest[- ]?seller(s)?\b/gi, suggest: 'classicos', severity: 'error', note: 'vocabulario zerezes' },
];

function walkStrings(node, path = '') {
  const out = [];
  if (typeof node === 'string') {
    out.push({ path, value: node });
  } else if (Array.isArray(node)) {
    node.forEach((v, i) => out.push(...walkStrings(v, `${path}[${i}]`)));
  } else if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) {
      out.push(...walkStrings(v, path ? `${path}.${k}` : k));
    }
  }
  return out;
}

function buildForbiddenChecks(cfg) {
  const list = cfg.voice?.forbidden || [];
  return list.map((term) => ({
    pattern: new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi'),
    term,
    severity: 'error',
    note: 'voice.forbidden',
  }));
}

export function lintContent(slug, edition, opts = {}) {
  const cfg = opts.cfg || loadClientConfig(slug);
  const path = opts.contentPath || editionPath(slug, edition);
  if (!existsSync(path)) {
    return { errors: 0, warnings: 0, issues: [], skipped: true, reason: `content not found: ${path}` };
  }
  const content = readJson(path);
  const strings = walkStrings(content);

  const checks = [
    ...buildForbiddenChecks(cfg),
    ...KNOWN_TYPOS.map((t) => ({ ...t, term: t.pattern.source })),
  ];

  const issues = [];
  for (const s of strings) {
    for (const check of checks) {
      check.pattern.lastIndex = 0;
      let m;
      while ((m = check.pattern.exec(s.value)) !== null) {
        issues.push({
          jsonPath: s.path,
          match: m[0],
          severity: check.severity,
          suggest: check.suggest || null,
          note: check.note || null,
        });
        if (!check.pattern.global) break;
      }
    }
  }

  const errors = issues.filter((i) => i.severity === 'error').length;
  const warnings = issues.filter((i) => i.severity !== 'error').length;
  return { errors, warnings, issues, skipped: false };
}

// CLI entry point — only runs when invoked directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = parseArgs(process.argv);
  const slug = requireArg(args, 'client');
  const edition = requireArg(args, 'edition');
  const result = lintContent(slug, edition);

  if (result.skipped) {
    log('lint', `skipped — ${result.reason}`);
    process.exit(0);
  }

  for (const i of result.issues) {
    const tag = i.severity === 'error' ? 'ERROR' : 'warn';
    const sug = i.suggest ? ` -> "${i.suggest}"` : '';
    const note = i.note ? ` [${i.note}]` : '';
    log('lint', `${tag} ${i.jsonPath}: "${i.match}"${sug}${note}`);
  }
  log('lint', `done — ${result.errors} error(s), ${result.warnings} warning(s)`);
  process.exit(result.errors > 0 ? 1 : 0);
}
