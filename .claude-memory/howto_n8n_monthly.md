---
name: howto_n8n_monthly
description: configuracao do workflow mensal n8n que orquestra a leitura criativa
type: howto
---

Workflow `workflows/n8n-monthly-leitura.json` dispara no 1º dia útil do mês e prepara a edição. Roteiro de configuração e troubleshooting.

## passos do workflow

1. **Trigger:** Schedule node, cron `0 9 1-3 * 1-5` (dispara 9h, dia 1–3 do mês, segunda a sexta — pega o 1º dia útil).
2. **pull-motion:** Execute Command node → `node system/scripts/pull-motion.mjs --client zerezes --edition $(date +%Y-%m -d 'last month')`. Adapter `globalThis.mcp.motion` precisa estar setado pelo n8n via credenciais Motion.
3. **pull-drive:** idem com `pull-drive.mjs`. Requer `sources.drive.root_folder_id` preenchido em `config.json` (hoje TBD — ver frente 2 do plano de melhorias).
4. **draft-content:** `draft-content.mjs` — gera `content/<edição>.json` com seções 00–04 pré-preenchidas via dado, 05–10 como TODO.
5. **lint-content:** `lint-content.mjs` — fail-fast em vocabulário proibido / typos conhecidos.
6. **commit + open PR:** GitHub node abre PR contra `main` pedindo revisão humana das seções editoriais.
7. **on PR merge:** webhook de merge dispara `build.mjs --as-root` → push → Vercel deploya.
8. **deploy-check:** `deploy-check.mjs` valida via Vercel MCP.
9. **notify:** Slack/email com link da edição publicada.

## variaveis de ambiente esperadas no n8n

| nome | onde pega | usado em |
|---|---|---|
| `MOTION_API_KEY` | Motion settings | adapter motion |
| `GOOGLE_DRIVE_OAUTH` | Google Cloud Console | adapter drive |
| `CANVA_API_KEY` | Canva developer | adapter canva |
| `VERCEL_TOKEN` | Vercel account | deploy-check |
| `GITHUB_PAT` | GitHub PAT (fine-grained, repo `jpdealmeidaalves/zerezes-leitura-criativa`) | abrir PR |

Credenciais ficam **só no n8n**, nunca em `.env` no repo (regra firme).

## troubleshooting

- **pull-motion grava stub:** `globalThis.mcp.motion` não foi injetado. Confirma que o node Motion roda **antes** do Execute Command e expõe via `globalThis`.
- **draft-content falha em "content not found":** order errada — `draft-content` precisa rodar **depois** de `pull-motion` ter gravado `<edição>.motion-snapshot.json`.
- **build aborta em contraste AA:** acessibilidade falhou (laranja sobre creme < 3:1). Solução: garantir que `cfg.brand.accent_usage.dark_variant` está setado (já está em `zerezes/config.json`).
- **lint trava em "bestseller":** alguém escreveu termo de mercado em campo editorial. Substituir por *clássicos*.

## edicao manual (sem n8n)

Mesma sequência via CLI local:
```bash
node system/scripts/pull-motion.mjs   --client zerezes --edition 2026-05
node system/scripts/pull-drive.mjs    --client zerezes --edition 2026-05
node system/scripts/draft-content.mjs --client zerezes --edition 2026-05
# editar content/2026-05.json
node system/scripts/lint-content.mjs  --client zerezes --edition 2026-05
node system/scripts/build.mjs         --client zerezes --edition 2026-05 --as-root
git add . && git commit -m "edicao maio/2026" && git push
node system/scripts/deploy-check.mjs
```

## referencias

- `system/docs/ARCHITECTURE.md:80-91` — desenho original do fluxo n8n
- `workflows/n8n-monthly-leitura.json` — workflow definido (não lido aqui)
- `reference_tools.md` — credenciais e workspace IDs
