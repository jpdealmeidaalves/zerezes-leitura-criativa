---
name: project_pipeline_leituras
description: formato e escopo da entrega "leitura criativa" — HTML editorial mensal Zerezes × concorrentes
type: project
originSessionId: 8b9dedd7-288a-4aff-aa99-b49105cdff31
---
Entregável recorrente: **"leitura criativa"** — HTML editorial de análise qualitativa de Meta Ads, Zerezes × concorrentes, por recorte temporal (mensal ou quinzenal).

**Consumidores:** times de criação & comunicação + studio (não mídia). Usado para briefar produção de creatives do mês seguinte.

**Concorrentes monitorados (6):** Warby Parker (referência editorial), Oakley (tech/esporte), Ace & Tate (irreverente, mais próxima em tom à Zerezes), Chilli Beans (BR, foco franquia), LIVO (BR, fragmentada), Óticas Carol (BR, funcional/preço). Rayban e Lapima foram pedidos mas ficaram de fora no v3/v4 — próxima rodada pode incluir. Brand IDs resolvidos via Motion MCP estão no workspace competitors + buscas adicionais.

**Protocolo Motion MCP (obrigatório em toda rodada):**
1. `get_creative_insights(insightType=SPEND, datePreset=CUSTOM, startDate=..., endDate=...)` — **sempre primeiro**. Retorna `goalMetric` (CTR) e `spendThreshold` necessários para interpretar as outras chamadas.
2. Depois: SCALING e HOOK na mesma sessão para cross-reference.
3. Para thumbnails de ads próprios recentes (< ~48h): `pubUrl`/`thumbnailUrl` podem ser `null` — grepar o payload bruto em `tool-results/` por `motionaccountassets` e reconstruir URL via sub-asset ID (ver `reference_tools.md`).
4. Ads muito novos retornam `ads: []` — sem thumbnail possível; usar placeholder creme+itálica laranja e aguardar 48h.

**Formato confirmado:** mensal (não quinzenal). Recorte 01–último dia útil do mês. Próxima edição: maio de 2026.

## lições aprendidas (atualizadas 30/04/2026)

**1. Não autorar preview editorial de mês futuro com dados especulativos.**
Em 29/04/2026 tentei gerar um preview pré-mês de maio (Grau/Solar/Sports + clássicos novas cores) baseado só no plano confirmado pelo usuário, sem dados Motion. O usuário **rejeitou** ("não gostei como ficou"). Lição: editorial sem evidência de dado fica genérico e abstrato. Esperar primeira semana de dados antes de draftar.

**2. Verificar SEMPRE qual URL o usuário está vendo.**
A `main` produção fica defasada quando trabalho está em branch+PR. Se usuário reclama de "dados antigos", quase certo que ele está vendo a URL `https://zerezes-leitura-criativa.vercel.app/` (produção) em vez do preview do branch (`zerezes-leitura-cria-git-af01d2-...vercel.app`). Antes de qualquer "investigação" — confirmar URL.

**3. Tom editorial × tom direto.**
Headlines e labels de cards: **diretos e funcionais** ("oportunidade de mercado"). Texto corrido editorial pode ser mais autoral. Não trocar essas duas camadas. Ver `project_vocabulario.md` seção "tom direto > editorial-abstrato".

**4. Sem valores em R$ no texto editorial corrido.**
Esta é leitura **criativa**, não de mídia. Mantê-lo só em caps técnicos de cards de criativo. Ver `project_vocabulario.md` seção "regra editorial sobre dados de orçamento".

**5. Pipeline `system/` não rodou em produção ainda.**
A edição de abril foi autorada direto em `index.html` raiz (~900 linhas hardcoded). A infra (`build.mjs`, `_render.mjs`, template, lint, archive) está pronta mas só foi exercitada uma vez no preview rejeitado de maio. Quando a edição de maio for retomada com dados reais, é a chance de validar o fluxo completo.

**Why:** o briefing original listou estes 4 (+ Warby/Lapima como referências). Cada marca ancora uma "postura criativa" e o report compara a voz delas com o que a Zerezes está dizendo.

**How to apply:**
- Versionar o HTML (`report-v3-editavel.html`, `report-v4.html`...). Nova rodada = novo arquivo.
- Estrutura consolidada de seções: 00 resumo · 01 tese · 02 funil · 03 heatmap · 04 coleção · 05 mercado · 06 palavras (copies) · 07 anatomia · 08 apostas · 09 checklist · 10 outras frentes.
- Sempre incluir mockup visual + wireframe quando a recomendação for prescritiva para o studio (texto puro não basta).
- Seção "outras frentes" cobre AON Solar, AON Sports, bestsellers, collabs MASP/FARM, ativações menores do período.
- Incluir fallback CSS para imagens Zerezes ausentes (placeholder estilizado creme+itálica laranja) — nem sempre os assets estão na pasta local.
