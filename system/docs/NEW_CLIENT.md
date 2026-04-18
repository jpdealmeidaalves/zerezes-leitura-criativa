# novo cliente — onboarding

como adicionar um cliente à plataforma de leitura criativa.

## pré-requisitos

o cliente tem:

- conta meta ads com histórico de pelo menos 30 dias
- pasta no google drive onde o studio publica assets
- um brand kit mínimo (paleta + fontes principais)
- referência de concorrência mapeada (no mínimo 3 marcas)

## passos

### 1. criar slug e diretório

escolhe um slug url-safe. padrão: nome da marca em minúsculas, `-` como separador.

```bash
mkdir -p system/clients/<slug>/content
```

### 2. preencher config.json

copia `system/clients/zerezes/config.json` como ponto de partida e edita. pontos críticos:

- **`brand.palette`** — cores do brand kit. **obrigatório** validar contraste AA:
  - qualquer cor usada em texto < 18px deve ter ratio ≥ 4.5:1 no bg principal
  - cor accent com ratio < 3:1 no bg só pode ser usada em títulos ≥ 24px ou ter `accent_usage.dark_variant` definido
- **`brand.fonts`** — duas famílias google fonts (sans + serif)
- **`sources.motion.brand_domain`** — domínio usado pra `get_brand_by_domain`
- **`sources.drive.root_folder_id`** — pasta raiz do cliente no drive
- **`sources.drive.monthly_folder_pattern`** — convenção do cliente (pode variar; zerezes usa `{MES_UPPER} {ANO}`)
- **`competitors`** — 3 a 7 marcas. ordem importa (aparece nessa ordem na leitura)
- **`voice`** — **preenchido por quem tem tom de voz do cliente**. zerezes é editorial; outro cliente pode ser técnico, irreverente, formal. não copia-cola: redefine.
- **`collections`** e **`personas`** — opcional, só preenche se o cliente tiver universo narrativo claro (como os 4 personagens grau26)

valida o config:

```bash
node system/scripts/validate-config.mjs --client <slug>
```

### 3. conectar mcps

no ambiente n8n, cria uma instância dos connectors por cliente:

- motion workspace id
- drive: credencial do cliente (oauth) + root folder id
- canva brand kit id
- vercel project id (cria um novo projeto vercel para o cliente)
- github repo (pode ser monorepo ou repo separado — ver abaixo)

### 4. decisão: repo mono ou per-client?

**mono (recomendado até 3 clientes):**

- um único repo da plataforma com todos os tenants
- `dist/<slug>/<edition>/` é o artefato de cada cliente
- deploy vercel apontando para `dist/<slug>/latest/` por domínio separado
- vantagem: compartilhamento de `lib/`, `template/`, `scripts/` imediato
- desvantagem: mudança numa lib afeta todos os clientes de uma vez

**per-client (recomendado a partir de 4+ clientes):**

- plataforma em repo próprio (`leitura-criativa-platform`)
- cada cliente em repo próprio consumindo a plataforma como git submodule ou npm package
- vantagem: versionamento independente (cliente A pode estar em v2, cliente B em v1)
- desvantagem: setup mais pesado

**escolha pro zerezes:** mono por ora, migrar quando chegar 4º.

### 5. primeira edição (manual, para validar)

primeira edição **não** passa pelo n8n. roda os passos de [`NEW_MONTH.md`](NEW_MONTH.md) manualmente, cada um isolado, pra identificar se:

- motion expõe os dados esperados
- drive tem os assets no formato esperado
- brand kit do canva renderiza corretamente
- build não quebra com as cores e fontes do cliente
- a seção 05 (mercado) tem 3+ concorrentes com dados suficientes

se qualquer um falhar, ajusta config ou cria uma exceção localizada em `scripts/` — nunca patcheia `lib/` pra acomodar cliente específico.

### 6. onboarding do time do cliente

o time do cliente (criação/comunicação/studio) precisa saber:

- onde a leitura mora (url)
- quando ela sai (primeiro dia útil do mês)
- como consumir (html no navegador + deck canva opcional)
- como dar feedback (github issue no repo ou canal slack dedicado)

## checklist de aceite (primeira edição de um cliente novo)

- [ ] config.json valida contra schema
- [ ] paleta passa contraste AA
- [ ] pull motion retorna > 20 creatives
- [ ] pull drive retorna > 10 assets
- [ ] build gera html sem erro
- [ ] html abre no navegador sem erro de console
- [ ] scroll-spy funciona
- [ ] todas as imagens carregam (ou caem no fallback corretamente)
- [ ] seção 05 tem 3+ concorrentes analisados
- [ ] deploy vercel bem-sucedido
- [ ] url de produção responde 200
- [ ] deck canva gerado
- [ ] time do cliente notificado
