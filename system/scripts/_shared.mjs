// shared helpers used by all scripts
// intentionally zero dependencies — runs on vanilla node 18+

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
export const SYSTEM_ROOT = resolve(dirname(__filename), '..');
export const REPO_ROOT = resolve(SYSTEM_ROOT, '..');

export function parseArgs(argv) {
  const out = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith('--')) {
        out[key] = next;
        i++;
      } else {
        out[key] = true;
      }
    }
  }
  return out;
}

export function loadClientConfig(slug) {
  const p = join(SYSTEM_ROOT, 'clients', slug, 'config.json');
  if (!existsSync(p)) throw new Error(`config not found: ${p}`);
  return JSON.parse(readFileSync(p, 'utf8'));
}

export function clientPath(slug, ...parts) {
  return join(SYSTEM_ROOT, 'clients', slug, ...parts);
}

export function editionPath(slug, edition, ...parts) {
  return join(SYSTEM_ROOT, 'clients', slug, 'content', ...parts.length ? parts : [`${edition}.json`]);
}

export function writeJson(path, data) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

export function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

export function log(tag, msg) {
  const stamp = new Date().toISOString().split('T')[1].slice(0, 8);
  console.log(`[${stamp}] ${tag} :: ${msg}`);
}

export function requireArg(args, name) {
  if (!args[name]) {
    console.error(`missing --${name}`);
    process.exit(2);
  }
  return args[name];
}

// contrast ratio per WCAG 2.1, for AA validation in build step
export function contrastRatio(hexA, hexB) {
  const lum = (hex) => {
    const c = hex.replace('#', '');
    const r = parseInt(c.slice(0, 2), 16) / 255;
    const g = parseInt(c.slice(2, 4), 16) / 255;
    const b = parseInt(c.slice(4, 6), 16) / 255;
    const srgb = [r, g, b].map((v) =>
      v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
    );
    return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
  };
  const L1 = lum(hexA);
  const L2 = lum(hexB);
  return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
}
