#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
if [ -x .venv/bin/python ]; then
  study_python=.venv/bin/python
elif [ -x /Users/goodman/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 ]; then
  study_python=/Users/goodman/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3
else
  study_python=python3
fi
if ! command -v node >/dev/null 2>&1 && [ -x /Users/goodman/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node ]; then
  PATH=/Users/goodman/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH
  export PATH
fi
if [ ! -x node_modules/.bin/vite ]; then
  echo 'ثبّت حزم الواجهة أولًا: npm install' >&2
  exit 1
fi
"$study_python" server/export.py >/dev/null
"$study_python" server/app.py &
study_api_pid=$!
trap 'kill "$study_api_pid" 2>/dev/null || true' EXIT INT TERM
./node_modules/.bin/vite --host 127.0.0.1
