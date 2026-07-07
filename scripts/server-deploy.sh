#!/bin/bash
# Copia di riferimento dello script di deploy che vive sul server in
# /home/ddiiorio/deploy-reservations.sh ed è invocato dal forced-command della
# chiave SSH usata da GitHub Actions (.github/workflows/deploy.yml).
#
# Se lo modifichi, ricordati di aggiornare anche la copia sul server:
#   scp scripts/server-deploy.sh ovh:/home/ddiiorio/deploy-reservations.sh
set -euo pipefail
cd "$HOME/reservations.muvat.cloud"
echo "[deploy] $(date -u '+%Y-%m-%d %H:%M:%S UTC') — fetch"
# NB: si resetta su FETCH_HEAD e non su origin/main perché "git fetch origin main"
# aggiorna FETCH_HEAD ma non il ref remoto origin/main su questa versione di git.
git fetch --quiet origin main
git reset --hard FETCH_HEAD
echo "[deploy] ora su $(git rev-parse --short HEAD) — build + up"
/usr/bin/docker-compose -f compose.server.yaml up -d --build
echo "[deploy] completato"
