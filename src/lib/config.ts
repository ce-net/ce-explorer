import { CeClient, connectNode } from "@ce-net/sdk";

/**
 * Where the explorer reads the CE node from.
 *
 * The default transport is the mesh-native, SAME-ORIGIN rail ({@link connectNode}):
 * the in-tab `window.__ceNode` bridge if present, else the same-origin `/ce` reverse
 * proxy. In `vite dev` Vite stands in for the `ce-app serve` layer and proxies `/ce`
 * to the local node at 127.0.0.1:8844. Either way the page is same-origin, so the
 * strict CSP (`connect-src 'self'`) holds — the explorer never reaches an off-origin
 * host. `VITE_CE_NODE_URL` remains an explicit override for advanced/embedded use.
 */
export function nodeBaseUrl(): string | undefined {
  const fromEnv = import.meta.env.VITE_CE_NODE_URL as string | undefined;
  if (fromEnv && fromEnv.length > 0) return fromEnv.replace(/\/$/, "");
  return undefined;
}

/**
 * A read-only client. The explorer never signs or spends — no token needed. With no
 * `baseUrl` (the default) it uses the mesh-native, same-origin {@link connectNode}
 * transport; a non-empty `baseUrl` (e.g. from `VITE_CE_NODE_URL`) is an explicit override.
 */
export function makeClient(baseUrl = nodeBaseUrl()): CeClient {
  if (!baseUrl) return connectNode();
  return CeClient.withToken(baseUrl);
}
