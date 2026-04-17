---
name: project_workflow_assets
description: fluxo recomendado de produção das leituras criativas — o que Motion cobre bem, o que exige high-res manual do usuário, e quando pedir
type: project
originSessionId: 8b9dedd7-288a-4aff-aa99-b49105cdff31
---
Divisão de trabalho entre Motion MCP e assets locais do usuário:

**Motion cobre sozinho (não pedir para o usuário):**
- Dados qualitativos de ads próprios — spend, CTR, copies, headlines, adnames, estrutura campanha/adset, publicador, landing page. Via `get_creative_insights`.
- Visuais de concorrentes em alta resolução — `motionswipefile.blob.core.windows.net` serve imagens/vídeos completos.
- **Visuais dos próprios ads Zerezes em alta resolução** — a Zerezes tem brandId pública `66f6b95baa0d5e90982cfbf9` no swipe file (mesma CDN dos concorrentes, NÃO `motionaccountassets`). Puxar via `get_inspo_creatives(brandIds=["66f6b95baa0d5e90982cfbf9"])` retorna TODOS os ads próprios ativos em alta resolução. **Este é o caminho certo para visuais de ads Zerezes, não o thumbnail de `motionaccountassets` retornado pelo `get_creative_insights`.**
- Transcripts de vídeo — `get_creative_transcript` para hook/CTA analysis.
- Glossary/tagging — `get_glossary_values`.
- Creative insights cruzados — HOOK rate, SCALING, retention, ROAS, CPA (ainda sub-explorados nas leituras).

**Exige high-res do usuário (não tem outra forma):**
- Product shots da coleção (16 modelos Grau26) — não vêm de ad library (Motion swipe file só tem creatives, não catálogo de produto). Vêm do banco de imagens da marca. Usuário drop em `zerezes-imgs/` (lena.jpg, jig.jpg, etc.).
- KV hero / banner campanha / artes fora do feed Meta — idem.

**Fluxo via Drive:** o Drive do usuário (`reference_drive.md`) tem estáticas high-res em pastas por mês (ex.: `ABRIL 2026` — `168SMrJcE784VO1vCLXEMrFG-0368Pmml`). Quando precisar, usar `download_file_content`, decodificar o blob base64 em Python, e salvar em `zerezes-imgs/` com nome previsível (ex.: `grau26_meio_1.jpg`). Já testado na rodada v4.

**Fluxo recomendado a seguir em toda nova leitura criativa:**

1. **Turno 1** — logo que o escopo fica claro, identificar **2–5 visuais de ads próprios** que vão ser protagonistas visuais do report (normalmente: 2 creators top-spend + 1–2 KVs + 1 catálogo hero). Pedir ao usuário para dropar em `zerezes-imgs/` com nomes previsíveis (ex.: `rafaela.jpg`, `rodrigobez.jpg`, `kv-hero.jpg`).
2. **Em paralelo**, puxar qualitativo via Motion — não bloqueia no usuário.
3. **Se a leitura tocar product shots da coleção** (Grau26, próxima coleção, etc.), confirmar que os 16 modelos já estão em `zerezes-imgs/` antes de montar o grid.
4. **Concorrentes**: nunca pedir — Motion entrega alta resolução sozinho.
5. **Fallback visual** sempre ativo: script do HTML substitui imagem ausente por placeholder estilizado (creme + itálica laranja) — o report fica apresentável mesmo se 1-2 assets não chegarem.

**Why:** descobrimos isso em 2026-04-17 na rodada v4 — thumbs de `motionaccountassets` são preview de navegação da própria Motion, resolução pequena intencionalmente. O usuário validou: "me parece que assim a integração fica pouco utilizável" — resposta: Motion continua sendo motor de 95% da análise, mas ~5% (visuais premium dos próprios ads) precisam vir do usuário. Melhor antecipar no turno 1 que descobrir no meio do caminho.
