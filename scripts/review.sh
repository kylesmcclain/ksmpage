#!/usr/bin/env bash
# Design-review harness: serve the production build, capture it, then tear the server down.
#
# Keeping the server's lifetime inside a single process tree matters — a preview server left
# running between invocations will happily serve a stale `dist/`, which produces screenshots
# of a build that no longer exists.
set -euo pipefail

OUT_DIR="${1:-shots}"
THEME="${2:-dark}"
PORT="${PORT:-4321}"
BASE_PATH="${BASE_PATH:-/ksmpage}"

cleanup() {
  if [[ -n "${SERVER_PID:-}" ]]; then
    kill "$SERVER_PID" 2>/dev/null || true
    wait "$SERVER_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT

npx astro preview --port "$PORT" --host >/tmp/astro-preview.log 2>&1 &
SERVER_PID=$!

for _ in $(seq 1 40); do
  if curl -sS -o /dev/null --max-time 2 "http://localhost:${PORT}${BASE_PATH}/"; then break; fi
  sleep 0.5
done

export SHOOT_BASE="http://localhost:${PORT}${BASE_PATH}"
node scripts/shoot.mjs "$OUT_DIR"
node scripts/shoot-sections.mjs "${OUT_DIR}-sections" "$THEME"
