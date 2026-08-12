# Project Map

## Architecture

- `localized-app` → `src/app.tsx`

## Routes

- `/tools/image-compress` (also `/en`, `/zh`) → 301 → `https://offline-tools.colors-cc.top/image-compress/` (source: `TOOL_REDIRECTS` in `src/site.ts`; CN nginx rules in `deploy/nginx-vps.conf`)

## Components

- `shared/site-chrome` → `src/templates/site-chrome.ts`

## Constraints
