#!/bin/sh
set -eu

: "${1:?Candidate Nginx config path is required}"
: "${2:?Target Nginx config path is required}"

candidate=$1
target=$2
backup="${target}.colors-cc-backup"
had_target=0

if [ -e "$target" ]; then
  cp -p "$target" "$backup"
  had_target=1
fi

install -m 0644 "$candidate" "$target"

if nginx -t; then
  systemctl reload nginx
  rm -f "$backup" "$candidate"
  exit 0
fi

if [ "$had_target" -eq 1 ]; then
  mv -f "$backup" "$target"
else
  rm -f "$target"
fi

nginx -t
rm -f "$candidate"
exit 1
