# v3.0.0-rc.1

Release candidate of 3.0.0, published under the `next` dist-tag: `npm install
@lobstrco/signer-extension-api@next`. The notes below describe the whole 3.0.0 release.

# v3.0.0

## New features
- Added multi-network support. Every wallet-facing function takes an optional `network`;
  omitting it means Stellar, permanently, so existing integrations are unaffected
- Added `getConnectedWallet`, which returns the address together with the network it is on
- Added `getSupportedNetworks` and `supportsNetwork`, so a page can ask an extension what it
  can do instead of assuming
- Added the `NETWORK` enum and the `NetworkId`, `SignType`, `NetworkDescriptor`,
  `SupportedNetwork`, `NetworkOptions` and `ConnectedWallet` types
- Added distinct error strings for network and payload failures, so integrators can branch
  instead of parsing `Sign failed`
- Added `"Reconnect the wallet to continue"`, raised when the extension does not recognise the
  connection this page holds. Call `getPublicKey` again to recover
- Added `"A wallet cannot be connected from this page"`, raised for a page with no origin to bind
  a connection to — a `file://` document or a sandboxed frame

## Security
- The value the SDK keeps for a connected wallet is now an opaque, origin-scoped reference
  minted by the extension, not the pairing key the backend accepts. A script on a connected
  page can no longer read it and call the backend directly. No call changes shape
- **Requires an extension that mints those references.** Against an older extension
  `getPublicKey` resolves with an empty reference and every later signature is refused with
  `"The connection key is missing"`
- A session established before this release is not carried over. This SDK looks for a reference
  the older bundle never stored, so the next signature is refused with `"The connection key is
  missing"` until `getPublicKey` runs again; a page still on the older bundle holds the old value
  and is refused with `"Reconnect the wallet to continue"` instead
- Added the `@lobstrco/signer-extension-api/protocol` entry point: the message names, API
  version, error strings and request/response types the SDK shares with the extension

## Breaking changes
- Rejections are `Error` objects; 2.x rejected with the bare string. The strings themselves
  are unchanged — compare `error.message`
- The package now declares an `exports` map. Deep paths such as
  `@lobstrco/signer-extension-api/build/index.min.js` no longer resolve — import the package
  itself. No existing call changes meaning

## Build improvements
- Ships separate ESM, CommonJS and `<script>` builds. Named imports now work at runtime in
  native ESM, where previously they existed only in the type definitions. The `<script>` build
  only defines `window.lobstrExtensionApi`; the 2.x UMD wrapper's AMD branch is gone
- The publication guard type-checks the packed tarball from outside the repo and runs the
  installed package, so the types and the runtime cannot drift apart
- The `import` condition ships its own ESM-flavoured declarations, so under Node-style
  TypeScript resolution the default import is typed as what the ESM build exports
- The SDK lives in its own repository, https://github.com/Lobstrco/lobstr-browser-extension,
  and the published declarations now carry their doc comments

## Documentation
- Documented the network API, the published module formats, the protocol entry point and
  every dApp-visible error string
- Corrected the browser global: it is `window.lobstrExtensionApi`

# v2.1.0

- Changed the package license to Apache-2.0

# v2.0.0

## New features
- Added `signMessage` function for signing arbitrary messages with the LOBSTR extension; returns the signed message together with the signer address
- Unified the signing protocol between the API and the extension, with API versioning for compatibility with future extension updates

## Build improvements
- Disabled source maps generation for production builds to reduce bundle size
- Added automatic build directory cleanup before each build
- Improved TypeScript compilation configuration to handle dependency type issues
- Optimized npm package contents to exclude development files and include only necessary files

## Package optimization
- Added `.npmignore` to exclude development files from npm package
- Configured `files` field in package.json to explicitly include only required files
- Reduced package size by excluding source code, tests, and build configuration files
- Included essential documentation (README.md, CHANGELOG.MD) in npm package

# v1.0.0-beta.0

- Name change to @lobstrco/signer-extension-api