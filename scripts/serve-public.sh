#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
if [ ! -x node_modules/.bin/vite ]; then
  echo 'Install frontend packages first (npm install or corepack pnpm install).' >&2
  exit 1
fi
./node_modules/.bin/tsc -b
./node_modules/.bin/vite build
export STUDYLAB_PUBLIC=1
export STUDYLAB_HOST="${STUDYLAB_HOST:-0.0.0.0}"
exec "${STUDYLAB_PYTHON:-python3}" server/app.py
