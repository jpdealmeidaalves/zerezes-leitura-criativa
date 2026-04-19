#!/usr/bin/env bash
# PostToolUse hook para Edit/Write/MultiEdit sobre index.html.
# Protege vocabulario (bestseller) e datas erradas (anos != 2026).
# Bloqueia via exit 2 quando detecta violacao.
set -eo pipefail
cd "${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null)}" 2>/dev/null || exit 0

# le JSON do stdin com o tool_input
input=$(cat)

# path do arquivo editado
path=$(printf '%s' "$input" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('tool_input',{}).get('file_path') or d.get('tool_input',{}).get('path') or '')" 2>/dev/null || echo "")

# so atua em index.html na raiz
case "$path" in
  */index.html|index.html) ;;
  *) exit 0 ;;
esac

# nao bloqueia se o arquivo nem existe (caso de Write criando novo)
[ -f "$path" ] || exit 0

violations=""

# 1. vocabulario: bestseller
if grep -niE 'bestseller' "$path" >/dev/null 2>&1; then
  lines=$(grep -niE 'bestseller' "$path" | head -3)
  violations+="vocabulário: uso proibido de 'bestseller'. substituir por 'clássicos'.\n${lines}\n"
fi

# 2. datas: qualquer ano fora da faixa 2026-2027 em texto de ad/copy eh suspeito
# filtro: considera so numeros de 4 digitos comecando com 20 (evita pegar "1280x720")
if grep -noE '\b20(1[0-9]|2[0-5])\b' "$path" | grep -v 'viewport\|preconnect\|fonts.googleapis' >/tmp/zerezes_date_check.txt 2>/dev/null; then
  if [ -s /tmp/zerezes_date_check.txt ]; then
    lines=$(head -3 /tmp/zerezes_date_check.txt)
    violations+="datas: possível ano incorreto (aceitos: 2026-2027). editorial deve usar 'abril de 2026' sempre com ano absoluto.\n${lines}\n"
  fi
fi

if [ -n "$violations" ]; then
  # escreve mensagem via JSON pro Claude (exit 2 = bloqueio)
  printf '%b' "post-edit-guard :: violação detectada em $path:\n$violations\ncorrija antes de continuar." 1>&2
  exit 2
fi

exit 0
