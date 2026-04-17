---
name: reference_tools
description: ferramentas conectadas para dados Meta Ads — Motion.app MCP, Windsor.ai, n8n; IDs de workspace Zerezes
type: reference
originSessionId: 8b9dedd7-288a-4aff-aa99-b49105cdff31
---
Integrações disponíveis para puxar dados de Meta Ads da conta Zerezes:

**Motion.app MCP** — principal fonte qualitativa.
- Workspace: `69e17b791615e8ee9b4174c8` (Zerezes)
- Org: `69e17acb2a78fe07044808f0` (Zerezes beta teste)
- GoalMetric configurado: **CTR** | spendThreshold: R$2.496,95
- Tools úteis: `get_creative_insights` (ads próprios + thumbnails), `get_inspo_creatives` (ad library concorrentes), `get_workspace_competitors`, `search_brands`, `get_creative_transcript`, `get_glossary_values`.
- Creative insights volta payload grande — se exceder limite do token, o arquivo é salvo em `tool-results/` e pode ser parseado com Python/jq.
- Thumbnails Zerezes vêm de `motionaccountassets.blob.core.windows.net` (CDN interno, acessível publicamente via URL completa).
- Inspo creatives dos concorrentes vêm de `motionswipefile.blob.core.windows.net`.

**Brand IDs resolvidos no Motion:**
- Warby Parker: `66c37cf3b822dc1089922786`
- Oakley: `66cf7809da161d103f983731`
- Chilli Beans: `67377e5d7850d1eb297e49ac`
- Ace & Tate: `66e9b3a5aa0d5e909815863f`
- LIVO: `691479bf9d1e7c01b7d4b7ec`
- Óticas Carol: `67fe63a754b74a69321331fd`
- Ray-Ban Meta: `67059881f21f9b4f9ef4f89c`

**Windsor.ai** — conector para dados complementares de ad set/criativo (Facebook/Meta). Use quando precisar de métricas que o Motion não expõe. Nota: campos `roas` e `purchases` não são válidos no `get_data` do Windsor com source=facebook — usar `spend`, `ctr`, `impressions` etc.

**n8n** — já disponível no stack do usuário para fluxos de dados (ex.: exportar Motion → processar → enviar). Usuário descartou Motion.app puro por custo; considerou MagicBrief mas não tem MCP nativo.
