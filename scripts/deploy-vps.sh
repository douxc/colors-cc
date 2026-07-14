#!/bin/sh
set -eu

if [ -f .env ]; then
  set -a
  . ./.env
  set +a
fi

: "${VPS_TARGET:?Set VPS_TARGET, for example deploy@your-vps}"

VPS_ROOT="${VPS_ROOT:-/var/www/colors-cc.top}"

pnpm validate
pnpm build:vps
rsync -az --delete dist/vps/ "${VPS_TARGET}:${VPS_ROOT}/"

echo "Deployed the CN static site to ${VPS_TARGET}:${VPS_ROOT}/"
