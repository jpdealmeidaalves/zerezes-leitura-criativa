// _thumbnails.mjs
// helper para resolver URLs de thumbnails Motion quando pubUrl/thumbnailUrl vem null.
//
// padrao motionaccountassets (CDN interno motion):
//   https://motionaccountassets.blob.core.windows.net/{workspaceId}/creativeassetfacebook/{subAssetId}/{tipo}
//
// regra empirica observada (abril/2026): subAssetId = parseInt(creativeAssetId.slice(-2), 16) + 1,
// ou seja, o sub-asset eh o ID seguinte ao creative asset principal. Funcionou em Alice Fleury (692b56 -> 692b57)
// e nos inativos 28/04. Em ads < 48h o objeto retorna `ads: []` no get_creative_insights e nao ha
// asset id pra computar — neste caso o consumidor deve usar placeholder CSS.
//
// uso:
//   import { candidateUrls, resolveThumbnail } from './_thumbnails.mjs';
//   const urls = candidateUrls('69e184bfc1fcf964d6f96da9', '692b56', { kind: 'image' });
//   const ok = await resolveThumbnail('69e184bfc1fcf964d6f96da9', '692b56', { kind: 'image' });

const CDN = 'https://motionaccountassets.blob.core.windows.net';

const FILE_BY_KIND = {
  image: 'image.jpg',
  video: 'cover.jpg',
  cover: 'cover.jpg',
  carousel: 'image.jpg',
};

function bumpHexId(id, offset = 1) {
  // creativeAssetId vem como hex curto (ex: "692b56"). soma offset preservando largura.
  const n = parseInt(id, 16);
  if (Number.isNaN(n)) return null;
  return (n + offset).toString(16).padStart(id.length, '0');
}

export function motionAssetUrl(workspaceId, subAssetId, kind = 'image') {
  const file = FILE_BY_KIND[kind] || 'image.jpg';
  return `${CDN}/${workspaceId}/creativeassetfacebook/${subAssetId}/${file}`;
}

export function candidateUrls(workspaceId, creativeAssetId, opts = {}) {
  const kind = opts.kind || 'image';
  const offsets = opts.offsets || [1, 0, 2];
  return offsets
    .map((off) => {
      const sub = off === 0 ? creativeAssetId : bumpHexId(creativeAssetId, off);
      if (!sub) return null;
      return { offset: off, subAssetId: sub, url: motionAssetUrl(workspaceId, sub, kind) };
    })
    .filter(Boolean);
}

export async function resolveThumbnail(workspaceId, creativeAssetId, opts = {}) {
  const candidates = candidateUrls(workspaceId, creativeAssetId, opts);
  if (typeof fetch !== 'function') return { resolved: null, candidates };
  for (const c of candidates) {
    try {
      const res = await fetch(c.url, { method: 'HEAD' });
      if (res.ok) return { resolved: c, candidates };
    } catch {
      // network unavailable / offline — return candidates list anyway
    }
  }
  return { resolved: null, candidates };
}
