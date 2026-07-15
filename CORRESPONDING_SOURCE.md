# Corresponding source for the image-compression bundle

The browser downloads `/assets/image-compress-worker.js`, which contains the
libimagequant and OxiPNG WebAssembly modules. This repository provides the
preferred source form and exact build instructions for that object code.

## Rebuild the distributed worker

Use the Node.js version in `.nvmrc` and pnpm version declared in `package.json`:

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm build:image-codecs
```

The command bundles these inputs into the ignored generated file
`src/generated/image-compress-worker.html`:

- `src/client/image-compress-worker.ts`
- `src/image-compression/png-strategy.ts`
- `scripts/build-image-codecs.ts`
- the exact packages pinned by `pnpm-lock.yaml`

`pnpm build:worker` embeds that generated file in the Cloudflare Worker build.
`pnpm build:vps` emits it as `dist/vps/assets/image-compress-worker.js`.

## Exact upstream source

The npm artifacts include precompiled Rust WebAssembly. Their corresponding
Rust and wrapper source is available at the immutable published commits below:

| Distributed package | Published source | Compiled core |
| --- | --- | --- |
| `libimagequant-wasm@0.3.0` | [`c33b7f493c879dd0d183dc41c098dec7f501ebb7`](https://github.com/akshetpandey/libimagequant-wasm/tree/c33b7f493c879dd0d183dc41c098dec7f501ebb7) | `imagequant@4.4.1` |
| `@jsquash/oxipng@2.3.0` | [`68a7201e5b4d9703bf65670fb0284d16536dd145`](https://github.com/jamsinclair/jSquash/tree/68a7201e5b4d9703bf65670fb0284d16536dd145/packages/oxipng) | `oxipng@9.1.1` |

The upstream Cargo lockfiles at those commits pin all transitive Rust crates.
See [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md) for copyright and
license details.

The generated worker is intentionally not committed because it is reproducible
from the preferred source above. No private keys, deployment credentials, or
environment-specific secrets are required to rebuild it.
