// pull-windsor.mjs
// pulls Windsor.ai (Facebook/Meta source) — dados complementares de criativo.
//
// uso: node system/scripts/pull-windsor.mjs --client zerezes --edition 2026-05
//
// ESCOPO (decisao usuario, abril/2026): leitura criativa, NAO leitura de midia.
// nao puxa orcamento/financeiro. puxa apenas metricas que indicam interacao
// criativa: ctr, frequency, video retention, thruplay, link clicks. detalhe
// completo em .claude-memory/reference_tools.md (secao Windsor.ai).
//
// IMPORTANTE: este arquivo nao importa MCP diretamente — passa pelo wrapper
// global.mcp.windsor fornecido pelo ambiente (n8n, claude agent sdk).

import { parseArgs, loadClientConfig, requireArg, writeJson, editionPath, log } from './_shared.mjs';

// metricas Windsor permitidas — espelha decisao em reference_tools.md
export const ALLOWED_FIELDS = [
  'ad_id',
  'ad_name',
  'adset_name',
  'campaign_name',
  'creative_id',
  'date',
  'ctr',
  'frequency',
  'impressions',
  'reach',
  'inline_link_clicks',
  'outbound_clicks',
  'thruplay_actions',
  'video_p25_watched_actions',
  'video_p50_watched_actions',
  'video_p75_watched_actions',
  'video_p100_watched_actions',
];

// metricas explicitamente bloqueadas (orcamento/financeiro). garante que o
// pipeline criativo nunca traga esses campos por engano.
export const FORBIDDEN_FIELDS = new Set([
  'spend', 'cpc', 'cpm', 'cpp', 'cost_per_action_type',
  'roas', 'purchase_roas', 'purchases', 'purchase_value',
  'cost_per_purchase', 'cost_per_thruplay', 'cost_per_inline_link_click',
]);

const args = parseArgs(process.argv);
const slug = requireArg(args, 'client');
const edition = requireArg(args, 'edition');
const cfg = loadClientConfig(slug);

log('windsor', `client=${slug} edition=${edition}`);

const adapter = globalThis.mcp?.windsor;
const snapshot = {
  client: slug,
  edition,
  pulled_at: new Date().toISOString(),
  source: adapter ? 'windsor-mcp' : 'stub',
  fields_requested: ALLOWED_FIELDS,
  fields_blocked: Array.from(FORBIDDEN_FIELDS),
  rows: [],
};

if (adapter) {
  try {
    // edition no formato "YYYY-MM" — converte pra range do mes
    const [y, m] = edition.split('-').map(Number);
    const startDate = `${y}-${String(m).padStart(2, '0')}-01`;
    const endDate = new Date(y, m, 0).toISOString().slice(0, 10); // ultimo dia do mes

    const data = await adapter.get_data({
      connector: 'facebook',
      accounts: cfg.sources?.windsor?.accounts || [],
      fields: ALLOWED_FIELDS,
      date_from: startDate,
      date_to: endDate,
    });

    // safety net: filtra qualquer campo proibido que escape do servidor
    snapshot.rows = (data || []).map((row) => {
      const clean = {};
      for (const [k, v] of Object.entries(row)) {
        if (!FORBIDDEN_FIELDS.has(k)) clean[k] = v;
      }
      return clean;
    });
    log('windsor', `pulled ${snapshot.rows.length} rows for ${startDate}..${endDate}`);
  } catch (e) {
    log('windsor', `error: ${e?.message || e}`);
    process.exit(1);
  }
} else {
  log('windsor', 'mcp adapter not available — writing stub snapshot for dev');
  snapshot.note = 'stub: run from an environment with windsor mcp connected to populate real data';
}

const outPath = editionPath(slug, edition).replace(/\.json$/, '.windsor-snapshot.json');
writeJson(outPath, snapshot);
log('windsor', `wrote ${outPath}`);
