# índice de memória — zerezes :: leitura criativa

> **Ler primeiro:** [`state_current.md`](state_current.md) — snapshot vivo do projeto, atualizado a cada rodada. Contém branch ativa, estado da PR, comandos canônicos, pendências e regras-mãe num único lugar.

## sobre o usuário e o tom

- [User role](user_role.md) — trabalha no time de **mídia** da Zerezes; entrega leituras criativas para criação/comunicação/studio.
- [Tom editorial preferido](feedback_tone.md) — autonomia + entregas grandes; prefere tom direto em headlines e editorial em texto corrido.
- [Datas sempre absolutas](feedback_dates.md) — é **2026**. Nunca "abril" sozinho.
- [Vocabulário Zerezes](project_vocabulario.md) — termos preferidos, proibidos e regras: *clássicos* (não "bestsellers"), "alavanca", "previsão maio", "espaço largo" proibido, **sem R$ em texto editorial corrido**, tom direto > editorial-abstrato em headlines.

## projeto / produto

- [Pipeline de leituras criativas](project_pipeline_leituras.md) — entregáveis mensais em HTML; `;;)`; lições aprendidas; protocolo Motion SPEND-first.
- [Zerezes Grau26](project_zerezes_grau26.md) — coleção central em abril/2026; 16 modelos literários; 4 personas (laura lufesi, túlio linare, letrux, philipp lavra); performance abril (CTR 0,88%, Rodrigo Bez dominante).
- [Collabs/ativações conhecidas](project_ativacoes.md) — Grau26, AON Solar, AON Sports, clássicos, MASP, FARM, The Simple Gym (alavanca), novas cores clássicos (previsão maio). **Plano de maio confirmado** (Grau/Solar/Sports 01–31 + clássicos 14–31).
- [Workflow de assets](project_workflow_assets.md) — Motion cobre 95% (qualitativo + concorrentes HD); pedir 2–5 high-res no turno 1; product shots Grau26 já em `zerezes-imgs/`.
- [Fuel — referência só de site](project_fuel_pending.md) — nunca rodou Meta Ads; só posicionamento.

## fontes e ferramentas

- [Ferramentas de dados](reference_tools.md) — Motion MCP (workspace, padrão `motionaccountassets`, ads < 48h), Windsor.ai (escopo só criativo, sem $), n8n.
- [Google Drive Zerezes](reference_drive.md) — pasta-pai `1lFADkpEqaCRT_PnAFD4hA-MfocKssjT3`, brandbook `19D6L2GgHsq5QDVMl0tTjycERqDnRg-Tq`, ABRIL 2026 `168SMrJcE784VO1vCLXEMrFG-0368Pmml`.

## how-tos operacionais

- [jq em payloads Motion](howto_motion_jq.md) — parsear `tool-results/*.txt` quando estoura token limit; extrair URLs `motionaccountassets`.
- [Workflow n8n mensal](howto_n8n_monthly.md) — passos, env vars, troubleshooting, equivalente CLI manual.
- [Apresentação institucional (Book Digital)](howto_apresentacao.md) — gerar deck no formato Fechamento Mensal a partir da leitura criativa; contrato de pedido, comando, decisões editoriais por sub-seção.
