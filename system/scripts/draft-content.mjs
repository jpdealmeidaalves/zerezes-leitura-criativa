// draft-content.mjs
// consome motion-snapshot + drive manifest e gera o rascunho de content/<edition>.json
// com as secoes evidence-based pre-preenchidas. secoes editoriais ficam como stubs
// marcados com TODO para revisao humana.
//
// uso: node system/scripts/draft-content.mjs --client zerezes --edition 2026-05

import { parseArgs, loadClientConfig, requireArg, writeJson, readJson, editionPath, clientPath, log } from './_shared.mjs';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const args = parseArgs(process.argv);
const slug = requireArg(args, 'client');
const edition = requireArg(args, 'edition');
const cfg = loadClientConfig(slug);

const snapshotPath = editionPath(slug, edition).replace(/\.json$/, '.motion-snapshot.json');
const driveManifestPath = join(clientPath(slug, 'assets', edition), '_manifest.json');

const snapshot = existsSync(snapshotPath) ? readJson(snapshotPath) : null;
const drive = existsSync(driveManifestPath) ? readJson(driveManifestPath) : null;

if (!snapshot) log('draft', `warning: no motion snapshot at ${snapshotPath} — draft will have empty evidence sections`);
if (!drive) log('draft', `warning: no drive manifest at ${driveManifestPath} — assets references empty`);

const creatives = snapshot?.creatives || [];

// aggregators (will produce auto-filled numbers for evidence sections)
const bySpend = [...creatives].sort((a, b) => (b.spend || 0) - (a.spend || 0));
const byCtr = [...creatives].sort((a, b) => (b.ctr || 0) - (a.ctr || 0));
const totalSpend = creatives.reduce((s, c) => s + (c.spend || 0), 0);

const draft = {
  client: slug,
  edition,
  generated_at: new Date().toISOString(),
  title: `leitura criativa :: ${edition}`,
  period: `TODO: define periodo exato da edicao (ex: "01 — 15 ${edition}")`,
  hero: {
    headline: 'TODO: headline editorial do mes (humano escreve)',
    subhead: `meta ads :: ${cfg.name} · ${cfg.competitors?.length || 0} marcas analisadas`,
    scope_note: 'TODO: nota de escopo — o que esta dentro e fora desta rodada',
  },
  sections: {
    resumo: {
      evidence_based: true,
      lead: 'TODO: paragrafo abrindo o mes — o humano escreve com base nos numeros abaixo',
      highlights: [
        { label: 'o que funcionou', title: `top asset por spend: ${bySpend[0]?.name || 'TBD'}`, body: 'TODO: narrativa editorial' },
        { label: 'surpresa positiva', title: `top asset por CTR: ${byCtr[0]?.name || 'TBD'}`, body: 'TODO: narrativa editorial' },
        { label: 'grande oportunidade', title: 'TODO: humano preenche', body: 'TODO' },
        { label: 'mercado', title: 'TODO: humano preenche', body: 'TODO' },
      ],
    },
    tese: {
      evidence_based: false,
      editorial: 'TODO: tese editorial do mes — 1 paragrafo + 1 pull quote',
      pullquote: 'TODO: quote com nomes de modelos/personas em DM Serif Display italico',
    },
    funil: {
      evidence_based: true,
      total_spend: totalSpend,
      topo: bySpend.filter((c) => /topo|prospec|alcance/i.test(c.placement || '')).slice(0, 6),
      meio: bySpend.filter((c) => /meio|sim97|sim98|sim99/i.test(c.placement || '')).slice(0, 6),
      fundo: bySpend.filter((c) => /fundo|rtg|retar|catalog/i.test(c.placement || '')).slice(0, 6),
      commentary: 'TODO: humano interpreta o split (onde esta funcionando, onde tem buraco)',
    },
    heatmap: {
      evidence_based: true,
      rows: (cfg.collections || []).map((col) => ({ cluster: col.name, status: col.status, coverage: { topo: 'TBD', meio: 'TBD', fundo: 'TBD', persona: 'TBD' } })),
      commentary: 'TODO: leitura do mapa — onde tem vazio e o que produzir',
    },
    colecao: {
      evidence_based: true,
      collections: cfg.collections || [],
      commentary: 'TODO: como cada colecao se comportou este mes',
    },
    mercado: {
      evidence_based: false,
      competitors: (cfg.competitors || []).map((c) => ({
        slug: c.slug,
        name: c.name,
        thesis: c.thesis,
        this_month: 'TODO: o que essa marca disse de novo este mes (humano)',
        assets: [],
      })),
    },
    palavras: {
      evidence_based: false,
      rows: 'TODO: tabela comparativa de copy/headline entre marcas',
    },
    anatomia: {
      evidence_based: false,
      template: 'TODO: revisar se anatomia do mes anterior ainda vale',
    },
    apostas: {
      evidence_based: false,
      bets: 'TODO: 5-7 apostas concretas para o mes seguinte',
    },
    checklist: {
      evidence_based: false,
      items: 'TODO: derivado de apostas',
    },
    outras_frentes: {
      evidence_based: false,
      note: 'TODO: coberturas secundarias (colecoes fora do foco central)',
    },
  },
  _sources: {
    motion_snapshot: snapshotPath,
    drive_manifest: driveManifestPath,
  },
};

const outPath = editionPath(slug, edition);
writeJson(outPath, draft);
log('draft', `wrote ${outPath}`);
log('draft', `next: abrir ${outPath} e substituir TODOs das secoes editoriais (01, 05-10)`);
