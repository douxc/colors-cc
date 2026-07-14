#!/bin/sh
set -eu

if [ -f .env ]; then
  set -a
  . ./.env
  set +a
fi

: "${VPS_TARGET:?Set VPS_TARGET, for example deploy@your-vps}"

VPS_ROOT="${VPS_ROOT:-/var/www/colors-cc/html}"
VPS_SITE_ORIGIN="${VPS_SITE_ORIGIN:-https://www.colors-cc.top}"

pnpm validate
pnpm build:vps
rsync -az --delete dist/vps/ "${VPS_TARGET}:${VPS_ROOT}/"
pnpm verify:seo -- "${VPS_SITE_ORIGIN}"

echo "Deployed the CN static site to ${VPS_TARGET}:${VPS_ROOT}/"
