// deploy-check.mjs
// valida o ultimo deploy via vercel mcp e retorna a url publica.
//
// uso: node system/scripts/deploy-check.mjs --client zerezes

import { parseArgs, loadClientConfig, requireArg, log } from './_shared.mjs';

const args = parseArgs(process.argv);
const slug = requireArg(args, 'client');
const cfg = loadClientConfig(slug);
const projectId = cfg.sources?.vercel?.project_id;
const productionDomain = cfg.sources?.vercel?.production_domain;

log('deploy', `client=${slug} project=${projectId}`);

const adapter = globalThis.mcp?.vercel;

if (!adapter) {
  log('deploy', 'vercel mcp adapter not available — skipping check.');
  log('deploy', `expected production url: https://${productionDomain || 'UNKNOWN'}`);
  process.exit(0);
}

try {
  const deployments = await adapter.list_deployments({ project: projectId, limit: 5 });
  const latest = deployments?.[0];
  if (!latest) {
    console.error('no deployments found');
    process.exit(1);
  }
  log('deploy', `latest: id=${latest.id} state=${latest.state} created=${latest.createdAt}`);
  if (latest.state === 'ERROR') {
    const logs = await adapter.get_deployment_build_logs({ id: latest.id });
    console.error('build failed:', logs);
    process.exit(1);
  }
  if (latest.state !== 'READY') {
    log('deploy', `state=${latest.state} — not ready yet. retry.`);
    process.exit(2);
  }

  // hit root url
  const url = `https://${productionDomain}`;
  const res = await fetch(url);
  if (!res.ok) {
    console.error(`${url} -> HTTP ${res.status}`);
    process.exit(1);
  }
  log('deploy', `ok :: ${url} -> ${res.status}`);
} catch (e) {
  console.error(`error: ${e?.message || e}`);
  process.exit(1);
}
