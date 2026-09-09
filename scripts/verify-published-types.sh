#!/usr/bin/env bash
# Checks the packed tarball from outside the repo, the way a consumer meets it.
#
# Inside the repo everything resolves straight from `src/`, so a package can be healthy
# here and broken on npm — only the packed tarball proves that `exports`, `typesVersions`,
# the flat d.ts tree and the bundles agree. That gap is how the named exports once came
# to exist only in the types.
#
# Two gates, both against the real tarball: the whole published surface must
# type-check, and the installed package must actually run.
set -euo pipefail

PKG_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TSC="$PKG_DIR/node_modules/.bin/tsc"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

cd "$PKG_DIR"
npm pack --loglevel=silent --pack-destination "$WORK" >/dev/null
mkdir -p "$WORK/node_modules/@lobstrco"
tar -xzf "$WORK"/*.tgz -C "$WORK"
mv "$WORK/package" "$WORK/node_modules/@lobstrco/signer-extension-api"

cat > "$WORK/surface.ts" <<'TS'
// touches the whole published surface: a symbol nobody uses here can vanish unnoticed
import signer, {
  isBrowser,
  NETWORK,
  getPublicKey,
  getConnectedWallet,
  getSupportedNetworks,
  supportsNetwork,
  signTransaction,
  signMessage,
  isConnected,
} from "@lobstrco/signer-extension-api";
import type {
  ConnectedWallet,
  NetworkDescriptor,
  NetworkId,
  NetworkOptions,
  SignType,
  SupportedNetwork,
} from "@lobstrco/signer-extension-api";

// the README documents the default export as carrying every function
export const wholeDefault = {
  getPublicKey: signer.getPublicKey,
  getConnectedWallet: signer.getConnectedWallet,
  getSupportedNetworks: signer.getSupportedNetworks,
  supportsNetwork: signer.supportsNetwork,
  signTransaction: signer.signTransaction,
  signMessage: signer.signMessage,
  isConnected: signer.isConnected,
};

// each function pinned to its exact signature, named and on the default alike
type GetPublicKey = (options?: NetworkOptions) => Promise<string>;
type GetConnectedWallet = (options?: NetworkOptions) => Promise<ConnectedWallet | null>;
type GetSupportedNetworks = () => Promise<SupportedNetwork[]>;
type SupportsNetwork = (network: NetworkId) => Promise<boolean>;
type SignTransaction = (transaction: string, options?: NetworkOptions) => Promise<string>;
type SignMessage = (
  message: string,
  options?: NetworkOptions,
) => Promise<{ signedMessage: string; signerAddress: string } | null>;
type IsConnected = () => Promise<boolean>;

export const signatures: [
  GetPublicKey, GetConnectedWallet, GetSupportedNetworks, SupportsNetwork,
  SignTransaction, SignMessage, IsConnected,
  GetPublicKey, GetConnectedWallet, GetSupportedNetworks, SupportsNetwork,
  SignTransaction, SignMessage, IsConnected,
] = [
  getPublicKey, getConnectedWallet, getSupportedNetworks, supportsNetwork,
  signTransaction, signMessage, isConnected,
  signer.getPublicKey, signer.getConnectedWallet, signer.getSupportedNetworks,
  signer.supportsNetwork, signer.signTransaction, signer.signMessage, signer.isConnected,
];

export const values = {
  isBrowser: isBrowser as boolean,
  ripple: NETWORK.ripple as NETWORK,
  label: (d: NetworkDescriptor): string => d.displayName,
  code: (d: NetworkDescriptor): string => d.nativeCode,
  decimals: (d: NetworkDescriptor): number => d.nativeDecimals,
  explorer: (d: NetworkDescriptor): string => d.explorerAccountUrl,
  kinds: (d: NetworkDescriptor): SignType[] => d.signTypes,
  broadcast: (d: NetworkDescriptor): "dapp" | "wallet" => d.broadcaster,
  gate: (d: NetworkDescriptor): boolean => d.available,
  wallet: (w: ConnectedWallet): [string, NetworkId] => [w.publicKey, w.network],
};

// open unions: narrowing the descriptor field to the enum voids the contract
export const future: NetworkId = "bitcoin";
export const futureField: SupportedNetwork["network"] = "bitcoin";
export const laterKind: SignType = "psbt";
export const laterKindInDescriptor: NetworkDescriptor["signTypes"][number] = "psbt";

// both are frozen sets a later extension will use: narrowing either to the value
// shipped today silently forbids the other, and every other check still passes
export const walletBroadcast: NetworkDescriptor["broadcaster"] = "wallet";
export const unavailableNetwork: NetworkDescriptor["available"] = false;

// `any` satisfies every assertion above, so each type says so on its own
type IsAny<T> = 0 extends 1 & T ? true : false;
export const noAny: IsAny<
  | NetworkOptions["network"]
  | ConnectedWallet["publicKey"]
  | ConnectedWallet["network"]
  | SupportedNetwork["network"]
  | NetworkDescriptor["signTypes"]
  | NetworkDescriptor["broadcaster"]
  | NetworkDescriptor["available"]
  | NetworkDescriptor["displayName"]
  | NetworkDescriptor["nativeCode"]
  | NetworkDescriptor["nativeDecimals"]
  | NetworkDescriptor["explorerAccountUrl"]
  | Parameters<typeof getPublicKey>[0]
  | Parameters<typeof getConnectedWallet>[0]
  | Parameters<typeof supportsNetwork>[0]
  | Parameters<typeof signTransaction>[0]
  | Parameters<typeof signTransaction>[1]
  | Parameters<typeof signMessage>[0]
  | Parameters<typeof signMessage>[1]
  | Awaited<ReturnType<typeof getPublicKey>>
  | Awaited<ReturnType<typeof getConnectedWallet>>
  | Awaited<ReturnType<typeof getSupportedNetworks>>
  | Awaited<ReturnType<typeof supportsNetwork>>
  | Awaited<ReturnType<typeof signTransaction>>
  | Awaited<ReturnType<typeof signMessage>>
  | Awaited<ReturnType<typeof isConnected>>
> = false;
TS

# the extension's half of the contract: every protocol name must resolve from the packed tarball
cat > "$WORK/protocol-surface.ts" <<'TS'
import {
  API_VERSION,
  DEFAULT_NETWORK,
  ERROR_MESSAGES,
  EXTERNAL_MSG_REQUEST,
  EXTERNAL_MSG_RESPONSE,
  EXTERNAL_SERVICE_TYPES,
  NETWORK,
  networkOrLegacy,
} from "@lobstrco/signer-extension-api/protocol";
import type {
  ConnectionResponse,
  ExternalRequestTxV1,
  ExternalRequestTxV2,
  GetPublicKeyResponse,
  NetworkDescriptor,
  NetworkId,
  SignType,
  SupportedNetwork,
} from "@lobstrco/signer-extension-api/protocol";
import { NETWORK as RootNetwork } from "@lobstrco/signer-extension-api";

// one declaration file behind both entry points, so the enum is the same type from either
export const sameEnum: [RootNetwork, NETWORK] = [NETWORK.ripple, RootNetwork.stellar];
export const v2: ExternalRequestTxV2 = {
  dataToSign: "x",
  connectionKey: "k",
  signType: "transaction",
  type: EXTERNAL_SERVICE_TYPES.SIGN,
  version: API_VERSION.V3,
  network: "bitcoin",
};
export const v1: ExternalRequestTxV1 = {
  connectionKey: "k",
  transactionXdr: "x",
  type: EXTERNAL_SERVICE_TYPES.SUBMIT_TRANSACTION,
};
export const conn: ConnectionResponse = {
  publicKey: "G",
  connectionKey: "k",
  network: networkOrLegacy(undefined),
};
export const base: GetPublicKeyResponse = conn;
// `as const` survived the declaration emit
export const declined: "User declined access" = ERROR_MESSAGES.USER_DECLINED_ACCESS;
export const source: "LOBSTR_EXTERNAL_MSG_REQUEST" = EXTERNAL_MSG_REQUEST;
export const reply: "LOBSTR_EXTERNAL_MSG_RESPONSE" = EXTERNAL_MSG_RESPONSE;
export const stellar: NETWORK.stellar = DEFAULT_NETWORK;
export const open: [NetworkId, SignType, NetworkDescriptor["broadcaster"], SupportedNetwork["network"]] =
  ["bitcoin", "psbt", "wallet", "bitcoin"];

// `any` satisfies every assertion above, so each type says so on its own
type IsAny<T> = 0 extends 1 & T ? true : false;
export const noAny: IsAny<
  | ExternalRequestTxV2["network"]
  | ExternalRequestTxV2["version"]
  | ConnectionResponse["network"]
  | typeof ERROR_MESSAGES.SIGN_FAILED
  | typeof EXTERNAL_SERVICE_TYPES.SIGN
  | ReturnType<typeof networkOrLegacy>
> = false;
TS

# what the types promise must also be there at runtime — the gap that shipped once
cat > "$WORK/package.json" <<'JSON'
{ "name": "smoke", "private": true, "type": "module" }
JSON

# the ESM entry as Node-style resolution reads it: the default import is the function object
# the .mjs exports, not the CommonJS namespace; the protocol entry has no default at all
cat > "$WORK/esm-shape.ts" <<'TS'
import signer from "@lobstrco/signer-extension-api";
import * as protocol from "@lobstrco/signer-extension-api/protocol";
// @ts-expect-error the protocol entry exports no default
import protocolDefault from "@lobstrco/signer-extension-api/protocol";

export const key: Promise<string> = signer.getPublicKey();
// @ts-expect-error the enum is a named export, not a member of the default object
export const notOnDefault = signer.NETWORK;
// @ts-expect-error the default object does not nest itself
export const noNesting = signer.default;
export const version: number = protocol.API_VERSION.V3;
export const unused = protocolDefault;
TS

cat > "$WORK/smoke.mjs" <<'JS'
import assert from "node:assert";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";
import signer, * as esm from "@lobstrco/signer-extension-api";
import * as protoEsm from "@lobstrco/signer-extension-api/protocol";

const require = createRequire(import.meta.url);
const cjs = require("@lobstrco/signer-extension-api");
const protoCjs = require("@lobstrco/signer-extension-api/protocol");
// the <script> build is a plain IIFE that assigns one global, so only a bare
// browser-like context shows what a page loading it from a CDN actually gets
const browser = { console };
browser.self = browser;
browser.window = browser;
vm.createContext(browser);
vm.runInContext(
  readFileSync("./node_modules/@lobstrco/signer-extension-api/build/index.min.js", "utf8"),
  browser,
);
const script = browser.lobstrExtensionApi;
assert.ok(script, "the <script> build defines no window.lobstrExtensionApi");

const FUNCTIONS = [
  "getConnectedWallet", "getPublicKey", "getSupportedNetworks",
  "isConnected", "signMessage", "signTransaction", "supportsNetwork",
];
// exact on purpose: an export added or dropped fails here until this list says so
const NAMED = [...FUNCTIONS, "NETWORK", "isBrowser"].sort();

for (const [kind, mod] of [["esm", esm], ["cjs", cjs], ["script", script]]) {
  const named = Object.keys(mod).filter((key) => key !== "default").sort();
  assert.deepEqual(named, NAMED, `${kind} exports ${named} not ${NAMED}`);
  assert.equal(mod.NETWORK.ripple, "ripple", `${kind} NETWORK is not the enum`);
  for (const name of FUNCTIONS) {
    assert.equal(typeof mod[name], "function", `${kind} ${name} is not callable`);
  }
}

// the README documents the default export as carrying every function
for (const [kind, fallback] of [["esm", signer], ["cjs", cjs.default], ["script", script.default]]) {
  for (const name of FUNCTIONS) {
    assert.equal(typeof fallback[name], "function", `${kind} default.${name} is not callable`);
  }
}

// the extension's half of the contract: the protocol entry carries exactly these names, and their values
const PROTOCOL = [
  "API_VERSION", "DEFAULT_NETWORK", "ERROR_MESSAGES", "EXTERNAL_MSG_REQUEST",
  "EXTERNAL_MSG_RESPONSE", "EXTERNAL_SERVICE_TYPES", "NETWORK", "networkOrLegacy",
];
const MESSAGE_TYPES = [
  "GET_SUPPORTED_NETWORKS", "REQUEST_ACCESS", "REQUEST_CONNECTION_STATUS",
  "SIGN", "SIGN_TRANSACTION", "SUBMIT_TRANSACTION",
];
for (const [kind, mod] of [["esm", protoEsm], ["cjs", protoCjs]]) {
  const named = Object.keys(mod).filter((key) => key !== "default").sort();
  assert.deepEqual(named, PROTOCOL, `${kind} protocol exports ${named} not ${PROTOCOL}`);
  assert.equal(mod.EXTERNAL_MSG_REQUEST, "LOBSTR_EXTERNAL_MSG_REQUEST", `${kind} request source`);
  assert.equal(mod.EXTERNAL_MSG_RESPONSE, "LOBSTR_EXTERNAL_MSG_RESPONSE", `${kind} response source`);
  assert.deepEqual(Object.keys(mod.EXTERNAL_SERVICE_TYPES).sort(), MESSAGE_TYPES, `${kind} message types`);
  // the content script matches by key, so a value that differs from its key is silently dropped
  for (const key of MESSAGE_TYPES) {
    assert.equal(mod.EXTERNAL_SERVICE_TYPES[key], key, `${kind} ${key} value differs from its key`);
  }
  assert.deepEqual([mod.API_VERSION.V1, mod.API_VERSION.V2, mod.API_VERSION.V3], [0, 1, 2], `${kind} API_VERSION`);
  assert.equal(Object.keys(mod.ERROR_MESSAGES).length, 15, `${kind} wire literal count`);
  assert.equal(mod.NETWORK.ripple, esm.NETWORK.ripple, `${kind} NETWORK differs from the root entry`);
  assert.equal(mod.networkOrLegacy(undefined), "stellar", `${kind} networkOrLegacy`);
}
JS

check() {  # <label> <command...>
  local label="$1"; shift

  if "$@" > "$WORK/out.txt" 2>&1; then
    echo "ok    $label"
    return 0
  fi

  echo "FAIL  $label"
  sed -e 's|.*/node_modules/|node_modules/|' -e "s|$WORK/||" "$WORK/out.txt" | sed 's/^/      /'
  return 1
}

