#!/bin/sh
set -eu

if [ -f .env ]; then
  set -a
  . ./.env
  set +a
fi

: "${VPS_TARGET:?Set VPS_TARGET, for example deploy@your-vps}"

VPS_ROOT="${VPS_ROOT:-/var/www/colors-cc.top}"
VPS_SITE_ORIGIN="${VPS_SITE_ORIGIN:-https://www.colors-cc.top}"
VPS_NGINX_CONFIG="${VPS_NGINX_CONFIG:-/etc/nginx/sites-available/colors-cc.top}"
REMOTE_NGINX_CONFIG=/tmp/colors-cc-nginx-vps.conf
REMOTE_NGINX_INSTALLER=/tmp/colors-cc-install-nginx-vps.sh

case "$VPS_NGINX_CONFIG" in
  /etc/nginx/sites-available/*) ;;
  *) echo "VPS_NGINX_CONFIG must be under /etc/nginx/sites-available" >&2; exit 1 ;;
esac

pnpm validate
pnpm build:vps
rsync -az --delete dist/vps/ "${VPS_TARGET}:${VPS_ROOT}/"
rsync -az deploy/nginx-vps.conf "${VPS_TARGET}:${REMOTE_NGINX_CONFIG}"
rsync -az deploy/install-nginx-vps.sh "${VPS_TARGET}:${REMOTE_NGINX_INSTALLER}"
ssh "$VPS_TARGET" "sudo -n sh ${REMOTE_NGINX_INSTALLER} ${REMOTE_NGINX_CONFIG} ${VPS_NGINX_CONFIG}"
pnpm verify:seo -- "${VPS_SITE_ORIGIN}"

echo "Deployed the CN static site to ${VPS_TARGET}:${VPS_ROOT}/"
