# ce·explorer

**ce-explorer is a live, read-only block explorer for the CE mesh** — a single-page dashboard that watches the network breathe. It streams accepted blocks and confirmed transactions over Server-Sent Events, polls the node for status, the capacity atlas, open jobs, and payment channels, and computes a torrent-style share-ratio leaderboard from each peer's interaction history. It talks to a local CE node through the published [`@ce-net/sdk`](https://www.npmjs.com/package/@ce-net/sdk) client (real endpoints, real SSE, no faked data), so the same app you read here is the app that runs against `ce start`.

## What you see

- **Pulse rail** — a sonar sweep across the top; every accepted block fires a ping and ticks the tip height.
- **Headline metrics** — block height, circulating supply, total burned, peers in the atlas. Tiles glow briefly when a value changes.
- **Live blocks** and **Transactions** — two SSE tails, newest first, with value-moving txs tinted amber and consensus/control txs in plum.
- **Capacity atlas** — every peer advertising capacity, with cores, memory, running jobs, last-seen, and self-tagged capability chips. Searchable by node id or tag, filterable by tag.
- **Share-ratio leaderboard** — `delivered / consumed` work per node (a pure seeder shows `∞`), ranked best-giver first.
- **Open jobs** and **Payment channels** — what this node is paying for or hosting, and the off-chain channels it holds.

## Run it against a node

1. **Start a CE node** (it serves the HTTP+SSE API on `127.0.0.1:8844`):

   ```bash
   ce start
   ```

2. **Install and run the explorer:**

   ```bash
   npm install
   npm run dev
   ```

   Open the printed URL (default `http://localhost:5290`). The data path is the mesh-native, **same-origin** rail: `@ce-net/sdk`'s `connectNode()` uses the in-tab `window.__ceNode` bridge if present, else the same-origin `/ce` reverse proxy. In dev, Vite stands in for the `ce-app serve` layer and proxies `/ce` to the node, so the browser stays same-origin under the strict CSP (`connect-src 'self'`) with no CORS and no off-origin hop. The explorer is read-only and needs no API token.

   If the node isn't running you'll get a clear empty/error state ("Can't reach the node. Is `ce start` running?") rather than a blank screen — start the node and it fills in live.

## Build and test

```bash
npm run build   # tsc --noEmit + vite build → dist/
npm test        # vitest: unit tests for the data model, store/runtime, formatting, errors
```

The unit tests use a small in-memory adapter (`src/lib/__tests__/fixtures.ts`) so they exercise the real mapping, sync/op, money/size formatting, and error-handling logic with the SDK and network mocked — the production data path itself is never faked.

## Serve & expose over the mesh

`npm run build` emits a static `dist/`. Host it the mesh-native way — strict CSP + the same-origin bridge + a same-origin `/ce` reverse proxy, all injected for you — with **ce-app**:

```bash
ce-app register                     # claim this app's name on-chain + advertise (no hub)
ce-app serve                        # build + host locally under the strict CSP, /ce -> 127.0.0.1:8844
ce-app expose --domain ce-explorer  # serve over https://ce-explorer.user.ce-net.com via mesh ingress
```

A served ce-explorer talks ONLY to its local node (same-origin). For advanced/embedded setups you may still point it at a specific node by setting `VITE_CE_NODE_URL` at build time (see `.env.example`) — this is an explicit override, not the default.

## Layout

```
src/
  app.ts            SPA orchestration: builds the shell, renders snapshots
  lib/
    config.ts       node base URL + read-only CeClient
    format.ts       money / bytes / hash / time formatting (no floats for money)
    model.ts        peer rows, share ratio, leaderboard, tx/job classification
    store.ts        ExplorerStore: ring buffers + immutable snapshots
    runtime.ts      ExplorerRuntime: SSE tails + polling loop over CeClient
    errors.ts       node errors → user-facing messages
  ui/               DOM helpers, panels, the pulse rail, styles
  views/            block / tx / peer / job / channel / metric renderers
```

Built on CE primitives via `@ce-net/sdk`. Read-only by design — the explorer never signs, spends, or mutates host state.