failed=0
check "runtime, from the packed tarball" bash -c "cd '$WORK' && node smoke.mjs" || failed=1

# both passes: one catches a private path leaking out, the other a degraded `any`.
# `node` resolution ignores `exports`: the root entry comes from `types`, the protocol entry
# from `typesVersions` — what TypeScript 4 and `module: commonjs` consumers meet; `bundler`
# reads the `exports` map instead. Both must reach both entries.
# TypeScript 6 refuses `node` resolution without `ignoreDeprecations`, and 7 drops it: once
# this repo moves to 7, run this pass with a pinned TypeScript 5 instead of removing it.
for skip in false true; do
  cat > "$WORK/tsconfig.json" <<TS
{
  "compilerOptions": {
    "target": "ES2020", "module": "ESNext", "moduleResolution": "node",
    "ignoreDeprecations": "6.0",
    "strict": true, "noEmit": true, "skipLibCheck": $skip
  },
  "files": ["surface.ts", "protocol-surface.ts"]
}
TS
  check "published surface + protocol, moduleResolution=node, skipLibCheck=$skip" "$TSC" -p "$WORK/tsconfig.json" || failed=1

  cat > "$WORK/tsconfig.json" <<TS
{
  "compilerOptions": {
    "target": "ES2020", "module": "ESNext", "moduleResolution": "bundler",
    "strict": true, "noEmit": true, "skipLibCheck": $skip
  },
  "files": ["surface.ts", "protocol-surface.ts"]
}
TS
  check "published surface + protocol, moduleResolution=bundler, skipLibCheck=$skip" "$TSC" -p "$WORK/tsconfig.json" || failed=1

  # Node-style resolution reads the `import` condition's own `.d.mts`, so the ESM shape is typed as shipped
  cat > "$WORK/tsconfig.json" <<TS
{
  "compilerOptions": {
    "target": "ES2020", "module": "NodeNext", "moduleResolution": "NodeNext",
    "strict": true, "noEmit": true, "skipLibCheck": $skip
  },
  "files": ["surface.ts", "protocol-surface.ts", "esm-shape.ts"]
}
TS
  check "published surface + protocol + ESM shape, moduleResolution=nodenext, skipLibCheck=$skip" "$TSC" -p "$WORK/tsconfig.json" || failed=1
done

exit $failed
