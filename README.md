# zerezes :: leitura criativa

Relatórios editoriais qualitativos de performance criativa em mídia paga (Meta Ads), Zerezes × concorrentes.

## Estrutura

- `index.html` — versão publicada (última rodada, entregue no Vercel)
- `files/` — histórico versionado de rodadas (`report-v3-editavel.html`, `report-v4.html`, ...)
- `zerezes-imgs/` — assets visuais (product shots da coleção, banners, estáticas high-res do Drive, thumbnails de creators puxados do Motion)
- `.claude-memory/` — memória da sessão Claude (vocabulário Zerezes, workflow, ativações, referências)

## Stack

- HTML estático + CSS inline (DM Sans + DM Serif Display)
- Hospedagem: Vercel (deploy automático a cada push)
- Fontes de dados: Motion.app MCP (dados + concorrentes HD), Google Drive MCP (estáticas high-res Zerezes)

## Rodadas

| Versão | Recorte | Destaques |
|---|---|---|
| v3 | abril/2026 (inicial) | 9 seções, sem copy analysis |
| v4 | 1–15 abril/2026 | +seção palavras (copy), +boas práticas Meta, +Fuel, clássicos (ex-bestsellers), wireframe anatomia, mockup "prazer, lena", 7 concorrentes |

## Convenções

- Vocabulário Zerezes: **clássicos** (não "bestsellers"), nome próprio da coleção é **Grau26**.
- Ativações marcadas como "entrantes" recebem badge laranja discreto.
- Imagens referenciam `zerezes-imgs/*` (absoluto a partir da raiz do site).
