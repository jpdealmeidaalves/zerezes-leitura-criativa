// generate-canva.mjs
// gera artefatos canva complementares: capa pdf, deck 16:9, mockups de apostas.
//
// uso: node system/scripts/generate-canva.mjs --client zerezes --edition 2026-05 --kind capa-pdf,deck

import { parseArgs, loadClientConfig, requireArg, readJson, writeJson, editionPath, log, REPO_ROOT } from './_shared.mjs';
import { mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const args = parseArgs(process.argv);
const slug = requireArg(args, 'client');
const edition = requireArg(args, 'edition');
const kinds = (args.kind || 'capa-pdf,deck').split(',');
const cfg = loadClientConfig(slug);
const contentPath = editionPath(slug, edition);
const content = existsSync(contentPath) ? readJson(contentPath) : null;

const adapter = globalThis.mcp?.canva;
if (!adapter) {
  log('canva', 'canva mcp adapter not available — writing manifest stub');
}

const outDir = join(REPO_ROOT, 'dist', slug, edition, 'canva');
mkdirSync(outDir, { recursive: true });
const manifest = { client: slug, edition, kinds, generated: [] };

for (const kind of kinds) {
  log('canva', `generating ${kind}`);
  if (!adapter) {
    manifest.generated.push({ kind, status: 'stub' });
    continue;
  }
  try {
    let design;
    if (kind === 'capa-pdf') {
      design = await adapter['generate-design']({
        prompt: `Editorial cover for "${content?.title || `leitura criativa ${edition}`}", brand: ${cfg.name}, palette: ${JSON.stringify(cfg.brand?.palette)}, font serif: ${cfg.brand?.fonts?.serif}, tagline: "${cfg.tagline || ''}", mood: editorial magazine, minimal typography`,
        size: 'A4_portrait',
        brand_kit_id: cfg.sources?.canva?.brand_kit_id,
      });
    } else if (kind === 'deck') {
      design = await adapter['generate-design-structured']({
        prompt: `10-slide executive deck of the creative reading. Cover + sections: resumo, tese, funil, heatmap, mercado, anatomia, apostas, checklist, fechamento. Brand ${cfg.name}.`,
        size: 'presentation_16_9',
        brand_kit_id: cfg.sources?.canva?.brand_kit_id,
        pages: 10,
      });
    } else if (kind === 'mockup-apostas') {
      for (const persona of (cfg.personas || [])) {
        const p = await adapter['generate-design']({
          prompt: `Feed post 1080x1350, persona ${persona.name} (${persona.role}), model "${persona.model}", headline "prazer, ${persona.model}" with serif italic in accent color, brand ${cfg.name}`,
          size: 'instagram_post',
          brand_kit_id: cfg.sources?.canva?.brand_kit_id,
        });
        manifest.generated.push({ kind: 'mockup-apostas', persona: persona.name, design_id: p.id });
      }
      continue;
    } else {
      log('canva', `unknown kind: ${kind}`);
      continue;
    }
    const exported = await adapter['export-design']({ design_id: design.id, format: kind === 'deck' ? 'pptx' : 'pdf' });
    manifest.generated.push({ kind, design_id: design.id, export_url: exported.url });
  } catch (e) {
    log('canva', `error in ${kind}: ${e?.message || e}`);
    manifest.generated.push({ kind, status: 'error', error: String(e) });
  }
}

writeJson(join(outDir, '_manifest.json'), manifest);
log('canva', `manifest at ${join(outDir, '_manifest.json')}`);
