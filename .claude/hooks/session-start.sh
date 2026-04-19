#!/usr/bin/env bash
# SessionStart hook — mostra estado da edicao ativa + se ha diff pendente.
# stdout aparece no system message do inicio da sessao.
set -eo pipefail
cd "${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null)}" 2>/dev/null || exit 0

echo "=== zerezes :: leitura criativa ==="

# edicoes com content/ presente
if compgen -G "system/clients/*/content/*.json" >/dev/null 2>&1; then
  echo "edições com content/*.json:"
  for f in system/clients/*/content/*.json; do
    client=$(basename "$(dirname "$(dirname "$f")")")
    edition=$(basename "$f" .json)
    [[ "$edition" == *".motion-snapshot"* ]] && continue
    echo "  · $client / $edition"
  done
else
  echo "nenhuma edição com content/*.json (index.html raiz é autorada direto)"
fi

# commit atual
echo -n "branch/commit: "
git rev-parse --abbrev-ref HEAD 2>/dev/null | tr -d '\n'
echo -n " @ "
git rev-parse --short HEAD 2>/dev/null || echo "no-git"

# diff pendente?
if ! git diff --quiet -- index.html 2>/dev/null; then
  echo "⚠ index.html tem modificações não commitadas"
fi
