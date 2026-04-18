# leitura criativa — plataforma multi-cliente

sistema replicável para produzir leituras criativas editoriais mensais sobre mídia paga, desenhado para escalar do cliente fundador (zerezes) para novos clientes sem reescrever o pipeline.

## o que isto é

uma **plataforma** — não um documento. o `index.html` na raiz é o output da edição `zerezes / abril 2026`. a pasta `system/` descreve como produzir as próximas edições (maio 2026, junho 2026) e como adicionar novos clientes (ex: aon sports standalone, uma nova conta) com o mesmo motor.

## arquitetura em uma linha

```
config (por cliente) + content (por mês) → template → build → dist → vercel
           ↑                   ↑
   brand kit / mcps    motion · drive · canva
```

detalhe completo em [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## estrutura

```
system/
├── clients/                    # um diretório por cliente (tenant)
│   └── zerezes/
│       ├── config.json         # brand kit, mcps, concorrentes, voz
│       └── content/
│           └── abril-2026.json # sections + data do mês
├── lib/                        # css/js compartilhados (canonical source)
│   ├── leitura.css
│   └── leitura.js
├── template/
│   └── index.template.html     # esqueleto com placeholders
├── scripts/                    # automações (node esm)
│   ├── build.mjs               # render: config + content + template → dist
│   ├── pull-motion.mjs         # puxa insights/transcripts via motion mcp
│   ├── pull-drive.mjs          # puxa assets da pasta do mês no drive
│   ├── generate-canva.mjs      # gera mockups via canva mcp
│   └── deploy-check.mjs        # valida deploy via vercel mcp
├── workflows/
│   └── n8n-monthly-leitura.json  # workflow n8n versionado
├── docs/
│   ├── ARCHITECTURE.md
│   ├── NEW_CLIENT.md           # passo a passo: onboarding novo cliente
│   ├── NEW_MONTH.md            # passo a passo: nova edição mensal
│   └── MCPS.md                 # inventário de mcps e uso de cada um
├── config.schema.json          # json-schema do config de cliente
└── README.md
```

## fluxos principais

- **nova leitura mensal** — [`docs/NEW_MONTH.md`](docs/NEW_MONTH.md)
- **novo cliente** — [`docs/NEW_CLIENT.md`](docs/NEW_CLIENT.md)
- **mcps disponíveis e pra quê** — [`docs/MCPS.md`](docs/MCPS.md)

## princípios de design

1. **conteúdo separado de apresentação** — md/json por mês, template html único.
2. **cliente é um tenant** — tudo que muda entre clientes (paleta, voz, concorrentes, fontes de dados) vive em `clients/<slug>/config.json`. o motor não tem conhecimento de cliente específico.
3. **mcps são pluggable** — cada script em `scripts/` assume que pode rodar em modo "com mcp conectado" (real) ou "stub" (local, usando fixtures). facilita dev sem quebrar prod.
4. **output é versionado** — `dist/index.html` vai pro git pra rastreabilidade; vercel faz deploy do último commit em main.
5. **n8n orquestra, não decide** — o workflow dispara os scripts na ordem certa; toda lógica editorial vive no código/config.

## status atual (abril 2026)

- ✅ edição zerezes/abril-2026 no ar em [zerezes-leitura-criativa.vercel.app](https://zerezes-leitura-criativa.vercel.app)
- ✅ contraste AA + scroll-spy aplicados
- 🟡 template + build.mjs scaffoldados, migração do conteúdo inline pendente (próxima edição)
- 🟡 scripts de pull (motion, drive) escritos como stubs — próxima etapa é validação com mcp real
- ⬜ n8n workflow a ser importado no ambiente de execução
- ⬜ segundo tenant (provavelmente aon sports standalone ou collab the simple gyn) ainda não criado
