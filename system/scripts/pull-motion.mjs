// pull-motion.mjs
// pulls motion.app insights/transcripts/competitors and writes a snapshot.
// in prod, this is invoked from an n8n node that has motion mcp connected.
// in dev, you can run it locally if motion mcp is available in the runtime.
//
// uso: node system/scripts/pull-motion.mjs --client zerezes --edition 2026-05
//
// IMPORTANTE: este arquivo intencionalmente nao importa mcp diretamente.
// mcps sao chamados via um adapter (global.mcp) fornecido pelo ambiente (n8n, claude agent sdk, etc).
// em dev standalone, se global.mcp estiver undefined, o script escreve snapshot stub.

import { parseArgs, loadClientConfig, requireArg, writeJson, editionPath, log } from './_shared.mjs';

const args = parseArgs(process.argv);
const slug = requireArg(args, 'client');
const edition = requireArg(args, 'edition');
const cfg = loadClientConfig(slug);

log('motion', `client=${slug} edition=${edition} workspace=${cfg.sources?.motion?.workspace_id || 'TBD'}`);

const adapter = globalThis.mcp?.motion;
const snapshot = {
  client: slug,
  edition,
  pulled_at: new Date().toISOString(),
  source: adapter ? 'motion-mcp' : 'stub',
  workspace: cfg.sources?.motion?.workspace_id,
  brand_domain: cfg.sources?.motion?.brand_domain,
  workspace_brand: null,
  creatives: [],
  competitors: [],
  reports: [],
};

if (adapter) {
  try {
    snapshot.workspace_brand = await adapter.get_workspace_brand();
    const competitors = await adapter.get_workspace_competitors();
    snapshot.competitors = competitors;
    const reports = await adapter.get_reports({ edition });
    snapshot.reports = reports;
    // populates creatives list in batches; truncate fields to keep snapshot readable
    const creatives = await adapter.get_creative_insights({ edition });
    snapshot.creatives = (creatives || []).map((c) => ({
      id: c.id,
      name: c.name,
      format: c.format,
      spend: c.spend,
      ctr: c.ctr,
      reach: c.reach,
      placement: c.placement,
      thumbnail: c.thumbnail,
    }));
  } catch (e) {
    log('motion', `error: ${e?.message || e} — keeping previous snapshot`);
    process.exit(1);
  }
} else {
  log('motion', 'mcp adapter not available — writing stub snapshot for dev');
  snapshot.note = 'stub: run from an environment with motion mcp connected to populate real data';
}

const outPath = editionPath(slug, edition).replace(/\.json$/, '.motion-snapshot.json');
writeJson(outPath, snapshot);
log('motion', `wrote ${outPath}`);
