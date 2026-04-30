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
- Creative insights volta payload grande — se exceder limite do token, o arquivo é salvo em `tool-results/` e pode ser parseado com jq.
- **Protocolo obrigatório:** sempre chamar `get_creative_insights` com `insightType=SPEND` primeiro — retorna `goalMetric` e `spendThreshold` necessários para interpretar chamadas seguintes (SCALING, HOOK etc.).

**Thumbnails dos ads próprios Zerezes — dois caminhos:**

1. **`motionswipefile` via `get_inspo_creatives`** (preferencial para ads confirmados) — brand ID público da Zerezes: `66f6b95baa0d5e90982cfbf9`. Retorna todos os ads ativos em alta resolução. CDN: `motionswipefile.blob.core.windows.net`.

2. **`motionaccountassets` (CDN interno Motion)** — aparece quando o swipe file não tem o ad. URL base:
   `https://motionaccountassets.blob.core.windows.net/69e184bfc1fcf964d6f96da9/creativeassetfacebook/{SUB_ASSET_ID}/{TIPO}`
   - Imagem: `{SUB_ASSET_ID}/image.jpg` — sub-asset ID é tipicamente o ID seguinte ao do creative asset principal (ex: asset=`692b56`, imagem em `692b57/image.jpg`)
   - Vídeo cover: `{VIDEO_ASSET_ID}/cover.jpg`
   - Carrossel 1ª card: ID seguinte ao creative asset ID, `/image.jpg`
   - **Atenção:** ads muito novos (< ~48h) retornam `ads: []` no `get_creative_insights` — nenhum thumbnail disponível. Usar placeholder e aguardar indexação.

**Brand IDs resolvidos no Motion (workspace competitors):**
- Warby Parker: `66c37cf3b822dc1089922786`
- Oakley: `66cf7809da161d103f983731`
- Chilli Beans: `67377e5d7850d1eb297e49ac`
- Ace & Tate: `66e9b3a5aa0d5e909815863f`
- LIVO: `691479bf9d1e7c01b7d4b7ec`
- Óticas Carol: `67fe63a754b74a69321331fd`
- Ray-Ban Meta: `67059881f21f9b4f9ef4f89c`
- Zerezes (própria): `66f6b95baa0d5e90982cfbf9`

**Inspo creatives dos concorrentes** vêm de `motionswipefile.blob.core.windows.net`. Para puxar ativos do último mês: `get_inspo_creatives(brandIds=[...], launchDate="LAST_30_DAYS", status="ACTIVE")`.

**Windsor.ai** — conector para dados complementares de ad set/criativo (Facebook/Meta). Use quando precisar de métricas que o Motion não expõe.

**Escopo definido (decisão usuário, abril/2026):** este projeto é leitura **criativa**, não de mídia. **Não puxar** dados de orçamento/financeiro: `spend`, `cpc`, `cpm`, `roas`, `purchases`, `cost_per_*`. **Puxar** apenas métricas que indicam interação criativa:
- `ctr` (click-through rate)
- `frequency` (frequência média por usuário)
- `video_p25/p50/p75/p100_watched_actions` (retenção de vídeo)
- `thruplay_actions`
- `inline_link_clicks`, `outbound_clicks`
- `impressions` e `reach` (denominadores, não foco)
- breakdowns: `placement`, `age`, `gender` quando relevante para leitura criativa

**Dimensões:** `ad_id`, `ad_name`, `adset_name`, `campaign_name`, `creative_id`, `date`.

Nota antiga (mantida): campos `roas`/`purchases` não são válidos no `get_data` do Windsor com source=facebook de qualquer forma.

**n8n** — já disponível no stack do usuário para fluxos de dados (ex.: exportar Motion → processar → enviar). Usuário descartou Motion.app puro por custo; considerou MagicBrief mas não tem MCP nativo.
