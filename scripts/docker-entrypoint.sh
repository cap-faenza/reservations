#!/bin/sh
set -eu

APP_DIR="${APP_DIR:-/app}"
cd "$APP_DIR"

mkdir -p "$APP_DIR/data/uploads"

case "${DATABASE_URL:-}" in
  file:*)
    db_path="${DATABASE_URL#file:}"
    db_path="${db_path%%\?*}"
    mkdir -p "$(dirname "$db_path")"
    touch "$db_path"
    ;;
esac

if [ "${SKIP_DB_MIGRATIONS:-0}" != "1" ]; then
  echo "Applying database migrations..."
  ./node_modules/.bin/prisma migrate deploy
fi

exec "$@"
