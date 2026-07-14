#!/bin/sh
set -eu

: "${VPS_TARGET:?Set VPS_TARGET, for example deploy@your-vps}"

VPS_ROOT="${VPS_ROOT:-/var/www/colors-cc/html}"

pnpm validate
pnpm build:vps
rsync -az --delete dist/vps/ "${VPS_TARGET}:${VPS_ROOT}/"

echo "Deployed the CN static site to ${VPS_TARGET}:${VPS_ROOT}/"
