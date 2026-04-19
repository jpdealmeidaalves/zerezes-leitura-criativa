#!/usr/bin/env bash
# PreToolUse para Bash: bloqueia comandos destrutivos em files/ (historico imutavel).
set -eo pipefail

input=$(cat)
cmd=$(printf '%s' "$input" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('tool_input',{}).get('command',''))" 2>/dev/null || echo "")

# bloqueia rm/mv recursivo ou wildcard em files/
if printf '%s' "$cmd" | grep -qE '(^|[[:space:]])(rm|mv)[[:space:]]+(-[rR][fF]?|-[fF][rR]?)[[:space:]]+[^|&;]*files/'; then
  printf 'pre-bash-guard :: comando destrutivo bloqueado em files/ (histórico imutável).\ncmd: %s\npara editar uma edição antiga, criar nova versão em vez de sobrescrever.' "$cmd" 1>&2
  exit 2
fi

if printf '%s' "$cmd" | grep -qE 'git[[:space:]]+checkout[[:space:]]+.*--[[:space:]]+files/'; then
  printf 'pre-bash-guard :: git checkout descartando alterações em files/ bloqueado.\n' 1>&2
  exit 2
fi

exit 0
