---
name: reference_drive
description: Google Drive do usuário — estrutura das pastas de criativos Zerezes e padrão de nomenclatura; MCP do Drive funciona nesta conta
type: reference
originSessionId: 8b9dedd7-288a-4aff-aa99-b49105cdff31
---
**Drive do usuário acessível via MCP** (`mcp__f45f2440-...`). Busca por `title contains` funciona; `parents in` NÃO é suportado pelo search.

**Pasta mãe ABRIL 2026:** `168SMrJcE784VO1vCLXEMrFG-0368Pmml` — criada/mantida por `gabriela.martins@zerezes.com.br`, compartilhada com o usuário.

**Convenção de nomenclatura dos estáticos:**
`midia_{produto}_{tipo}_{etapa}_{formato}_{variante}.jpg`
- produto: `grau26`, `sport_AON`, etc.
- tipo: `discovery`, `awareness`
- etapa: `topo`, `meio`, `fundo`
- formato: `1080x1350` (feed 4:5), `1080x1920` (story/reels 9:16), `1200x628` (feed paisagem), `1200x1200` (feed 1:1)
- variante: `1`, `2`, `3`, `4` ou `step_1`, `step_2`...

Exemplos confirmados:
- `midia_grau26_discovery_meio_1080x1350_1.jpg`
- `midia_grau26_discovery_fundo_1200x628_3.jpg`
- `midia_sport_AON_topo_awareness_1080x1920_step_4.jpg`

**Onde os creators (Rafaela, Rodrigo Bez, Giorgia, MouraJo, Alice Fleury) NÃO estão:** não na pasta ABRIL 2026. Buscas por `Rafaela`, `Rodrigo`, `Amorim`, `Bez`, `creator` não retornam conteúdo deles em abril. Provavelmente em outra pasta (pedir ao usuário) ou entregues fora do Drive (WhatsApp/link direto do creator).

**How to apply:**
- Ao montar uma leitura criativa, buscar no Drive os estáticos via `title contains 'grau26_discovery_meio'` (ou o produto/etapa específica) — entrega alta resolução pronta.
- Para usar como `<img src>` numa leitura, ou baixar via `download_file_content` para `zerezes-imgs/`, ou usar o endpoint `https://lh3.googleusercontent.com/d/{FILE_ID}` (requer compartilhamento público).
- Sempre confirmar com o usuário antes de baixar muitos arquivos — a pasta ABRIL 2026 tem dezenas.
