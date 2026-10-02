# @lobstrco/signer-extension-api

[![npm version](https://badge.fury.io/js/%40lobstrco%2Fsigner-extension-api.svg)](https://badge.fury.io/js/%40lobstrco%2Fsigner-extension-api)
[![Package size](https://img.shields.io/bundlephobia/minzip/@lobstrco/signer-extension-api)](https://bundlephobia.com/package/@lobstrco/signer-extension-api)

This package builds a wrapper around the messaging system used to interact with the LOBSTR browser extension. Client applications will be able to install this package from npm and then integrate it with the LOBSTR signer extension using dev-friendly methods.

## User Interface Guideline

To ensure consistency of styles with the LOBSTR wallet, please use the assets in [the `assets` folder](./assets) for your integration and always write the **LOBSTR** wallet brand name in all capital letters only.

## Getting Started
To get started, you’ll need both the LOBSTR signer extension and the API needed to integrate with it.

### Install the LOBSTR signer extension.

- Head over to the Chrome Web Store and install the LOBSTR signer extension into your browser.

### Install LOBSTR signer extension API
Now, you need a way to communicate with the LOBSTR signer extension. To facilitate this, we created a Javascript library called **@lobstrco/signer-extension-api** that will let you send and receive messages from the extension.

#### For ES2023 applications
- Install the module using npm: ```npm install @lobstrco/signer-extension-api```

or

- Install the module using yarn: ```yarn add @lobstrco/signer-extension-api```

#### For browser-based applications
Install the packaged library via script tag, swapping in the desired version number for ```{version}```:

```html
<script src="https://cdn.jsdelivr.net/npm/@lobstrco/signer-extension-api@{version}/build/index.min.js"></script>
```

unpkg serves the same file, if you prefer it:

```html
<script src="https://unpkg.com/@lobstrco/signer-extension-api@{version}/build/index.min.js"></script>
```

#### Module formats

The package ships three builds and picks the right one for you:

| Your setup | What you get |
|---|---|
| `import` (native ESM, bundlers, Node ESM) | `build/index.mjs` |
| `require` (CommonJS) | `build/index.cjs` |
| `<script src="...">` | `build/index.min.js` (defines `window.lobstrExtensionApi`) |

Named imports work in all three, including native ESM in Node. The `<script>` file opens with its
own `"use strict"` directive, so load it as its own script rather than concatenating it ahead of
others.

#### Protocol vocabulary

`@lobstrco/signer-extension-api/protocol` is a second entry point holding the vocabulary the
SDK and the extension share on the wire: the message type names, the API version, the
dApp-visible error strings and the request/response types. A dApp does not need it — the
functions below speak the protocol for you. It exists for the extension itself and for anyone
implementing the same protocol.

| Your setup | What you get |
|---|---|
| `import { ... } from "@lobstrco/signer-extension-api/protocol"` | `build/protocol.mjs` |
| `require("@lobstrco/signer-extension-api/protocol")` | `build/protocol.cjs` |

## Using LOBSTR signer extension in a web app
You now have an extension installed on your machine and a library to interact with it. This library will provide methods to send and receive data from a user’s extension on your website or application.

### Importing
The default export carries every function in an ES2023 application:

```javascript
import lobstrApi from "@lobstrco/signer-extension-api";
```

`NETWORK` and `isBrowser` are named exports only — the default export holds the
functions, not the constants.

or import just the modules you require:

```javascript
import {
 isConnected,
 getPublicKey,
 getConnectedWallet,
 getSupportedNetworks,
 supportsNetwork,
 signTransaction,
 signMessage,
 NETWORK,
} from "@lobstrco/signer-extension-api";
```

Now let's dig into what functionality is available to you:

## Networks

The extension can hold wallets on more than one network. **Every function that touches a
wallet takes an optional `network`, and leaving it out always means Stellar** — code written
before networks existed keeps working, permanently and by design.

```javascript
import { NETWORK, getPublicKey } from "@lobstrco/signer-extension-api";

await getPublicKey();                            // Stellar, same as it ever was
await getPublicKey({ network: NETWORK.ripple }); // the XRP Ledger wallet
```

Connections are kept per network: asking for a Stellar wallet and asking for an XRP Ledger
wallet are two separate approvals, and each is remembered on its own.

Ask the extension what it supports rather than assuming — an older build will not know a
network your code was written for:

```javascript
import { getSupportedNetworks, supportsNetwork, NETWORK } from "@lobstrco/signer-extension-api";

if (await supportsNetwork(NETWORK.ripple)) {
  // safe to offer XRP Ledger in your UI
}

for (const entry of await getSupportedNetworks()) {
  console.log(entry.network, entry.displayName, entry.available);
}
```

`available: false` means the extension knows the network but cannot use it right now. That is
different from the network being absent from the list, which means this build has never heard
of it. Treat an unknown string as unknown — do not fall back to Stellar.

`NETWORK` is an enum of the networks this SDK version knows (`stellar`, `ripple`), but the
`network` parameter accepts any string, so a page written today can name a network a later
extension adds.

## API

### isConnected

```isConnected() -> <Promise<boolean>>```

This function is used to determine whether a user has the LOBSTR signer extension installed in your application.

```javascript
import { isConnected } from "@lobstrco/signer-extension-api";

if (await isConnected()) {
  alert("User has LOBSTR extension installed!");
}
```

### getPublicKey

```getPublicKey(options?: { network?: string }) -> <Promise<string>>```

Returns the address of the connected wallet on the requested network, prompting the user to
approve the connection if they have not already. Omit `options` for Stellar.

It **throws** rather than returning an empty string when there is nothing to return — see
[Errors](#errors). Outside a browser it resolves to `""`.

```typescript
import { getPublicKey } from "@lobstrco/signer-extension-api";

const retrievePublicKey = async (): Promise<string> => {
  let publicKey = "";
  let error = "";

  try {
    publicKey = await getPublicKey();
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  if (error) {
    return error;
  }

  return publicKey;
};
```

### getConnectedWallet

```getConnectedWallet(options?: { network?: string }) -> <Promise<{ publicKey: string, network: string } | null>>```

The same connection as `getPublicKey`, but it also tells you which network the wallet is on.
Use it when you support more than one network and need to keep track of which is which.

```typescript
import { getConnectedWallet, NETWORK } from "@lobstrco/signer-extension-api";

const wallet = await getConnectedWallet({ network: NETWORK.ripple });
// { publicKey: "r...", network: "ripple" }
```

Resolves to `null` outside a browser.

### getSupportedNetworks

```getSupportedNetworks() -> <Promise<SupportedNetwork[]>>```

What this extension build can do. Each entry describes one network:

| Field | Meaning |
|---|---|
| `network` | The id you pass as `options.network` |
| `displayName` | Name to show a user, e.g. `"XRP Ledger"` |
| `nativeCode` / `nativeDecimals` | The native asset, e.g. `"XRP"` and `6` |
| `explorerAccountUrl` | Account page prefix; append an address |
| `signTypes` | Which of `"transaction"` / `"message"` this network accepts |
| `broadcaster` | `"dapp"` — signing gives you the signed transaction to submit; `"wallet"` — it gives you the id of one the wallet already sent |
| `available` | `false` means known but currently unusable |

Resolves to `[]` outside a browser. An older extension returns only what it knows, so treat
the list as the source of truth rather than hard-coding networks.

### supportsNetwork

```supportsNetwork(network: string) -> <Promise<boolean>>```

Shorthand for looking one network up in `getSupportedNetworks()`.

### signTransaction

```signTransaction(transaction: string, options?: { network?: string }) -> <Promise<string>>```

Signs a transaction as the user and returns the result to your application.

`transaction` is a string **in the network's own grammar** — a base64 XDR envelope on Stellar,
transaction JSON on the XRP Ledger. What comes back follows that network's `broadcaster`: with
`"dapp"` (both networks today) you get the signed transaction and submit it yourself.

*NOTE:* The payload must be valid for the network you name, or the call is refused before the
user is ever prompted.


```typescript
import { signTransaction } from "@lobstrco/signer-extension-api";

const userSignTransaction = async (xdr: string): Promise<string> => {
  let signedTransaction = "";
  let error = "";

  try {
    signedTransaction = await signTransaction(xdr);
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  if (error) {
    return error;
  }

  return signedTransaction;
};
```

### signMessage

```signMessage(message: string, options?: { network?: string }) -> <Promise<{signedMessage: string, signerAddress: string} | null>>```

This function accepts a message string, which it will sign and return an object containing the signed message and the signer's address to your application.

Not every network signs arbitrary messages — the XRP Ledger has no scheme for it, and asking
is refused with `SIGN_TYPE_NOT_SUPPORTED`. Check `signTypes` in `getSupportedNetworks()` before
offering it.

```typescript
import { signMessage } from "@lobstrco/signer-extension-api";

const userSignMessage = async (message: string): Promise<{signedMessage: string, signerAddress: string} | null> => {
  let result = null;
  let error = "";

  try {
    result = await signMessage(message);
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  if (error) {
    console.error("Error signing message:", error);
    return null;
  }

  return result;
};
```

## Using LOBSTR in the browser
You now have the LOBSTR signer extension installed on our machine and a library to interact with it. This library will provide you methods to send and receive data from a user’s extension in your website or application.

### Importing
First import the library in the ```<head>``` tag of your page.

- Install the packaged library via script tag, swapping in the desired version number for ```{version}```

```html
<head>
  <script src="https://cdn.jsdelivr.net/npm/@lobstrco/signer-extension-api@{version}/build/index.min.js"></script>
</head>
```

This exposes a global called `window.lobstrExtensionApi` holding the library. The call
signatures are exactly the same as the node version:

```javascript
if (await window.lobstrExtensionApi.isConnected()) {
  alert("User has LOBSTR extension installed!");
}

const publicKey = await window.lobstrExtensionApi.getPublicKey({
  network: window.lobstrExtensionApi.NETWORK.ripple,
});
```

## Errors

Failures reject with an `Error` whose `message` is one of the strings below. They are stable
values — compare `error.message` against them rather than parsing it:

| `error.message` | What happened |
|---|---|
| `"User declined access"` | The user closed the prompt or rejected it in the app |
| `"Network is not supported"` | This extension build does not know the network you named |
| `"The connected wallet belongs to a different network"` | The wallet answered on a network other than the one you asked for |
| `"No wallet connected on the requested network"` | The extension has no wallet on that network |
| `"The connection key is missing"` | `signTransaction` or `signMessage` was called before `getPublicKey` connected a wallet on that network |
| `"The data to sign is missing"` | The payload was empty or not a string |
| `"A wallet cannot be connected from this page"` | The page has no origin to bind a connection to — a `file://` document or a sandboxed frame |
| `"Reconnect the wallet to continue"` | The extension does not recognise the reference this page holds — it was revoked, it belongs to another origin, or it predates the current extension. Call `getPublicKey` again |
| `"Associated account not found"` | The wallet was removed from the extension while the access prompt stood open |
| `"This type of signing is not supported on this network"` | e.g. `signMessage` on the XRP Ledger |
| `"The transaction payload is not valid for this network"` | The payload is not in that network's grammar |
| `"The transaction payload is too large"` | Over the size the network's signing path accepts |
| `"Couldn't open access prompt"` | The extension could not open its confirmation window |
| `"Unable to send message to extension"` | The page could not reach the extension — typically after the extension was updated; reload the page |
| `"This request type is not supported"` | The installed extension predates this SDK and does not know the request |
| `"Sign failed"` | Deliberately vague — the signing did not complete |
| `"Signing request timed out"` | The user never answered in the app |

## Upgrading from v2

No call changes meaning: **a call with no `network` is a Stellar call, permanently.** Only
the shape of a rejection changed (below).

Three things to know:

- **Entry points.** The package now declares `exports`, so deep paths such as
  `@lobstrco/signer-extension-api/build/index.min.js` no longer resolve. Import the package
  itself. In exchange, named imports now work in native ESM, where they previously existed
  only in the type definitions.
- **New surface.** `getConnectedWallet`, `getSupportedNetworks`, `supportsNetwork`, the
  `NETWORK` enum, and an optional `network` on `getPublicKey`, `signTransaction` and
  `signMessage`.
- **Errors.** Rejections are `Error` objects; v2 rejected with the bare string. The strings
  are unchanged, so compare `error.message` where you compared the value itself.

## Developing

Node 22.13 or newer.

```
npm ci
npm test            # builds first: the Node suite reads the built output in build/
npm run verify:types
```

`npm run build` bundles with esbuild and emits the declarations with `tsc`; `npm run lint`,
`npm run format:check` and `npm run typecheck` are what CI runs, and `npm run test:watch`
keeps the tests running. Publishing is manual: `npm publish` builds through `prepack` and
ships only what `files` in package.json lists.

## License

Apache-2.0. See [LICENSE](./LICENSE).
