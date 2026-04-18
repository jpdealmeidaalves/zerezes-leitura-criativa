# mcps — inventário e uso

cada mcp conectado à sessão tem uma função específica no pipeline. esta página é a fonte de verdade do que cada um faz e quando rodar.

## tier 1 — core do pipeline mensal

### motion.app mcp (`867f0c05-...`)
**papel:** fonte primária dos dados de mídia paga da conta.

| tool                        | uso no fluxo                                                           |
| --------------------------- | ---------------------------------------------------------------------- |
| `get_workspace_brand`       | pega metadados do workspace do cliente                                 |
| `get_creative_insights`     | alimenta seção 02 (funil) e 08 (apostas) — spend, ctr, reach por asset |
| `get_creative_summary`      | descrição textual por asset — vira legenda e tags                      |
| `get_creative_transcript`   | transcript de vídeo — usado pra análise de copy (seção 06)             |
| `get_demographic_breakdown` | perfil de quem viu — ainda não usado, vetor futuro                     |
| `get_workspace_competitors` | lista de concorrentes já mapeados no workspace                         |
| `get_inspo_creatives`       | alimenta seção 05 (mercado) — ads dos concorrentes                     |
| `get_inspo_brand_context`   | contexto editorial de cada concorrente                                 |

**cadence:** quinzenal (primeira quinzena do mês) + mensal (fechamento).

### google drive mcp (`f45f2440-...`)
**papel:** assets hi-res produzidos pelo studio.

| tool                        | uso no fluxo                                                            |
| --------------------------- | ----------------------------------------------------------------------- |
| `search_files`              | busca a pasta mensal (`{MES_UPPER} {ANO}`) no root configurado          |
| `list_recent_files`         | valida que o studio subiu os arquivos da convenção `midia_{produto}_..` |
| `download_file_content`     | baixa assets pra pasta local `clients/<slug>/assets/<edition>/`         |
| `read_file_content`         | lê briefings/moodboards em doc pra contexto editorial                   |
| `get_file_metadata`         | checa data de modificação (se studio atualizou, rebuildar)              |

**cadence:** dispara no mesmo momento da pull motion.

### canva mcp (`a0248f3f-...`)
**papel:** geração de artefatos visuais que complementam a leitura html.

| tool                        | uso no fluxo                                                          |
| --------------------------- | --------------------------------------------------------------------- |
| `list-brand-kits`           | confirma brand kit do cliente antes de gerar                          |
| `generate-design`           | gera capa do pdf, deck 16:9 da leitura, thumbnails de redes internas  |
| `generate-design-structured`| gera mockups das apostas (seção 08) se for solicitado                 |
| `export-design`             | exporta png/pdf pra `dist/` e `assets/`                               |
| `upload-asset-from-url`     | sobe assets do drive pro canva quando mockup precisa de foto real     |

**cadence:** sob demanda — capa pdf e deck são gerados a cada edição; mockups só quando aposta é aprovada pelo studio.

### vercel mcp (`d57dbc6f-...`)
**papel:** validação do deploy.

| tool                          | uso no fluxo                                                     |
| ----------------------------- | ---------------------------------------------------------------- |
| `list_deployments`            | lista últimos deploys do projeto                                 |
| `get_deployment`              | estado do último deploy                                          |
| `get_deployment_build_logs`   | debug de falha de build                                          |
| `get_runtime_logs`            | debug de erro runtime no site publicado                          |

**cadence:** após cada `git push main`.

### n8n mcp (`cae6bae2-...`)
**papel:** orquestrador do fluxo mensal. workflow versionado em `workflows/n8n-monthly-leitura.json`.

| tool                          | uso no fluxo                                                     |
| ----------------------------- | ---------------------------------------------------------------- |
| `create_workflow_from_code`   | import inicial do workflow versionado                            |
| `execute_workflow`            | trigger manual em dev                                            |
| `update_workflow`             | sync de alteração no json versionado                             |
| `get_execution`               | inspecionar execuções passadas                                   |

**cadence:** scheduled trigger — 1º dia útil do mês às 08h.

## tier 2 — complementares (roadmap)

### figma mcp (a conectar)
**papel:** bridge com o studio. quando aposta da seção 08 virar arte final, o asset de origem vem do figma do cliente.
**status:** não conectado ainda. candidato natural pra quando tiver a 3ª leitura.

### social listening (reddit / brand24 / mention — a escolher)
**papel:** adicionar dimensão qualitativa ("o que o público diz") além do output das marcas.
**status:** vetor a explorar. maior ganho pra diferenciar a leitura competitivamente.

### tiktok / youtube ads libraries
**papel:** expandir cobertura de canal dos concorrentes. hoje leitura é só meta.
**status:** possivelmente via apify mcp; a validar.

## tier 3 — utilidades

### gmail mcp (`4a34bc03-...`)
dispara notificação quando leitura publica. opcional.

### calendar mcp (`e744c46f-...`)
usa feriados e disponibilidade do cliente pra agendar o trigger do workflow.

### chrome / preview / computer-use
escape hatch — screenshot manual de algo que o motion não cobre. evitar quando possível.

## regras de ouro

1. **mcp nunca é chamado dentro do template ou do build.** só dentro de `scripts/pull-*.mjs` ou de um step n8n. isso mantém o build hermético (dá pra rodar offline com fixtures).
2. **cada pull grava snapshot.** `scripts/pull-motion.mjs` escreve em `clients/<slug>/content/<edition>.motion-snapshot.json`. assim a mesma edição é reprodutível mesmo se motion mudar de dados no futuro.
3. **erro de mcp não derruba pipeline.** script fai fail soft — registra em log, usa última snapshot válida, e avisa.
4. **credenciais ficam no n8n, nunca no repo.** o repo versiona ids (folder id, project id, workspace id) que não são segredo; tokens moram no ambiente n8n.
