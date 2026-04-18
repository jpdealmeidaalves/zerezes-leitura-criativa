// pull-drive.mjs
// finds monthly folder in google drive using client config pattern and downloads hi-res assets.
//
// uso: node system/scripts/pull-drive.mjs --client zerezes --edition 2026-05
//
// edition format: YYYY-MM
// monthly_folder_pattern in config determines how we search:
//   "{MES_UPPER} {ANO}" for edition 2026-05 => "MAIO 2026"

import { parseArgs, loadClientConfig, requireArg, writeJson, clientPath, log, SYSTEM_ROOT } from './_shared.mjs';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const MESES = ['janeiro', 'fevereiro', 'marco', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

function resolveFolderName(pattern, edition) {
  const [ano, mes] = edition.split('-');
  const mesNome = MESES[parseInt(mes, 10) - 1];
  return pattern
    .replace('{MES_UPPER}', mesNome.toUpperCase())
    .replace('{MES_LOWER}', mesNome)
    .replace('{ANO}', ano)
    .replace('{MM}', mes);
}

const args = parseArgs(process.argv);
const slug = requireArg(args, 'client');
const edition = requireArg(args, 'edition');
const cfg = loadClientConfig(slug);

const folderName = resolveFolderName(cfg.sources?.drive?.monthly_folder_pattern || '{MES_UPPER} {ANO}', edition);
const rootFolderId = cfg.sources?.drive?.root_folder_id;

log('drive', `client=${slug} edition=${edition} folder="${folderName}" root=${rootFolderId}`);

const adapter = globalThis.mcp?.drive;
const outDir = clientPath(slug, 'assets', edition);
mkdirSync(outDir, { recursive: true });

const manifest = {
  client: slug,
  edition,
  pulled_at: new Date().toISOString(),
  source: adapter ? 'drive-mcp' : 'stub',
  folder_name: folderName,
  files: [],
};

if (adapter) {
  try {
    const folder = await adapter.search_files({ query: folderName, parent: rootFolderId, mime: 'application/vnd.google-apps.folder' });
    if (!folder || !folder.length) throw new Error(`folder not found: ${folderName}`);
    const folderId = folder[0].id;
    const files = await adapter.list_recent_files({ folder: folderId, limit: 200 });
    for (const f of files) {
      const buf = await adapter.download_file_content({ id: f.id });
      const local = join(outDir, f.name);
      writeFileSync(local, Buffer.from(buf));
      manifest.files.push({ id: f.id, name: f.name, size: f.size, modified: f.modifiedTime, local_path: local });
    }
  } catch (e) {
    log('drive', `error: ${e?.message || e}`);
    process.exit(1);
  }
} else {
  log('drive', 'mcp adapter not available — stub manifest only');
  manifest.note = 'stub: connect drive mcp to populate';
}

writeJson(join(outDir, '_manifest.json'), manifest);
log('drive', `wrote manifest with ${manifest.files.length} files to ${outDir}`);
